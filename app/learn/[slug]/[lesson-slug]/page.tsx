import React from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MDX_COMPONENTS } from "@/components/learn/MDXRenderer";
import LessonClientView from "@/components/learn/LessonClientView";

interface PageProps {
  params: Promise<{
    slug: string;
    "lesson-slug": string;
  }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { slug, "lesson-slug": lessonSlug } = await params;
  const supabase = await createSupabaseServerClient();

  // 1. Fetch topic by slug
  const { data: topic } = await supabase
    .from("learn_topics")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!topic) {
    notFound();
  }

  // 2. Fetch all published lessons under this topic to build syllabus navigation
  const { data: lessons } = await supabase
    .from("learn_lessons")
    .select("id, title, slug, order_index")
    .eq("topic_id", topic.id)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  const activeLessons = lessons || [];

  // 3. Fetch current lesson details
  const { data: lesson } = await supabase
    .from("learn_lessons")
    .select("*")
    .eq("topic_id", topic.id)
    .eq("slug", lessonSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (!lesson) {
    notFound();
  }

  // 4. Fetch quizzes for the current lesson
  const { data: quizzes } = await supabase
    .from("learn_quizzes")
    .select("*")
    .eq("lesson_id", lesson.id)
    .order("order_index", { ascending: true });

  const activeQuizzes = quizzes || [];

  // 5. Fetch current user progress completed lessons
  let isLoggedIn = false;
  let completedLessonIds: string[] = [];

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    isLoggedIn = true;
    const lessonIds = activeLessons.map((l) => l.id);
    const { data: progress } = await supabase
      .from("learn_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true)
      .in("lesson_id", lessonIds);

    completedLessonIds = (progress || []).map((p) => p.lesson_id);
  }

  return (
    <>
      <Navbar />
      <LessonClientView
        topic={topic}
        lessons={activeLessons}
        lesson={lesson}
        quizzes={activeQuizzes}
        initialCompletedIds={completedLessonIds}
        isLoggedIn={isLoggedIn}
      >
        <MDXRemote
          source={lesson.mdx_content || ""}
          components={MDX_COMPONENTS}
        />
      </LessonClientView>
      <Footer />
    </>
  );
}
