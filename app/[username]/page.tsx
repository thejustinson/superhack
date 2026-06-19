"use client";

import { useEffect, useState, use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Globe, GitFork, Share2, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { notFound } from "next/navigation";

const containerStyle: React.CSSProperties = {
  maxWidth: "1024px",
  margin: "0 auto",
  padding: "0 24px",
};

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  if (username && isReservedUsername(username)) {
    notFound();
  }

  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState<any>(null);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .maybeSingle();

        if (profileError || !profileData) {
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch university if verified
        if (profileData.university_id) {
          const { data: uniData } = await supabase
            .from("universities")
            .select("*")
            .eq("id", profileData.university_id)
            .maybeSingle();
          setUniversity(uniData);
        }

        // Fetch user's projects
        const { data: projectsData } = await supabase
          .from("projects")
          .select(`
            *,
            profiles!user_id (full_name, username),
            cohorts (
              title,
              slug,
              universities (name, slug)
            )
          `)
          .eq("user_id", profileData.id)
          .order("created_at", { ascending: false });

        const formatted = (projectsData || []).map((p: any) => ({
          ...p,
          builder: {
            full_name: p.profiles?.full_name || profileData.full_name || "Anonymous",
            username: p.profiles?.username || profileData.username || "",
          },
          cohort: p.cohorts ? {
            title: p.cohorts.title,
            slug: p.cohorts.slug,
          } : null,
          university: p.cohorts?.universities ? {
            name: p.cohorts.universities.name,
            slug: p.cohorts.universities.slug,
          } : null,
        }));

        setProjects(formatted);
      } catch (err) {
        console.error("Error fetching public profile:", err);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchProfileData();
    }
  }, [username]);

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

  if (!profile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100svh" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", backgroundColor: "#0b0c0f" }}>
          <h2 style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "#f0f0f0" }}>Profile @{username} not found</h2>
          <Link href="/projects" style={{ color: "#ffba08", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={16} /> Explore projects
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = (profile.full_name || username).split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100svh", backgroundColor: "#0b0c0f" }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: "120px", paddingBottom: "96px" }}>
        <div style={containerStyle}>
          {/* Profile Header */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "48px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "40px"
          }}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || username}
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255, 186, 8, 0.25)",
                  marginBottom: "20px"
                }}
              />
            ) : (
              <div style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 186, 8, 0.1)",
                border: "2px solid rgba(255, 186, 8, 0.2)",
                color: "#ffba08",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 900,
                marginBottom: "20px"
              }}>
                {initials}
              </div>
            )}

            <h1 style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "2rem",
              fontWeight: 900,
              color: "#f0f0f0",
              margin: "0 0 4px 0"
            }}>
              {profile.full_name || `@${username}`}
            </h1>
            <p style={{ color: "#ffba08", fontSize: "0.9375rem", margin: "0 0 16px 0", fontWeight: 500 }}>
              @{profile.username}
            </p>

            {university && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(20, 241, 149, 0.08)",
                border: "1px solid rgba(20, 241, 149, 0.2)",
                color: "#14F195",
                fontSize: "0.8125rem",
                padding: "6px 12px",
                borderRadius: "20px",
                marginBottom: "16px"
              }} nests-lucide="true">
                <ShieldCheck size={14} />
                <span>Verified Student at {university.name}</span>
              </div>
            )}

            {profile.about && (
              <p style={{
                maxWidth: "600px",
                color: "#888888",
                fontSize: "0.9375rem",
                lineHeight: 1.6,
                margin: "0 0 24px 0"
              }}>
                {profile.about}
              </p>
            )}

            {/* Social & Contact Links */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }} nests-lucide="true">
              {profile.twitter_url && (
                <Link
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.875rem",
                    color: "#888888",
                    textDecoration: "none",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ffba08"}
                  onMouseLeave={e => e.currentTarget.style.color = "#888888"}
                >
                  <Share2 size={15} /> Twitter
                </Link>
              )}

              {profile.github_url && (
                <Link
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.875rem",
                    color: "#888888",
                    textDecoration: "none",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ffba08"}
                  onMouseLeave={e => e.currentTarget.style.color = "#888888"}
                >
                  <GitFork size={15} /> GitHub
                </Link>
              )}

              {profile.website_url && (
                <Link
                  href={profile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.875rem",
                    color: "#888888",
                    textDecoration: "none",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ffba08"}
                  onMouseLeave={e => e.currentTarget.style.color = "#888888"}
                >
                  <Globe size={15} /> Website
                </Link>
              )}
            </div>
          </div>

          {/* Builder's Projects Section */}
          <div>
            <h2 style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#f0f0f0",
              marginBottom: "24px"
            }}>
              Projects ({projects.length})
            </h2>

            {projects.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px"
              }}>
                {projects.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: "#111318",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "12px",
                padding: "40px",
                textAlign: "center",
                color: "#888888"
              }}>
                This builder hasn&apos;t submitted any projects yet.
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
