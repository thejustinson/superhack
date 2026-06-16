"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { LessonSidebar } from "./LessonSidebar";
import { Quiz } from "./Quiz";
import { LessonProgress } from "./LessonProgress";
import { LessonNav } from "./LessonNav";
import { ChevronRight } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order_index: number;
}

interface QuizData {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "code_challenge";
  options: any;
  correct_answer: string;
  explanation?: string | null;
  order_index: number;
}

interface LessonClientViewProps {
  topic: Topic;
  lessons: Lesson[];
  lesson: Lesson & { mdx_content: string | null };
  quizzes: QuizData[];
  initialCompletedIds: string[];
  isLoggedIn: boolean;
  children: React.ReactNode;
}

export default function LessonClientView({
  topic,
  lessons,
  lesson,
  quizzes,
  initialCompletedIds,
  isLoggedIn,
  children,
}: LessonClientViewProps) {
  const { user, refreshProfile } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(initialCompletedIds));
  const [quizzesPassed, setQuizzesPassed] = useState(quizzes.length === 0);
  const [loading, setLoading] = useState(false);

  const currentIdx = lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  // Calculate estimated read time
  const wordCount = lesson.mdx_content ? lesson.mdx_content.split(/\s+/).length : 0;
  const readTime = Math.ceil(wordCount / 200) || 1;

  const handleMarkComplete = async () => {
    if (!isLoggedIn || !user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("learn_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          quiz_passed: quizzes.length > 0,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );

      if (!error) {
        setCompletedIds((prev) => {
          const nextSet = new Set(prev);
          nextSet.add(lesson.id);
          return nextSet;
        });
        await refreshProfile();
      }
    } catch (err) {
      // Handle gracefully
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100svh", backgroundColor: "#0b0c0f" }}>
      <div className="flex flex-col lg:flex-row flex-1" style={{ paddingTop: "72px" }}>
        
        {/* Responsive Sidebar */}
        <LessonSidebar
          topicTitle={topic.title}
          topicSlug={topic.slug}
          lessons={lessons}
          currentLessonSlug={lesson.slug}
          completedLessonIds={completedIds}
        />

        {/* Lesson View Area */}
        <main
          style={{
            flex: 1,
            padding: "40px 24px 96px",
            display: "flex",
            justifyContent: "center",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: "680px", width: "100%", display: "flex", flexDirection: "column" }}>
            
            {/* Breadcrumb Navigation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#666666",
                marginBottom: "24px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <Link href="/learn" style={{ color: "#666666", textDecoration: "none" }}>
                Learn
              </Link>
              <ChevronRight size={10} />
              <Link href={`/learn/${topic.slug}`} style={{ color: "#666666", textDecoration: "none" }}>
                {topic.title}
              </Link>
              <ChevronRight size={10} />
              <span style={{ color: "#999999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {lesson.title}
              </span>
            </div>

            {/* Lesson Title header */}
            <h1
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "2.25rem",
                fontWeight: 800,
                color: "#f0f0f0",
                margin: 0,
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
              }}
            >
              {lesson.title}
            </h1>

            {/* Metadata bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "12px",
                marginBottom: "32px",
                fontSize: "0.8125rem",
                color: "#888888",
              }}
            >
              <span>{readTime} min read</span>
              <span style={{ fontWeight: 500, color: "#ffba08" }}>
                Lesson {currentIdx + 1} of {lessons.length}
              </span>
            </div>

            {/* Render MDX Children */}
            <div style={{ minHeight: "100px" }}>{children}</div>

            {/* Render Quiz Section */}
            {quizzes.length > 0 && <Quiz quizzes={quizzes} onAllPassed={setQuizzesPassed} />}

            {/* Render Progress & Completion tracker */}
            <LessonProgress
              isCompleted={completedIds.has(lesson.id)}
              quizzesPassed={quizzesPassed}
              loading={loading}
              onComplete={handleMarkComplete}
              isLoggedIn={isLoggedIn}
              nextLesson={nextLesson}
              topicSlug={topic.slug}
              topicTitle={topic.title}
            />

            {/* Lesson Prev/Next navigation */}
            <LessonNav prevLesson={prevLesson} nextLesson={nextLesson} topicSlug={topic.slug} />

          </div>
        </main>
      </div>
    </div>
  );
}
