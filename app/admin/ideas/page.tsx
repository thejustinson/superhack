"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/admin/DataTable";
import { SlideOver } from "@/components/admin/SlideOver";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const CATEGORIES = [
  "DeFi", "NFT", "Gaming", "Infrastructure", "DAO", "Payments", "Social", "Other",
];

interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  created_at: string;
}

const EMPTY = {
  title: "", description: "" as string | null,
  category: "" as string | null, difficulty: "beginner" as string | null,
  problem: "" as string | null,
  solution: "" as string | null,
  suggested_stack: "" as string, // comma-separated in the form
};

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

export default function AdminIdeasPage() {
  const [data, setData] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Idea | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Idea | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });
    setData(rows ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setError(""); setSlideOpen(true);
  }

  function openEdit(row: any) {
    setEditing(row);
    setForm({
      title: row.title,
      description: row.description ?? "",
      category: row.category ?? "",
      difficulty: row.difficulty ?? "beginner",
      problem: row.problem ?? "",
      solution: row.solution ?? "",
      suggested_stack: (row.suggested_stack ?? []).join(", "),
    });
    setError(""); setSlideOpen(true);
  }

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value || null }));
  }

  async function save() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError("");
    const payload = {
      title: form.title,
      description: form.description || null,
      category: form.category || null,
      difficulty: (form.difficulty || null) as "beginner" | "intermediate" | "advanced" | null,
      problem: form.problem || null,
      solution: form.solution || null,
      suggested_stack: form.suggested_stack
        ? form.suggested_stack.split(",").map((s: string) => s.trim()).filter(Boolean)
        : null,
    };

    try {
      if (editing) {
        const { error: err } = await supabase.from("ideas").update(payload).eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("ideas").insert([payload]);
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
    await supabase.from("ideas").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    await load();
  }

  const difficultyColor: Record<string, string> = {
    beginner: "#4ade80", intermediate: "#ffba08", advanced: "#f87171",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "1.5rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
          }}>Ideas</h1>
          <p style={{ color: "#888888", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {data.length} project ideas in the bank
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} /> New Idea
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "title", label: "Title", sortable: true },
          { key: "category", label: "Category", render: (r) => r.category ? (
            <Badge variant="accent">{r.category}</Badge>
          ) : <span style={{ color: "#555" }}>â€”</span> },
          { key: "difficulty", label: "Difficulty", render: (r) => r.difficulty ? (
            <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: difficultyColor[r.difficulty] ?? "#888" }}>
              {r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1)}
            </span>
          ) : "â€”" },
          { key: "created_at", label: "Added", sortable: true, render: (r) =>
            new Date(r.created_at).toLocaleDateString() },
        ]}
        data={data}
        keyField="id"
        loading={loading}
        emptyMessage="No ideas yet. Add some inspiration!"
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

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Edit Idea" : "New Idea"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              style={inputStyle} value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Decentralised payroll on Solana"
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="A brief description of the idea and its impactâ€¦"
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category ?? ""}
                onChange={(e) => set("category", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Selectâ€¦</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select
                value={form.difficulty ?? "beginner"}
                onChange={(e) => set("difficulty", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>The Problem</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={(form as any).problem ?? ""}
              onChange={(e) => set("problem", e.target.value)}
              placeholder="What pain does this solve?"
            />
          </div>
          <div>
            <label style={labelStyle}>The Solution</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={(form as any).solution ?? ""}
              onChange={(e) => set("solution", e.target.value)}
              placeholder="What does the project do to solve it?"
            />
          </div>
          <div>
            <label style={labelStyle}>
              Suggested Stack
              <span style={{ color: "#555", fontWeight: 400, marginLeft: "6px" }}>comma-separated</span>
            </label>
            <input
              style={inputStyle}
              value={(form as any).suggested_stack ?? ""}
              onChange={(e) => setForm((f: any) => ({ ...f, suggested_stack: e.target.value }))}
              placeholder="Anchor, Next.js, Solana Pay"
            />
          </div>

          {error && <p style={{ color: "#f87171", fontSize: "0.8125rem", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <Button variant="ghost" size="sm" onClick={() => setSlideOpen(false)} disabled={saving}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Savingâ€¦" : editing ? "Save Changes" : "Create Idea"}
            </Button>
          </div>
        </div>
      </SlideOver>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Idea"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

