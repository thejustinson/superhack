"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCohortBySlug } from "@/lib/cohorts";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Loader2, Calendar, Trophy, Send, Award, Bell } from "lucide-react";
import Link from "next/link";

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user, profile } = useAuth();
  
  const [cohort, setCohort] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadHackathonData();
    }
  }, [slug]);

  const loadHackathonData = async () => {
    setLoading(true);
    try {
      const data = await getCohortBySlug(slug);
      if (!data) {
        router.push("/hackathons");
        return;
      }
      setCohort(data);

      // Fetch projects for this cohort
      const { data: projs } = await supabase
        .from("projects")
        .select(`
          *,
          profiles (
            id,
            full_name,
            university_id
          )
        `)
        .eq("cohort_id", data.id);

      // Format projects to match ProjectWithDetails
      const formattedProjs = (projs || []).map((p: any) => ({
        ...p,
        cohorts: data
      }));

      setProjects(formattedProjs);
    } catch (err) {
      console.error("Error loading hackathon:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ display: "flex", flex: 1, minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0c0f" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "#ffba08" }} />
        </div>
        <Footer />
      </>
    );
  }

  const statusVariant =
    cohort.status === "active" ? "status-active"
    : cohort.status === "upcoming" ? "status-upcoming"
    : "status-past";

  const isCohortActive = cohort.status === "active";
  const userMatchesUniversity = profile?.university_id === cohort.university_id;
  const isVerified = profile?.university_verified;

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "#0b0c0f", minHeight: "100vh", color: "#f0f0f0", paddingTop: "120px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          
          {/* Breadcrumb */}
          <div style={{ marginBottom: "24px" }}>
            <Link href="/hackathons" style={{ fontSize: "0.875rem", color: "#888888", textDecoration: "none" }}>
              ← All Hackathons
            </Link>
          </div>

          {/* Hero Section */}
          <div style={{
            backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px", padding: "40px", marginBottom: "48px"
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", marginBottom: "24px" }}>
              <div>
                <span style={{ fontSize: "0.875rem", color: "#ffba08", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                  {cohort.universities?.name}
                </span>
                <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 900, fontSize: "2.5rem", color: "#f0f0f0", margin: 0, lineHeight: 1.2 }}>
                  {cohort.title}
                </h1>
              </div>
              <Badge variant={statusVariant}>{cohort.status}</Badge>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", color: "#888888", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={16} />
                <span>
                  {new Date(cohort.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric" })} — {new Date(cohort.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Trophy size={16} />
                <span>$250 Prize Pool</span>
              </div>
            </div>
          </div>

          {/* Prize Breakdown Section */}
          <section style={{ marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.5rem", fontWeight: 900, marginBottom: "24px" }}>Prize Breakdown</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {[
                { place: "1st Place", prize: "$100", label: "Best Overall Program" },
                { place: "2nd Place", prize: "$70", label: "Runner-Up Design/Logic" },
                { place: "3rd Place", prize: "$50", label: "Third Place Submission" },
                { place: "Community Vote", prize: "$30", label: "Voted Best Project" },
              ].map((p, idx) => (
                <div key={p.place} style={{
                  backgroundColor: idx === 0 ? "rgba(255,186,8,0.06)" : "#111318",
                  border: idx === 0 ? "1px solid rgba(255,186,8,0.2)" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px", padding: "24px", textAlign: "center"
                }}>
                  <Award size={20} style={{ color: idx === 0 ? "#ffba08" : "#888888", margin: "0 auto 12px" }} />
                  <span style={{ fontSize: "0.75rem", color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>{p.place}</span>
                  <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "2rem", fontWeight: 900, color: idx === 0 ? "#ffba08" : "#f0f0f0", display: "block", margin: "6px 0" }}>{p.prize}</span>
                  <span style={{ fontSize: "0.8125rem", color: "#888888" }}>{p.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Dynamic Banner CTA based on Eligibility */}
          <div style={{ marginBottom: "56px" }}>
            {isCohortActive ? (
              user ? (
                isVerified ? (
                  userMatchesUniversity ? (
                    <div style={{
                      backgroundColor: "rgba(20,241,149,0.06)", border: "1px solid rgba(20,241,149,0.2)",
                      borderRadius: "12px", padding: "32px", display: "flex", flexWrap: "wrap",
                      justifyContent: "space-between", alignItems: "center", gap: "20px"
                    }}>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.25rem", margin: "0 0 6px" }}>You are eligible to submit!</h3>
                        <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0 }}>Submissions are open for builders from {cohort.universities?.name}.</p>
                      </div>
                      <Link href="/submit" style={{
                        display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffba08",
                        color: "#0b0c0f", fontWeight: 600, fontSize: "0.875rem", padding: "12px 24px",
                        borderRadius: "8px", textDecoration: "none"
                      }}>
                        <Send size={15} /> Submit your project
                      </Link>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "12px", padding: "32px", display: "flex", flexWrap: "wrap",
                      justifyContent: "space-between", alignItems: "center", gap: "20px"
                    }}>
                      <div style={{ flex: 1, minWidth: "260px" }}>
                        <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.25rem", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Bell size={18} style={{ color: "#ffba08" }} /> This cohort is restricted
                        </h3>
                        <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0, lineHeight: 1.5 }}>
                          This cohort is specifically for students of <strong>{cohort.universities?.name}</strong>. Ring the bell to request a Superhack cohort at your school!
                        </p>
                      </div>
                      <Link href="/apply" style={{
                        backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                        color: "#f0f0f0", fontWeight: 600, fontSize: "0.875rem", padding: "12px 24px",
                        borderRadius: "8px", textDecoration: "none"
                      }}>
                        Apply for your school
                      </Link>
                    </div>
                  )
                ) : (
                  <div style={{
                    backgroundColor: "rgba(255,186,8,0.06)", border: "1px solid rgba(255,186,8,0.2)",
                    borderRadius: "12px", padding: "32px", display: "flex", flexWrap: "wrap",
                    justifyContent: "space-between", alignItems: "center", gap: "20px"
                  }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.25rem", margin: "0 0 6px" }}>Verify your student email</h3>
                      <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0 }}>You must verify your university email domain on your dashboard before submitting projects.</p>
                    </div>
                    <Link href="/dashboard" style={{
                      backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                      fontSize: "0.875rem", padding: "12px 24px", borderRadius: "8px",
                      textDecoration: "none"
                    }}>
                      Go to Dashboard
                    </Link>
                  </div>
                )
              ) : (
                <div style={{
                  backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px", padding: "32px", display: "flex", flexWrap: "wrap",
                  justifyContent: "space-between", alignItems: "center", gap: "20px"
                }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.25rem", margin: "0 0 6px" }}>Join the Hackathon</h3>
                    <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0 }}>Log in to view submission requirements or register for this cohort.</p>
                  </div>
                  <Link href="/auth" style={{
                    backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                    fontSize: "0.875rem", padding: "12px 24px", borderRadius: "8px",
                    textDecoration: "none"
                  }}>
                    Log In / Sign Up
                  </Link>
                </div>
              )
            ) : null}
          </div>

          {/* Submissions Section */}
          <section>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.5rem", fontWeight: 900, marginBottom: "24px" }}>Submitted Projects</h2>
            {projects.length === 0 ? (
              <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "56px 24px", textAlign: "center", color: "#888888" }}>
                No projects submitted to this cohort yet.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
