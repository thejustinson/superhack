"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  AlertCircle,
  Lightbulb,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────

type Difficulty = "beginner" | "intermediate" | "advanced";

interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: Difficulty | null;
  problem: string | null;
  solution: string | null;
  suggested_stack: string[] | null;
  upvote_count: number;
  created_at: string;
}

// ─── Animation Variants ───────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// ─── Helpers ─────────────────────────────────────────────────

function difficultyColor(d: Difficulty | null): string {
  if (d === "beginner") return "#4ade80";
  if (d === "intermediate") return "#ffba08";
  if (d === "advanced") return "#f87171";
  return "#888888";
}

function difficultyLabel(d: Difficulty | null): string {
  if (!d) return "";
  return d.charAt(0).toUpperCase() + d.slice(1);
}

// ─── Sub-components ──────────────────────────────────────────

function SectionHeading({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "12px",
      }}
    >
      <span style={{ color: "#ffba08", display: "flex", alignItems: "center" }}>
        {icon}
      </span>
      <h2
        style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "1.25rem",
          color: "#f0f0f0",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </h2>
    </div>
  );
}

function SimilarIdeaCard({ idea }: { idea: Idea }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/ideas/${idea.id}`}
      style={{ textDecoration: "none" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: hovered ? "rgba(255,255,255,0.04)" : "#111318",
          border: `1px solid ${hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: "8px",
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          cursor: "pointer",
          transition: "background-color 0.2s, border-color 0.2s, transform 0.2s",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {idea.category && (
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#888888",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "2px 9px",
                borderRadius: "999px",
              }}
            >
              {idea.category}
            </span>
          )}
          {idea.difficulty && (
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "capitalize",
                color: difficultyColor(idea.difficulty),
                backgroundColor: `${difficultyColor(idea.difficulty)}18`,
                border: `1px solid ${difficultyColor(idea.difficulty)}40`,
                padding: "2px 9px",
                borderRadius: "999px",
              }}
            >
              {difficultyLabel(idea.difficulty)}
            </span>
          )}
        </div>
        <p
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "1rem",
            color: "#f0f0f0",
            margin: 0,
            lineHeight: 1.35,
          }}
        >
          {idea.title}
        </p>
      </motion.div>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { user } = useAuth();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [hasVoted, setHasVoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [voteLoading, setVoteLoading] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [countAnimating, setCountAnimating] = useState(false);

  const [similarIdeas, setSimilarIdeas] = useState<Idea[]>([]);

  // ── Fetch idea ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    supabase
      .from("ideas")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const row = data as unknown as Idea;
        setIdea(row);
        setUpvoteCount(row.upvote_count ?? 0);
        setLoading(false);

        // Fetch similar
        if (row.category) {
          supabase
            .from("ideas")
            .select("*")
            .eq("category", row.category)
            .neq("id", id)
            .limit(3)
            .then(({ data: simData }) => {
              if (simData) setSimilarIdeas(simData as unknown as Idea[]);
            });
        }
      });
  }, [id]);

  // ── Fetch vote state ────────────────────────────────────────
  useEffect(() => {
    if (!user || !id) {
      setHasVoted(false);
      return;
    }
    supabase
      .from("idea_votes")
      .select("id")
      .eq("idea_id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setHasVoted(!!data);
      });
  }, [user, id]);

  // ── Handle vote ─────────────────────────────────────────────
  const handleVote = useCallback(async () => {
    if (!user) {
      setLoginPrompt(true);
      setTimeout(() => setLoginPrompt(false), 2800);
      return;
    }
    if (voteLoading) return;
    setVoteLoading(true);

    if (hasVoted) {
      // Unvote
      await supabase
        .from("idea_votes")
        .delete()
        .eq("idea_id", id)
        .eq("user_id", user.id);
      setHasVoted(false);
      setUpvoteCount((c) => Math.max(0, c - 1));
    } else {
      // Vote
      await supabase
        .from("idea_votes")
        .insert({ idea_id: id, user_id: user.id } as never);
      setHasVoted(true);
      setUpvoteCount((c) => c + 1);
      // trigger count pop animation
      setCountAnimating(true);
      setTimeout(() => setCountAnimating(false), 400);
    }
    setVoteLoading(false);
  }, [user, voteLoading, hasVoted, id]);

  // ── Loading spinner ──────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div
          style={{
            minHeight: "100svh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0b0c0f",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "3px solid rgba(255,186,8,0.15)",
              borderTopColor: "#ffba08",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <Footer />
      </>
    );
  }

  // ── 404 ─────────────────────────────────────────────────────
  if (notFound || !idea) {
    return (
      <>
        <Navbar />
        <div
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            backgroundColor: "#0b0c0f",
            color: "#f0f0f0",
            textAlign: "center",
            padding: "24px",
          }}
        >
          <h1
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: "3rem",
              color: "#f0f0f0",
              margin: 0,
            }}
          >
            Idea not found
          </h1>
          <p style={{ color: "#888888", margin: 0 }}>
            This idea may have been removed or the link is invalid.
          </p>
          <Link
            href="/ideas"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#ffba08",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.9375rem",
            }}
          >
            <ArrowLeft size={16} />
            Back to Ideas
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  // ── Main render ──────────────────────────────────────────────
  const votedStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,186,8,0.15)",
    border: "1px solid #ffba08",
    color: "#ffba08",
  };
  const unvotedStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#888888",
  };

  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: "#0b0c0f", minHeight: "100svh" }}>

        {/* ── Hero ──────────────────────────────────────────── */}
        <section
          style={{
            backgroundColor: "#111318",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "112px",
            paddingBottom: "56px",
            position: "relative",
          }}
        >
          {/* Upvote button — absolutely positioned top-right inside hero */}
          <div
            style={{
              position: "absolute",
              top: "112px",
              right: "clamp(24px, 5vw, 80px)",
            }}
          >
            <div style={{ position: "relative" }}>
              <motion.button
                id="upvote-btn"
                aria-label={hasVoted ? "Remove upvote" : "Upvote this idea"}
                whileTap={{ scale: 0.9 }}
                onClick={handleVote}
                style={{
                  ...(hasVoted ? votedStyle : unvotedStyle),
                  borderRadius: "10px",
                  padding: "10px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.2s, border-color 0.2s",
                  fontFamily: "inherit",
                  minWidth: "58px",
                }}
              >
                <ChevronUp
                  size={20}
                  strokeWidth={2.5}
                  color={hasVoted ? "#ffba08" : "#888888"}
                />
                <motion.span
                  key={upvoteCount}
                  animate={
                    countAnimating
                      ? { scale: [1, 1.3, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: hasVoted ? "#ffba08" : "#888888",
                    lineHeight: 1,
                  }}
                >
                  {upvoteCount}
                </motion.span>
              </motion.button>

              {/* Login prompt tooltip */}
              <AnimatePresence>
                {loginPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#1e2028",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "0.8125rem",
                      color: "#f0f0f0",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      zIndex: 10,
                    }}
                  >
                    Sign in to vote
                    <div
                      style={{
                        position: "absolute",
                        top: "-5px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "9px",
                        height: "9px",
                        backgroundColor: "#1e2028",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRight: "none",
                        borderBottom: "none",
                        rotate: "45deg",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Hero content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              padding: "0 clamp(24px, 5vw, 80px)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Back link */}
            <motion.div variants={fadeUp}>
              <Link
                href="/ideas"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#888888",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
              >
                <ArrowLeft size={15} />
                All ideas
              </Link>
            </motion.div>

            {/* Badges row */}
            <motion.div
              variants={fadeUp}
              style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}
            >
              {idea.category && (
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#888888",
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: "4px 12px",
                    borderRadius: "999px",
                  }}
                >
                  {idea.category}
                </span>
              )}
              {idea.difficulty && (
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "capitalize",
                    color: difficultyColor(idea.difficulty),
                    backgroundColor: `${difficultyColor(idea.difficulty)}18`,
                    border: `1px solid ${difficultyColor(idea.difficulty)}40`,
                    padding: "4px 12px",
                    borderRadius: "999px",
                  }}
                >
                  {difficultyLabel(idea.difficulty)}
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                color: "#f0f0f0",
                margin: 0,
                maxWidth: "720px",
              }}
            >
              {idea.title}
            </motion.h1>

            {/* Description */}
            {idea.description && (
              <motion.p
                variants={fadeUp}
                style={{
                  color: "#888888",
                  fontSize: "1.0625rem",
                  lineHeight: 1.65,
                  margin: 0,
                  maxWidth: "600px",
                }}
              >
                {idea.description}
              </motion.p>
            )}
          </motion.div>
        </section>

        {/* ── Content sections ──────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            maxWidth: "780px",
            margin: "0 auto",
            padding: "60px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "48px",
          }}
        >
          {/* The Problem */}
          {idea.problem && (
            <motion.section variants={fadeUp}>
              <SectionHeading
                icon={<AlertCircle size={20} />}
                label="The Problem"
              />
              <p
                style={{
                  color: "#888888",
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {idea.problem}
              </p>
            </motion.section>
          )}

          {/* The Solution */}
          {idea.solution && (
            <motion.section variants={fadeUp}>
              <SectionHeading
                icon={<Lightbulb size={20} />}
                label="The Solution"
              />
              <p
                style={{
                  color: "#f0f0f0",
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {idea.solution}
              </p>
            </motion.section>
          )}

          {/* Suggested Stack */}
          {idea.suggested_stack && idea.suggested_stack.length > 0 && (
            <motion.section variants={fadeUp}>
              <SectionHeading
                icon={<Layers size={20} />}
                label="Suggested Stack"
              />
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {idea.suggested_stack.map((tech, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      fontSize: "0.8125rem",
                      fontFamily: "monospace",
                      color: "#f0f0f0",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.section>
          )}

          {/* Divider */}
          {(idea.problem || idea.solution || (idea.suggested_stack && idea.suggested_stack.length > 0)) && (
            <div
              style={{
                height: "1px",
                backgroundColor: "rgba(255,255,255,0.07)",
              }}
            />
          )}
        </motion.div>

        {/* ── Similar Ideas ─────────────────────────────────── */}
        {similarIdeas.length > 0 && (
          <section
            style={{
              maxWidth: "780px",
              margin: "0 auto",
              padding: "0 24px 60px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <h2
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "#f0f0f0",
                  margin: "0 0 20px",
                  letterSpacing: "-0.01em",
                }}
              >
                Other ideas in{" "}
                <span style={{ color: "#ffba08" }}>{idea.category}</span>
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "12px",
                }}
              >
                {similarIdeas.map((sim) => (
                  <SimilarIdeaCard key={sim.id} idea={sim} />
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ── Build this CTA ────────────────────────────────── */}
        <section
          style={{
            backgroundColor: "#111318",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              maxWidth: "640px",
              margin: "0 auto",
              padding: "72px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <h2
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1.875rem, 4vw, 2.75rem)",
                letterSpacing: "-0.03em",
                color: "#f0f0f0",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Ready to build this?
            </h2>
            <p
              style={{
                color: "#888888",
                fontSize: "1rem",
                lineHeight: 1.65,
                margin: 0,
                maxWidth: "420px",
              }}
            >
              Join the next Superhack cohort and turn this idea into a real
              project.
            </p>
            <Link
              href={user ? "/submit" : "/auth"}
              id="cta-get-started"
              style={{
                marginTop: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffba08",
                color: "#0b0c0f",
                fontWeight: 700,
                fontSize: "0.9375rem",
                padding: "13px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                letterSpacing: "-0.01em",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.88";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get started
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
