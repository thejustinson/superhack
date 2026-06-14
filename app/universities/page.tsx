"use client";

import React, { useState, useEffect } from "react";
import { getUniversitiesWithCohortCounts } from "@/lib/universities";
import { UniversityCard } from "@/components/ui/UniversityCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function UniversitiesPage() {
  const [unis, setUnis] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getUniversitiesWithCohortCounts();
        setUnis(data);
      } catch (err) {
        console.error("Failed to load universities:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredUnis = unis.filter((uni) => {
    const matchName = uni.name.toLowerCase().includes(search.toLowerCase());
    const matchCity = uni.city ? uni.city.toLowerCase().includes(search.toLowerCase()) : false;
    return matchName || matchCity;
  });

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "#0b0c0f", minHeight: "100vh", color: "#f0f0f0", paddingTop: "120px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          
          {/* Header */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", marginBottom: "48px" }}>
            <div>
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
                Network
              </span>
              <h1 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 900, fontSize: "3.5rem", letterSpacing: "-0.02em", margin: "0", lineHeight: 1.1 }}>
                Universities
              </h1>
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search by name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px", padding: "10px 14px 10px 40px", fontSize: "0.875rem",
                  color: "#f0f0f0", outline: "none", transition: "border-color 0.2s"
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#ffba08")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
              <Loader2 className="animate-spin" size={32} style={{ color: "#ffba08" }} />
            </div>
          ) : filteredUnis.length === 0 ? (
            <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "10px", padding: "80px 24px", textAlign: "center", color: "#888888" }}>
              No universities found matching your search.
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredUnis.map((uni) => (
                <motion.div key={uni.id} variants={fadeUp}>
                  <UniversityCard
                    id={uni.id}
                    name={uni.name}
                    slug={uni.slug}
                    city={uni.city}
                    state={uni.state}
                    logo_url={uni.logo_url}
                    cohort_count={uni.cohort_count}
                    has_active_cohort={uni.last_cohort?.status === "active"}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}

