import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database, UniversityVerification } from "@/lib/supabase";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/verify-university — send OTP to university email
export async function POST(request: NextRequest) {
  const { universityEmail, userId } = await request.json();

  if (!universityEmail || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const token = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  // Delete any previous tokens for this user
  await supabase
    .from("university_verifications")
    .delete()
    .eq("user_id", userId);

  // Store the new token
  const { error } = await supabase
    .from("university_verifications")
    .insert({ user_id: userId, university_email: universityEmail, token, expires_at: expiresAt });

  if (error) {
    return NextResponse.json({ error: "Failed to create verification" }, { status: 500 });
  }

  // TODO: Send email to universityEmail with the token.
  // In production, use Supabase Edge Functions, Resend, SendGrid, etc.
  // For development, the token is logged to the server console.
  console.log(`[University Verify] OTP for ${universityEmail}: ${token}`);

  return response;
}

// PUT /api/verify-university — verify OTP and mark user as verified
export async function PUT(request: NextRequest) {
  const { universityEmail, token, userId, universityId } = await request.json();

  if (!universityEmail || !token || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check the token
  const { data: verification } = await supabase
    .from("university_verifications")
    .select("*")
    .eq("user_id", userId)
    .eq("university_email", universityEmail)
    .eq("token", token)
    .single();

  if (!verification) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  if (new Date(verification.expires_at) < new Date()) {
    return NextResponse.json({ error: "Code expired" }, { status: 400 });
  }

  // Mark user as verified
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      university_email: universityEmail,
      university_verified: true,
      ...(universityId ? { university_id: universityId } : {}),
    })
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
  }

  // Clean up token
  await supabase
    .from("university_verifications")
    .delete()
    .eq("user_id", userId);

  return response;
}