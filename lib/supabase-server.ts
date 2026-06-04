import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type Database } from "./supabase";

// ─── Server client (Server Components, Route Handlers) ───────
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies — only route handlers can
          }
        },
      },
    }
  );
}

// ─── Get current session (server-side) ───────────────────────
export async function getServerSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ─── Get current user profile (server-side) ──────────────────
export async function getServerUserProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, universities(*)")
    .eq("id", user.id)
    .single();

  return profile;
}
