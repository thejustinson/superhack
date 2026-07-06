"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge";
import { projectPath } from "@/lib/utils";

interface Winner {
  id: string;
  name: string;
  project_slug: string | null;
  prize_place: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  profiles: { full_name: string | null; username: string | null; avatar_url: string | null } | null;
  cohorts: {
    title: string | null;
    slug: string | null;
    results_announced: boolean | null;
    universities: { name: string | null } | null;
  } | null;
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item) || "unknown";
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function WinnerAvatar({ src, name, size = 40 }: { src?: string | null; name?: string | null; size?: number }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        onError={() => setErr(true)}
      />
    );
  }
  return <InitialsAvatar name={name ?? "?"} size={size} />;
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("projects")
        .select(`
          id, name, project_slug, prize_place, payment_status, payment_amount,
          profiles!user_id(full_name, username, avatar_url),
          cohorts(title, slug, results_announced, universities(name))
        `)
        .not("prize_place", "is", null)
        .order("created_at", { ascending: false });

      // Keep only cohorts where results_announced is true
      const announced = ((data ?? []) as unknown as Winner[]).filter(
        (w) => w.cohorts?.results_announced === true
      );
      setWinners(announced);
      setLoading(false);
    }
    load();
  }, []);

  const byCohort = groupBy(winners, (w) => w.cohorts?.slug ?? "unknown");

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "104px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Trophy size={24} style={{ color: "#ffba08" }} />
            <h1
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: "clamp(2rem, 5vw, 2.75rem)",
                fontWeight: 900,
                color: "#f0f0f0",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Winners
            </h1>
          </div>
          <p style={{ fontSize: "0.9375rem", color: "#888", margin: 0 }}>
            Every Superhack winner, across every cohort.
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid rgba(255,186,8,0.15)",
                borderTopColor: "#ffba08",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        ) : winners.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "80px" }}>
            <Trophy size={32} style={{ color: "rgba(255,255,255,0.1)", marginBottom: "16px" }} />
            <p style={{ color: "#555", fontSize: "0.9375rem" }}>
              No winners announced yet. Check back after the first Demo Day.
            </p>
          </div>
        ) : (
          Object.entries(byCohort).map(([cohortSlug, cohortWinners]) => {
            const cohort = cohortWinners[0].cohorts;
            const sorted = [...cohortWinners].sort((a, b) => {
              const order = ["1st", "2nd", "3rd", "Runner Up", "Community"];
              return (order.indexOf(a.prize_place ?? "") ?? 99) - (order.indexOf(b.prize_place ?? "") ?? 99);
            });

            return (
              <section key={cohortSlug} style={{ marginBottom: "56px" }}>
                {/* Cohort header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontSize: "1.0625rem",
                        fontWeight: 700,
                        color: "#f0f0f0",
                        margin: "0 0 3px",
                      }}
                    >
                      {cohort?.title ?? cohortSlug}
                    </h2>
                    {cohort?.universities?.name && (
                      <p style={{ fontSize: "0.8125rem", color: "#666", margin: 0 }}>
                        {cohort.universities.name}
                      </p>
                    )}
                  </div>
                  {cohort?.slug && (
                    <Link
                      href={`/hackathons/${cohort.slug}`}
                      style={{
                        fontSize: "0.8125rem",
                        color: "#ffba08",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      View cohort →
                    </Link>
                  )}
                </div>

                {/* Winner cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {sorted.map((winner) => (
                    <div
                      key={winner.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        backgroundColor: "#111318",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "12px",
                        padding: "16px 20px",
                      }}
                    >
                      {/* Left: avatar + name + project link */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <WinnerAvatar
                          src={winner.profiles?.avatar_url}
                          name={winner.profiles?.full_name}
                          size={40}
                        />
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.9375rem",
                              fontWeight: 600,
                              color: "#f0f0f0",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {winner.profiles?.full_name ?? "Unknown"}
                          </p>
                          <Link
                            href={projectPath(winner.profiles?.username ?? "", winner.project_slug ?? "")}
                            style={{
                              fontSize: "0.8125rem",
                              color: "#888",
                              textDecoration: "none",
                              display: "block",
                              marginTop: "1px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffba08")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
                          >
                            {winner.name} →
                          </Link>
                        </div>
                      </div>

                      {/* Right: place + amount + payment badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              justifyContent: "flex-end",
                              marginBottom: "3px",
                            }}
                          >
                            <Trophy size={12} style={{ color: "#ffba08" }} />
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ffba08" }}>
                              {winner.prize_place}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#f0f0f0" }}>
                            ${winner.payment_amount ?? 100} USDC
                          </p>
                        </div>
                        <PaymentStatusBadge status={winner.payment_status} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
