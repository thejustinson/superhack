"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUniversityBySlug } from "@/lib/universities";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin, Calendar, Trophy, Medal, ArrowRight, Layers, FileCode, Users } from "lucide-react";
import Link from "next/link";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { projectPath } from "@/lib/utils";

type Tab = "overview" | "projects" | "cohorts" | "winners";

export default function UniversityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [uni, setUni] = useState<any>(null);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [builderCount, setBuilderCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedCohortId, setSelectedCohortId] = useState<string>("all");

  useEffect(() => {
    if (slug) {
      loadUniversityData();
    }
  }, [slug]);

  const loadUniversityData = async () => {
    setLoading(true);
    try {
      // Sync cohort status
      try {
        await supabase.rpc("sync_cohort_status");
      } catch (err) {
        console.error("Failed to sync cohort status:", err);
      }

      const university = await getUniversityBySlug(slug);
      if (!university) {
        router.push("/universities");
        return;
      }
      setUni(university);

      // Fetch cohorts for this university
      const { data: uniCohorts } = await supabase
        .from("cohorts")
        .select("*")
        .eq("university_id", university.id)
        .order("start_date", { ascending: false });

      const cohortsList = uniCohorts || [];
      setCohorts(cohortsList);

      if (cohortsList.length > 0) {
        const cohortIds = cohortsList.map((c) => c.id);
        
        // Fetch projects for these cohorts
        const { data: uniProjects } = await supabase
          .from("projects")
          .select(`
            *,
            profiles!user_id (
              full_name,
              username
            ),
            cohorts (
              title,
              slug,
              universities (name, slug)
            )
          `)
          .in("cohort_id", cohortIds)
          .order("upvote_count", { ascending: false });

        const formatted = (uniProjects || []).map((p: any) => {
          const matchedCohort = cohortsList.find((c) => c.id === p.cohort_id);
          return {
            ...p,
            builder: {
              full_name: p.profiles?.full_name || "Anonymous",
              username: p.profiles?.username || "",
            },
            cohort: matchedCohort ? {
              title: matchedCohort.title,
              slug: matchedCohort.slug,
            } : null,
            university: university ? {
              name: university.name,
              slug: university.slug,
            } : null,
          };
        });
        setProjects(formatted);

        // Calculate builder count
        const uniqueBuilders = new Set(formatted.map((p) => p.user_id)).size;
        setBuilderCount(uniqueBuilders);
      }
    } catch (err) {
      console.error("Error loading university page data:", err);
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

  // Filter cohorts
  const activeCohort = cohorts.find((c) => c.status === "active");
  const upcomingCohort = cohorts.find((c) => c.status === "upcoming");

  // Filter projects by cohort select dropdown
  const filteredProjects = selectedCohortId === "all" 
    ? projects
    : projects.filter((p) => p.cohort_id === selectedCohortId);

  // Winners: projects with highest votes
  const winners = [...projects]
    .sort((a, b) => b.upvote_count - a.upvote_count)
    .slice(0, 3)
    .filter((p) => p.upvote_count > 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "cohorts", label: "Cohorts" },
    { id: "winners", label: "Winners" },
  ];

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "#0b0c0f", minHeight: "100vh", color: "#f0f0f0", paddingTop: "120px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          
          {/* Back Link */}
          <div style={{ marginBottom: "24px" }}>
            <Link href="/universities" style={{ fontSize: "0.875rem", color: "#888888", textDecoration: "none" }}>
              ← All Universities
            </Link>
          </div>

          {/* Header Section */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px", marginBottom: "40px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "12px",
              backgroundColor: "rgba(255,186,8,0.12)", border: "1px solid rgba(255,186,8,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", fontWeight: 900, color: "#ffba08",
              fontFamily: "DM Sans, system-ui, sans-serif",
              overflow: "hidden", flexShrink: 0,
            }}>
              {uni.logo_url ? (
                <img
                  src={uni.logo_url}
                  alt={`${uni.name} logo`}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                uni.name.charAt(0)
              )}
            </div>
            <div>
              <h1 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 900, fontSize: "2.25rem", margin: "0 0 6px" }}>
                {uni.name}
              </h1>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", color: "#888888", fontSize: "0.875rem" }}>
                {uni.city && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={14} />
                    <span>{uni.city}{uni.state && `, ${uni.state}`}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={14} />
                  <span>{cohorts.length} {cohorts.length === 1 ? "cohort" : "cohorts"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Users size={14} />
                  <span>{builderCount} {builderCount === 1 ? "builder" : "builders"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab buttons */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "32px", overflowX: "auto", paddingBottom: "2px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 20px", fontSize: "0.875rem", fontWeight: 500,
                  backgroundColor: "transparent", border: "none", cursor: "pointer",
                  color: activeTab === tab.id ? "#ffba08" : "#888888",
                  borderBottom: activeTab === tab.id ? "2px solid #ffba08" : "2px solid transparent",
                  fontFamily: "inherit", transition: "all 0.15s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content with Framer Motion AnimatePresence */}
          <div style={{ minHeight: "300px" }}>
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
                    <div>
                      <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", marginBottom: "12px" }}>About</h3>
                      <p style={{ color: "#888888", lineHeight: 1.6, fontSize: "0.9375rem", margin: 0 }}>
                        {uni.description || `${uni.name} is a leading institution in ${uni.city}, hosting campus-wide Solana builder programs and technical cohorts.`}
                      </p>
                    </div>

                    <div>
                      <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", marginBottom: "16px" }}>Active/Upcoming Program</h3>
                      
                      {activeCohort ? (
                        <div style={{
                          backgroundColor: "rgba(20,241,149,0.06)", border: "1px solid rgba(20,241,149,0.2)",
                          borderRadius: "10px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px"
                        }}>
                          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
                            <div>
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#14F195", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>
                                Active Cohort
                              </span>
                              <h4 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", margin: "0 0 6px", color: "#f0f0f0" }}>{activeCohort.title}</h4>
                              <span style={{ fontSize: "0.8125rem", color: "#888888" }}>Ends on {new Date(activeCohort.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                            <Link href={`/hackathons/${activeCohort.slug}`} style={{
                              display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#ffba08",
                              color: "#0b0c0f", fontWeight: 600, fontSize: "0.875rem", padding: "10px 20px",
                              borderRadius: "8px", textDecoration: "none"
                            }}>
                              View hackathon <ArrowRight size={14} />
                            </Link>
                          </div>
                          <CountdownTimer startDate={activeCohort.start_date} endDate={activeCohort.end_date} />
                        </div>
                      ) : upcomingCohort ? (
                        <div style={{
                          backgroundColor: "rgba(255,186,8,0.06)", border: "1px solid rgba(255,186,8,0.2)",
                          borderRadius: "10px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px"
                        }}>
                          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
                            <div>
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ffba08", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>
                                Upcoming Cohort
                              </span>
                              <h4 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", margin: "0 0 6px", color: "#f0f0f0" }}>{upcomingCohort.title}</h4>
                              <span style={{ fontSize: "0.8125rem", color: "#888888" }}>Starts on {new Date(upcomingCohort.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                            <Link href={`/hackathons/${upcomingCohort.slug}`} style={{
                              display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#111318",
                              color: "#ffba08", border: "1px solid rgba(255,186,8,0.3)", fontWeight: 600, fontSize: "0.875rem",
                              padding: "10px 20px", borderRadius: "8px", textDecoration: "none"
                            }}>
                              Details
                            </Link>
                          </div>
                          <CountdownTimer startDate={upcomingCohort.start_date} endDate={upcomingCohort.end_date} />
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: "#111318", border: "1px dashed rgba(255,255,255,0.07)",
                          borderRadius: "10px", padding: "32px", textAlign: "center"
                        }}>
                          <p style={{ color: "#888888", fontSize: "0.9375rem", margin: "0 0 16px" }}>No active cohort running at this university.</p>
                          <Link href="/apply" style={{
                            display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#ffba08",
                            color: "#0b0c0f", fontWeight: 600, fontSize: "0.875rem", padding: "10px 20px",
                            borderRadius: "8px", textDecoration: "none"
                          }}>
                            Apply to host a cohort
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "projects" && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", margin: 0 }}>Projects</h3>
                    
                    {cohorts.length > 0 && (
                      <select
                        value={selectedCohortId}
                        onChange={(e) => setSelectedCohortId(e.target.value)}
                        style={{
                          backgroundColor: "#111318", color: "#f0f0f0", border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "6px", padding: "6px 12px", fontSize: "0.8125rem", outline: "none"
                        }}
                      >
                        <option value="all">All Cohorts</option>
                        {cohorts.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {filteredProjects.length === 0 ? (
                    <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "56px 24px", textAlign: "center", color: "#888888" }}>
                      No projects submitted yet for this university.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProjects.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "cohorts" && (
                <motion.div
                  key="cohorts"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", marginBottom: "20px" }}>Cohorts History</h3>
                  
                  {cohorts.length === 0 ? (
                    <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "40px", textAlign: "center", color: "#888888" }}>
                      No cohorts have run at this university.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {cohorts.map((cohort) => (
                        <div key={cohort.id} style={{
                          backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "8px", padding: "20px", display: "flex", flexWrap: "wrap",
                          justifyContent: "space-between", alignItems: "center", gap: "16px"
                        }}>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
                            <h4 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.1rem", margin: 0 }}>{cohort.title}</h4>
                            <Badge variant={cohort.status === "active" ? "status-active" : cohort.status === "upcoming" ? "status-upcoming" : "status-past"}>
                              {cohort.status}
                            </Badge>
                            <span style={{
                              fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em",
                              textTransform: "uppercase" as const,
                              color: cohort.scope === "faculty" ? "#ffba08" : "#888888",
                              backgroundColor: cohort.scope === "faculty" ? "rgba(255,186,8,0.1)" : "rgba(255,255,255,0.05)",
                              border: `1px solid ${cohort.scope === "faculty" ? "rgba(255,186,8,0.25)" : "rgba(255,255,255,0.1)"}`,
                              padding: "2px 9px", borderRadius: "999px",
                            }}>
                              {cohort.scope === "faculty" && cohort.faculty_name ? cohort.faculty_name : "University-wide"}
                            </span>
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "32px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "#888888" }}>
                              <Calendar size={13} />
                              <span>{new Date(cohort.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })} — {new Date(cohort.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                            </div>
                            <Link href={`/hackathons/${cohort.slug}`} style={{
                              fontSize: "0.8125rem", fontWeight: 600, color: "#ffba08", textDecoration: "none"
                            }}>
                              View Cohort →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "winners" && (
                <motion.div
                  key="winners"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", marginBottom: "8px" }}>Leaderboard Winners</h3>

                  {activeCohort ? (
                    <div style={{
                      backgroundColor: "#111318", border: "1px dashed rgba(255,255,255,0.07)",
                      borderRadius: "12px", padding: "40px", display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: "20px", textAlign: "center"
                    }}>
                      <Trophy size={48} style={{ color: "#888888" }} />
                      <div>
                        <p style={{ fontWeight: 600, color: "#f0f0f0", margin: "0 0 4px", fontSize: "1.1rem" }}>
                          Winners will be announced when the hackathon ends.
                        </p>
                        <p style={{ color: "#888888", fontSize: "0.875rem", margin: "0 0 16px" }}>
                          The hackathon ends in:
                        </p>
                      </div>
                      <div style={{ width: "100%", maxWidth: "400px" }}>
                        <CountdownTimer startDate={activeCohort.start_date} endDate={activeCohort.end_date} />
                      </div>
                    </div>
                  ) : upcomingCohort ? (
                    <div style={{
                      backgroundColor: "#111318", border: "1px dashed rgba(255,255,255,0.07)",
                      borderRadius: "12px", padding: "48px 24px", display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center"
                    }}>
                      <Trophy size={48} style={{ color: "#888888" }} />
                      <div>
                        <p style={{ fontWeight: 600, color: "#f0f0f0", margin: "0 0 4px", fontSize: "1.1rem" }}>
                          Winners will be announced when the hackathon ends.
                        </p>
                        <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0 }}>
                          The hackathon hasn&apos;t started yet.
                        </p>
                      </div>
                    </div>
                  ) : winners.length === 0 ? (
                    <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "40px", textAlign: "center", color: "#888888" }}>
                      No winners announced yet. Get voting to set the leaderboards!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {winners.map((project, index) => {
                        const rankLabel = index === 0 ? "1st Place" : index === 1 ? "2nd Place" : "3rd Place";
                        const prizeAmount = "$100 school fees contribution";
                        return (
                          <div key={project.id} style={{
                            backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "10px", padding: "20px", display: "flex", flexWrap: "wrap",
                            justifyContent: "space-between", alignItems: "center", gap: "16px"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                              <div style={{
                                width: "40px", height: "40px", borderRadius: "50%",
                                backgroundColor: index <= 1 ? "rgba(255,186,8,0.15)" : "rgba(255,255,255,0.05)",
                                display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center"
                              }}>
                                <Medal size={18} style={{ color: index <= 1 ? "#ffba08" : "#888888" }} />
                              </div>
                              <div>
                                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#ffba08", fontWeight: 600 }}>{rankLabel} ({prizeAmount})</span>
                                <h4 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.15rem", margin: "4px 0 0", color: "#f0f0f0" }}>{project.name}</h4>
                                <span style={{ fontSize: "0.8125rem", color: "#888888" }}>by {project.builder?.full_name || "Builder"}</span>
                              </div>
                            </div>

                            <Link href={projectPath(project.builder?.username || "", project.project_slug || "")} style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              backgroundColor: "rgba(255,255,255,0.05)", color: "#f0f0f0", fontSize: "0.8125rem",
                              padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: 500
                            }}>
                              View Project <ArrowRight size={13} />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
