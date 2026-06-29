import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { matchUniversityByDomain } from "@/lib/universities";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    
    // Auth client to verify user session
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

    // Service role client to perform reads/updates bypassing RLS
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("university_verification_code, university_verification_expires_at, pending_university_email")
      .eq("id", user.id)
      .single();

    if (!profile?.university_verification_code) {
      return NextResponse.json({ error: "No verification in progress" }, { status: 400 });
    }

    if (new Date(profile.university_verification_expires_at) < new Date()) {
      return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
    }

    if (profile.university_verification_code !== code) {
      return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    }

    if (!profile.pending_university_email) {
      return NextResponse.json({ error: "No pending email found" }, { status: 400 });
    }

    // Match the email domain against the universities table
    const submittedDomain = profile.pending_university_email.split("@")[1];

    // Fetch all universities and check if the submitted domain matches
    const { data: universities } = await supabase
      .from("universities")
      .select("id, email_domain");

    const matchedUniversity = matchUniversityByDomain(submittedDomain, universities || []);

    if (!matchedUniversity) {
      return NextResponse.json(
        { error: "This email domain is not recognised as a partner university" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        university_email: profile.pending_university_email,
        university_id: matchedUniversity.id,
        university_verified: true,
        university_verified_at: new Date().toISOString(),
        university_verification_code: null,
        university_verification_expires_at: null,
        pending_university_email: null,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Could not complete verification" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
