"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    cover_image_url: string | null;
  };
  lessonCount: number;
  completedCount: number;
  isLoggedIn: boolean;
}

export function TopicCard({
  topic,
  lessonCount,
  completedCount,
  isLoggedIn,
}: TopicCardProps) {
  const progressPercent = lessonCount > 0 ? (completedCount / lessonCount) * 100 : 0;

  return (
    <Link href={`/learn/${topic.slug}`} style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={{ y: -4, borderColor: "rgba(255,186,8,0.3)" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          height: "100%",
          backgroundColor: "#111318",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          cursor: "pointer",
        }}
      >
        {/* Cover Image/Placeholder */}
        <div
          style={{
            height: "160px",
            width: "100%",
            backgroundColor: "#0d0f14",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {topic.cover_image_url ? (
            <img
              src={topic.cover_image_url}
              alt={topic.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.75,
              }}
            />
          ) : (
            <BookOpen size={48} style={{ color: "rgba(255,255,255,0.08)" }} />
          )}

          {/* Badge */}
          <span
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#ffba08",
              backgroundColor: "rgba(11,12,15,0.8)",
              padding: "4px 10px",
              borderRadius: "4px",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,186,8,0.2)",
            }}
          >
            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
          </span>
        </div>

        {/* Content body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
          <h3
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontWeight: 700,
              fontSize: "1.1875rem",
              color: "#f0f0f0",
              margin: 0,
              lineHeight: 1.35,
            }}
          >
            {topic.title}
          </h3>

          <p
            style={{
              fontSize: "0.875rem",
              color: "#888888",
              lineHeight: 1.5,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {topic.description}
          </p>

          {/* Progress Section */}
          {isLoggedIn && (
            <div style={{ marginTop: "auto", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", fontWeight: 500, color: "#888888" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <GraduationCap size={12} />
                  Progress
                </span>
                <span style={{ color: "#ffba08" }}>
                  {completedCount} / {lessonCount} completed
                </span>
              </div>
              
              {/* Progress bar container */}
              <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: "#ffba08", borderRadius: "999px", transition: "width 0.3s ease" }} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
