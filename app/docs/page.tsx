"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

interface ResourceLink {
  title: string;
  description: string;
  href: string;
}

const resources: { group: string; links: ResourceLink[] }[] = [
  {
    group: "Getting Started",
    links: [
      { title: "Solana Docs", description: "Official Solana documentation. Covers accounts, programs, transactions, and the Solana runtime.", href: "https://solana.com/docs" },
      { title: "Solana Playground", description: "Browser-based IDE for writing, deploying, and testing Solana programs. No setup required.", href: "https://beta.solpg.io" },
      { title: "Anchor Docs", description: "Anchor framework docs for writing Solana programs in Rust with a high-level abstraction layer.", href: "https://www.anchor-lang.com/docs" },
    ],
  },
  {
    group: "Payments",
    links: [
      { title: "Solana Pay Docs", description: "Protocol specification and SDK for accepting Solana payments via QR codes and deep links.", href: "https://docs.solanapay.com" },
    ],
  },
  {
    group: "Tokens",
    links: [
      { title: "SPL Token Docs", description: "Everything about the Solana Program Library token program â€” create, mint, burn, and transfer.", href: "https://spl.solana.com/token" },
      { title: "Metaplex Docs", description: "NFT standards, compressed NFTs (cNFTs), and the Metaplex protocol for digital assets on Solana.", href: "https://developers.metaplex.com" },
    ],
  },
  {
    group: "Wallets",
    links: [
      { title: "Phantom", description: "The most popular Solana wallet. Supports devnet â€” switch in settings for testing.", href: "https://phantom.app" },
      { title: "Backpack", description: "Multi-chain wallet with xNFT support. Great for exploring newer Solana features.", href: "https://backpack.app" },
    ],
  },
  {
    group: "Tools & RPC",
    links: [
      { title: "Helius", description: "Enhanced Solana RPC with webhooks, parsed transactions, and NFT APIs. Generous free tier.", href: "https://docs.helius.dev" },
      { title: "QuickNode", description: "High-performance Solana RPC nodes. Free plan available for hackathon projects.", href: "https://www.quicknode.com/docs/solana" },
    ],
  },
];

const containerStyle: React.CSSProperties = {
  maxWidth: "860px",
  margin: "0 auto",
  padding: "0 32px",
};

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100svh", paddingTop: "120px", paddingBottom: "96px" }}>
        <div style={containerStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "72px" }}>

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
                Resources
              </motion.span>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                  color: "#f0f0f0",
                  margin: 0,
                }}
              >
                Docs & resources
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{ color: "#888888", fontSize: "1.0625rem", maxWidth: "460px", margin: 0, lineHeight: 1.6 }}
              >
                Everything you need to build on Solana, curated for Superhack participants.
              </motion.p>
            </motion.div>

            {/* Resource groups */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{ display: "flex", flexDirection: "column", gap: "56px" }}
            >
              {resources.map((group) => (
                <motion.section key={group.group} variants={fadeUp}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "#f0f0f0",
                        margin: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {group.group}
                    </h2>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        backgroundColor: "rgba(255,255,255,0.07)",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "24px",
                          padding: "20px 24px",
                          backgroundColor: "#111318",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "8px",
                          textDecoration: "none",
                          transition: "border-color 0.2s, background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                          e.currentTarget.style.backgroundColor = "#141720";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                          e.currentTarget.style.backgroundColor = "#111318";
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <span
                            style={{
                              fontFamily: "DM Sans, system-ui, sans-serif",
                              fontWeight: 700,
                              fontSize: "0.9375rem",
                              color: "#f0f0f0",
                              transition: "color 0.2s",
                            }}
                          >
                            {link.title}
                          </span>
                          <span
                            style={{
                              fontSize: "0.875rem",
                              color: "#888888",
                              lineHeight: 1.55,
                            }}
                          >
                            {link.description}
                          </span>
                        </div>
                        <ExternalLink
                          size={15}
                          style={{ color: "#888888", flexShrink: 0, marginTop: "2px" }}
                        />
                      </Link>
                    ))}
                  </div>
                </motion.section>
              ))}
            </motion.div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

