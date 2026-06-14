"use client";

import { useEffect, useState } from "react";
import { University, Users, Zap, FolderKanban, Lightbulb, ThumbsUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/admin/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Stats {
  universities: number;
  users: number;
  hackathons: number;
  projects: number;
  ideas: number;
  votes: number;
}

interface ProjectsByMonth {
  month: string;
  count: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    universities: 0, users: 0, hackathons: 0,
    projects: 0, ideas: 0, votes: 0,
  });
  const [chartData, setChartData] = useState<ProjectsByMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: universities },
        { count: users },
        { count: hackathons },
        { count: projects },
        { count: ideas },
        { count: votes },
      ] = await Promise.all([
        supabase.from("universities").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("cohorts").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("ideas").select("*", { count: "exact", head: true }),
        supabase.from("votes").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        universities: universities ?? 0,
        users: users ?? 0,
        hackathons: hackathons ?? 0,
        projects: projects ?? 0,
        ideas: ideas ?? 0,
        votes: votes ?? 0,
      });

      // Projects by month (last 6 months)
      const { data: projectRows } = await supabase
        .from("projects")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (projectRows) {
        const counts: Record<string, number> = {};
        projectRows.forEach((p) => {
          const d = new Date(p.created_at);
          const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
          counts[key] = (counts[key] ?? 0) + 1;
        });
        setChartData(
          Object.entries(counts).map(([month, count]) => ({ month, count }))
        );
      }

      setLoading(false);
    }
    load();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div style={{
          backgroundColor: "#181b22", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px", padding: "10px 14px",
          fontSize: "0.8125rem", color: "#f0f0f0",
        }}>
          <div style={{ color: "#888888", marginBottom: "4px" }}>{label}</div>
          <div style={{ fontWeight: 600, color: "#ffba08" }}>{payload[0].value} projects</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "1.5rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
        }}>
          Dashboard
        </h1>
        <p style={{ color: "#888888", fontSize: "0.875rem", marginTop: "4px", marginBottom: 0 }}>
          Platform overview and key metrics
        </p>
      </div>

      {/* Stat grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "32px",
      }}>
        <StatCard label="Universities" value={stats.universities} icon={<University size={15} />} />
        <StatCard label="Users" value={stats.users} icon={<Users size={15} />} trend="up" trendValue="+12% this month" />
        <StatCard label="Hackathons" value={stats.hackathons} icon={<Zap size={15} />} />
        <StatCard label="Projects" value={stats.projects} icon={<FolderKanban size={15} />} accent />
        <StatCard label="Ideas" value={stats.ideas} icon={<Lightbulb size={15} />} />
        <StatCard label="Total Votes" value={stats.votes} icon={<ThumbsUp size={15} />} />
      </div>

      {/* Chart */}
      <div style={{
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        padding: "24px",
      }}>
        <h2 style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "1rem", fontWeight: 700, color: "#f0f0f0",
          margin: "0 0 20px",
        }}>
          Projects Submitted
        </h2>
        {loading ? (
          <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              border: "2px solid rgba(255,186,8,0.15)", borderTopColor: "#ffba08",
              animation: "spin 0.8s linear infinite",
            }} />
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", color: "#888888", fontSize: "0.875rem" }}>
            No project data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} stroke="#1f2230" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#888888", fontSize: 11, fontFamily: "var(--font-dm-sans), system-ui" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#888888", fontSize: 11, fontFamily: "var(--font-dm-sans), system-ui" }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,186,8,0.06)" }} />
              <Bar dataKey="count" fill="#ffba08" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

