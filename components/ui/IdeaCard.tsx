"use client";

import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import type { Idea } from "@/lib/supabase";

interface IdeaCardProps {
  idea: Idea;
  compact?: boolean;
}

export function IdeaCard({ idea, compact = false }: IdeaCardProps) {
  return (
    <Link
      href={`/ideas/${idea.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px",
        padding: compact ? "18px" : "24px",
        textDecoration: "none",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "pointer",
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
      {/* Badges row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {idea.category && (
          <span style={{
            fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#888888",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "3px 10px", borderRadius: "999px", whiteSpace: "nowrap",
          }}>
            {idea.category}
          </span>
        )}
        {idea.difficulty && <DifficultyBadge difficulty={idea.difficulty} />}
      </div>

      {/* Title + description */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <h3 style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: compact ? "1rem" : "1.125rem",
          color: "#f0f0f0",
          margin: 0,
          lineHeight: 1.3,
        }}>
          {idea.title}
        </h3>
        {idea.description && !compact && (
          <p style={{
            fontSize: "0.875rem", color: "#888888",
            lineHeight: 1.6, margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          } as React.CSSProperties}>
            {idea.description}
          </p>
        )}
      </div>

      {/* Upvote count */}
      <div style={{
        display: "flex", alignItems: "center", gap: "5px",
        paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <ChevronUp size={13} style={{ color: "#888888" }} />
        <span style={{ fontSize: "0.8125rem", color: "#888888", fontWeight: 500 }}>
          {idea.upvote_count ?? 0}
        </span>
      </div>
    </Link>
  );
}
