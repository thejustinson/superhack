"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { InitialsAvatar } from "./InitialsAvatar";

interface UniversityCardProps {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  logo_url?: string;
  cohort_count: number;
  has_active_cohort: boolean;
}

export function UniversityCard({
  id,
  name,
  slug,
  city,
  state,
  logo_url,
  cohort_count,
  has_active_cohort,
}: UniversityCardProps) {
  return (
    <Link href={`/universities/${slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        style={{
          backgroundColor: "#111318",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "12px",
          padding: "1.25rem",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "180px",
          transition: "border-color 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 186, 8, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
        }}
      >
        {/* Top: Logo + Active Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          {logo_url ? (
            <img
              src={logo_url}
              alt={name}
              style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <InitialsAvatar name={name} size={48} />
          )}

          {has_active_cohort && (
            <span
              style={{
                backgroundColor: "rgba(255, 186, 8, 0.1)",
                color: "#ffba08",
                border: "1px solid rgba(255, 186, 8, 0.3)",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Active
            </span>
          )}
        </div>

        {/* Middle: Name + City/State */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "14px 0", minWidth: 0, width: "100%" }}>
          <h4
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#f0f0f0",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </h4>
          {(city || state) && (
            <span
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "0.8125rem",
                color: "#888888",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {city}
              {city && state ? ", " : ""}
              {state}
            </span>
          )}
        </div>

        {/* Bottom: Cohort Count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.75rem",
            color: "#888888",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            paddingTop: "12px",
            marginTop: "auto",
            width: "100%",
          }}
        >
          <Calendar size={13} />
          <span>
            {cohort_count} {cohort_count === 1 ? "cohort" : "cohorts"}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
