"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Hammer, Send, Trophy } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const steps = [
  {
    n: "01",
    icon: BookOpen,
    title: "Learn about Solana",
    week: "Week 1",
    desc: "Dive into Solana fundamentals — accounts, programs, transactions, and the programming model. Full resource list provided.",
  },
  {
    n: "02",
    icon: Hammer,
    title: "Build your project",
    week: "Week 2",
    desc: "Pick an idea from our curated list or bring your own. Build a working Solana dApp or on-chain program on devnet.",
  },
  {
    n: "03",
    icon: Send,
    title: "Submit & list it",
    week: "Submission",
    desc: "Fill in the submission form with your project details, GitHub link, and Solana program address to go live on the board.",
  },
  {
    n: "04",
    icon: Trophy,
    title: "Demo day & prizes",
    week: "Demo Day",
    desc: "Present your project to judges and community. Winners get paid in USDC directly to their Solana wallet.",
  },
];

const prizes = [
  { rank: "1st Place", amount: "$100", desc: "Best overall — technical excellence & impact", hot: true },
  { rank: "2nd Place", amount: "$70", desc: "Runner-up — strong execution and creativity", hot: false },
  { rank: "3rd Place", amount: "$50", desc: "Third place — solid build and presentation", hot: false },
  { rank: "Community Vote", amount: "$30", desc: "Voted best project by the Superteam Nigeria community", hot: false },
];

