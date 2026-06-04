import { supabase } from "./supabase";
import type { UserProfile } from "./supabase";

// ─── OTP Auth Flow ───────────────────────────────────────────

// Send OTP
export async function sendOTP(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true }
  });
  if (error) throw error;
  return { data };
}

// Verify OTP
export async function verifyOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Keep aliases for backward compatibility
export const sendOtp = sendOTP;
export const verifyOtp = verifyOTP;

/**
 * Fetch the current user's public profile from the `profiles` table.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

/**
 * Update user profile fields (full_name, university_id, etc.)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "created_at">>
) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
}
