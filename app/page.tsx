"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import Link from "next/link";
import type { Idea } from "@/lib/supabase";

// Animation helpers
const ease = [0.16, 1, 0.3, 1] as const;

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay },
  };
}

function inView(delay = 0) {
  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.6, ease, delay },
  };
}

const C: React.CSSProperties = {
  maxWidth: "1152px",
  margin: "0 auto",
  padding: "0 32px",
  width: "100%",
};

const SECTION: React.CSSProperties = {
  padding: "112px 0",
  borderTop: "1px solid rgba(255,255,255,0.07)",
};

const SECTION_SURFACE: React.CSSProperties = {
  ...SECTION,
  backgroundColor: "#111318",
};

const prizes = [
  { rank: "1st Place", amount: "$100", desc: "Contribution toward your school fees, paid in USDC.", hot: false },
  { rank: "2nd Place", amount: "$100", desc: "Contribution toward your school fees, paid in USDC.", hot: false },
];

const steps = [
  { n: "01", title: "Learn about Solana", week: "Week 1", desc: "Dive into Solana fundamentals - accounts, programs, transactions. Full resource list provided, no prior blockchain experience needed." },
  { n: "02", title: "Build your project", week: "Week 2", desc: "Pick an idea from our curated list or bring your own. Build a working Solana dApp or on-chain program on devnet." },
  { n: "03", title: "Submit & list it", week: "Submission", desc: "Fill in the submission form with project details, GitHub link, and your Solana program address to go live on the board." },
  { n: "04", title: "Demo day & prizes", week: "Demo Day", desc: "Present to judges and community. Winners get paid in USDC directly to their Solana wallet." },
];

function difficultyColor(d?: string | null) {
  if (d === "beginner") return "#4ade80";
  if (d === "intermediate") return "#ffba08";
  return "#f87171";
}

