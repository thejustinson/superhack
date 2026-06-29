"use client";

import { useEffect, useState } from "react";
import {
  University, Users, Zap, FolderKanban, GraduationCap, FolderGit2, TrendingUp, Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/admin/StatCard";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { getWeeklyCounts, getUniversityBreakdown } from "@/lib/analytics";
import type { WeekBucket, UniversityRow } from "@/lib/analytics";

// ---------------------------------------------------------------------------
// Local sub-components
// ---------------------------------------------------------------------------

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: "#111318",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "12px",
  padding: "24px",
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: "0.6875rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#555",
  fontWeight: 600,
  marginBottom: "12px",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={SECTION_LABEL}>{children}</p>;
}

function ChartCard({
  title,
  children,
  loading,
  height = 200,
}: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  height?: number;
}) {
  return (
    <div style={CARD_STYLE}>
      <h3
        style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "0.9375rem",
          fontWeight: 700,
          color: "#f0f0f0",
          margin: "0 0 20px",
        }}
      >
        {title}
      </h3>
      {loading ? (
        <div
          style={{
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "2px solid rgba(255,186,8,0.15)",
              borderTopColor: "#ffba08",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  );
}

const CHART_TOOLTIP_STYLE = {
  background: "#111318",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "8px",
  fontSize: "0.8125rem",
  color: "#f0f0f0",
};

const AXIS_PROPS = {
  stroke: "#555",
  fontSize: 11,
  fontFamily: "var(--font-dm-sans), system-ui",
  tickLine: false,
  axisLine: false,
};

function LineChartContent({ data, dataKey = "count" }: { data: WeekBucket[]; dataKey?: string }) {
  return (
    <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" vertical={false} />
      <XAxis dataKey="week" {...AXIS_PROPS} />
      <YAxis allowDecimals={false} {...AXIS_PROPS} />
      <Tooltip
        contentStyle={CHART_TOOLTIP_STYLE}
        itemStyle={{ color: "#ffba08", fontWeight: 600 }}
        labelStyle={{ color: "#888", marginBottom: 4 }}
        cursor={{ stroke: "rgba(255,186,8,0.15)", strokeWidth: 1 }}
      />
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke="#ffba08"
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4, fill: "#ffba08", strokeWidth: 0 }}
      />
    </LineChart>
  );
}

interface ActivityProject {
  id: string;
  name: string;
  tagline: string | null;
  created_at: string;
  profiles: { username: string | null; full_name: string | null } | null;
}

interface ActivitySignup {
  id: string;
  full_name: string | null;
  username: string | null;
  university_verified: boolean;
  created_at: string;
}

