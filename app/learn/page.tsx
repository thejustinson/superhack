"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopicCard } from "@/components/learn/TopicCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
}

interface Lesson {
  id: string;
  topic_id: string;
}

export default function LearnPage() {
  const { user, loading: authLoading } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, number>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Overall stats
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch published topics
        const { data: topicsData } = await supabase
          .from("learn_topics")
          .select("*")
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        const activeTopics = topicsData || [];
        setTopics(activeTopics);

        if (activeTopics.length === 0) {
          setLoading(false);
          return;
        }

        const topicIds = activeTopics.map((t) => t.id);

        // 2. Fetch all published lessons under these topics
        const { data: lessonsData } = await supabase
          .from("learn_lessons")
          .select("id, topic_id")
          .eq("is_published", true)
          .in("topic_id", topicIds);

        const activeLessons = lessonsData || [];

        // Group lesson counts by topic
        const lMap: Record<string, number> = {};
        activeTopics.forEach((t) => { lMap[t.id] = 0; });
        activeLessons.forEach((l) => {
          if (lMap[l.topic_id] !== undefined) {
            lMap[l.topic_id] += 1;
          }
        });
        setLessonsMap(lMap);
        setTotalLessons(activeLessons.length);

        // 3. Fetch progress for logged-in user
        if (user) {
          const { data: progressData } = await supabase
            .from("learn_progress")
            .select("lesson_id, completed")
            .eq("user_id", user.id)
            .eq("completed", true);

          const completedLessons = progressData || [];
          const completedIds = new Set(completedLessons.map((p) => p.lesson_id));

          // Group completed counts by topic
          const cMap: Record<string, number> = {};
          activeTopics.forEach((t) => { cMap[t.id] = 0; });

          // Fetch all details of completed lessons to match topics
          const { data: completedLessonsDetail } = await supabase
            .from("learn_lessons")
            .select("id, topic_id")
            .in("id", Array.from(completedIds));

          const activeCompletedDetails = completedLessonsDetail || [];
          activeCompletedDetails.forEach((ld) => {
            if (cMap[ld.topic_id] !== undefined) {
              cMap[ld.topic_id] += 1;
            }
          });

          setCompletedMap(cMap);
          setTotalCompleted(activeCompletedDetails.length);
        }
      } catch (err) {
        // Handle gracefully
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  // Framer Motion presets
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const overallProgressPercent = totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100svh", paddingTop: "120px", paddingBottom: "96px", backgroundColor: "#0b0c0f" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 32px" }}>
          
          <motion.div variants={container} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Header */}
            <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{
                display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#ffba08", backgroundColor: "rgba(255,186,8,0.1)",
                padding: "5px 12px", borderRadius: "999px", width: "fit-content",
              }}>
                Curriculum
              </span>
              <h1 style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4rem)",
                letterSpacing: "-0.03em", lineHeight: 0.95, color: "#f0f0f0", margin: 0,
              }}>
                Learn Solana
              </h1>
              <p style={{ color: "#888888", fontSize: "1.0625rem", maxWidth: "480px", margin: 0, lineHeight: 1.6 }}>
                Start from zero. Build on Solana. Everything you need, in order.
              </p>
            </motion.div>

            {/* Progress / Auth Banner */}
            {!loading && (
              <motion.div variants={fadeUp}>
                {user ? (
                  /* Progress tracker card */
                  <div
                    style={{
                      backgroundColor: "#111318",
                      border: "1px solid rgba(255,186,8,0.15)",
                      borderRadius: "14px",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 2px", fontWeight: 700, color: "#f0f0f0", fontSize: "0.9375rem" }}>
                          Your Learning Journey
                        </h4>
                        <p style={{ margin: 0, fontSize: "0.8125rem", color: "#888888" }}>
                          You have completed {totalCompleted} of {totalLessons} lessons across all topics.
                        </p>
                      </div>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: "#ffba08" }}>
                        {Math.round(overallProgressPercent)}% Complete
                      </span>
                    </div>

                    <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ width: `${overallProgressPercent}%`, height: "100%", backgroundColor: "#ffba08", borderRadius: "999px", transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                ) : (
                  /* Sign in nudge banner */
                  <div
                    style={{
                      backgroundColor: "#111318",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "14px",
                      padding: "18px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <AlertCircle size={18} style={{ color: "#888888" }} />
                      <span style={{ fontSize: "0.875rem", color: "#888888" }}>
                        Sign in to track your course progress, save quiz challenges, and claim builder certifications.
                      </span>
                    </div>
                    <Link
                      href="/auth"
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#f0f0f0",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Beginner Notice banner */}
            <motion.div
              variants={fadeUp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "10px",
                padding: "12px 18px",
              }}
            >
              <Info size={16} style={{ color: "#888888", flexShrink: 0 }} />
              <span style={{ fontSize: "0.8125rem", color: "#888888", lineHeight: 1.4 }}>
                Start with topic 1 if you're new to Solana — no experience needed.
              </span>
            </motion.div>

            {/* Topics Grid */}
            <motion.div variants={fadeUp}>
              {loading ? (
                /* Shimmer loading skeletons */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      style={{
                        height: "320px",
                        backgroundColor: "#111318",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        padding: "24px",
                      }}
                    >
                      <div style={{ height: "120px", width: "100%", borderRadius: "8px", background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s infinite" }} />
                      <div style={{ height: "24px", width: "60%", borderRadius: "4px", background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s infinite 0.1s" }} />
                      <div style={{ height: "14px", width: "90%", borderRadius: "4px", background: "rgba(255,255,255,0.02)", animation: "pulse 1.5s infinite 0.15s" }} />
                      <div style={{ height: "14px", width: "70%", borderRadius: "4px", background: "rgba(255,255,255,0.02)", animation: "pulse 1.5s infinite 0.2s" }} />
                    </div>
                  ))}
                </div>
              ) : topics.length === 0 ? (
                /* Empty state */
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <BookOpen size={48} style={{ color: "rgba(255,255,255,0.1)", marginBottom: "16px" }} />
                  <p style={{ color: "#888888", fontSize: "0.9375rem" }}>
                    No learning topics have been published yet. Check back soon!
                  </p>
                </div>
              ) : (
                /* Grid cards rendering */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      lessonCount={lessonsMap[topic.id] ?? 0}
                      completedCount={completedMap[topic.id] ?? 0}
                      isLoggedIn={!!user}
                    />
                  ))}
                </div>
              )}
            </motion.div>

          </motion.div>
        </div>
      </main>
      <Footer />
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
