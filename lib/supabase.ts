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
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "upvote_count"> & { id?: string; upvote_count?: number };
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
          difficulty: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ideas"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Database["public"]["Tables"]["ideas"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      increment_upvote: { Args: { project_id: string }; Returns: void };
      decrement_upvote: { Args: { project_id: string }; Returns: void };
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

// Joined types used across the app
export type CohortWithUniversity = Cohort & { universities: University };
export type ProjectWithDetails = Project & {
  profiles: Pick<UserProfile, "id" | "full_name" | "university_id">;
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
