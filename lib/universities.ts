import { supabase } from "./supabase";
import type { University, Cohort, CohortWithUniversity } from "./supabase";

export async function getUniversities(): Promise<University[]> {
  const { data, error } = await supabase
    .from("universities")
    .select("*")
    .order("name");
  if (error) { console.error(error); return []; }
  return data;
}

export async function getUniversityBySlug(slug: string): Promise<University | null> {
  const { data, error } = await supabase
    .from("universities")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getUniversityCohorts(universityId: string): Promise<Cohort[]> {
  const { data, error } = await supabase
    .from("cohorts")
    .select("*")
    .eq("university_id", universityId)
    .order("start_date", { ascending: false });
  if (error) return [];
  return data;
}

export async function getUniversitiesWithCohortCounts() {
  const { data: unis } = await supabase.from("universities").select("*").order("name");
  if (!unis) return [];

  const results = await Promise.all(
    unis.map(async (uni) => {
      const { count } = await supabase
        .from("cohorts")
        .select("id", { count: "exact", head: true })
        .eq("university_id", uni.id);
      const { data: lastCohort } = await supabase
        .from("cohorts")
        .select("end_date, status")
        .eq("university_id", uni.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to avoid errors if no cohort exists
      return { ...uni, cohort_count: count ?? 0, last_cohort: lastCohort ?? null };
    })
  );
  return results;
}

export async function getAllCohorts(): Promise<CohortWithUniversity[]> {
  const { data, error } = await supabase
    .from("cohorts")
    .select("*, universities(*)")
    .order("start_date", { ascending: false });
  if (error) return [];
  return data as unknown as CohortWithUniversity[];
}

export async function getActiveCohortForUniversity(universityId: string): Promise<Cohort | null> {
  const { data } = await supabase
    .from("cohorts")
    .select("*")
    .eq("university_id", universityId)
    .eq("status", "active")
    .maybeSingle();
  return data ?? null;
}

export function matchUniversityByDomain<T extends { email_domain: string | null }>(
  submittedDomain: string,
  universities: T[]
): T | undefined {
  return universities.find((uni) => {
    if (!uni.email_domain) return false;
    return (
      submittedDomain === uni.email_domain ||
      submittedDomain.endsWith(`.${uni.email_domain}`)
    );
  });
}

