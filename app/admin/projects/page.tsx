"use client";

import { useEffect, useState } from "react";
import { Trash2, ExternalLink, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/admin/DataTable";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { WinnerModal } from "@/components/admin/WinnerModal";

interface ProjectRow {
  id: string;
  name: string;
  project_slug: string | null;
  description: string | null;
  github_url: string | null;
  live_url: string | null;
  upvote_count: number;
  created_at: string;
  status: string;
  prize_place: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  profiles: { full_name: string | null; username: string | null } | null;
  cohorts: { title: string; slug: string; universities: { name: string; slug: string } | null } | null;
}

export default function AdminProjectsPage() {
  const [data, setData] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [winnerTarget, setWinnerTarget] = useState<ProjectRow | null>(null);

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase
      .from("projects")
      .select(`
        *,
        profiles!user_id (full_name, username),
        cohorts (title, slug, universities (name, slug))
      `)
      .order("created_at", { ascending: false });
    setData((rows as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("projects").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    await load();
  }

  async function updatePaymentStatus(projectId: string, status: string) {
    await supabase
      .from("projects")
      .update({
        payment_status: status,
        payment_updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);
    setData((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, payment_status: status } : p)
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "1.5rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
        }}>Projects</h1>
        <p style={{ color: "#888888", fontSize: "0.875rem", margin: "4px 0 0" }}>
          {data.length} projects submitted
        </p>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Project", sortable: true },
          { key: "profiles", label: "Builder", render: (r) => r.profiles?.full_name ?? "-" },
          { key: "cohorts", label: "Hackathon", render: (r) => r.cohorts?.title ?? "-" },
          { key: "cohorts", label: "University", render: (r) => r.cohorts?.universities?.name ?? "-" },
          { key: "upvote_count", label: "Votes", sortable: true, render: (r) => (
            <span style={{ fontWeight: 600, color: "#ffba08" }}>{r.upvote_count}</span>
          )},
          { key: "status", label: "Status", render: (r) => (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {r.status === "winner" ? (
                <span style={{ color: "#ffba08", fontWeight: 600, fontSize: "0.8125rem" }}>Winner ({r.prize_place})</span>
              ) : (
                <span style={{ color: "#888888", fontSize: "0.8125rem" }}>Submitted</span>
              )}
              {r.prize_place && (
                <select
                  value={r.payment_status ?? "pending"}
                  onChange={(e) => { e.stopPropagation(); updatePaymentStatus(r.id, e.target.value); }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: "0.75rem",
                    backgroundColor: "#0d0f14",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    color: "#f0f0f0",
                    cursor: "pointer",
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    outline: "none",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="sent">Sent</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              )}
            </div>
          )},
          { key: "github_url", label: "Links", render: (r) => (
            <div style={{ display: "flex", gap: "6px" }}>
              {r.github_url && (
                <a href={r.github_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.8rem", color: "#888888", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
                >
                  <ExternalLink size={13} /> GitHub
                </a>
              )}
              {r.live_url && (
                <a href={r.live_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.8rem", color: "#888888", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ffba08")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
                >
                  <ExternalLink size={13} /> Live
                </a>
              )}
            </div>
          )},
          { key: "created_at", label: "Submitted", sortable: true, render: (r) =>
            new Date(r.created_at).toLocaleDateString() },
        ]}
        data={data}
        keyField="id"
        loading={loading}
        emptyMessage="No projects submitted yet."
        actions={(row) => (
          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={() => setWinnerTarget(row)} title="Manage Winner Status"
              style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: "4px", borderRadius: "5px" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ffba08"; e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#888888"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Award size={14} />
            </button>
            <button onClick={() => setDeleteTarget(row)} title="Delete"
              style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: "4px", borderRadius: "5px" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#888888"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Delete "${deleteTarget?.name}"? Votes will also be removed.`}
        loading={deleting}
      />

      <WinnerModal
        open={!!winnerTarget}
        onClose={() => setWinnerTarget(null)}
        project={winnerTarget}
        onConfirm={load}
      />
    </div>
  );
}

