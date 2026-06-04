"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronUp, Package } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const stubProjects: {
  id: number;
  name: string;
  builder: string;
  school: string;
  description: string;
  upvotes: number;
  link: string;
}[] = [];

async function upvoteProject(id: number) {
  // TODO: wire to Supabase
  console.log("Upvote project", id);
}

const containerStyle: React.CSSProperties = {
  maxWidth: "1152px",
  margin: "0 auto",
  padding: "0 32px",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState(stubProjects);
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set());

  async function handleUpvote(id: number) {
    if (upvoted.has(id)) return;
    await upvoteProject(id);
    setUpvoted((prev) => new Set(prev).add(id));
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  }

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
                  fontFamily: "var(--font-fraunces), Georgia, serif",
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

            {/* Empty state */}
            {projects.length === 0 ? (
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
                      fontFamily: "var(--font-fraunces), Georgia, serif",
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
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "16px",
                }}
              >
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={fadeUp}
                    style={{
                      backgroundColor: "#111318",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "8px",
                      padding: "28px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
                    }
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <h2
                        style={{
                          fontFamily: "var(--font-fraunces), Georgia, serif",
                          fontWeight: 700,
                          fontSize: "1.125rem",
                          color: "#f0f0f0",
                          margin: 0,
                        }}
                      >
                        {project.name}
                      </h2>
                      <p style={{ fontSize: "0.75rem", color: "#888888", margin: 0 }}>
                        {project.builder} · {project.school}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#888888",
                        lineHeight: 1.6,
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {project.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <button
                        id={`upvote-${project.id}`}
                        onClick={() => handleUpvote(project.id)}
                        disabled={upvoted.has(project.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid",
                          borderColor: upvoted.has(project.id)
                            ? "rgba(255,186,8,0.3)"
                            : "rgba(255,255,255,0.1)",
                          backgroundColor: upvoted.has(project.id)
                            ? "rgba(255,186,8,0.08)"
                            : "transparent",
                          color: upvoted.has(project.id) ? "#ffba08" : "#888888",
                          cursor: upvoted.has(project.id) ? "default" : "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <ChevronUp size={13} />
                        {project.upvotes}
                      </button>
                      {project.link && (
                        <Link
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.75rem",
                            color: "#888888",
                            textDecoration: "none",
                          }}
                        >
                          View project <ArrowUpRight size={12} />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
