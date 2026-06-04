"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldCheck, Mail, AlertTriangle, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { OTPInput } from "@/components/ui/OTPInput";

function DashboardContent() {
  const { user, profile, refreshProfile } = useAuth();

  if (!user) {
    return null;
  }

  const [projects, setProjects] = useState<any[]>([]);
  const [upvotedProjects, setUpvotedProjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Verification state
  const [verificationStep, setVerificationStep] = useState<"input" | "verify">("input");
  const [uniEmail, setUniEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [detectedUni, setDetectedUni] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      // Fetch user's own projects
      const { data: ownProjects, error: err1 } = await supabase
        .from("projects")
        .select(`
          *,
          cohorts (
            id,
            title,
            slug,
            universities (
              name
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!err1 && ownProjects) setProjects(ownProjects);

      // Fetch projects upvoted by the user
      const { data: votes, error: err2 } = await supabase
        .from("votes")
        .select(`
          project_id,
          projects (
            *,
            cohorts (
              id,
              title,
              slug,
              universities (
                name
              )
            )
          )
        `)
        .eq("user_id", user.id);

      if (!err2 && votes) {
        const upvoted = votes
          .map((v: any) => v.projects)
          .filter((p: any) => p !== null);
        setUpvotedProjects(upvoted);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setUniEmail(email);
    setVerificationError("");

    if (email.includes("@")) {
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain) {
        const { data } = await supabase
          .from("universities")
          .select("id, name")
          .eq("email_domain", domain)
          .maybeSingle();

        if (data) {
          setDetectedUni(data);
        } else {
          setDetectedUni(null);
        }
      }
    } else {
      setDetectedUni(null);
    }
  };

  const startVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniEmail.trim() || !user) return;
    setVerificationLoading(true);
    setVerificationError("");

    const domain = uniEmail.split("@")[1]?.toLowerCase();
    if (!domain) {
      setVerificationError("Invalid email address.");
      setVerificationLoading(false);
      return;
    }

    // Double check domain exists in system
    const { data: uni } = await supabase
      .from("universities")
      .select("id, name")
      .eq("email_domain", domain)
      .maybeSingle();

    if (!uni) {
      setVerificationError(`We couldn't find a registered university with the domain "${domain}". Contact support to add yours!`);
      setVerificationLoading(false);
      return;
    }

    setDetectedUni(uni);

    try {
      const res = await fetch("/api/verify-university", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityEmail: uniEmail.trim().toLowerCase(), userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");

      setVerificationStep("verify");
    } catch (err: any) {
      setVerificationError(err.message || "Failed to send verification code.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const completeVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verificationCode.length !== 6 || !user || !detectedUni) return;
    setVerificationLoading(true);
    setVerificationError("");

    try {
      const res = await fetch("/api/verify-university", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityEmail: uniEmail.trim().toLowerCase(),
          token: verificationCode,
          userId: user.id,
          universityId: detectedUni.id
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setVerificationSuccess(true);
      await refreshProfile();
      setTimeout(() => {
        setVerificationStep("input");
      }, 3000);
    } catch (err: any) {
      setVerificationError(err.message || "Invalid or expired verification code.");
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <main style={{ backgroundColor: "#0b0c0f", minHeight: "100vh", color: "#f0f0f0", paddingTop: "80px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 900, fontSize: "2rem", color: "#f0f0f0", margin: "0 0 6px" }}>
              Hey, {profile?.full_name || "Builder"}
            </h1>
            <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: "0.875rem", color: "#888888", margin: 0 }}>
              Welcome back to your hacker dashboard.
            </p>
          </div>
          
          {profile?.university_verified && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(20,241,149,0.06)", border: "1px solid rgba(20,241,149,0.2)", borderRadius: "20px", padding: "6px 14px" }}>
              <ShieldCheck size={14} style={{ color: "#14F195" }} />
              <span style={{ fontSize: "0.75rem", color: "#14F195", fontWeight: 600 }}>University Verified</span>
            </div>
          )}
        </div>

        {/* Verification banner if not verified */}
        {!profile?.university_verified && (
          <div style={{
            backgroundColor: "#111318", border: "1px solid #ffba08", borderRadius: "12px",
            padding: "24px", marginBottom: "40px", position: "relative"
          }}>
            <AnimatePresence mode="wait">
              {verificationSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <ShieldCheck size={32} style={{ color: "#14F195" }} />
                  <div>
                    <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.15rem", margin: "0 0 4px" }}>Verification Successful!</h3>
                    <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0 }}>Your university profile has been activated. You can now submit projects.</p>
                  </div>
                </motion.div>
              ) : verificationStep === "input" ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.25rem", margin: "0 0 6px", color: "#ffba08" }}>
                    Verify your university email to submit projects
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#888888", margin: "0 0 16px", maxWidth: "600px", lineHeight: 1.5 }}>
                    Hackathons are university-restricted. Enter your official university email (e.g. name@unilag.edu.ng) to verify and unlock submissions.
                  </p>
                  
                  <form onSubmit={startVerification} style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                    <div style={{ flex: "1", minWidth: "260px" }}>
                      <input
                        type="email"
                        placeholder="you@youruniversity.edu.ng"
                        value={uniEmail}
                        onChange={handleEmailChange}
                        required
                        style={{
                          width: "100%", backgroundColor: "#0b0c0f",
                          border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px",
                          padding: "10px 14px", fontSize: "0.875rem", color: "#f0f0f0",
                          outline: "none"
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={verificationLoading}
                      style={{
                        backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                        fontSize: "0.875rem", padding: "10px 20px", borderRadius: "8px",
                        border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
                      }}
                    >
                      {verificationLoading ? <Loader2 size={14} className="animate-spin" /> : "Send verification"}
                    </button>
                  </form>
                  {detectedUni && (
                    <p style={{ fontSize: "0.75rem", color: "#14F195", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShieldCheck size={12} /> Detected University: {detectedUni.name}
                    </p>
                  )}
                  {verificationError && (
                    <p style={{ fontSize: "0.8125rem", color: "#f87171", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertTriangle size={12} /> {verificationError}
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.25rem", margin: "0 0 6px", color: "#ffba08" }}>
                    Enter verification code
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#888888", margin: "0 0 16px" }}>
                    We sent a 6-digit code to <span style={{ color: "#f0f0f0" }}>{uniEmail}</span> (check your console output in dev mode).
                  </p>
                  
                  <form onSubmit={completeVerification} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "320px" }}>
                    <OTPInput
                      value={verificationCode}
                      onChange={setVerificationCode}
                      onComplete={() => completeVerification()}
                    />
                    
                    {verificationError && (
                      <p style={{ fontSize: "0.8125rem", color: "#f87171", margin: 0 }}>{verificationError}</p>
                    )}

                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        type="submit"
                        disabled={verificationLoading || verificationCode.length !== 6}
                        style={{
                          backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                          fontSize: "0.875rem", padding: "10px 20px", borderRadius: "8px",
                          border: "none", cursor: "pointer", flex: 1
                        }}
                      >
                        {verificationLoading ? <Loader2 size={14} className="animate-spin" /> : "Verify Code"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerificationStep("input")}
                        style={{
                          backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                          color: "#888888", fontSize: "0.875rem", padding: "10px 20px", borderRadius: "8px",
                          cursor: "pointer"
                        }}
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Dashboard Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}>
          
          {/* My Projects */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 900, fontSize: "1.5rem" }}>My Projects</h2>
              {profile?.university_verified ? (
                <Link href="/submit" style={{
                  display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#ffba08",
                  color: "#0b0c0f", fontWeight: 600, fontSize: "0.8125rem", padding: "8px 14px",
                  borderRadius: "6px", textDecoration: "none"
                }}>
                  <Plus size={14} /> Submit Project
                </Link>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "#888888" }}>Verify email to submit</span>
              )}
            </div>

            {loadingData ? (
              <div style={{ display: "flex", padding: "40px", justifyContent: "center" }}><Loader2 className="animate-spin" style={{ color: "#ffba08" }} /></div>
            ) : projects.length === 0 ? (
              <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "48px 24px", textAlign: "center" }}>
                <p style={{ color: "#888888", fontSize: "0.9375rem", margin: "0 0 16px" }}>You haven&apos;t submitted any projects yet.</p>
                {profile?.university_verified && (
                  <Link href="/submit" style={{ color: "#ffba08", fontSize: "0.875rem", fontWeight: 500, textDecoration: "underline" }}>
                    Submit your first project
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {projects.map((proj) => (
                  <ProjectCard key={proj.id} project={{
                    ...proj,
                    profiles: { id: user.id, full_name: profile?.full_name || "", university_id: profile?.university_id || null },
                    cohorts: proj.cohorts
                  }} />
                ))}
              </div>
            )}
          </section>

          {/* Upvoted Projects */}
          <section>
            <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 900, fontSize: "1.5rem", marginBottom: "20px" }}>Upvoted Projects</h2>
            {loadingData ? (
              <div style={{ display: "flex", padding: "40px", justifyContent: "center" }}><Loader2 className="animate-spin" style={{ color: "#ffba08" }} /></div>
            ) : upvotedProjects.length === 0 ? (
              <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "36px 24px", textAlign: "center" }}>
                <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0 }}>You haven&apos;t upvoted any projects yet.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {upvotedProjects.map((proj) => (
                  <ProjectCard key={proj.id} project={proj} />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