// Reusable inline-style primitives
const S = {
  container: {
    maxWidth: "1152px",
    margin: "0 auto",
    padding: "0 32px",
    width: "100%",
  } as React.CSSProperties,
  section: (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "96px 0",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    ...extra,
  }),
  badge: (accent = false): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    maxWidth: "fit-content",
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "5px 12px",
    borderRadius: "999px",
    backgroundColor: accent ? "#ffba08" : "rgba(255,255,255,0.06)",
    color: accent ? "#0b0c0f" : "#888888",
    border: "none",
  }),
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main style={{ display: "flex", flexDirection: "column", flex: 1 }}>

        {/* ── HERO ── */}
        <section
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: "120px",
            paddingBottom: "80px",
          }}
        >
          <div style={S.container}>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "760px" }}
            >
              {/* Superteam badge */}
              <motion.div variants={fadeUp}>
                <span style={S.badge(true)}>
                  ◆ A Superteam Nigeria Initiative
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontWeight: 900,
                  fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.03em",
                  color: "#f0f0f0",
                  margin: 0,
                }}
              >
                Build on Solana.{" "}
                <span style={{ color: "#ffba08" }}>Get paid.</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: "1.125rem",
                  color: "#888888",
                  maxWidth: "480px",
                  lineHeight: 1.65,
                  fontWeight: 300,
                  margin: 0,
                }}
              >
                A two-week hackathon for Nigerian students and builders. Learn
                Solana, ship a real project, and compete for{" "}
                <strong style={{ color: "#f0f0f0", fontWeight: 500 }}>
                  $250 in prizes
                </strong>
                . No prior blockchain experience required.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}
              >
                <Link
                  href="/auth"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#ffba08",
                    color: "#0b0c0f",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    padding: "14px 28px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    transition: "opacity 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.88";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Register Now <ArrowRight size={16} />
                </Link>
                <Link
                  href="/ideas"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "transparent",
                    color: "#f0f0f0",
                    fontWeight: 500,
                    fontSize: "0.9375rem",
                    padding: "14px 28px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  See Ideas
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeUp}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "40px",
                  paddingTop: "32px",
                  marginTop: "8px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {[
                  { label: "Prize pool", value: "$250" },
                  { label: "Duration", value: "2 weeks" },
                  { label: "Open to", value: "All builders" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                        fontWeight: 900,
                        fontSize: "1.75rem",
                        letterSpacing: "-0.02em",
                        color: "#f0f0f0",
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </span>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#888888",
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={S.section()}>
          <div style={S.container}>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              style={{ display: "flex", flexDirection: "column", gap: "56px" }}
            >
              <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={S.badge()}>Process</span>
                <h2
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.025em",
                    color: "#f0f0f0",
                    margin: 0,
                    marginTop: "8px",
                  }}
                >
                  How it works
                </h2>
                <p style={{ color: "#888888", maxWidth: "400px", margin: 0 }}>
                  Four steps from zero to Solana builder in two weeks.
                </p>
              </motion.div>

              {/* Steps grid */}
              <motion.div
                variants={stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.n}
                      variants={fadeUp}
                      style={{
                        padding: "32px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        borderRight: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                        backgroundColor: "#0b0c0f",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#111318")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#0b0c0f")
                      }
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Icon size={18} style={{ color: "#ffba08" }} />
                        <span
                          style={{
                            fontFamily: "var(--font-fraunces), Georgia, serif",
                            fontWeight: 900,
                            fontSize: "3rem",
                            color: "rgba(255,255,255,0.06)",
                            lineHeight: 1,
                          }}
                        >
                          {step.n}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#888888",
                            border: "1px solid rgba(255,255,255,0.1)",
                            padding: "3px 10px",
                            borderRadius: "999px",
                            width: "fit-content",
                          }}
                        >
                          {step.week}
                        </span>
                        <h3
                          style={{
                            fontFamily: "var(--font-fraunces), Georgia, serif",
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            color: "#f0f0f0",
                            margin: 0,
                            marginTop: "4px",
                          }}
                        >
                          {step.title}
                        </h3>
                        <p style={{ fontSize: "0.875rem", color: "#888888", lineHeight: 1.6, margin: 0 }}>
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── PRIZE POOL ── */}
        <section style={S.section()}>
          <div style={S.container}>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              style={{ display: "flex", flexDirection: "column", gap: "56px" }}
            >
              <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={S.badge()}>Rewards</span>
                <h2
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.025em",
                    color: "#f0f0f0",
                    margin: 0,
                    marginTop: "8px",
                  }}
                >
                  Prize pool
                </h2>
                <p style={{ color: "#888888", maxWidth: "400px", margin: 0 }}>
                  Paid out in USDC to your Solana wallet on demo day.
                </p>
              </motion.div>

              <motion.div
                variants={stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                {prizes.map((prize) => (
                  <motion.div
                    key={prize.rank}
                    variants={fadeUp}
                    style={{
                      padding: "32px",
                      borderRadius: "8px",
                      border: prize.hot ? "none" : "1px solid rgba(255,255,255,0.07)",
                      backgroundColor: prize.hot ? "#ffba08" : "#111318",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!prize.hot)
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      if (!prize.hot)
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: prize.hot ? "rgba(0,0,0,0.6)" : "#888888",
                      }}
                    >
                      {prize.rank}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                        fontWeight: 900,
                        fontSize: "3.5rem",
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                        color: prize.hot ? "#0b0c0f" : "#f0f0f0",
                      }}
                    >
                      {prize.amount}
                    </span>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: 1.55,
                        color: prize.hot ? "rgba(0,0,0,0.7)" : "#888888",
                        margin: 0,
                      }}
                    >
                      {prize.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={S.section({ paddingBottom: "128px" })}>
          <div style={S.container}>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "32px",
              }}
            >
              <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontWeight: 900,
                    fontSize: "clamp(3rem, 7vw, 5.5rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 0.95,
                    color: "#f0f0f0",
                    margin: 0,
                  }}
                >
                  Ready to ship?
                </h2>
                <p style={{ color: "#888888", fontSize: "1.125rem", margin: 0 }}>
                  Join the next generation of Solana builders from Nigeria.
                </p>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link
                  href="/auth"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#ffba08",
                    color: "#0b0c0f",
                    fontWeight: 600,
                    fontSize: "1rem",
                    padding: "16px 36px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    transition: "opacity 0.2s, transform 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.88";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Register Now <ArrowRight size={18} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
