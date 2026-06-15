"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { FolderGit2, ChevronUp, Lightbulb, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { projectPath } from "@/lib/utils";
import { InlineCountdown } from "@/components/ui/InlineCountdown";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ projects: 0, upvotes: 0, ideasVoted: 0 });
  const [activeCohort, setActiveCohort] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);

      // 1. Sync cohort status
      try {
        await supabase.rpc("sync_cohort_status");
      } catch (err) {
        console.error("Failed to sync cohort status:", err);
      }

      const [
        { count: projectCount },
        { data: myProjects },
        { count: ideasVotedCount },
        { data: votes },
      ] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("projects").select(`
          *,
          profiles!user_id (full_name, username),
          cohorts (title, slug, universities (name, slug))
        `).eq("user_id", user!.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("idea_votes").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("votes").select("project_id, projects(upvote_count)").eq("user_id", user!.id),
      ]);

      // Sum upvotes on user's own projects
      const { data: ownProjects } = await supabase
        .from("projects")
        .select("upvote_count")
        .eq("user_id", user!.id);

      const totalUpvotes = (ownProjects ?? []).reduce((sum: number, p: any) => sum + (p.upvote_count ?? 0), 0);

      setStats({
        projects: projectCount ?? 0,
        upvotes: totalUpvotes,
        ideasVoted: ideasVotedCount ?? 0,
      });
      setRecentProjects(myProjects ?? []);

      // Active cohort at user's university
      if (profile?.university_id) {
        const { data: cohort } = await supabase
          .from("cohorts")
          .select("*, universities(name)")
          .eq("university_id", profile.university_id)
          .eq("status", "active")
          .maybeSingle();
        setActiveCohort(cohort ?? null);
      }

      setLoading(false);
    }
    load();
  }, [user, profile?.university_id]);

  const statItems = [
    { label: "Projects submitted", value: stats.projects, icon: FolderGit2 },
    { label: "Upvotes received", value: stats.upvotes, icon: ChevronUp },
    { label: "Ideas upvoted", value: stats.ideasVoted, icon: Lightbulb },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show"
      style={{ display: "flex", flexDirection: "column", gap: "36px" }}
    >
      {/* Welcome */}
      <motion.div variants={fadeUp}>
        <h1 style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontWeight: 900, fontSize: "2rem", color: "#f0f0f0", margin: "0 0 6px",
        }}>
          Hey, {profile?.full_name?.split(" ")[0] || "Builder"}
        </h1>
        <p style={{ color: "#888888", fontSize: "0.9375rem", margin: 0 }}>
          Welcome back to your dashboard.
        </p>
      </motion.div>

      {/* Verification banner */}
      {!profile?.university_verified && (
        <motion.div variants={fadeUp} style={{
          backgroundColor: "rgba(255,186,8,0.06)",
          border: "1px solid rgba(255,186,8,0.25)",
          borderRadius: "12px", padding: "18px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ShieldCheck size={20} style={{ color: "#ffba08", flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, color: "#f0f0f0", margin: "0 0 2px", fontSize: "0.9375rem" }}>
                Verify your university email
              </p>
              <p style={{ color: "#888888", margin: 0, fontSize: "0.8125rem" }}>
                Required to submit projects to hackathons.
              </p>
            </div>
          </div>
          <Link href="/dashboard/university" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            backgroundColor: "#ffba08", color: "#0b0c0f",
            fontWeight: 600, fontSize: "0.8125rem", padding: "8px 16px", borderRadius: "7px",
            textDecoration: "none", whiteSpace: "nowrap",
          }}>
            Verify now <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      {/* Stats row */}
      <motion.div variants={fadeUp} style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
      }}>
        {statItems.map((s) => (
          <div key={s.label} style={{
            backgroundColor: "#111318",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px", padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.75rem", color: "#888888", fontWeight: 500 }}>{s.label}</span>
              <s.icon size={14} style={{ color: "#555" }} />
            </div>
            <span style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "2rem", fontWeight: 700, color: "#f0f0f0", lineHeight: 1,
            }}>
              {loading ? "-" : s.value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Active hackathon */}
      {activeCohort && (
        <motion.div variants={fadeUp} style={{
          backgroundColor: "rgba(20,241,149,0.04)",
          border: "1px solid rgba(20,241,149,0.2)",
          borderRadius: "12px", padding: "22px 24px",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
              backgroundColor: "rgba(20,241,149,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={18} style={{ color: "#14F195" }} />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#14F195", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "2px" }}>
                Active Hackathon
              </span>
              <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#f0f0f0" }}>
                {activeCohort.title}
              </span>
              <div style={{ marginTop: "4px" }}>
                <InlineCountdown startDate={activeCohort.start_date} endDate={activeCohort.end_date} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/submit" style={{
              backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
              fontSize: "0.8125rem", padding: "9px 18px", borderRadius: "7px",
              textDecoration: "none",
            }}>
              Submit project
            </Link>
            <Link href={`/hackathons/${activeCohort.slug}`} style={{
              backgroundColor: "rgba(255,255,255,0.06)", color: "#f0f0f0",
              fontSize: "0.8125rem", padding: "9px 18px", borderRadius: "7px",
              textDecoration: "none", display: "flex", alignItems: "center", gap: "5px",
            }}>
              Details <ArrowRight size={12} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Recent projects */}
      <motion.div variants={fadeUp}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "1.25rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
          }}>
            Recent projects
          </h2>
          <Link href="/dashboard/projects" style={{
            fontSize: "0.8125rem", color: "#ffba08", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: "64px", borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.04)",
                animation: "shimmer 1.4s infinite",
              }} />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <div style={{
            border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px",
            padding: "36px 24px", textAlign: "center",
          }}>
            <p style={{ color: "#888888", margin: "0 0 12px", fontSize: "0.9375rem" }}>
              No projects yet.
            </p>
            {profile?.university_verified && (
              <Link href="/submit" style={{ color: "#ffba08", fontSize: "0.875rem", textDecoration: "underline" }}>
                Submit your first project
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentProjects.map((proj) => {
              const linkHref = projectPath(proj.profiles?.username || "", proj.project_slug || "");
              return (
                <Link key={proj.id} href={linkHref} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "10px", padding: "14px 18px", textDecoration: "none",
                  transition: "border-color 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                >
                <div>
                  <span style={{ fontWeight: 600, color: "#f0f0f0", fontSize: "0.9375rem" }}>{proj.name}</span>
                  <span style={{ display: "block", fontSize: "0.8rem", color: "#888888", marginTop: "2px" }}>
                    {proj.cohorts?.title ?? ""}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#888888" }}>
                  <ChevronUp size={13} />
                  <span style={{ fontSize: "0.8125rem" }}>{proj.upvote_count ?? 0}</span>
                </div>
              </Link>
            );
          })}
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes shimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}

