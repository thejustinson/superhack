import { Resend } from "resend";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { universityEmail } = await req.json();

    if (!universityEmail || !universityEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const cookieStore = await cookies();
    
    // Auth client using anon key to authenticate user
    const authSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Service role client to perform RLS-bypassed reads/writes
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Rate limiting check
    const { data: profile } = await supabase
      .from("profiles")
      .select("university_verification_expires_at")
      .eq("id", user.id)
      .single();

    if (
      profile?.university_verification_expires_at &&
      new Date(profile.university_verification_expires_at).getTime() - Date.now() > 9 * 60 * 1000
    ) {
      return NextResponse.json(
        { error: "Please wait before requesting another code" },
        { status: 429 }
      );
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        pending_university_email: universityEmail,
        university_verification_code: code,
        university_verification_expires_at: expiresAt.toISOString(),
      })
      .eq("id", user.id);

    if (dbError) {
      return NextResponse.json({ error: "Could not save verification code" }, { status: 500 });
    }

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify your university email for Superhack</title>
  <style>
    body {
      background-color: #0b0c0f;
      color: #f0f0f0;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #111318;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 14px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .logo {
      font-family: 'Fraunces', serif;
      font-size: 24px;
      font-weight: 900;
      color: #ffba08;
      margin-bottom: 24px;
      text-align: center;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #f0f0f0;
      margin: 0 0 16px;
      text-align: center;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #888888;
      margin: 0 0 24px;
      text-align: center;
    }
    .otp-code {
      display: block;
      width: fit-content;
      margin: 0 auto 24px;
      font-family: monospace;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 6px;
      color: #ffba08;
      background-color: rgba(255, 186, 8, 0.1);
      border: 1px dashed rgba(255, 186, 8, 0.3);
      padding: 12px 24px;
      border-radius: 8px;
      text-align: center;
    }
    .footer {
      font-size: 12px;
      color: #555555;
      text-align: center;
      margin-top: 32px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Superhack</div>
    <h1>Verify your university email</h1>
    <p>Please use the verification code below to verify your student status and unlock hackathon submissions.</p>
    <div class="otp-code">{{ .Token }}</div>
    <p style="font-size: 12px; margin-bottom: 0;">This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
    <div class="footer">
      &copy; 2026 Superhack Platform. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: "Superhack <noreply@superhack.fun>",
      to: universityEmail,
      subject: "Verify your university email for Superhack",
      html: emailTemplate.replace("{{ .Token }}", code),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
