"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProjectCard, ProjectCardSkeleton } from "@/components/ui/ProjectCard";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/AuthContext";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const containerStyle: React.CSSProperties = {
  maxWidth: "1152px",
  margin: "0 auto",
  padding: "0 32px",
};

export default function ProjectsPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  async function fetchProjectsAndVotes() {
    setLoading(true);
    try {
      // 1. Sync cohort status
      try {
        await supabase.rpc("sync_cohort_status");
      } catch (err) {
        console.error("Failed to sync cohort status:", err);
      }

      // 2. Fetch projects with profile and cohort/university relation
      const { data: projData, error: projError } = await supabase
        .from("projects")
        .select(`
          *,
          profiles!user_id (full_name, username),
          cohorts (
            title,
            slug,
            universities (name, slug)
          )
        `)
        .order("upvote_count", { ascending: false });

      if (projError) throw projError;
      
      const formatted = (projData || []).map((p: any) => ({
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

      setProjects(formatted);

      // 2. Fetch user's votes if logged in
      if (user) {
        const { data: voteData, error: voteError } = await supabase
          .from("votes")
          .select("project_id")
          .eq("user_id", user.id);

        if (!voteError && voteData) {
          setUserVotes(new Set(voteData.map((v) => v.project_id)));
        }
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjectsAndVotes();
  }, [user]);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100svh", paddingTop: "120px", paddingBottom: "96px" }}>
        <div style={containerStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>

            {/* Header */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <motion.span
                variants={fadeUp}
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#888888",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  width: "fit-content",
                }}
              >
                Showcase
              </motion.span>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                  color: "#f0f0f0",
                  margin: 0,
                }}
              >
                Submitted projects
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{ color: "#888888", fontSize: "1.0625rem", maxWidth: "460px", margin: 0, lineHeight: 1.6 }}
              >
                Projects built by Superhack participants. Vote for your favourites.
              </motion.p>
            </motion.div>

            {/* Content loading state */}
            {loading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "16px",
                }}
              >
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
              </div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "96px 32px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px",
                  backgroundColor: "#111318",
                  gap: "24px",
                  textAlign: "center",
                }}
              >
                <Package size={40} strokeWidth={1.25} style={{ color: "#888888" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <h2
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      color: "#f0f0f0",
                      margin: 0,
                    }}
                  >
                    No projects yet
                  </h2>
                  <p style={{ color: "#888888", fontSize: "0.875rem", maxWidth: "300px", margin: 0, lineHeight: 1.6 }}>
                    Be the first to submit. Projects will appear here once participants start shipping.
                  </p>
                </div>
                <Link
                  href="/submit"
                  style={{
                    backgroundColor: "#ffba08",
                    color: "#0b0c0f",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    padding: "11px 24px",
                    borderRadius: "6px",
                    textDecoration: "none",
                  }}
                >
                  Submit your project
                </Link>
              </motion.div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {projects.map((project) => (
                  <motion.div key={project.id} variants={fadeUp}>
                    <ProjectCard
                      project={project}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Auth Prompt Modal */}
      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#111318",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "#f0f0f0", fontSize: "1.5rem", margin: 0 }}>
              Join Superhack
            </h3>
            <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
              You need an account to upvote projects and participate in hackathons.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link
                href="/auth"
                style={{
                  backgroundColor: "#ffba08",
                  color: "#0b0c0f",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  padding: "12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                Create Account / Sign In
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888888",
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