function RecentActivityFeed({
  projects,
  signups,
  loading,
}: {
  projects: ActivityProject[];
  signups: ActivitySignup[];
  loading: boolean;
}) {
  const [tab, setTab] = useState<"projects" | "signups">("projects");

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: active ? "#f0f0f0" : "#555",
    background: "none",
    border: "none",
    borderBottom: `2px solid ${active ? "#ffba08" : "transparent"}`,
    paddingBottom: "8px",
    cursor: "pointer",
    transition: "color 0.15s, border-color 0.15s",
    fontFamily: "DM Sans, system-ui, sans-serif",
  });

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div style={CARD_STYLE}>
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button style={tabStyle(tab === "projects")} onClick={() => setTab("projects")}>
          Latest Projects
        </button>
        <button style={tabStyle(tab === "signups")} onClick={() => setTab("signups")}>
          Latest Signups
        </button>
      </div>

      {loading ? (
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid rgba(255,186,8,0.15)", borderTopColor: "#ffba08", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : tab === "projects" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {projects.length === 0 && (
            <p style={{ color: "#555", fontSize: "0.875rem" }}>No projects yet.</p>
          )}
          {projects.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#f0f0f0" }}>{p.name}</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#666", marginTop: "2px" }}>
                  {p.tagline ?? "No tagline"} · by {p.profiles?.username ?? p.profiles?.full_name ?? "Unknown"}
                </p>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#555", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={11} />
                {timeAgo(p.created_at)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {signups.length === 0 && (
            <p style={{ color: "#555", fontSize: "0.875rem" }}>No signups yet.</p>
          )}
          {signups.map((u) => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#f0f0f0" }}>
                  {u.full_name ?? u.username ?? "Anonymous"}
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#666", marginTop: "2px" }}>
                  {u.username ? `@${u.username}` : "No username"} · {u.university_verified ? "✓ Verified" : "Unverified"}
                </p>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#555", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={11} />
                {timeAgo(u.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard page
// ---------------------------------------------------------------------------

interface TopStats {
  universities: number;
  cohorts: { total: number; active: number; upcoming: number; past: number };
  projects: number;
  users: number;
}

interface FunnelStats {
  verifiedCount: number;
  joinCount: number;
  submissionCount: number;
}

export default function AdminDashboardPage() {
  const [topStats, setTopStats] = useState<TopStats>({
    universities: 0,
    cohorts: { total: 0, active: 0, upcoming: 0, past: 0 },
    projects: 0,
    users: 0,
  });
  const [funnelStats, setFunnelStats] = useState<FunnelStats>({
    verifiedCount: 0,
    joinCount: 0,
    submissionCount: 0,
  });

  const [signupsByWeek, setSignupsByWeek] = useState<WeekBucket[]>([]);
  const [verificationsByWeek, setVerificationsByWeek] = useState<WeekBucket[]>([]);
  const [submissionsByWeek, setSubmissionsByWeek] = useState<WeekBucket[]>([]);
  const [universityBreakdown, setUniversityBreakdown] = useState<UniversityRow[]>([]);

  const [latestProjects, setLatestProjects] = useState<ActivityProject[]>([]);
  const [latestSignups, setLatestSignups] = useState<ActivitySignup[]>([]);

  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // ── Top stats (fast, parallel counts) ──────────────────────────────
      const [
        { count: universities },
        { count: users },
        { count: projects },
        { data: cohortRows },
        { count: verified },
        { count: submissions },
      ] = await Promise.all([
        supabase.from("universities").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("cohorts").select("status"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("university_verified", true),
        supabase.from("projects").select("*", { count: "exact", head: true }),
      ]);

      const cohortsByStatus = (cohortRows ?? []).reduce(
        (acc: Record<string, number>, c: { status: string }) => {
          acc[c.status] = (acc[c.status] ?? 0) + 1;
          return acc;
        },
        {}
      );

      setTopStats({
        universities: universities ?? 0,
        cohorts: {
          total: (cohortRows ?? []).length,
          active: cohortsByStatus["active"] ?? 0,
          upcoming: cohortsByStatus["upcoming"] ?? 0,
          past: cohortsByStatus["past"] ?? 0,
        },
        projects: projects ?? 0,
        users: users ?? 0,
      });

      // Cohort joins — table may not exist yet; swallow errors gracefully
      let joinCount = 0;
      try {
        const { count: joins } = await supabase
          .from("cohort_participants")
          .select("*", { count: "exact", head: true });
        joinCount = joins ?? 0;
      } catch {
        joinCount = 0;
      }

      setFunnelStats({
        verifiedCount: verified ?? 0,
        joinCount,
        submissionCount: submissions ?? 0,
      });

      // ── Recent activity ─────────────────────────────────────────────────
      const [{ data: recentProjects }, { data: recentSignups }] = await Promise.all([
        supabase
          .from("projects")
          .select("id, name, tagline, created_at, profiles(username, full_name)")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("profiles")
          .select("id, full_name, username, university_verified, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      setLatestProjects((recentProjects ?? []) as unknown as ActivityProject[]);
      setLatestSignups((recentSignups ?? []) as ActivitySignup[]);
      setLoading(false);

      // ── Growth charts & university breakdown (slower, run after render) ─
      const [sWeek, vWeek, subWeek, uniBreakdown] = await Promise.all([
        getWeeklyCounts(supabase, "profiles", "created_at"),
        getWeeklyCounts(supabase, "profiles", "university_verified_at", { university_verified: true }),
        getWeeklyCounts(supabase, "projects", "created_at"),
        getUniversityBreakdown(supabase),
      ]);

      setSignupsByWeek(sWeek);
      setVerificationsByWeek(vWeek);
      setSubmissionsByWeek(subWeek);
      setUniversityBreakdown(uniBreakdown);
      setChartsLoading(false);
    }

    load();
  }, []);

  const conversionRate =
    funnelStats.verifiedCount > 0
      ? Math.round((funnelStats.submissionCount / funnelStats.verifiedCount) * 100)
      : 0;

  const cohortSub = topStats.cohorts.total > 0
    ? `${topStats.cohorts.active} active · ${topStats.cohorts.upcoming} upcoming · ${topStats.cohorts.past} past`
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#f0f0f0",
            margin: 0,
          }}
        >
          Analytics
        </h1>
        <p style={{ color: "#888", fontSize: "0.875rem", marginTop: "4px", marginBottom: 0 }}>
          Platform-wide metrics and growth
        </p>
      </div>

      {/* ── Top stat row ─────────────────────────────────────────────────── */}
      <div>
        <SectionLabel>Overview</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "14px",
          }}
        >
          <StatCard
            label="Universities"
            value={topStats.universities}
            icon={<University size={15} />}
          />
          <StatCard
            label="Hackathons"
            value={topStats.cohorts.total}
            sub={cohortSub}
            icon={<Zap size={15} />}
          />
          <StatCard
            label="Projects"
            value={topStats.projects}
            icon={<FolderKanban size={15} />}
            accent
          />
          <StatCard
            label="Registered users"
            value={topStats.users}
            icon={<Users size={15} />}
          />
        </div>
      </div>

      {/* ── Funnel row ───────────────────────────────────────────────────── */}
      <div>
        <SectionLabel>Conversion funnel</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "14px",
          }}
        >
          <StatCard
            label="Verified students"
            value={funnelStats.verifiedCount}
            icon={<GraduationCap size={15} />}
          />
          <StatCard
            label="Cohort joins"
            value={funnelStats.joinCount}
            icon={<Users size={15} />}
          />
          <StatCard
            label="Submissions"
            value={funnelStats.submissionCount}
            icon={<FolderGit2 size={15} />}
          />
          <StatCard
            label="Conversion rate"
            value={`${conversionRate}%`}
            sub="verified → submitted"
            icon={<TrendingUp size={15} />}
            accent={conversionRate > 0}
          />
        </div>
      </div>

      {/* ── Growth line charts ───────────────────────────────────────────── */}
      <div>
        <SectionLabel>Growth over time</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ChartCard title="Signups over time" loading={chartsLoading}>
            {signupsByWeek.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: "0.875rem" }}>
                No data yet
              </div>
            ) : (
              <LineChartContent data={signupsByWeek} />
            )}
          </ChartCard>

          <ChartCard title="University verifications over time" loading={chartsLoading}>
            {verificationsByWeek.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: "0.875rem" }}>
                No verification timestamps recorded yet — data will appear for verifications going forward.
              </div>
            ) : (
              <LineChartContent data={verificationsByWeek} />
            )}
          </ChartCard>

          <ChartCard title="Project submissions over time" loading={chartsLoading}>
            {submissionsByWeek.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: "0.875rem" }}>
                No data yet
              </div>
            ) : (
              <LineChartContent data={submissionsByWeek} />
            )}
          </ChartCard>
        </div>
      </div>

      {/* ── University breakdown horizontal bar chart ────────────────────── */}
      {universityBreakdown.length > 0 && (
        <div>
          <SectionLabel>Activity by university</SectionLabel>
          <ChartCard
            title="Verified builders per university"
            loading={chartsLoading}
            height={Math.max(180, universityBreakdown.length * 44)}
          >
            <BarChart
              data={universityBreakdown}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="#1f2230" />
              <XAxis type="number" allowDecimals={false} {...AXIS_PROPS} />
              <YAxis
                type="category"
                dataKey="universityName"
                width={150}
                {...AXIS_PROPS}
                tick={{ fill: "#888", fontSize: 11, fontFamily: "var(--font-dm-sans), system-ui" }}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                itemStyle={{ color: "#ffba08", fontWeight: 600 }}
                labelStyle={{ color: "#888", marginBottom: 4 }}
                cursor={{ fill: "rgba(255,186,8,0.05)" }}
              />
              <Bar dataKey="builders" name="Verified builders" fill="#ffba08" radius={[0, 4, 4, 0]} maxBarSize={20} />
              <Bar dataKey="submissions" name="Submissions" fill="rgba(255,186,8,0.3)" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ChartCard>
        </div>
      )}

      {/* ── Recent activity feed ─────────────────────────────────────────── */}
      <div>
        <SectionLabel>Recent activity</SectionLabel>
        <RecentActivityFeed
          projects={latestProjects}
          signups={latestSignups}
          loading={loading}
        />
      </div>
    </div>
  );
}
