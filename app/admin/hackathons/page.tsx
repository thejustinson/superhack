"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { AnnounceResultsModal } from "@/components/admin/AnnounceResultsModal";
import { supabase } from "@/lib/supabase";
import type { Cohort, University } from "@/lib/supabase";
import { DataTable } from "@/components/admin/DataTable";
import { SlideOver } from "@/components/admin/SlideOver";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { ScopeToggle } from "@/components/admin/ScopeToggle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const DEFAULT_PRIZE_POOL = [
  { place: "1st", amount: 100, description: "School fees contribution" },
  { place: "2nd", amount: 100, description: "School fees contribution" }
];

const EMPTY = {
  university_id: "",
  title: "",
  slug: "",
  status: "upcoming" as Cohort["status"],
  start_date: "" as string | null,
  end_date: "" as string | null,
  prize_pool: DEFAULT_PRIZE_POOL,
  scope: "university" as "university" | "faculty",
  faculty_name: "" as string | null,
  faculty_logo_url: "" as string | null,
  results_announced: false,
  results_announcement_date: "" as string | null,
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  backgroundColor: "#0d0f14",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", color: "#f0f0f0",
  fontSize: "0.875rem", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.8rem", color: "#888888",
  fontWeight: 500, marginBottom: "6px",
};

