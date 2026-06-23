"use client";

import { useState, useMemo } from "react";
import { Search, Trophy, ArrowUp } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { InitialsAvatar } from "./InitialsAvatar";
import { projectPath } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export interface ProjectWithBuilder {
  id: string;
  name: string;
  project_slug: string;
  tagline?: string | null;
  description?: string | null;
  logo_url?: string | null;
  upvote_count: number;
  prize_place?: string | null;
  status?: string | null;
  cohort_id: string;
  user_id: string;
  builder: {
    full_name: string;
    username: string;
    avatar_url?: string | null;
  };
  cohort?: {
    title: string;
    slug: string;
  } | null;
  university?: {
    name: string;
    slug: string;
  } | null;
}

export function WinnerCard({ project }: { project: ProjectWithBuilder }) {
  const {
    name,
    project_slug,
    tagline,
    description,
    logo_url,
    upvote_count,
    prize_place,
    builder,
  } = project;

  const builderName = builder?.full_name || "Anonymous";

  return (
    <Link href={projectPath(builder.username, project_slug)} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "220px",
          backgroundColor: "#111318",
          border: "2px solid rgba(255, 186, 8, 0.4)",
          borderRadius: "16px",
          padding: "1.5rem",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3), 0 0 15px rgba(255, 186, 8, 0.05)",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 186, 8, 0.8)";
          e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.4), 0 0 25px rgba(255, 186, 8, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 186, 8, 0.4)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3), 0 0 15px rgba(255, 186, 8, 0.05)";
        }}
      >
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,186,8,0.1) 0%, rgba(255,186,8,0) 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          {/* Top Row: Place Label + Trophy */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(255, 186, 8, 0.15)",
              border: "1px solid rgba(255, 186, 8, 0.3)",
              borderRadius: "20px",
              padding: "4px 12px",
            }}>
              <Trophy size={14} style={{ color: "#ffba08" }} />
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#ffba08",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}>
                {prize_place || "Winner"}
              </span>
            </div>
            
            {/* Upvote Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#ffba08",
                backgroundColor: "rgba(255, 186, 8, 0.05)",
                border: "1px solid rgba(255, 186, 8, 0.2)",
                borderRadius: "6px",
                padding: "4px 8px",
                flexShrink: 0,
              }}
            >
              <ArrowUp size={12} strokeWidth={2.5} />
              <span>{upvote_count}</span>
            </div>
          </div>

          {/* Project Details (Logo + Title) */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", minWidth: 0 }}>
            {logo_url ? (
              <img
                src={logo_url}
                alt={name}
                style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255, 255, 255, 0.1)" }}
              />
            ) : (
              <InitialsAvatar name={name} size={48} />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h4
                style={{
                  fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                  fontSize: "1.15rem",
                  fontWeight: 800,
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
          </div>

          {/* Tagline or Description */}
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

        {/* Bottom Row: Builder Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "12px" }}>
          {builder?.avatar_url ? (
            <img
              src={builder.avatar_url}
              alt={builderName}
              style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#888888",
              flexShrink: 0,
            }}>
              {builderName.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{
            fontSize: "0.8125rem",
            color: "#888888",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {builderName}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

export function CohortResults({ projects, cohortTitle }: { projects: ProjectWithBuilder[]; cohortTitle: string }) {
  const [query, setQuery] = useState("");

  const winners = useMemo(() => {
    const list = projects.filter((p) => p.prize_place);
    return list.sort((a, b) => {
      const aVal = a.prize_place || "";
      const bVal = b.prize_place || "";
      const aMatch = aVal.match(/^(\d+)/);
      const bMatch = bVal.match(/^(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return aVal.localeCompare(bVal);
    });
  }, [projects]);

  const filtered = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.builder?.full_name?.toLowerCase().includes(q) ||
        p.builder?.username?.toLowerCase().includes(q)
    );
  }, [query, projects]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      <div>
        <h2 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.75rem", fontWeight: 900, color: "#f0f0f0", marginBottom: "4px" }}>
          {cohortTitle} — Results
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0 }}>
          {projects.length} {projects.length === 1 ? "builder submitted a project" : "builders submitted projects"} this cohort
        </p>
      </div>

      {winners.length > 0 && (
        <div style={{
          backgroundColor: "#181b22",
          border: "1px solid rgba(255, 186, 8, 0.2)",
          borderRadius: "16px",
          padding: "24px",
        }}>
          <h3 style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#888888",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "16px",
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}>
            Winners
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {winners.map((project) => (
              <WinnerCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "#f0f0f0", marginBottom: "16px" }}>
          All participants
        </h3>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or project..."
            style={{
              width: "100%",
              backgroundColor: "#111318",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "8px",
              padding: "10px 16px 10px 40px",
              fontSize: "0.875rem",
              color: "#f0f0f0",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255, 186, 8, 0.4)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)")}
          />
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#888888", padding: "32px 0", textAlign: "center" }}>
            No matches found
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