export default function HomePage() {
  const [featuredCohort, setFeaturedCohort] = useState<any>(null);
  const [cohortLoading, setCohortLoading] = useState(true);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    async function load() {
      try {
        try { await supabase.rpc("sync_cohort_status"); } catch {}
        const { data: cohorts } = await supabase
          .from("cohorts")
          .select("*, universities(name)")
          .in("status", ["active", "upcoming"])
          .order("start_date", { ascending: true });
        if (cohorts && cohorts.length > 0) {
          const active = cohorts.find((c: any) => c.status === "active");
          setFeaturedCohort(active || cohorts[0] || null);
        }
      } finally {
        setCohortLoading(false);
      }

      const { data: ideasData } = await supabase
        .from("ideas")
        .select("*")
        .order("upvote_count", { ascending: false })
        .limit(3);
      if (ideasData) setIdeas(ideasData);
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ display: "flex", flexDirection: "column", flex: 1 }}>

        {/* HERO */}
        <section
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            paddingTop: "96px",
            paddingBottom: "80px",
            position: "relative",
            overflow: "hidden",
            backgroundImage: "radial-gradient(circle, rgba(255,186,8,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
          }}
        >
          <div style={{ ...C, display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "720px" }}>

            {/* Label */}
            {/* <motion.div {...fadeUp(0)} style={{ marginBottom: "32px" }}>
              <span style={{
                display: "inline-block",
                border: "1px solid rgba(255,186,8,0.3)",
                color: "#ffba08",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: "999px",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontWeight: 500,
              }}>
                Powered by Solana
              </span>
            </motion.div> */}

            {/* Headline — single sentence, natural two-line wrap */}
            <motion.h1 {...fadeUp(0.1)} style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: "700px",
              textAlign: "center",
              margin: "0 auto 32px",
              color: "#f0f0f0",
            }}>
              The campus hackathon for Solana builders.
            </motion.h1>

            {/* Subtext */}
            <motion.div {...fadeUp(0.4)} style={{ marginBottom: "40px" }}>
              <p style={{
                fontSize: "1.1rem",
                fontWeight: 300,
                color: "#888888",
                maxWidth: "420px",
                lineHeight: 1.7,
                fontFamily: "var(--font-dm-sans), sans-serif",
                textAlign: "center",
                margin: 0,
              }}>
                Superhack is a campus hackathon platform for Nigerian university students. One week to learn Solana. One week to build. Real prizes.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div {...fadeUp(0.5)} style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", marginBottom: "28px" }}>
              <Link href="/auth" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                backgroundColor: "#ffba08", color: "#0b0c0f",
                fontWeight: 600, fontSize: "0.9375rem", padding: "14px 32px",
                borderRadius: "8px", textDecoration: "none",
                transition: "opacity 0.2s, transform 0.15s",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Start building <ArrowRight size={16} />
              </Link>
              <Link href="/hackathons" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                backgroundColor: "transparent", color: "#f0f0f0",
                fontWeight: 500, fontSize: "0.9375rem", padding: "14px 32px",
                borderRadius: "8px", textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)",
                transition: "border-color 0.2s, background 0.2s",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                View hackathons
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div {...fadeUp(0.6)}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#555555", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                Join the train of blockchain builders.
              </p>
            </motion.div>
          </div>
        </section>

        {/* STATS STRIP */}
        <div style={{
          backgroundColor: "#111318",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "20px 32px",
        }}>
          <div style={{
            maxWidth: "1152px", margin: "0 auto",
            display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center",
            gap: "12px 32px",
          }}>
            {["$100 school fees contribution · 2 winners per cohort", "2-week format", "Solana-powered"].map((stat, i, arr) => (
              <span key={stat} style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                <span style={{ fontSize: "0.875rem", color: "#666666", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                  {stat}
                </span>
                {i < arr.length - 1 && (
                  <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem" }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* FEATURED HACKATHON */}
        {!cohortLoading && featuredCohort && (
          <section style={SECTION}>
            <div style={C}>
              <motion.div {...inView(0)} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "32px", maxWidth: "600px", margin: "0 auto", textAlign: "center",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                  <span style={{
                    display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 14px",
                    borderRadius: "999px",
                    backgroundColor: featuredCohort.status === "active" ? "rgba(20,241,149,0.12)" : "rgba(255,186,8,0.12)",
                    color: featuredCohort.status === "active" ? "#14F195" : "#ffba08",
                  }}>
                    {featuredCohort.status === "active" ? "Active Hackathon" : "Upcoming Hackathon"}
                  </span>
                  <h2 style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "clamp(2rem, 5vw, 3.25rem)",
                    fontWeight: 900, letterSpacing: "-0.03em", color: "#f0f0f0", margin: 0,
                  }}>
                    {featuredCohort.title}
                  </h2>
                  <p style={{ color: "#888888", maxWidth: "440px", margin: 0, fontSize: "0.9375rem", lineHeight: 1.6 }}>
                    Running at {featuredCohort.universities?.name}. Join now to build your project and win prizes.
                  </p>
                </div>
                <div style={{ width: "100%" }}>
                  <CountdownTimer startDate={featuredCohort.start_date} endDate={featuredCohort.end_date} />
                </div>
                <Link href={`/hackathons/${featuredCohort.slug}`} style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  backgroundColor: featuredCohort.status === "active" ? "#14F195" : "#ffba08",
                  color: "#0b0c0f", fontWeight: 600, fontSize: "0.9375rem",
                  padding: "12px 28px", borderRadius: "8px", textDecoration: "none", transition: "opacity 0.2s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Join Hackathon <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section id="how-it-works" style={SECTION_SURFACE}>
          <div style={C}>
            <motion.div {...inView(0)} style={{ marginBottom: "72px" }}>
              <span style={{
                display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase", color: "#888888",
                backgroundColor: "rgba(255,255,255,0.06)", padding: "5px 12px",
                borderRadius: "999px", marginBottom: "20px",
              }}>
                Process
              </span>
              <h2 style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                fontWeight: 900, letterSpacing: "-0.03em", color: "#f0f0f0", margin: "0 0 12px",
              }}>
                How it works
              </h2>
              <p style={{ color: "#888888", margin: 0, fontSize: "1rem", maxWidth: "380px" }}>
                Four steps from zero to Solana builder in two weeks.
              </p>
            </motion.div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "48px 56px",
            }}>
              {steps.map((step, i) => (
                <motion.div key={step.n} {...inView(i * 0.08)} style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", top: "-8px", right: "0",
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "5rem", fontWeight: 900,
                    color: "rgba(255,255,255,0.06)", lineHeight: 1,
                    userSelect: "none", pointerEvents: "none",
                  }}>
                    {step.n}
                  </span>
                  <div style={{ width: "32px", height: "2px", backgroundColor: "#ffba08", marginBottom: "16px", borderRadius: "1px" }} />
                  <span style={{
                    display: "inline-block", fontSize: "0.6875rem", fontWeight: 600,
                    letterSpacing: "0.08em", textTransform: "uppercase", color: "#888888",
                    border: "1px solid rgba(255,255,255,0.1)", padding: "3px 10px",
                    borderRadius: "999px", marginBottom: "10px",
                  }}>
                    {step.week}
                  </span>
                  <h3 style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em",
                    color: "#f0f0f0", margin: "0 0 10px",
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: "0.875rem", color: "#888888", lineHeight: 1.65, margin: 0,
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}>
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* IDEAS PREVIEW */}
        <section style={SECTION}>
          <div style={C}>
            <motion.div {...inView(0)} style={{ marginBottom: "48px" }}>
              <h2 style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 900, letterSpacing: "-0.03em", color: "#f0f0f0", margin: "0 0 12px",
              }}>
                Not sure what to build?
              </h2>
              <p style={{ color: "#888888", margin: 0, fontSize: "1rem", maxWidth: "460px", lineHeight: 1.6 }}>
                Browse our curated list of Solana project ideas - built for student builders.
              </p>
            </motion.div>

            {ideas.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px", marginBottom: "32px",
              }}>
                {ideas.map((idea, i) => (
                  <motion.div key={idea.id} {...inView(i * 0.08)}>
                    <Link href={`/ideas/${idea.id}`} style={{
                      display: "block",
                      backgroundColor: "#111318",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "16px",
                      padding: "24px",
                      textDecoration: "none",
                      transition: "border-color 0.2s, transform 0.2s",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,186,8,0.25)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                        {idea.category && (
                          <span style={{
                            fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em",
                            textTransform: "uppercase", color: "#888888",
                            backgroundColor: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "999px",
                          }}>
                            {idea.category}
                          </span>
                        )}
                        {idea.difficulty && (
                          <span style={{
                            fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em",
                            textTransform: "capitalize", color: difficultyColor(idea.difficulty),
                            backgroundColor: `${difficultyColor(idea.difficulty)}18`,
                            padding: "3px 10px", borderRadius: "999px",
                          }}>
                            {idea.difficulty}
                          </span>
                        )}
                      </div>
                      <h3 style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em",
                        color: "#f0f0f0", margin: "0 0 8px", lineHeight: 1.3,
                      }}>
                        {idea.title}
                      </h3>
                      {idea.description && (
                        <p style={{
                          fontSize: "0.875rem", color: "#888888", margin: 0, lineHeight: 1.55,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {idea.description}
                        </p>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            <motion.div {...inView(0.2)}>
              <Link href="/ideas" style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                color: "#ffba08", fontSize: "0.9375rem", fontWeight: 500,
                textDecoration: "none", fontFamily: "var(--font-dm-sans), sans-serif",
                transition: "opacity 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                See all ideas <ArrowRight size={15} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* PRIZES */}
        <section style={SECTION_SURFACE}>
          <div style={C}>
            <motion.div {...inView(0)} style={{ marginBottom: "56px" }}>
              <span style={{
                display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase", color: "#888888",
                backgroundColor: "rgba(255,255,255,0.06)", padding: "5px 12px",
                borderRadius: "999px", marginBottom: "20px",
              }}>
                Rewards
              </span>
              <h2 style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                fontWeight: 900, letterSpacing: "-0.03em", color: "#f0f0f0", margin: "0 0 12px",
              }}>
                We're paying school fees.
              </h2>
              <p style={{ color: "#888888", margin: 0, fontSize: "1rem" }}>
                The top 2 builders in each cohort receive up to $100 each — a contribution toward their school fees, paid in USDC on Solana.
              </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {prizes.map((prize, i) => (
                <motion.div key={prize.rank} {...inView(i * 0.08)} style={{
                  padding: "32px 28px",
                  borderRadius: "16px",
                  backgroundColor: prize.hot ? "rgba(255,186,8,0.06)" : "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTop: prize.hot ? "2px solid #ffba08" : "1px solid rgba(255,255,255,0.06)",
                  display: "flex", flexDirection: "column", gap: "10px",
                  position: "relative", overflow: "hidden",
                }}>
                  <span style={{
                    position: "absolute", bottom: "-12px", right: "12px",
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "5rem", fontWeight: 900,
                    color: "rgba(255,255,255,0.04)", lineHeight: 1,
                    userSelect: "none", pointerEvents: "none",
                  }}>
                    {i + 1}
                  </span>
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: prize.hot ? "#ffba08" : "#888888",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}>
                    {prize.rank}
                  </span>
                  <span style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontWeight: 900, fontSize: "3.25rem", letterSpacing: "-0.03em", lineHeight: 1,
                    color: prize.hot ? "#ffba08" : "#f0f0f0",
                  }}>
                    {prize.amount}
                  </span>
                  <p style={{
                    fontSize: "0.875rem", lineHeight: 1.55, color: "#888888", margin: 0,
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}>
                    {prize.desc}
                  </p>
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: "32px", textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "#666666", margin: 0, fontFamily: "var(--font-dm-sans), sans-serif", lineHeight: 1.5 }}>
                Prizes are capped at $100 per winner and paid in USDC on Solana after the Superhack demo day. Winners are selected by the Superteam Nigeria team.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{
          backgroundColor: "#111318",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "112px 32px",
          textAlign: "center",
        }}>
          <motion.div {...inView(0)} style={{
            maxWidth: "560px", margin: "0 auto",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
          }}>
            <h2 style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4rem)",
              letterSpacing: "-0.03em", lineHeight: 0.95, color: "#f0f0f0", margin: 0,
            }}>
              Ready to ship something?
            </h2>
            <p style={{
              color: "#888888", fontSize: "1.0625rem", lineHeight: 1.6, margin: 0,
              maxWidth: "400px", fontFamily: "var(--font-dm-sans), sans-serif",
            }}>
              Create an account and join the next cohort at your university.
            </p>
            <Link href="/auth" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              backgroundColor: "#ffba08", color: "#0b0c0f",
              fontWeight: 600, fontSize: "1rem", padding: "15px 36px",
              borderRadius: "8px", textDecoration: "none", marginTop: "8px",
              transition: "opacity 0.2s, transform 0.15s",
              fontFamily: "var(--font-dm-sans), sans-serif",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Get started <ArrowRight size={18} />
            </Link>
            <p style={{ margin: 0 }}>
              <span style={{ fontSize: "0.8125rem", color: "#888888", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                Want Superhack at your school?{" "}
              </span>
              <Link href="/apply" style={{
                fontSize: "0.8125rem", color: "#ffba08",
                fontFamily: "var(--font-dm-sans), sans-serif",
                transition: "opacity 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Apply here <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
              </Link>
            </p>
          </motion.div>
        </section>

      </main>
      <Footer />
    </>
  );
}

