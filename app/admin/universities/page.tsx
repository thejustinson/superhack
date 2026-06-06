"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { University } from "@/lib/supabase";
import { DataTable } from "@/components/admin/DataTable";
import { SlideOver } from "@/components/admin/SlideOver";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";

const EMPTY: Omit<University, "id" | "created_at"> = {
  name: "", slug: "", city: null, state: null, logo_url: null,
  email_domain: null, description: null,
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

export default function AdminUniversitiesPage() {
  const [data, setData] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<University | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<University | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase
      .from("universities")
      .select("*")
      .order("name");
    setData(rows ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setError("");
    setSlideOpen(true);
  }

  function openEdit(row: University) {
    setEditing(row);
    setForm({
      name: row.name, slug: row.slug, city: row.city, state: row.state,
      logo_url: row.logo_url, email_domain: row.email_domain, description: row.description,
    });
    setError("");
    setSlideOpen(true);
  }

  function set(key: string, value: string) {
    setForm((f) => {
      const next: any = { ...f, [key]: value || null };
      if (key === "name" && !editing) next.slug = toSlug(value);
      return next;
    });
  }

  async function save() {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.slug.trim()) { setError("Slug is required."); return; }
    setSaving(true); setError("");
    try {
      if (editing) {
        const { error: err } = await supabase
          .from("universities")
          .update(form)
          .eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("universities")
          .insert([form]);
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
    await supabase.from("universities").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    await load();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: "1.5rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
          }}>Universities</h1>
          <p style={{ color: "#888888", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {data.length} universities registered
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} /> New University
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "slug", label: "Slug", sortable: true, render: (r) => (
            <code style={{ fontSize: "0.8rem", color: "#888888" }}>{r.slug}</code>
          )},
          { key: "city", label: "City", sortable: true, render: (r) => r.city ?? "—" },
          { key: "state", label: "State", render: (r) => r.state ?? "—" },
          { key: "email_domain", label: "Email Domain", render: (r) => r.email_domain ?? "—" },
        ]}
        data={data}
        keyField="id"
        loading={loading}
        emptyMessage="No universities yet. Create the first one!"
        actions={(row) => (
          <>
            <button
              onClick={() => openEdit(row)}
              title="Edit"
              style={{
                background: "none", border: "none", color: "#888888",
                cursor: "pointer", padding: "4px", borderRadius: "5px",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ffba08"; e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#888888"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              title="Delete"
              style={{
                background: "none", border: "none", color: "#888888",
                cursor: "pointer", padding: "4px", borderRadius: "5px",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#888888"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      />

      {/* Create / Edit SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editing ? "Edit University" : "New University"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input
              style={inputStyle} value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Lagos State University"
            />
          </div>
          <div>
            <label style={labelStyle}>Slug *</label>
            <input
              style={inputStyle} value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="lagos-state-university"
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>City</label>
              <input
                style={inputStyle} value={form.city ?? ""}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Lagos"
              />
            </div>
            <div>
              <label style={labelStyle}>State</label>
              <input
                style={inputStyle} value={form.state ?? ""}
                onChange={(e) => set("state", e.target.value)}
                placeholder="Lagos State"
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email Domain</label>
            <input
              style={inputStyle} value={form.email_domain ?? ""}
              onChange={(e) => set("email_domain", e.target.value)}
              placeholder="lasu.edu.ng"
            />
          </div>
          <div>
            <label style={labelStyle}>Logo URL</label>
            <input
              style={inputStyle} value={form.logo_url ?? ""}
              onChange={(e) => set("logo_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description…"
            />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.8125rem", margin: 0 }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <Button variant="ghost" size="sm" onClick={() => setSlideOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create University"}
            </Button>
          </div>
        </div>
      </SlideOver>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete University"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