export default function AdminHackathonsPage() {
  const [data, setData] = useState<(Cohort & { universities: University | null })[]>([]);
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Cohort | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Cohort | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [announceTarget, setAnnounceTarget] = useState<Cohort | null>(null);

  function openAnnounceModal(cohort: Cohort) {
    setAnnounceTarget(cohort);
  }

  async function load() {
    setLoading(true);
    const [{ data: cohorts }, { data: uniList }] = await Promise.all([
      supabase
        .from("cohorts")
        .select("*, universities(id, name)")
        .order("created_at", { ascending: false }),
      supabase.from("universities").select("id, name").order("name"),
    ]);
    setData((cohorts as any) ?? []);
    setUnis((uniList as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, university_id: unis[0]?.id ?? "" });
    setError(""); setSlideOpen(true);
  }

  function openEdit(row: Cohort) {
    let pool: any = row.prize_pool;
    if (!pool || !Array.isArray(pool)) {
      if (pool && typeof pool === "object") {
        pool = Object.entries(pool).map(([place, amount]) => ({
          place,
          amount: Number(amount) || 0,
          description: "School fees contribution"
        }));
      } else {
        pool = [
          { place: "1st", amount: 100, description: "School fees contribution" },
          { place: "2nd", amount: 100, description: "School fees contribution" }
        ];
      }
    }

    setEditing(row);
    setForm({
      university_id: row.university_id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      start_date: row.start_date ?? "",
      end_date: row.end_date ?? "",
      prize_pool: pool,
      scope: (row.scope as "university" | "faculty") ?? "university",
      faculty_name: row.faculty_name ?? "",
      faculty_logo_url: row.faculty_logo_url ?? "",
      results_announced: row.results_announced ?? false,
      results_announcement_date: row.results_announcement_date ?? "",
    });
    setError(""); setSlideOpen(true);
  }

  function set(key: string, value: string) {
    setForm((f: any) => {
      const next: any = { ...f, [key]: value || null };
      if (key === "title" && !editing) next.slug = toSlug(value);
      return next;
    });
  }

  const handleResultsAnnouncedChange = async (checked: boolean) => {
    if (checked) {
      if (editing) {
        try {
          const { data } = await supabase
            .from("projects")
            .select("id")
            .eq("cohort_id", editing.id)
            .not("prize_place", "is", null);
          
          if (!data || data.length === 0) {
            const confirm = window.confirm(
              "No winners have been marked for this cohort yet. Are you sure you want to announce results?"
            );
            if (!confirm) return;
          }
        } catch (err) {
          console.error("Failed to check cohort winners:", err);
        }
      } else {
        const confirm = window.confirm(
          "No winners have been marked for this cohort yet. Are you sure you want to announce results?"
        );
        if (!confirm) return;
      }
    }
    setForm((f) => ({ ...f, results_announced: checked }));
  };

  async function save() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.slug.trim()) { setError("Slug is required."); return; }
    if (!form.university_id) { setError("University is required."); return; }
    setSaving(true); setError("");
    const payload = {
      university_id: form.university_id,
      title: form.title,
      slug: form.slug,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      prize_pool: form.prize_pool,
      scope: form.scope,
      faculty_name: form.scope === "faculty" ? (form.faculty_name || null) : null,
      faculty_logo_url: form.scope === "faculty" ? (form.faculty_logo_url || null) : null,
      results_announced: form.results_announced,
      results_announcement_date: form.results_announcement_date || null,
    };
    try {
      if (editing) {
        const { error: err } = await supabase.from("cohorts").update(payload).eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("cohorts").insert([payload]);
        if (err) throw err;
      }
      setSlideOpen(false);
      await load();
    } catch (e: any) {
      setError(e.message ?? "An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("cohorts").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    await load();
  }

  const statusVariant: Record<string, "status-active" | "status-upcoming" | "status-past"> = {
    active: "status-active", upcoming: "status-upcoming", past: "status-past",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "1.5rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
          }}>Hackathons</h1>
          <p style={{ color: "#888888", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {data.length} cohorts total
          </p>
        </div>
        <Button size="sm" onClick={openCreate} disabled={unis.length === 0}>
          <Plus size={14} /> New Hackathon
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "title", label: "Title", sortable: true },
          { key: "university_id", label: "University", render: (r: any) => r.universities?.name ?? "-" },
          { key: "status", label: "Status", render: (r) => (
            <Badge variant={statusVariant[r.status] ?? "muted"}>{r.status}</Badge>
          )},
          { key: "start_date", label: "Start", render: (r) => r.start_date ? new Date(r.start_date).toLocaleDateString() : "-" },
          { key: "end_date", label: "End", render: (r) => r.end_date ? new Date(r.end_date).toLocaleDateString() : "-" },
          { key: "results", label: "Results", render: (r: any) => {
            if (r.status !== 'past') return <span style={{ color: "#888888", fontSize: "0.8125rem" }}>-</span>;
            if (r.results_announced) {
              return (
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#888888", fontSize: "0.75rem", fontWeight: 600 }}>
                  <CheckCircle2 size={14} style={{ color: "#14F195" }} />
                  Results announced
                </span>
              );
            }
            return (
              <button
                onClick={() => openAnnounceModal(r)}
                style={{
                  backgroundColor: "#ffba08",
                  color: "#0b0c0f",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Announce Results
              </button>
            );
          }},
        ]}
        data={data}
        keyField="id"
        loading={loading}
        emptyMessage="No hackathons yet."
        actions={(row) => (
          <>
            <button onClick={() => openEdit(row)} title="Edit"
              style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: "4px", borderRadius: "5px" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ffba08"; e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#888888"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Pencil size={14} />
            </button>
            <button onClick={() => setDeleteTarget(row)} title="Delete"
              style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: "4px", borderRadius: "5px" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#888888"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      />

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Edit Hackathon" : "New Hackathon"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={labelStyle}>University *</label>
            <select
              value={form.university_id}
              onChange={(e) => set("university_id", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Select university...</option>
              {unis.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              style={inputStyle} value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Superhack 2025 - Lagos"
            />
          </div>
          <div>
            <label style={labelStyle}>Slug *</label>
            <input
              style={inputStyle} value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="superhack-2025-lagos"
            />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Cohort["status"] }))}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="past">Past</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                type="date" style={inputStyle}
                value={form.start_date ?? ""}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                type="date" style={inputStyle}
                value={form.end_date ?? ""}
                onChange={(e) => set("end_date", e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Results Announcement Date</label>
              <input
                type="date" style={inputStyle}
                value={form.results_announcement_date ?? ""}
                onChange={(e) => set("results_announcement_date", e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "42px" }}>
              <input
                type="checkbox"
                id="results_announced"
                checked={form.results_announced}
                onChange={(e) => handleResultsAnnouncedChange(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="results_announced" style={{ fontSize: "0.875rem", color: "#f0f0f0", cursor: "pointer", fontWeight: 500 }}>
                Results Announced
              </label>
            </div>
          </div>

          {/* Prize pool configuration */}
          <div>
            <label style={labelStyle}>Prize Pool (School fees contribution)</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Array.isArray(form.prize_pool) && form.prize_pool.map((item: any, idx: number) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "70px 100px 1fr", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8125rem", color: "#f0f0f0", fontWeight: 600 }}>{item.place} Place</span>
                  <input
                    type="number"
                    style={inputStyle}
                    value={item.amount}
                    onChange={(e) => {
                      const nextPool = [...form.prize_pool];
                      nextPool[idx] = { ...nextPool[idx], amount: Number(e.target.value) || 0 };
                      setForm((f) => ({ ...f, prize_pool: nextPool }));
                    }}
                    placeholder="100"
                  />
                  <input
                    type="text"
                    style={inputStyle}
                    value={item.description || ""}
                    onChange={(e) => {
                      const nextPool = [...form.prize_pool];
                      nextPool[idx] = { ...nextPool[idx], description: e.target.value };
                      setForm((f) => ({ ...f, prize_pool: nextPool }));
                    }}
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Scope toggle */}
          <div>
            <label style={labelStyle}>Scope</label>
            <ScopeToggle
              value={form.scope}
              onChange={(val) => setForm((f: any) => ({ ...f, scope: val }))}
            />
          </div>

          {/* Faculty fields */}
          {form.scope === "faculty" && (
            <>
              <div>
                <label style={labelStyle}>Faculty name</label>
                <input
                  style={inputStyle} value={form.faculty_name ?? ""}
                  onChange={(e) => set("faculty_name", e.target.value)}
                  placeholder="Faculty of Engineering"
                />
              </div>
              <div>
                <label style={labelStyle}>Faculty logo URL</label>
                <input
                  style={inputStyle} value={form.faculty_logo_url ?? ""}
                  onChange={(e) => set("faculty_logo_url", e.target.value)}
                  placeholder="https://..."
                />
                {form.faculty_logo_url && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={form.faculty_logo_url} alt="Preview"
                      style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "#888888" }}>Preview</span>
                  </div>
                )}
              </div>
            </>
          )}

          {error && <p style={{ color: "#f87171", fontSize: "0.8125rem", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <Button variant="ghost" size="sm" onClick={() => setSlideOpen(false)} disabled={saving}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Hackathon"}
            </Button>
          </div>
        </div>
      </SlideOver>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Hackathon"
        message={`Delete "${deleteTarget?.title}"? All associated projects will also be deleted.`}
        loading={deleting}
      />

      {announceTarget && (
        <AnnounceResultsModal
          cohort={announceTarget}
          open={!!announceTarget}
          onClose={() => setAnnounceTarget(null)}
          onAnnounced={load}
        />
      )}
    </div>
  );
}

