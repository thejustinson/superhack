"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/admin/DataTable";
import { SlideOver } from "@/components/admin/SlideOver";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";

interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

const EMPTY = {
  title: "",
  slug: "",
  description: "",
  cover_image_url: "",
  order_index: 0,
  is_published: false,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  backgroundColor: "#0d0f14",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#f0f0f0",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  color: "#888888",
  fontWeight: 500,
  marginBottom: "6px",
};

export default function AdminTopicsPage() {
  const router = useRouter();
  const [data, setData] = useState<Topic[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  async function load() {
    setLoading(true);
    // 1. Fetch topics ordered by order_index
    const { data: rows } = await supabase
      .from("learn_topics")
      .select("*")
      .order("order_index", { ascending: true });
    
    const activeTopics = rows ?? [];
    setData(activeTopics);

    if (activeTopics.length > 0) {
      // 2. Fetch lesson counts per topic
      const topicIds = activeTopics.map((t) => t.id);
      const { data: counts } = await supabase
        .from("learn_lessons")
        .select("topic_id");

      const mapping: Record<string, number> = {};
      activeTopics.forEach((t) => { mapping[t.id] = 0; });
      (counts || []).forEach((c) => {
        if (mapping[c.topic_id] !== undefined) {
          mapping[c.topic_id] += 1;
        }
      });
      setLessonCounts(mapping);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleTitleChange(val: string) {
    setForm((f) => ({
      ...f,
      title: val,
      slug: editing ? f.slug : slugify(val),
    }));
  }

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value || "" }));
  }

  function openCreate() {
    setEditing(null);
    setForm({
      ...EMPTY,
      order_index: data.length > 0 ? Math.max(...data.map((d) => d.order_index)) + 1 : 1,
    });
    setError("");
    setSlideOpen(true);
  }

  function openEdit(row: Topic, e: React.MouseEvent) {
    e.stopPropagation(); // Stop navigation click
    setEditing(row);
    setForm({
      title: row.title,
      slug: row.slug,
      description: row.description ?? "",
      cover_image_url: row.cover_image_url ?? "",
      order_index: row.order_index,
      is_published: row.is_published,
    });
    setError("");
    setSlideOpen(true);
  }

  async function save() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.slug.trim()) { setError("Slug is required."); return; }
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      cover_image_url: form.cover_image_url || null,
      order_index: form.order_index,
      is_published: form.is_published,
    };

    try {
      if (editing) {
        const { error: err } = await supabase.from("learn_topics").update(payload).eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("learn_topics").insert([payload]);
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
    await supabase.from("learn_topics").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    await load();
  }

  async function move(index: number, direction: "up" | "down") {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === data.length - 1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const current = data[index];
    const target = data[swapIndex];

    // Swap order_indexes in the database
    const tempIndex = -1; // Temp negative index to avoid uniqueness constraint validation if any
    
    setLoading(true);
    await supabase.from("learn_topics").update({ order_index: tempIndex }).eq("id", current.id);
    await supabase.from("learn_topics").update({ order_index: current.order_index }).eq("id", target.id);
    await supabase.from("learn_topics").update({ order_index: target.order_index }).eq("id", current.id);
    await load();
  }

  const columns = [
    {
      key: "title",
      label: "Topic Title",
      render: (row: Topic) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, color: "#f0f0f0" }}>{row.title}</span>
          <span style={{ fontSize: "0.75rem", color: "#666666" }}>/{row.slug}</span>
        </div>
      ),
    },
    {
      key: "lessons",
      label: "Lessons",
      render: (row: Topic) => (
        <span style={{ fontSize: "0.875rem", color: "#cccccc" }}>
          {lessonCounts[row.id] ?? 0} { (lessonCounts[row.id] ?? 0) === 1 ? "lesson" : "lessons" }
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Topic) => (
        <Badge variant={row.is_published ? "status-active" : "status-past"}>
          {row.is_published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "reorder",
      label: "Order",
      render: (row: Topic) => {
        const idx = data.findIndex((x) => x.id === row.id);
        return (
          <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => move(idx, "up")}
              disabled={idx === 0}
              style={{
                padding: "4px", backgroundColor: "rgba(255,255,255,0.03)", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer",
                borderRadius: "4px", color: idx === 0 ? "#444" : "#888", display: "flex",
              }}
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => move(idx, "down")}
              disabled={idx === data.length - 1}
              style={{
                padding: "4px", backgroundColor: "rgba(255,255,255,0.03)", border: "none", cursor: idx === data.length - 1 ? "not-allowed" : "pointer",
                borderRadius: "4px", color: idx === data.length - 1 ? "#444" : "#888", display: "flex",
              }}
            >
              <ArrowDown size={14} />
            </button>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (row: Topic) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => openEdit(row, e)}
            style={{
              background: "none", border: "none", color: "#ffba08", cursor: "pointer", padding: "6px", borderRadius: "6px", display: "flex",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            style={{
              background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "6px", borderRadius: "6px", display: "flex",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f0f0f0", margin: 0 }}>
            Learn Topics Manager
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "#888888", margin: "4px 0 0" }}>
            Add, re-order, and publish Solana modules. Click a topic row to manage its syllabus lessons.
          </p>
        </div>
        
        <Button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#ffba08", color: "#0b0c0f" }}>
          <Plus size={14} /> Add Topic
        </Button>
      </div>

      {/* Main Table view */}
      <DataTable
        columns={columns}
        data={data}
        keyField="id"
        loading={loading}
        onRowClick={(row) => router.push(`/admin/learn/${row.id}`)}
      />

      {/* SlideOver Form */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editing ? "Edit Topic" : "Create Topic"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "8px 0" }}>
          <div>
            <label style={labelStyle}>Topic Title</label>
            <input
              type="text"
              style={inputStyle}
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Introduction to Solana"
            />
          </div>

          <div>
            <label style={labelStyle}>URL Slug</label>
            <input
              type="text"
              style={inputStyle}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="intro-to-solana"
            />
          </div>

          <div>
            <label style={labelStyle}>Description (Syllabus summary)</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Topics covered in this module..."
            />
          </div>

          <div>
            <label style={labelStyle}>Cover Image URL</label>
            <input
              type="text"
              style={inputStyle}
              value={form.cover_image_url}
              onChange={(e) => set("cover_image_url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Order Index</label>
              <input
                type="number"
                style={inputStyle}
                value={form.order_index}
                onChange={(e) => set("order_index", e.target.value)}
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem", color: "#cccccc" }}>
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                  style={{ accentColor: "#ffba08" }}
                />
                Published
              </label>
            </div>
          </div>

          {error && <p style={{ fontSize: "0.8rem", color: "#f87171", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Button
              onClick={save}
              disabled={saving}
              style={{ flex: 1, backgroundColor: "#ffba08", color: "#0b0c0f" }}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setSlideOpen(false)}
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SlideOver>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Topic?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the topic and all lessons under it. This action cannot be undone.`}
        loading={deleting}
      />

    </div>
  );
}
