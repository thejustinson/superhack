"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Circle, ArrowLeft, Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LessonSidebar } from "@/components/learn/LessonSidebar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order_index: number;
}

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const slug = params.slug as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch topic details
        const { data: topicData } = await supabase
          .from("learn_topics")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .maybeSingle();

        if (!topicData) {
          setTopic(null);
          setLoading(false);
          return;
        }

        setTopic(topicData);

        // 2. Fetch lessons in the topic
        const { data: lessonsData } = await supabase
          .from("learn_lessons")
          .select("id, title, slug, order_index")
          .eq("topic_id", topicData.id)
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        const activeLessons = lessonsData || [];
        setLessons(activeLessons);

        // 3. Fetch progress if user is logged in
        if (user && activeLessons.length > 0) {
          const lessonIds = activeLessons.map((l) => l.id);
          const { data: progressData } = await supabase
            .from("learn_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("completed", true)
            .in("lesson_id", lessonIds);

          const completed = new Set((progressData || []).map((p) => p.lesson_id));
          setCompletedLessonIds(completed);
        }
      } catch (err) {
        // Handle gracefully
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && slug) {
      loadData();
    }
  }, [slug, user, authLoading]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100svh", paddingTop: "120px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#0b0c0f" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.05)", borderTopColor: "#ffba08", animation: "spin 0.8s linear infinite" }} />
        </main>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (!topic) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100svh", paddingTop: "140px", textAlign: "center", backgroundColor: "#0b0c0f", paddingBottom: "96px" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f0f0f0", marginBottom: "12px" }}>Topic Not Found</h2>
            <p style={{ color: "#888888", marginBottom: "24px" }}>This topic does not exist or has not been published yet.</p>
            <Link href="/learn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#ffba08", textDecoration: "none", fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to all topics
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const firstLessonSlug = lessons[0]?.slug;

  return (
    <>
      <Navbar />
      
      {/* Container Wrapper */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100svh", backgroundColor: "#0b0c0f" }}>
        
        {/* Responsive Content Columns */}
        <div className="flex flex-col lg:flex-row flex-1" style={{ paddingTop: "72px" }}>
          
          {/* Syllabus Sidebar */}
          <LessonSidebar
            topicTitle={topic.title}
            topicSlug={topic.slug}
            lessons={lessons}
            completedLessonIds={completedLessonIds}
          />

          {/* Main content body */}
          <main style={{ flex: 1, padding: "40px 24px 96px", display: "flex", justifyContent: "center", overflowY: "auto" }}>
            <div style={{ maxWidth: "680px", width: "100%", display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Back to all topics link */}
              <Link
                href="/learn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.8125rem",
                  color: "#888888",
                  textDecoration: "none",
                  width: "fit-content",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
              >
                <ArrowLeft size={13} />
                <span>All topics</span>
              </Link>

              {/* Cover Banner */}
              {topic.cover_image_url && (
                <div style={{ width: "100%", height: "220px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <img src={topic.cover_image_url} alt={topic.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              {/* Title & Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h1 style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: "2.25rem", fontWeight: 800, color: "#f0f0f0", margin: 0, letterSpacing: "-0.02em" }}>
                  {topic.title}
                </h1>
                <p style={{ fontSize: "1.0625rem", color: "#a0a0a0", lineHeight: 1.6, margin: 0 }}>
                  {topic.description}
                </p>
              </div>

              {/* Start CTA */}
              {firstLessonSlug && (
                <button
                  onClick={() => router.push(`/learn/${topic.slug}/${firstLessonSlug}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "fit-content",
                    padding: "12px 28px",
                    borderRadius: "8px",
                    backgroundColor: "#ffba08",
                    color: "#0b0c0f",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    cursor: "pointer",
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <Play size={15} fill="#0b0c0f" />
                  <span>Start learning</span>
                </button>
              )}

              {/* Syllabus / Lesson Checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                <h3 style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#f0f0f0", margin: 0 }}>
                  Lessons Syllabus
                </h3>
                
                {lessons.length === 0 ? (
                  <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0 }}>
                    No lessons have been added to this topic yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {lessons.map((lesson, idx) => {
                      const isCompleted = completedLessonIds.has(lesson.id);

                      return (
                        <Link
                          key={lesson.id}
                          href={`/learn/${topic.slug}/${lesson.slug}`}
                          style={{
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "16px 20px",
                            backgroundColor: "#111318",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "12px",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255,186,8,0.2)";
                            e.currentTarget.style.transform = "translateX(2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                            e.currentTarget.style.transform = "none";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#ffba08", minWidth: "18px" }}>
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#e0e0e0" }}>
                              {lesson.title}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {isCompleted ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#14F195", fontSize: "0.8125rem", fontWeight: 500 }}>
                                <span>Complete</span>
                                <CheckCircle2 size={16} />
                              </div>
                            ) : (
                              <Circle size={16} style={{ color: "rgba(255,255,255,0.15)" }} />
                            )}
                            <ArrowRight size={14} style={{ color: "#666666" }} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
