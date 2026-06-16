"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface LessonNavProps {
  prevLesson: { slug: string; title: string } | null;
  nextLesson: { slug: string; title: string } | null;
  topicSlug: string;
}

export function LessonNav({ prevLesson, nextLesson, topicSlug }: LessonNavProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "48px",
        paddingTop: "24px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        gap: "16px",
      }}
    >
      {/* Prev Button */}
      {prevLesson ? (
        <Link
          href={`/learn/${topicSlug}/${prevLesson.slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#888888",
            fontSize: "0.875rem",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
        >
          <ArrowLeft size={14} />
          <span>{prevLesson.title}</span>
        </Link>
      ) : (
        <div />
      )}

      {/* Next Button */}
      {nextLesson ? (
        <Link
          href={`/learn/${topicSlug}/${nextLesson.slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#888888",
            fontSize: "0.875rem",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
        >
          <span>{nextLesson.title}</span>
          <ArrowRight size={14} />
        </Link>
      ) : (
        <Link
          href={`/learn/${topicSlug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#888888",
            fontSize: "0.875rem",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
        >
          <span>Topic Overview</span>
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
