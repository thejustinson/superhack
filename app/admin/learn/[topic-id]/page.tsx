"use client";

import { useEffect, useState, use } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ArrowLeft, ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/admin/DataTable";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  mdx_content: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

interface Topic {
  id: string;
  title: string;
}



export default function AdminLessonsPage({ params }: { params: Promise<{ "topic-id": string }> }) {
  const router = useRouter();
  const { "topic-id": topicId } = use(params);

  const [topic, setTopic] = useState<Topic | null>(null);
  const [data, setData] = useState<Lesson[]>([]);
  const [quizCounts, setQuizCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
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

    // 1. Fetch topic title
    const { data: tData } = await supabase
      .from("learn_topics")
      .select("id, title")
      .eq("id", topicId)
      .single();
    
    if (tData) setTopic(tData);

    // 2. Fetch lessons in the topic
    const { data: rows } = await supabase
      .from("learn_lessons")
      .select("*")
      .eq("topic_id", topicId)
      .order("order_index", { ascending: true });

    const activeLessons = rows ?? [];
    setData(activeLessons);

    if (activeLessons.length > 0) {
      // 3. Fetch quiz counts per lesson
      const { data: counts } = await supabase
        .from("learn_quizzes")
        .select("lesson_id");

      const mapping: Record<string, number> = {};
      activeLessons.forEach((l) => { mapping[l.id] = 0; });
      (counts || []).forEach((c) => {
        if (mapping[c.lesson_id] !== undefined) {
          mapping[c.lesson_id] += 1;
        }
      });
      setQuizCounts(mapping);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (topicId) {
      load();
    }
  }, [topicId]);



  async function openCreate() {
    setError("");
    setLoading(true);
    const nextOrderIndex = data.length > 0 ? Math.max(...data.map((d) => d.order_index)) + 1 : 1;
    const timestamp = Date.now();
    const payload = {
      topic_id: topicId,
      title: "Untitled Lesson",
      slug: `untitled-lesson-${timestamp}`,
      mdx_content: "# Untitled Lesson\n\nWrite MDX content here...",
      order_index: nextOrderIndex,
      is_published: false,
    };

    try {
      const { data: inserted, error: err } = await supabase
        .from("learn_lessons")
        .insert([payload])
        .select()
        .single();
      
      if (err) throw err;
      if (inserted) {
        router.push(`/admin/learn/${topicId}/${inserted.id}/edit`);
      }
    } catch (e: any) {
      setError(e.message ?? "An error occurred.");
      setLoading(false);
    }
  }
  function openEdit(row: Lesson, e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/admin/learn/${topicId}/${row.id}/edit`);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("learn_lessons").delete().eq("id", deleteTarget.id);
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

    const tempIndex = -1;

    setLoading(true);
    await supabase.from("learn_lessons").update({ order_index: tempIndex }).eq("id", current.id);
    await supabase.from("learn_lessons").update({ order_index: current.order_index }).eq("id", target.id);
    await supabase.from("learn_lessons").update({ order_index: target.order_index }).eq("id", current.id);
    await load();
  }

  const columns = [
    {
      key: "title",
      label: "Lesson Title",
      render: (row: Lesson) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, color: "#f0f0f0" }}>{row.title}</span>
          <span style={{ fontSize: "0.75rem", color: "#666666" }}>/{row.slug}</span>
        </div>
      ),
    },
    {
      key: "quizzes",
      label: "Quizzes",
      render: (row: Lesson) => (
        <span style={{ fontSize: "0.875rem", color: "#cccccc" }}>
          {quizCounts[row.id] ?? 0} { (quizCounts[row.id] ?? 0) === 1 ? "quiz" : "quizzes" }
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Lesson) => (
        <Badge variant={row.is_published ? "status-active" : "status-past"}>
          {row.is_published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "reorder",
      label: "Order",
      render: (row: Lesson) => {
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
      render: (row: Lesson) => (
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
      
      {/* Back button */}
      <Link
        href="/admin/learn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.8125rem",
          color: "#888888",
          textDecoration: "none",
          width: "fit-content",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
      >
        <ArrowLeft size={13} />
        <span>Back to Topics</span>
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f0f0f0", margin: 0 }}>
            {topic ? `${topic.title} Syllabus` : "Syllabus Manager"}
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "#888888", margin: "4px 0 0" }}>
            Add and arrange MDX lessons for this topic. Click any lesson row to open the Quiz Challenge Builder.
          </p>
        </div>

        <Button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#ffba08", color: "#0b0c0f" }}>
          <Plus size={14} /> Add Lesson
        </Button>
      </div>

      {/* Table view */}
      <DataTable
        columns={columns}
        data={data}
        keyField="id"
        loading={loading}
        onRowClick={(row) => router.push(`/admin/learn/${topicId}/${row.id}`)}
      />



      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Lesson?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the lesson content and any quizzes attached to it. This action cannot be undone.`}
        loading={deleting}
      />

    </div>
  );
}
