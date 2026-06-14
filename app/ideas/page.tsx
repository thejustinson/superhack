"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IdeaCard } from "@/components/ui/IdeaCard";
import { supabase } from "@/lib/supabase";
import type { Idea } from "@/lib/supabase";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// Skeleton card
function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: "#111318",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "10px",
      padding: "24px",
      display: "flex", flexDirection: "column", gap: "14px",
    }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ height: "20px", width: "64px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", animation: "shimmer 1.4s infinite" }} />
        <div style={{ height: "20px", width: "80px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", animation: "shimmer 1.4s infinite 0.1s" }} />
      </div>
      <div style={{ height: "20px", width: "80%", borderRadius: "4px", background: "rgba(255,255,255,0.07)", animation: "shimmer 1.4s infinite 0.15s" }} />
      <div style={{ height: "14px", width: "100%", borderRadius: "4px", background: "rgba(255,255,255,0.05)", animation: "shimmer 1.4s infinite 0.2s" }} />
      <div style={{ height: "14px", width: "70%", borderRadius: "4px", background: "rgba(255,255,255,0.05)", animation: "shimmer 1.4s infinite 0.25s" }} />
    </div>
  );
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("ideas")
        .select("*")
        .order("upvote_count", { ascending: false });

      if (data) {
        setIdeas(data);
        // Build distinct category list
        const cats = Array.from(new Set(data.map((i) => i.category).filter(Boolean))) as string[];
        setCategories(["All", ...cats.sort()]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = activeCategory === "All"
    ? ideas
    : ideas.filter((i) => i.category === activeCategory);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100svh", paddingTop: "120px", paddingBottom: "96px" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>

            {/* Header */}
            <motion.div
              variants={stagger} initial="hidden" animate="show"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <motion.span variants={fadeUp} style={{
                display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase" as const,
                color: "#888888", backgroundColor: "rgba(255,255,255,0.06)",
                padding: "5px 12px", borderRadius: "999px", width: "fit-content",
              }}>
                Inspiration
              </motion.span>
              <motion.h1 variants={fadeUp} style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 900, fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
                letterSpacing: "-0.03em", lineHeight: 0.95, color: "#f0f0f0", margin: 0,
              }}>
                Project ideas
              </motion.h1>
              <motion.p variants={fadeUp} style={{
                color: "#888888", fontSize: "1.0625rem", maxWidth: "480px", margin: 0, lineHeight: 1.6,
              }}>
                Not sure what to build? Pick one of these ideas or use them as
                inspiration. Each comes with problem context and a suggested stack.
              </motion.p>
            </motion.div>

            {/* Category filter */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
            >
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    id={`filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      fontSize: "0.8125rem", padding: "6px 16px", borderRadius: "999px",
                      border: "1px solid",
                      borderColor: active ? "#ffba08" : "rgba(255,255,255,0.1)",
                      backgroundColor: active ? "#ffba08" : "transparent",
                      color: active ? "#0b0c0f" : "#888888",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer", transition: "all 0.18s", fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                        e.currentTarget.style.color = "#f0f0f0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "#888888";
                      }
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </motion.div>

            {/* Grid */}
            {loading ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "12px",
                  padding: "64px 24px", textAlign: "center",
                }}
              >
                <p style={{ color: "#888888", fontSize: "1rem", margin: "0 0 12px" }}>
                  {activeCategory === "All" ? "No ideas yet. Check back soon!" : `No ideas in "${activeCategory}" yet.`}
                </p>
                {activeCategory !== "All" && (
                  <button
                    onClick={() => setActiveCategory("All")}
                    style={{
                      background: "none", border: "none", color: "#ffba08",
                      fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
                      textDecoration: "underline",
                    }}
                  >
                    View all ideas
                  </button>
                )}
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  variants={stagger} initial="hidden" animate="show"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {filtered.map((idea) => (
                    <motion.div key={idea.id} variants={fadeUp}>
                      <IdeaCard idea={idea} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}

