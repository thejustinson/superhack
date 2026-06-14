"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { InitialsAvatar } from "./InitialsAvatar";
import { WinnerBadge } from "./WinnerBadge";
import { Badge } from "./Badge";
import { projectPath } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    project_slug: string;
    tagline?: string | null;
    description?: string | null;
    logo_url?: string | null;
    upvote_count: number;
    prize_place?: string | null;
    status?: string | null;
    cohort?: { title: string; slug: string } | null;
    builder: { full_name: string; username: string };
    university?: { name: string; slug: string } | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const {
    id,
    name,
    project_slug,
    tagline,
    description,
    logo_url,
    upvote_count,
    prize_place,
    status,
    cohort,
    builder,
    university,
  } = project;

  const builderName = builder?.full_name || "Anonymous";
  const universityName = university?.name;
  const isWinner = status === "winner" || !!prize_place;

  return (
    <Link href={projectPath(builder.username, project_slug)} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "200px",
          backgroundColor: "#111318",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "12px",
          padding: "1.25rem",
          cursor: "pointer",
          overflow: "hidden",
          transition: "border-color 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 186, 8, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
        }}
      >
        {/* Top Row: Logo + Name + Winner Badge */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", minWidth: 0 }}>
            {logo_url ? (
              <img
                src={logo_url}
                alt={name}
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <InitialsAvatar name={name} size={40} />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h4
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: "1rem",
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
            </div>
            {isWinner && (
              <WinnerBadge place={prize_place || "Winner"} style={{ flexShrink: 0 }} />
            )}
          </div>

          {/* Middle: Tagline or Description (max 2 lines) */}
          {(tagline || description) && (
            <p
              style={{
                fontSize: "0.875rem",
                fontFamily: "var(--font-dm-sans), sans-serif",
                color: "#888888",
                lineHeight: 1.5,
                margin: "4px 0 0 0",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tagline || description}
            </p>
          )}
        </div>

        {/* Bottom Rows: Builder/University, Upvote count, Cohort badge */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            {/* Builder + University info */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#888888",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {builderName} {universityName ? `· ${universityName}` : ""}
              </p>
            </div>

            {/* Upvote Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#888888",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "6px",
                padding: "4px 8px",
                flexShrink: 0,
              }}
            >
              <ArrowUp size={12} strokeWidth={2.5} />
              <span>{upvote_count}</span>
            </div>
          </div>

          {/* Cohort Name at very bottom */}
          {cohort?.title && (
            <div style={{ width: "fit-content", marginTop: "4px" }}>
              <Badge variant="outline" style={{ fontSize: "0.6875rem", padding: "2px 8px" }}>
                {cohort.title}
              </Badge>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export function ProjectCardSkeleton() {
  const shimmer: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "6px" };
  return (
    <div
      style={{
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "200px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ ...shimmer, width: "40px", height: "40px", borderRadius: "50%" }} />
        <div style={{ ...shimmer, height: "16px", width: "50%" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "16px 0" }}>
        <div style={{ ...shimmer, height: "12px", width: "100%" }} />
        <div style={{ ...shimmer, height: "12px", width: "80%" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ ...shimmer, height: "12px", width: "40%" }} />
        <div style={{ ...shimmer, height: "20px", width: "40px" }} />
      </div>
    </div>
  );
}
