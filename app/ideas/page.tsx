"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const categories = ["All", "Payments", "Tokens", "Governance", "Identity", "DeFi", "Tools"];

const ideas = [
  {
    id: 1,
    category: "Payments",
    title: "Solana Pay Checkout",
    description: "A simple point-of-sale checkout interface using Solana Pay. Accept SOL or SPL tokens in-person or online with QR code generation.",
    docsHref: "https://docs.solanapay.com",
  },
  {
    id: 2,
    category: "Tokens",
    title: "SPL Token Launcher",
    description: "A UI to create and mint custom SPL tokens on devnet. Name, symbol, supply, decimals — all configurable through a form.",
    docsHref: "https://spl.solana.com/token",
  },
  {
    id: 3,
    category: "Governance",
    title: "On-chain Voting",
    description: "A basic DAO voting program. Create proposals, cast on-chain votes, and tally results. Ideal for student councils or communities.",
    docsHref: "https://www.anchor-lang.com/docs",
  },
  {
    id: 4,
    category: "Identity",
    title: "Proof of Attendance NFT",
    description: "Mint a compressed NFT as proof of attending an event. Uses Metaplex's cNFTs for near-zero minting cost.",
    docsHref: "https://developers.metaplex.com/bubblegum",
  },
  {
    id: 5,
    category: "DeFi",
    title: "Savings Circle dApp (Ajo/Esusu)",
    description: "A digital Ajo/Esusu savings system. Members pool SOL weekly; one member collects the pot each round.",
    docsHref: "https://solana.com/docs/programs",
  },
  {
    id: 6,
    category: "Tools",
    title: "Wallet Explorer Dashboard",
    description: "A read-only dashboard for a Solana wallet. Show SOL balance, token holdings, and recent transaction history via RPC.",
    docsHref: "https://docs.helius.dev",
  },
];

const sectionStyle: React.CSSProperties = {
  minHeight: "100svh",
  paddingTop: "120px",
  paddingBottom: "96px",
};
const containerStyle: React.CSSProperties = {
  maxWidth: "1152px",
  margin: "0 auto",
  padding: "0 32px",
};

export default function IdeasPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? ideas
      : ideas.filter((idea) => idea.category === activeCategory);

  return (
    <>
      <Navbar />
      <main style={sectionStyle}>
        <div style={containerStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>

            {/* Header */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <motion.span
                variants={fadeUp}
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#888888",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  width: "fit-content",
                }}
              >
                Inspiration
              </motion.span>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontWeight: 900,
                  fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                  color: "#f0f0f0",
                  margin: 0,
                }}
              >
                Project ideas
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{ color: "#888888", fontSize: "1.0625rem", maxWidth: "480px", margin: 0, lineHeight: 1.6 }}
              >
                Not sure what to build? Pick one of these ideas or use them as
                inspiration. Each comes with docs to get you started.
              </motion.p>
            </motion.div>

            {/* Filter */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
            >
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    id={`filter-${cat.toLowerCase()}`}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      fontSize: "0.8125rem",
                      padding: "6px 16px",
                      borderRadius: "999px",
                      border: "1px solid",
                      borderColor: active ? "#ffba08" : "rgba(255,255,255,0.1)",
                      backgroundColor: active ? "#ffba08" : "transparent",
                      color: active ? "#0b0c0f" : "#888888",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                        e.currentTarget.style.color = "#f0f0f0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "#888888";
                      }
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </motion.div>

            {/* Grid */}
            <motion.div
              key={activeCategory}
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {filtered.map((idea) => (
                <motion.div
                  key={idea.id}
                  variants={fadeUp}
                  style={{
                    backgroundColor: "#111318",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px",
                    padding: "28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    transition: "border-color 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span
                    style={{
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
                    {idea.category}
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                    <h2
                      style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                        fontWeight: 700,
                        fontSize: "1.125rem",
                        color: "#f0f0f0",
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {idea.title}
                    </h2>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#888888",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {idea.description}
                    </p>
                  </div>

                  <Link
                    href={idea.docsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "#ffba08",
                      textDecoration: "none",
                      paddingTop: "8px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    View docs <ExternalLink size={12} />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
