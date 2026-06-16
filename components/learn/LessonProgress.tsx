"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface LessonProgressProps {
  isCompleted: boolean;
  quizzesPassed: boolean;
  loading: boolean;
  onComplete: () => void;
  isLoggedIn: boolean;
  nextLesson: { slug: string; title: string } | null;
  topicSlug: string;
  topicTitle: string;
}

export function LessonProgress({
  isCompleted,
  quizzesPassed,
  loading,
  onComplete,
  isLoggedIn,
  nextLesson,
  topicSlug,
  topicTitle,
}: LessonProgressProps) {
  // If not logged in, show sign-in nudge
  if (!isLoggedIn) {
    return (
      <div
        style={{
          marginTop: "40px",
          padding: "24px",
          borderRadius: "12px",
          backgroundColor: "#111318",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Lock size={20} style={{ color: "#ffba08" }} />
        <div>
          <h4 style={{ margin: "0 0 4px", fontWeight: 600, color: "#f0f0f0", fontSize: "0.9375rem" }}>
            Want to track your progress?
          </h4>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "#888888" }}>
            Sign in to check off completed lessons, save quiz attempts, and earn credentials.
          </p>
        </div>
        <Link
          href="/auth"
          style={{
            padding: "8px 16px",
            backgroundColor: "#ffba08",
            color: "#0b0c0f",
            borderRadius: "6px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textDecoration: "none",
            marginTop: "4px",
          }}
        >
          Sign in to save progress
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "40px",
        padding: "24px",
        borderRadius: "12px",
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h4 style={{ margin: "0 0 4px", fontWeight: 600, color: "#f0f0f0", fontSize: "0.9375rem" }}>
            Lesson Status
          </h4>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "#888888" }}>
            {isCompleted
              ? "You have completed this lesson!"
              : !quizzesPassed
              ? "Complete the challenge above to unlock completion."
              : "Ready to check off this lesson."}
          </p>
        </div>

        {isCompleted ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#14F195" }}>
            <CheckCircle2 size={20} />
            <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Lesson Complete!</span>
          </div>
        ) : (
          <button
            onClick={onComplete}
            disabled={loading || !quizzesPassed}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: quizzesPassed ? "#ffba08" : "rgba(255,255,255,0.04)",
              color: quizzesPassed ? "#0b0c0f" : "#666666",
              border: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: quizzesPassed && !loading ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (quizzesPassed && !loading) e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              if (quizzesPassed && !loading) e.currentTarget.style.opacity = "1";
            }}
          >
            {loading ? "Completing..." : "Mark as complete"}
          </button>
        )}
      </div>

      {/* Next Step Banner */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "16px",
            marginTop: "8px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {nextLesson ? (
            <Link
              href={`/learn/${topicSlug}/${nextLesson.slug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#ffba08",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span>Next: {nextLesson.title}</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              href="/learn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#ffba08",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span>You've completed {topicTitle}! Back to all topics</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}
