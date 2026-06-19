import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const fallbackResponse = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", backgroundColor: "#0b0c0f" }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#f0f0f0" }}>
          Superhack
        </div>
        <div style={{ fontSize: 28, color: "#888888", marginTop: 16 }}>
          The campus hackathon for Solana builders.
        </div>
      </div>
    ),
    { ...size }
  );

  try {
    const { slug } = await params;
    if (!slug) return fallbackResponse;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: cohort, error } = await supabase
      .from("cohorts")
      .select("title, start_date, end_date, prize_pool, universities(name)")
      .eq("slug", slug)
      .single();

    if (error || !cohort) {
      return fallbackResponse;
    }

    const universityName = (cohort as any)?.universities?.name ?? "Partner University";
    const dateRange = cohort?.start_date && cohort?.end_date 
      ? `${formatDate(cohort.start_date)} – ${formatDate(cohort.end_date)}`
      : "";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px",
            backgroundColor: "#0b0c0f",
            backgroundImage:
              "radial-gradient(circle, rgba(255,186,8,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div
              style={{
                fontSize: 14,
                color: "#ffba08",
                border: "1px solid rgba(255,186,8,0.3)",
                borderRadius: 99,
                padding: "6px 16px",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Superhack Cohort
            </div>
            {cohort?.prize_pool && (
              <div
                style={{
                  fontSize: 14,
                  color: "#ffba08",
                  fontWeight: 600,
                }}
              >
                {cohort.prize_pool} Prize pool
              </div>
            )}
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#f0f0f0", marginBottom: 16 }}>
            {cohort?.title ?? "Solana Hackathon"}
          </div>
          <div style={{ fontSize: 28, color: "#888888", marginBottom: 16 }}>
            at {universityName}
          </div>
          {dateRange && (
            <div style={{ fontSize: 22, color: "#555555" }}>
              {dateRange}
            </div>
          )}
        </div>
      ),
      { ...size }
    );
  } catch (err) {
    return fallbackResponse;
  }
}
