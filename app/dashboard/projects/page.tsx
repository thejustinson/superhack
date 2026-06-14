"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function DashboardProjectsPage() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select(`
        *,
        profiles!user_id (full_name, username),
        cohorts (title, slug, universities (name, slug))
      `)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }

  async function deleteProject(id: string) {
    setDeletingId(id);
    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
    setConfirmId(null);
  }

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      style={{ display: "flex", flexDirection: "column", gap: "28px" }}
    >
      {/* Header */}
      <motion.div variants={fadeUp} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
      }}>
        <div>
          <h1 style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "1.75rem", fontWeight: 900, color: "#f0f0f0", margin: "0 0 4px",
          }}>
            My Projects
          </h1>
          <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0 }}>
            {loading ? "Loadingâ€¦" : `${projects.length} project${projects.length !== 1 ? "s" : ""} submitted`}
          </p>
        </div>
        {profile?.university_verified && (
          <Link href="/submit" style={{
            display: "flex", alignItems: "center", gap: "7px",
            backgroundColor: "#ffba08", color: "#0b0c0f",
            fontWeight: 600, fontSize: "0.875rem", padding: "9px 18px",
            borderRadius: "8px", textDecoration: "none",
          }}>
            <Plus size={15} /> Submit project
          </Link>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Loader2 size={28} style={{ color: "#ffba08", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : projects.length === 0 ? (
        <motion.div variants={fadeUp} style={{
          border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "12px",
          padding: "64px 24px", textAlign: "center",
        }}>
          <p style={{ color: "#888888", fontSize: "1rem", margin: "0 0 16px" }}>
            You haven&apos;t submitted any projects yet.
          </p>
          {profile?.university_verified ? (
            <Link href="/submit" style={{ color: "#ffba08", fontSize: "0.875rem", fontWeight: 500, textDecoration: "underline" }}>
              Submit your first project
            </Link>
          ) : (
            <Link href="/dashboard/university" style={{ color: "#ffba08", fontSize: "0.875rem", fontWeight: 500, textDecoration: "underline" }}>
              Verify your university email first
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {projects.map((proj) => (
            <div key={proj.id} style={{ position: "relative" }}>
              <ProjectCard project={{
                ...proj,
                builder: {
                  full_name: proj.profiles?.full_name || profile?.full_name || "Anonymous",
                  username: proj.profiles?.username || profile?.username || "",
                },
                cohort: proj.cohorts ? {
                  title: proj.cohorts.title,
                  slug: proj.cohorts.slug,
                } : null,
                university: proj.cohorts?.universities ? {
                  name: proj.cohorts.universities.name,
                  slug: proj.cohorts.universities.slug,
                } : null,
              }} />
              {/* Delete button */}
              {confirmId === proj.id ? (
                <div style={{
                  position: "absolute", bottom: "12px", right: "12px",
                  display: "flex", gap: "6px",
                }}>
                  <button
                    onClick={() => deleteProject(proj.id)}
                    disabled={deletingId === proj.id}
                    style={{
                      backgroundColor: "#f87171", color: "#fff", fontWeight: 600,
                      fontSize: "0.75rem", padding: "5px 12px", borderRadius: "6px",
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {deletingId === proj.id ? "Deletingâ€¦" : "Confirm delete"}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.08)", color: "#888",
                      fontSize: "0.75rem", padding: "5px 10px", borderRadius: "6px",
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(proj.id)}
                  style={{
                    position: "absolute", bottom: "12px", right: "12px",
                    backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171",
                    border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: "6px", padding: "5px 8px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                    fontSize: "0.75rem", fontFamily: "inherit", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.1)")}
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          ))}
        </motion.div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

