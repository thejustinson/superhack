"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { OTPInput } from "@/components/ui/OTPInput";
import { ShieldCheck, AlertTriangle, Loader2, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface University {
  id: string;
  name: string;
  email_domain: string;
}

interface Cohort {
  id: string;
  title: string;
  slug: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// â”€â”€â”€ Verified State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function VerifiedView({ profile }: { profile: any }) {
  const [university, setUniversity] = useState<University | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.university_id) { setLoading(false); return; }
    async function load() {
      const [{ data: uni }, { data: cohortData }] = await Promise.all([
        supabase
          .from("universities")
          .select("id, name, email_domain")
          .eq("id", profile.university_id)
          .single(),
        supabase
          .from("cohorts")
          .select("id, title, slug, status, start_date, end_date")
          .eq("university_id", profile.university_id)
          .in("status", ["active", "upcoming"])
          .order("start_date", { ascending: true }),
      ]);
      if (uni) setUniversity(uni as University);
      if (cohortData) setCohorts(cohortData as Cohort[]);
      setLoading(false);
    }
    load();
  }, [profile?.university_id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Success banner */}
      <div style={{
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        padding: "28px",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            backgroundColor: "rgba(20,241,149,0.08)",
            border: "1px solid rgba(20,241,149,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <ShieldCheck size={22} style={{ color: "#14F195" }} />
          </div>
          <div>
            <h2 style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "1.25rem", fontWeight: 700, color: "#f0f0f0", margin: "0 0 2px",
            }}>
              University Verified
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0 }}>
              Your university affiliation has been confirmed.
            </p>
          </div>
        </div>

        {university ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}>
            <div style={{
              backgroundColor: "#0d0f14",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "12px 16px",
            }}>
              <div style={{ fontSize: "0.6875rem", color: "#888888", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                University
              </div>
              <div style={{ fontSize: "0.9375rem", color: "#f0f0f0", fontWeight: 500 }}>
                {university.name}
              </div>
            </div>
            <div style={{
              backgroundColor: "#0d0f14",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "12px 16px",
            }}>
              <div style={{ fontSize: "0.6875rem", color: "#888888", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                Email Domain
              </div>
              <div style={{ fontSize: "0.9375rem", color: "#14F195", fontFamily: "monospace" }}>
                @{university.email_domain}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <Loader2 size={20} style={{ color: "#ffba08", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : null}
      </div>

      {/* Cohorts */}
      <div style={{ marginBottom: "8px" }}>
        <h3 style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "1rem", fontWeight: 700, color: "#f0f0f0", margin: "0 0 14px",
        }}>
          Hackathons at Your University
        </h3>

        {loading ? (
          <div style={{
            backgroundColor: "#111318",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "32px",
            display: "flex", justifyContent: "center",
          }}>
            <Loader2 size={20} style={{ color: "#ffba08", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : cohorts.length === 0 ? (
          <div style={{
            backgroundColor: "#111318",
            border: "1px dashed rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            color: "#888888",
            fontSize: "0.875rem",
          }}>
            No active or upcoming hackathons at your university right now.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {cohorts.map((cohort) => (
              <div
                key={cohort.id}
                style={{
                  backgroundColor: "#111318",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <h4 style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: "1rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {cohort.title}
                    </h4>
                    <Badge variant={cohort.status === "active" ? "status-active" : "status-upcoming"}>
                      {cohort.status}
                    </Badge>
                  </div>
                  {(cohort.start_date || cohort.end_date) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "#888888" }}>
                      <Calendar size={13} />
                      {cohort.start_date && <span>{formatDate(cohort.start_date)}</span>}
                      {cohort.start_date && cohort.end_date && <ArrowRight size={11} />}
                      {cohort.end_date && <span>{formatDate(cohort.end_date)}</span>}
                    </div>
                  )}
                </div>
                <Link
                  href={`/hackathons/${cohort.slug}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    backgroundColor: "rgba(255,186,8,0.08)",
                    border: "1px solid rgba(255,186,8,0.25)",
                    color: "#ffba08",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.08)")}
                >
                  View <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Verification Flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function VerificationFlow() {
  const { user, refreshProfile } = useAuth();

  const [verificationStep, setVerificationStep] = useState<"input" | "verify">("input");
  const [uniEmail, setUniEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [detectedUni, setDetectedUni] = useState<{ id: string; name: string } | null>(null);

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
        setDetectedUni(data ?? null);
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
          universityId: detectedUni.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setVerificationSuccess(true);
      await refreshProfile();
    } catch (err: any) {
      setVerificationError(err.message || "Invalid or expired verification code.");
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#111318",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "12px",
      padding: "28px",
    }}>
      <AnimatePresence mode="wait">
        {verificationSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "14px" }}
          >
            <ShieldCheck size={36} style={{ color: "#14F195", flexShrink: 0 }} />
            <div>
              <h3 style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "1.15rem", fontWeight: 700, margin: "0 0 4px", color: "#f0f0f0",
              }}>
                Verification Successful!
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0 }}>
                Your university profile has been activated. You can now submit projects.
              </p>
            </div>
          </motion.div>
        ) : verificationStep === "input" ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3 style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "1.25rem", fontWeight: 700, margin: "0 0 6px", color: "#ffba08",
            }}>
              Verify your university email
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#888888", margin: "0 0 20px", lineHeight: 1.6 }}>
              Hackathons are university-restricted. Enter your official university email (e.g. name@unilag.edu.ng) to verify and unlock submissions.
            </p>

            <form onSubmit={startVerification} style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ flex: "1", minWidth: "260px" }}>
                <input
                  type="email"
                  placeholder="you@youruniversity.edu.ng"
                  value={uniEmail}
                  onChange={handleEmailChange}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#0b0c0f",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontSize: "0.875rem",
                    color: "#f0f0f0",
                    outline: "none",
                    fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={verificationLoading}
                style={{
                  backgroundColor: "#ffba08",
                  color: "#0b0c0f",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: verificationLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                  opacity: verificationLoading ? 0.7 : 1,
                }}
              >
                {verificationLoading ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : "Send Code"}
              </button>
            </form>

            {detectedUni && (
              <p style={{
                fontSize: "0.75rem", color: "#14F195", marginTop: "10px",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                <ShieldCheck size={12} />
                Detected: <strong>{detectedUni.name}</strong>
              </p>
            )}

            {verificationError && (
              <p style={{
                fontSize: "0.8125rem", color: "#f87171", marginTop: "10px",
                display: "flex", alignItems: "flex-start", gap: "6px", lineHeight: 1.5,
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                {verificationError}
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
            <h3 style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "1.25rem", fontWeight: 700, margin: "0 0 6px", color: "#ffba08",
            }}>
              Enter verification code
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#888888", margin: "0 0 20px", lineHeight: 1.6 }}>
              We sent a 6-digit code to{" "}
              <span style={{ color: "#f0f0f0", fontWeight: 600 }}>{uniEmail}</span>.
              {detectedUni && (
                <span> Verifying for <span style={{ color: "#14F195" }}>{detectedUni.name}</span>.</span>
              )}
            </p>

            <form onSubmit={completeVerification} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "320px" }}>
              <OTPInput
                value={verificationCode}
                onChange={setVerificationCode}
                onComplete={() => completeVerification()}
              />

              {verificationError && (
                <p style={{
                  fontSize: "0.8125rem", color: "#f87171", margin: 0,
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <AlertTriangle size={13} />
                  {verificationError}
                </p>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={verificationLoading || verificationCode.length !== 6}
                  style={{
                    backgroundColor: "#ffba08",
                    color: "#0b0c0f",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: (verificationLoading || verificationCode.length !== 6) ? "not-allowed" : "pointer",
                    flex: 1,
                    opacity: (verificationLoading || verificationCode.length !== 6) ? 0.6 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                  }}
                >
                  {verificationLoading ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : "Verify Code"}
                </button>
                <button
                  type="button"
                  onClick={() => { setVerificationStep("input"); setVerificationCode(""); setVerificationError(""); }}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#888888",
                    fontSize: "0.875rem",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
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
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function UniversityPage() {
  const { profile, loading } = useAuth();

  return (
    <div style={{
      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      color: "#f0f0f0",
    }}>
      {/* Page heading */}
      <h1 style={{
        fontFamily: "DM Sans, system-ui, sans-serif",
        fontSize: "1.5rem",
        fontWeight: 700,
        color: "#f0f0f0",
        margin: "0 0 24px",
      }}>
        My University
      </h1>

      <div style={{ maxWidth: "640px" }}>
        {loading ? (
          <div style={{
            backgroundColor: "#111318",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Loader2 size={24} style={{ color: "#ffba08", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : profile?.university_verified ? (
          <VerifiedView profile={profile} />
        ) : (
          <VerificationFlow />
        )}
      </div>
    </div>
  );
}

