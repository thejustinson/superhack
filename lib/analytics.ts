import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns the Monday of the week containing `date`, formatted "Mon d" */
function getWeekStart(date: Date): { label: string; sortKey: number } {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // shift to Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return {
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    sortKey: d.getTime(),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface WeekBucket {
  week: string;
  count: number;
}

/**
 * Buckets rows from any table into weekly counts, using `dateColumn` as the
 * timestamp source. Optional `filters` are applied as equality conditions.
 */
export async function getWeeklyCounts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  table: string,
  dateColumn: string,
  filters?: Record<string, unknown>
): Promise<WeekBucket[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from(table).select(dateColumn);
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  const { data } = await query;

  const buckets: Record<string, { count: number; sortKey: number }> = {};
  (data ?? []).forEach((row: Record<string, unknown>) => {
    const val = row[dateColumn];
    if (!val) return;
    const date = new Date(val as string);
    if (isNaN(date.getTime())) return;
    const { label, sortKey } = getWeekStart(date);
    if (!buckets[label]) buckets[label] = { count: 0, sortKey };
    buckets[label].count += 1;
  });

  return Object.entries(buckets)
    .map(([week, { count, sortKey }]) => ({ week, count, sortKey }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ week, count }) => ({ week, count }));
}

export interface UniversityRow {
  universityName: string;
  builders: number;
  submissions: number;
}

/**
 * Returns per-university verified-builder and submission counts,
 * sorted descending by builder count.
 */
export async function getUniversityBreakdown(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): Promise<UniversityRow[]> {
  const [
    { data: universities },
    { data: profiles },
    { data: projects },
  ] = await Promise.all([
    supabase.from("universities").select("id, name"),
    supabase.from("profiles").select("university_id, university_verified"),
    supabase.from("projects").select("id, cohorts(university_id)"),
  ]);

  return (universities ?? [])
    .map((uni: { id: string; name: string }) => {
      const builders = (profiles ?? []).filter(
        (p: { university_id: string | null; university_verified: boolean }) =>
          p.university_id === uni.id && p.university_verified
      ).length;

      const submissions = (projects ?? []).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.cohorts?.university_id === uni.id
      ).length;

      return { universityName: uni.name, builders, submissions };
    })
    .sort((a: UniversityRow, b: UniversityRow) => b.builders - a.builders);
}
