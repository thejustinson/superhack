"use client";

import { useEffect, useState, use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/AuthContext";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { WinnerBadge } from "@/components/ui/WinnerBadge";
import { CopyButton } from "@/components/ui/CopyButton";
import { SimilarProjects } from "@/components/project/SimilarProjects";
import { EditSlideOver } from "@/components/project/EditSlideOver";
import ReactMarkdown from "react-markdown";
import {
  ChevronUp,
  GitFork,
  Globe,
  Share2,
  Send,
  ExternalLink,
  Edit3,
  ArrowLeft,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { upvoteProject } from "@/lib/projects";

const containerStyle: React.CSSProperties = {
  maxWidth: "1152px",
  margin: "0 auto",
  padding: "0 24px",
};

export default function ProjectDetailSlugPage({ params }: { params: Promise<{ username: string; "project-slug": string }> }) {
  const { username, "project-slug": projectSlug } = use(params);
  const { user } = useUser();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVoted, setIsVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [voteLoading, setVoteLoading] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  async function fetchProject() {
    try {
      // Query projects and filter using inner join on profiles
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles!inner (id, full_name, university_id, username),
          cohorts (
            id,
            title,
            prize_pool,
            universities (name, logo_url)
          )
        `)
        .eq("profiles.username", username)
        .eq("project_slug", projectSlug)
        .single();

      if (error) throw error;
      setProject(data);
      setVoteCount(data.upvote_count || 0);

      if (user) {
        const { data: voteData } = await supabase
          .from("votes")
          .select("id")
          .eq("project_id", data.id)
          .eq("user_id", user.id)
          .maybeSingle();

        setIsVoted(!!voteData);
      }
    } catch (err) {
      console.error("Error fetching project by slug:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProject();
  }, [username, projectSlug, user]);

  async function handleVote() {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }
    if (voteLoading) return;
    setVoteLoading(true);

    try {
      if (isVoted) {
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("project_id", project.id)
          .eq("user_id", user.id);

        if (error) throw error;
        setIsVoted(false);
        setVoteCount((c) => Math.max(0, c - 1));
      } else {
        await upvoteProject(project.id, user.id);
        setIsVoted(true);
        setVoteCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Upvote/unvote failed:", err);
    } finally {
      setVoteLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100svh" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0c0f" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255, 186, 8, 0.2)",
              borderTopColor: "#ffba08",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100svh" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", backgroundColor: "#0b0c0f" }}>
          <h2 style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "#f0f0f0" }}>Project not found</h2>
          <Link href="/projects" style={{ color: "#ffba08", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={16} /> Back to showcase
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === project.user_id;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100svh", paddingTop: "100px", paddingBottom: "96px", backgroundColor: "#0b0c0f" }}>
        {/* Back Link */}
        <div style={{ ...containerStyle, marginBottom: "24px" }}>
          <Link
            href="/projects"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#888888",
              textDecoration: "none",
              fontSize: "0.875rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
          >
            <ArrowLeft size={16} /> Back to showcase
          </Link>
        </div>

        {/* Hero Section */}
        <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "48px", marginBottom: "48px" }}>
          <div style={{ ...containerStyle, position: "relative" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "24px",
              }}
            >
              {/* Logo */}
              {project.logo_url ? (
                <img
                  src={project.logo_url}
                  alt={project.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                  }}
                />
              ) : (
                <InitialsAvatar name={project.name} size={80} />
              )}

              {/* Title & Metadata */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  {project.status === "winner" && (
                    <WinnerBadge place={project.prize_place} />
                  )}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#888888",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {project.cohorts?.title}
                  </span>
                </div>

                <h1
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                    color: "#f0f0f0",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {project.name}
                </h1>

                {project.tagline && (
                  <p style={{ color: "#888888", fontSize: "1.125rem", margin: "8px 0 0 0", lineHeight: 1.4 }}>
                    {project.tagline}
                  </p>
                )}

                <p style={{ fontSize: "0.8125rem", color: "#666666", margin: "12px 0 0 0" }}>
                  Shipped by <Link href={`/${project.profiles?.username}`} style={{ color: "#ffba08", fontWeight: 500, textDecoration: "none" }}>@{project.profiles?.username}</Link>
                  {project.cohorts?.universities?.name && ` · ${project.cohorts.universities.name}`}
                </p>
              </div>

              {/* Voting & Action Column */}
              <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "flex-end" }}>
                {isOwner && (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      padding: "10px 18px",
                      color: "#f0f0f0",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Edit Profile</span>
                  </button>
                )}

                {/* Vote Button */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={handleVote}
                    disabled={voteLoading}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: isVoted ? "rgba(255, 186, 8, 0.12)" : "rgba(255, 255, 255, 0.05)",
                      border: "1px solid",
                      borderColor: isVoted ? "#ffba08" : "rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      padding: "10px 18px",
                      color: isVoted ? "#ffba08" : "#f0f0f0",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isVoted) {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isVoted) {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                      }
                    }}
                  >
                    <ChevronUp size={16} strokeWidth={2.5} />
                    <span>Upvote</span>
                    <span
                      style={{
                        paddingLeft: "6px",
                        borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
                        fontWeight: 700,
                      }}
                    >
                      {voteCount}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showLoginPrompt && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          position: "absolute",
                          bottom: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          marginBottom: "8px",
                          backgroundColor: "#ffba08",
                          color: "#0b0c0f",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                          zIndex: 10,
                        }}
                      >
                        Sign in to vote
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div style={containerStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "48px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "48px",
              }}
            >
              {/* Left Column */}
              <div style={{ flex: "2 1 600px", minWidth: 0, display: "flex", flexDirection: "column", gap: "40px" }}>
                <div>
                  <h2
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      color: "#f0f0f0",
                      marginBottom: "16px",
                    }}
                  >
                    About the project
                  </h2>

                  <div
                    style={{
                      color: "#888888",
                      fontSize: "0.9375rem",
                      lineHeight: 1.7,
                      fontFamily: "var(--font-dm-sans), sans-serif",
                    }}
                  >
                    {project.description ? (
                      <div className="prose prose-invert">
                        <ReactMarkdown>{project.description}</ReactMarkdown>
                      </div>
                    ) : (
                      <p style={{ fontStyle: "italic" }}>No description provided.</p>
                    )}
                  </div>
                </div>

                {/* Screenshots Strip */}
                {project.screenshots && project.screenshots.length > 0 && (
                  <div>
                    <h2
                      style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        color: "#f0f0f0",
                        marginBottom: "16px",
                      }}
                    >
                      Product Screenshots
                    </h2>
                    <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px" }}>
                      {project.screenshots.map((url: string, index: number) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${project.name} Screenshot ${index + 1}`}
                          onClick={() => setActiveLightboxImage(url)}
                          style={{
                            height: "140px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            cursor: "zoom-in",
                            objectFit: "cover",
                            transition: "opacity 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* Launch / Links Card */}
                <div
                  style={{
                    backgroundColor: "#111318",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: "#f0f0f0",
                      margin: 0,
                    }}
                  >
                    Links & Launch
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {project.live_url && (
                      <Link
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          backgroundColor: "#ffba08",
                          color: "#0b0c0f",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textDecoration: "none",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Globe size={16} /> Open Web App
                        </span>
                        <ExternalLink size={14} />
                      </Link>
                    )}

                    {project.github_url && (
                      <Link
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "#f0f0f0",
                          borderRadius: "8px",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          textDecoration: "none",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <GitFork size={16} /> GitHub Repository
                        </span>
                        <ExternalLink size={14} />
                      </Link>
                    )}

                    {project.website_url && (
                      <Link
                        href={project.website_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          color: "#888888",
                          borderRadius: "8px",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          textDecoration: "none",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Globe size={16} /> Project Website
                        </span>
                        <ExternalLink size={14} />
                      </Link>
                    )}
                  </div>

                  {/* Social Handles */}
                  {(project.twitter_url || project.telegram_url) && (
                    <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "16px" }}>
                      {project.twitter_url && (
                        <Link
                          href={project.twitter_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.8125rem",
                            color: "#888888",
                            textDecoration: "none",
                          }}
                        >
                          <Share2 size={14} /> Twitter
                        </Link>
                      )}
                      {project.telegram_url && (
                        <Link
                          href={project.telegram_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.8125rem",
                            color: "#888888",
                            textDecoration: "none",
                          }}
                        >
                          <Send size={14} /> Telegram
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Solana Address Box */}
                {project.solana_address && (
                  <div
                    style={{
                      backgroundColor: "#111318",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#888888",
                        margin: 0,
                      }}
                    >
                      Solana Wallet Address
                    </h4>
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.8125rem",
                        color: "#f0f0f0",
                        wordBreak: "break-all",
                        margin: 0,
                        backgroundColor: "rgba(0,0,0,0.2)",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {project.solana_address}
                    </p>
                    <CopyButton value={project.solana_address} label="Copy Solana Address" />
                  </div>
                )}

                {/* Similar projects / Same cohort */}
                <SimilarProjects currentProjectId={project.id} cohortId={project.cohort_id} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxImage(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              cursor: "zoom-out",
            }}
          >
            <button
              onClick={() => setActiveLightboxImage(null)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "transparent",
                border: "none",
                color: "#888888",
                cursor: "pointer",
              }}
            >
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={activeLightboxImage}
              alt="Screenshot Lightbox"
              style={{
                maxWidth: "90%",
                maxHeight: "85%",
                borderRadius: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <EditSlideOver
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
        onSave={fetchProject}
      />
    </>
  );
}
