import { supabase } from "./supabase";
import type { Cohort, CohortWithUniversity } from "./supabase";

export async function getAllCohorts(): Promise<CohortWithUniversity[]> {
  const { data, error } = await supabase
    .from("cohorts")
    .select("*, universities(*)")
    .order("start_date", { ascending: false });
  if (error) return [];
  return data as unknown as CohortWithUniversity[];
}

export async function getCohortBySlug(slug: string): Promise<CohortWithUniversity | null> {
  const { data, error } = await supabase
    .from("cohorts")
    .select("*, universities(*)")
    .eq("slug", slug)
    .maybeSingle(); // Use maybeSingle to prevent single() errors
  if (error) return null;
  return data as unknown as CohortWithUniversity;
}
