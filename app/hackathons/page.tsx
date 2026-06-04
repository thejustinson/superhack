"use client";

import React, { useState, useEffect } from "react";
import { getAllCohorts } from "@/lib/universities";
import type { CohortWithUniversity } from "@/lib/supabase";
import { CohortCard } from "@/components/ui/CohortCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Calendar } from "lucide-react";
import LinkComponent from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function HackathonsPage() {
  const [cohorts, setCohorts] = useState<CohortWithUniversity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllCohorts();
        setCohorts(data);
      } catch (err) {
        console.error("Failed to load cohorts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const active = cohorts.filter((c) => c.status === "active");
  const upcoming = cohorts.filter((c) => c.status === "upcoming");
  const past = cohorts.filter((c) => c.status === "past");

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "#0b0c0f", minHeight: "100vh", color: "#f0f0f0", paddingTop: "120px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          
          {/* Header */}
          <div style={{ marginBottom: "56px" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "5px 12px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              color: "#888888",
              marginBottom: "16px"
            }}>
              Chapters
            </span>
            <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 900, fontSize: "3.5rem", letterSpacing: "-0.02em", margin: "0 0 12px", lineHeight: 1.1 }}>
              Hackathons
            </h1>
            <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: "1rem", color: "#888888", margin: 0, maxWidth: "500px", lineHeight: 1.6 }}>
              Browse active, upcoming, and past cohorts running across campus chapters.
            </p>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
              <Loader2 className="animate-spin" size={32} style={{ color: "#ffba08" }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "64px" }}>
              
              {/* Active Section */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
                  <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.5rem", margin: 0 }}>Active Hackathons</h2>
                  <span style={{ backgroundColor: "rgba(20,241,149,0.12)", color: "#14F195", fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "12px" }}>
                    {active.length}
                  </span>
                </div>
                {active.length === 0 ? (
                  <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "40px", textAlign: "center", color: "#888888" }}>
                    No active hackathons at the moment.
                  </div>
                ) : (
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}
                  >
                    {active.map((cohort) => (
                      <motion.div key={cohort.id} variants={fadeUp}>
                        <CohortCard cohort={cohort} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </section>

              {/* Upcoming Section */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
                  <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.5rem", margin: 0 }}>Upcoming Hackathons</h2>
                  <span style={{ backgroundColor: "rgba(255,186,8,0.12)", color: "#ffba08", fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "12px" }}>
                    {upcoming.length}
                  </span>
                </div>
                {upcoming.length === 0 ? (
                  <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "40px", textAlign: "center", color: "#888888" }}>
                    No upcoming hackathons scheduled.
                  </div>
                ) : (
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}
                  >
                    {upcoming.map((cohort) => (
                      <motion.div key={cohort.id} variants={fadeUp}>
                        <CohortCard cohort={cohort} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </section>

              {/* Past Section */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
                  <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.5rem", margin: 0 }}>Past Hackathons</h2>
                  <span style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#888888", fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "12px" }}>
                    {past.length}
                  </span>
                </div>
                {past.length === 0 ? (
                  <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "40px", textAlign: "center", color: "#888888" }}>
                    No past cohorts found.
                  </div>
                ) : (
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}
                  >
                    {past.map((cohort) => (
                      <motion.div key={cohort.id} variants={fadeUp}>
                        <CohortCard cohort={cohort} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </section>

              {/* Banner */}
              <div style={{
                backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px", padding: "48px", marginTop: "32px",
                display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px"
              }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 900, fontSize: "1.75rem", margin: "0 0 8px" }}>
                    Want Superhack at your school?
                  </h2>
                  <p style={{ fontSize: "0.9375rem", color: "#888888", margin: 0 }}>
                    Apply to start a campus chapter and bring Solana hackathons directly to your university.
                  </p>
                </div>
                <LinkComponent href="/apply" style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                  fontSize: "0.9375rem", padding: "14px 28px", borderRadius: "8px",
                  textDecoration: "none", transition: "opacity 0.2s"
                }}>
                  Apply now <ArrowRight size={16} />
                </LinkComponent>
              </div>

            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
