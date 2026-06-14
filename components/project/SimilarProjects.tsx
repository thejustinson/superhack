"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { ChevronRight } from "lucide-react";
import { projectPath } from "@/lib/utils";

interface SimilarProjectsProps {
  currentProjectId: string;
  cohortId: string;
}

export function SimilarProjects({ currentProjectId, cohortId }: SimilarProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, name, tagline, logo_url, project_slug, profiles!user_id(username)")
          .eq("cohort_id", cohortId)
          .neq("id", currentProjectId)
          .limit(3);

        if (!error && data) {
          setProjects(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [currentProjectId, cohortId]);

  if (loading || projects.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h3
        style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "1.125rem",
          color: "#f0f0f0",
          margin: 0,
        }}
      >
        Other projects in this cohort
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {projects.map((proj) => {
          const linkHref = projectPath(proj.profiles?.username || "", proj.project_slug || "");
          return (
            <Link
              key={proj.id}
              href={linkHref}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "border-color 0.2s, background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
            }}
          >
            {proj.logo_url ? (
              <img
                src={proj.logo_url}
                alt={proj.name}
                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <InitialsAvatar name={proj.name} size={36} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4
                style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#f0f0f0",
                  margin: 0,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {proj.name}
              </h4>
              {proj.tagline && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#888888",
                    margin: "2px 0 0 0",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {proj.tagline}
                </p>
              )}
            </div>
            <ChevronRight size={14} style={{ color: "#888888" }} />
          </Link>
          );
        })}
      </div>
    </div>
  );
}
