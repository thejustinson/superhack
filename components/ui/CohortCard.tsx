import Link from "next/link";
import { Calendar, Trophy } from "lucide-react";
import { Badge } from "./Badge";
import type { CohortWithUniversity } from "@/lib/supabase";
import { InlineCountdown } from "./InlineCountdown";

interface CohortCardProps {
  cohort: CohortWithUniversity;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

function getPrizeTotal(prizePool: unknown): number {
  if (!prizePool || typeof prizePool !== "object") return 0;
  return Object.values(prizePool as Record<string, number>).reduce((a, b) => a + b, 0);
}

export function CohortCard({ cohort }: CohortCardProps) {
  const statusVariant =
    cohort.status === "active" ? "status-active"
    : cohort.status === "upcoming" ? "status-upcoming"
    : "status-past";

  const prizeTotal = getPrizeTotal(cohort.prize_pool);

  return (
    <div
      style={{
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* University */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Logo placeholder */}
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            backgroundColor: "rgba(255,186,8,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.75rem", fontWeight: 700, color: "#ffba08", flexShrink: 0,
          }}>
            {cohort.universities?.name?.charAt(0) ?? "U"}
          </div>
          <span style={{ fontSize: "0.8125rem", color: "#888888", fontWeight: 500 }}>
            {cohort.universities?.name ?? "University"}
          </span>
        </div>
        <Badge variant={statusVariant}>{cohort.status}</Badge>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "DM Sans, system-ui, sans-serif",
        fontWeight: 700,
        fontSize: "1.125rem",
        color: "#f0f0f0",
        margin: 0,
        lineHeight: 1.3,
      }}>
        {cohort.title}
      </h3>

      {/* Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "#888888" }}>
          <Calendar size={13} />
          <span>{formatDate(cohort.start_date)} — {formatDate(cohort.end_date)}</span>
        </div>
        {cohort.start_date && cohort.end_date && (
          <div style={{ marginTop: "4px" }}>
            <InlineCountdown startDate={cohort.start_date} endDate={cohort.end_date} />
          </div>
        )}
        {prizeTotal > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "#888888" }}>
            <Trophy size={13} />
            <span>${prizeTotal} prize pool</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link
          href={`/hackathons/${cohort.slug}`}
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#ffba08",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          View hackathon →
        </Link>
      </div>
    </div>
  );
}
