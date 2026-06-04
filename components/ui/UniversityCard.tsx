import Link from "next/link";
import { MapPin } from "lucide-react";
import type { University } from "@/lib/supabase";

interface UniversityCardProps {
  university: University & { cohort_count: number; last_cohort: { end_date: string | null; status: string } | null };
}

export function UniversityCard({ university }: UniversityCardProps) {
  return (
    <Link
      href={`/universities/${university.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px",
        padding: "24px",
        textDecoration: "none",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Logo placeholder */}
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "10px",
        backgroundColor: "rgba(255,186,8,0.1)",
        border: "1px solid rgba(255,186,8,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
        fontWeight: 900,
        color: "#ffba08",
        fontFamily: "var(--font-fraunces), Georgia, serif",
      }}>
        {university.name.charAt(0)}
      </div>

      {/* Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontWeight: 700,
          fontSize: "1rem",
          color: "#f0f0f0",
          lineHeight: 1.3,
        }}>
          {university.name}
        </span>
        {university.city && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8125rem", color: "#888888" }}>
            <MapPin size={12} />
            {university.city}{university.state && `, ${university.state}`}
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: "flex",
        gap: "16px",
        paddingTop: "12px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#f0f0f0", fontFamily: "var(--font-fraunces)" }}>
            {university.cohort_count}
          </span>
          <span style={{ fontSize: "0.6875rem", color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {university.cohort_count === 1 ? "cohort" : "cohorts"}
          </span>
        </div>
        {university.last_cohort && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: university.last_cohort.status === "active" ? "#14F195" : "#888888",
            }}>
              {university.last_cohort.status}
            </span>
            <span style={{ fontSize: "0.6875rem", color: "#888888" }}>status</span>
          </div>
        )}
      </div>
    </Link>
  );
}
