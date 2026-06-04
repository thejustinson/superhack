import { supabase, getClient } from "./supabase";
import type { Project, ProjectWithDetails } from "./supabase";

// ─── Server-side fetchers (now client-safe) ───────────────────

export async function getProjects(filters?: {
  universityId?: string;
  cohortId?: string;
}): Promise<ProjectWithDetails[]> {
  let query = supabase
    .from("projects")
    .select("*, profiles(id, full_name, university_id), cohorts(*, universities(*))")
    .order("upvote_count", { ascending: false });

  if (filters?.cohortId) query = query.eq("cohort_id", filters.cohortId);
  if (filters?.universityId) {
    query = query.eq("cohorts.university_id", filters.universityId);
  }

  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return (data ?? []) as unknown as ProjectWithDetails[];
}

export async function getProjectById(id: string): Promise<ProjectWithDetails | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*, profiles(id, full_name, university_id), cohorts(*, universities(*))")
    .eq("id", id)
    .maybeSingle(); // Use maybeSingle to prevent single() errors
  if (error) return null;
  return data as unknown as ProjectWithDetails;
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getUserVotedProjectIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("votes")
    .select("project_id")
    .eq("user_id", userId);
  return (data ?? []).map((v) => v.project_id);
}

// ─── Client-side mutators ─────────────────────────────────────

export async function submitProject(data: {
  cohort_id: string;
  user_id: string;
  name: string;
  description: string;
  github_url?: string;
  live_url?: string;
  solana_address?: string;
}): Promise<string> {
  const supabase = getClient();
  const payload = {
    ...data,
    github_url: data.github_url ?? null,
    live_url: data.live_url ?? null,
    solana_address: data.solana_address ?? null,
  };

  const { data: project, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return project.id;
}

/**
 * Upvote a project. Uses unique constraint to prevent duplicates.
 * Increments upvote_count via atomic DB function.
 */
export async function upvoteProject(projectId: string, userId: string): Promise<void> {
  const supabase = getClient();

  // Insert vote (will fail silently if already voted due to unique constraint)
  const { error: voteError } = await supabase
    .from("votes")
    .insert({ project_id: projectId, user_id: userId });

  if (voteError) {
    // Already voted — this is expected, not a real error
    if (voteError.code === "23505") return;
    throw voteError;
  }

  // Atomically increment count
  const { error: countError } = await supabase.rpc("increment_upvote", {
    project_id: projectId,
  });
  if (countError) throw countError;
}

export async function hasUserVoted(projectId: string, userId: string): Promise<boolean> {
  const supabase = getClient();
  const { data } = await supabase
    .from("votes")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}
