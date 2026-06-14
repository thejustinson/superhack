"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { IdeaCard } from "@/components/ui/IdeaCard";
import type { Idea } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

type Tab = "projects" | "ideas";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function DashboardUpvotedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("projects");
  const [projects, setProjects] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    const [{ data: votes }, { data: ideaVotes }] = await Promise.all([
      supabase
        .from("votes")
        .select("project_id, projects(*, profiles!user_id(full_name, username), cohorts(title, slug, universities(name, slug)))")
        .eq("user_id", user!.id),
      supabase
        .from("idea_votes")
        .select("idea_id, ideas(*)")
        .eq("user_id", user!.id),
    ]);

    const formattedProjects = (votes ?? [])
      .map((v: any) => v.projects)
      .filter(Boolean)
      .map((p: any) => ({
        ...p,
        builder: {
          full_name: p.profiles?.full_name || "Anonymous",
          username: p.profiles?.username || "",
        },
        cohort: p.cohorts ? {
          title: p.cohorts.title,
          slug: p.cohorts.slug,
        } : null,
        university: p.cohorts?.universities ? {
          name: p.cohorts.universities.name,
          slug: p.cohorts.universities.slug,
        } : null,
      }));

    setProjects(formattedProjects);
    setIdeas(
      (ideaVotes ?? []).map((v: any) => v.ideas).filter(Boolean) as Idea[]
    );
    setLoading(false);
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px",
    fontSize: "0.875rem",
    fontWeight: active ? 600 : 400,
    fontFamily: "inherit",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: active ? "#ffba08" : "#888888",
    borderBottom: active ? "2px solid #ffba08" : "2px solid transparent",
    transition: "all 0.15s",
  });

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      style={{ display: "flex", flexDirection: "column", gap: "28px" }}
    >
      <motion.div variants={fadeUp}>
        <h1 style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "1.75rem", fontWeight: 900, color: "#f0f0f0", margin: "0 0 4px",
        }}>
          Upvoted
        </h1>
        <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0 }}>
          Things you&apos;ve voted on.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} style={{
        display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", gap: "4px",
      }}>
        <button style={tabStyle(tab === "projects")} onClick={() => setTab("projects")}>
          Projects {!loading && `(${projects.length})`}
        </button>
        <button style={tabStyle(tab === "ideas")} onClick={() => setTab("ideas")}>
          Ideas {!loading && `(${ideas.length})`}
        </button>
      </motion.div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Loader2 size={28} style={{ color: "#ffba08", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : tab === "projects" ? (
        projects.length === 0 ? (
          <motion.div variants={fadeUp} style={{
            border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "12px",
            padding: "56px 24px", textAlign: "center",
          }}>
            <p style={{ color: "#888888", margin: 0 }}>You haven&apos;t upvoted any projects yet.</p>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}
          >
            {projects.map((proj) => <ProjectCard key={proj.id} project={proj} />)}
          </motion.div>
        )
      ) : ideas.length === 0 ? (
        <motion.div variants={fadeUp} style={{
          border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "12px",
          padding: "56px 24px", textAlign: "center",
        }}>
          <p style={{ color: "#888888", margin: 0 }}>You haven&apos;t upvoted any ideas yet.</p>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}
        >
          {ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
        </motion.div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

