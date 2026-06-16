"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowLeft, ChevronDown, ChevronUp, Book } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order_index: number;
}

interface LessonSidebarProps {
  topicTitle: string;
  topicSlug: string;
  lessons: Lesson[];
  currentLessonSlug?: string;
  completedLessonIds: Set<string>;
}

export function LessonSidebar({
  topicTitle,
  topicSlug,
  lessons,
  currentLessonSlug,
  completedLessonIds,
}: LessonSidebarProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const activeLesson = lessons.find((l) => l.slug === currentLessonSlug);

  return (
    <>
      {/* ── Desktop Sidebar View ── */}
      <aside
        className="hidden lg:flex"
        style={{
          width: "280px",
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          height: "calc(100vh - 72px)",
          position: "sticky",
          top: "72px",
          backgroundColor: "#0b0c0f",
          flexShrink: 0,
        }}
      >
        {/* Header Topic Title */}
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#888888", letterSpacing: "0.1em", textTransform: "uppercase" }}>Topic</span>
          <h2
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "#f0f0f0",
              margin: "4px 0 0",
              lineHeight: 1.35,
            }}
          >
            {topicTitle}
          </h2>
        </div>

        {/* Scrollable list */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {lessons.map((lesson) => {
            const isActive = lesson.slug === currentLessonSlug;
            const isCompleted = completedLessonIds.has(lesson.id);

            return (
              <Link
                key={lesson.id}
                href={`/learn/${topicSlug}/${lesson.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: isActive ? "rgba(255,186,8,0.1)" : "transparent",
                  color: isActive ? "#ffba08" : isCompleted ? "#d0d0d0" : "#888888",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "#f0f0f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = isCompleted ? "#d0d0d0" : "#888888";
                  }
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={15} style={{ color: "#14F195", flexShrink: 0 }} />
                ) : (
                  <Circle size={15} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                )}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {lesson.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Link */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Link
            href="/learn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8125rem",
              color: "#888888",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
          >
            <ArrowLeft size={13} />
            <span>All topics</span>
          </Link>
        </div>
      </aside>

      {/* ── Mobile Dropdown / Accordion View ── */}
      <div
        className="block lg:hidden"
        style={{
          backgroundColor: "#111318",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky",
          top: "72px",
          zIndex: 40,
          width: "100%",
        }}
      >
        <button
          onClick={() => setMobileExpanded((prev) => !prev)}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: "none",
            border: "none",
            color: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", textAlign: "left" }}>
            <Book size={16} style={{ color: "#ffba08" }} />
            <div>
              <span style={{ fontSize: "0.6875rem", color: "#888888", textTransform: "uppercase", display: "block" }}>
                Syllabus
              </span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#d0d0d0" }}>
                {activeLesson ? activeLesson.title : "Lesson list"}
              </span>
            </div>
          </div>
          {mobileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {mobileExpanded && (
          <div
            style={{
              padding: "8px 16px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              backgroundColor: "#0d0f14",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {lessons.map((lesson) => {
              const isActive = lesson.slug === currentLessonSlug;
              const isCompleted = completedLessonIds.has(lesson.id);

              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${topicSlug}/${lesson.slug}`}
                  onClick={() => setMobileExpanded(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: isActive ? "rgba(255,186,8,0.1)" : "transparent",
                    color: isActive ? "#ffba08" : isCompleted ? "#d0d0d0" : "#888888",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={15} style={{ color: "#14F195", flexShrink: 0 }} />
                  ) : (
                    <Circle size={15} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  )}
                  <span>{lesson.title}</span>
                </Link>
              );
            })}

            <Link
              href="/learn"
              onClick={() => setMobileExpanded(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px 4px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                marginTop: "8px",
                fontSize: "0.8125rem",
                color: "#ffba08",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={13} />
              <span>Back to all topics</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
