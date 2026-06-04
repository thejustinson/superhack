"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, ArrowUpRight } from "lucide-react";
import { Badge } from "./Badge";
import { upvoteProject } from "@/lib/projects";
import { useUser } from "@/contexts/AuthContext";
import type { ProjectWithDetails } from "@/lib/supabase";

interface ProjectCardProps {
  project: ProjectWithDetails;
  hasVoted?: boolean;
  onAuthRequired?: () => void;
}

export function ProjectCard({ project, hasVoted = false, onAuthRequired }: ProjectCardProps) {
  const { user } = useUser();
  const [voted, setVoted] = useState(hasVoted);
  const [count, setCount] = useState(project.upvote_count);
  const [loading, setLoading] = useState(false);

  const university = project.cohorts?.universities;

  async function handleUpvote() {
    if (!user) { onAuthRequired?.(); return; }
    if (voted || loading) return;
    setLoading(true);
    try {
      await upvoteProject(project.id, user.id);
      setVoted(true);
      setCount((c) => c + 1);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  return (
    <div
      style={{
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
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
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Link
          href={`/projects/${project.id}`}
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontWeight: 700,
            fontSize: "1.0625rem",
            color: "#f0f0f0",
            lineHeight: 1.3,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffba08")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#f0f0f0")}
        >
          {project.name}
        </Link>
        <p style={{ fontSize: "0.75rem", color: "#888888", margin: 0 }}>
          {project.profiles?.full_name || "Anonymous"}
          {university && ` · ${university.name}`}
        </p>
      </div>

      {/* Description */}
      {project.description && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "#888888",
            lineHeight: 1.6,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          marginTop: "auto",
        }}
      >
        <button
          onClick={handleUpvote}
          disabled={voted || loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: voted ? "rgba(255,186,8,0.35)" : "rgba(255,255,255,0.1)",
            backgroundColor: voted ? "rgba(255,186,8,0.08)" : "transparent",
            color: voted ? "#ffba08" : "#888888",
            cursor: voted ? "default" : "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            if (!voted) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "#f0f0f0"; }
          }}
          onMouseLeave={(e) => {
            if (!voted) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#888888"; }
          }}
        >
          <ChevronUp size={13} strokeWidth={2.5} />
          {count}
        </button>

        {(project.github_url || project.live_url) && (
          <Link
            href={project.live_url || project.github_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#888888" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
          >
            View <ArrowUpRight size={12} />
          </Link>
        )}
      </div>
    </div>
  );
}

// Skeleton loader
export function ProjectCardSkeleton() {
  const shimmer: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "6px" };
  return (
    <div style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ ...shimmer, height: "20px", width: "70%" }} />
      <div style={{ ...shimmer, height: "12px", width: "40%" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ ...shimmer, height: "12px", width: "100%" }} />
        <div style={{ ...shimmer, height: "12px", width: "85%" }} />
        <div style={{ ...shimmer, height: "12px", width: "60%" }} />
      </div>
    </div>
  );
}
