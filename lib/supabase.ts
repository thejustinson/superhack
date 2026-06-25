import { createBrowserClient } from "@supabase/ssr";

// ─── Database Types ──────────────────────────────────────────
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UniversityVerification = {
  id: string;
  user_id: string;
  university_email: string;
  token: string;
  expires_at: string;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          city: string | null;
          state: string | null;
          logo_url: string | null;
          email_domain: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["universities"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["universities"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          university_id: string | null;
          university_email: string | null;
          university_verified: boolean;
          is_admin: boolean;
          created_at: string;
          username: string | null;
          about: string | null;
          avatar_url: string | null;
          twitter_url: string | null;
          github_url: string | null;
          website_url: string | null;
          university_verification_code: string | null;
          university_verification_expires_at: string | null;
          pending_university_email: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at"> & { id: string };
        Update: Partial<Omit<Database["public"]["Tables"]["profiles"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
      cohorts: {
        Row: {
          id: string;
          university_id: string;
          title: string;
          slug: string;
          status: "upcoming" | "active" | "past";
          start_date: string | null;
          end_date: string | null;
          prize_pool: Json;
          scope: "university" | "faculty";
          faculty_name: string | null;
          faculty_logo_url: string | null;
          results_announced: boolean | null;
          results_announcement_date: string | null;
          description: string | null;
          kickoff_meeting_url: string | null;
          luma_event_url: string | null;
          luma_embed_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cohorts"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["cohorts"]["Insert"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          cohort_id: string;
          user_id: string;
          name: string;
          description: string | null;
          github_url: string | null;
          live_url: string | null;
          solana_address: string | null;
          upvote_count: number;
          created_at: string;
          logo_url: string | null;
          tagline: string | null;
          twitter_url: string | null;
          telegram_url: string | null;
          website_url: string | null;
          screenshots: string[] | null;
          status: "draft" | "submitted" | "winner";
          prize_place: string | null;
          slug: string | null;
          project_slug: string | null;
          category: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "upvote_count" | "status" | "prize_place"> & { 
          id?: string; 
          upvote_count?: number;
          status?: "draft" | "submitted" | "winner";
          prize_place?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      votes: {
        Row: { id: string; project_id: string; user_id: string; created_at: string };
        Insert: { id?: string; project_id: string; user_id: string };
        Update: never;
        Relationships: [];
      };
      university_verifications: {
        Row: UniversityVerification;
        Insert: Omit<UniversityVerification, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<UniversityVerification, "id" | "created_at"> & { id?: string }>;
        Relationships: [];
      };
      ideas: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          difficulty: "beginner" | "intermediate" | "advanced" | null;
          problem: string | null;
          solution: string | null;
          suggested_stack: string[] | null;
          upvote_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ideas"]["Row"], "id" | "created_at" | "upvote_count"> & { id?: string; upvote_count?: number };
        Update: Partial<Omit<Database["public"]["Tables"]["ideas"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
      idea_votes: {
        Row: { id: string; idea_id: string; user_id: string; created_at: string };
        Insert: { id?: string; idea_id: string; user_id: string };
        Update: never;
        Relationships: [];
      };
      host_applications: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          university_name: string;
          faculty_name: string | null;
          role: string | null;
          why: string | null;
          estimated_attendance: number | null;
          status: "pending" | "reviewed" | "approved" | "rejected";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["host_applications"]["Row"], "id" | "created_at" | "status"> & { id?: string; status?: "pending" | "reviewed" | "approved" | "rejected" };
        Update: Partial<Omit<Database["public"]["Tables"]["host_applications"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
      learn_topics: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          cover_image_url: string | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["learn_topics"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["learn_topics"]["Insert"]>;
        Relationships: [];
      };
      learn_lessons: {
        Row: {
          id: string;
          topic_id: string;
          title: string;
          slug: string;
          mdx_content: string | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["learn_lessons"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["learn_lessons"]["Insert"]>;
        Relationships: [];
      };
      learn_quizzes: {
        Row: {
          id: string;
          lesson_id: string;
          question: string;
          type: "multiple_choice" | "true_false" | "code_challenge";
          options: Json;
          correct_answer: string;
          explanation: string | null;
          function_name: string | null;
          test_input: Json | null;
          order_index: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["learn_quizzes"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["learn_quizzes"]["Insert"]>;
        Relationships: [];
      };
      learn_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          quiz_passed: boolean;
          completed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["learn_progress"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["learn_progress"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      increment_upvote: { Args: { project_id: string }; Returns: void };
      decrement_upvote: { Args: { project_id: string }; Returns: void };
      sync_cohort_status: { Args: Record<string, never>; Returns: void };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ─── Convenience row types ───────────────────────────────────
export type University = Database["public"]["Tables"]["universities"]["Row"];
export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type Cohort = Database["public"]["Tables"]["cohorts"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];
export type Idea = Database["public"]["Tables"]["ideas"]["Row"];
export type IdeaVote = Database["public"]["Tables"]["idea_votes"]["Row"];
export type HostApplication = Database["public"]["Tables"]["host_applications"]["Row"];

// Joined types used across the app
export type CohortWithUniversity = Cohort & { universities: University };
export type ProjectWithDetails = Project & {
  profiles: Pick<UserProfile, "id" | "full_name" | "university_id" | "username">;
  cohorts: Cohort & { universities: University };
};

// ─── Browser client (used in Client Components) ──────────────
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function getClient() {
  return supabase;
}
