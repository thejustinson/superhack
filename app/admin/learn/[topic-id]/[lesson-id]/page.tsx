"use client";

import { useEffect, useState, use } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ArrowLeft, Lightbulb, Trash } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/admin/DataTable";
import { SlideOver } from "@/components/admin/SlideOver";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface Quiz {
  id: string;
  lesson_id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "code_challenge";
  options: any;
  correct_answer: string;
  explanation: string | null;
  function_name?: string | null;
  test_input?: any;
  order_index: number;
  created_at: string;
}

interface Lesson {
  id: string;
  title: string;
  mdx_content: string | null;
}

interface OptionItem {
  label: string;
  value: string;
}

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

export default function AdminQuizzesPage({
  params,
}: {
  params: Promise<{ "topic-id": string; "lesson-id": string }>;
}) {
  const { "topic-id": topicId, "lesson-id": lessonId } = use(params);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [data, setData] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Code challenge new states
  const [functionName, setFunctionName] = useState("");
  const [testInputRaw, setTestInputRaw] = useState("[]");

  // SlideOver Form state fields
  const [question, setQuestion] = useState("");
  const [type, setType] = useState<"multiple_choice" | "true_false" | "code_challenge">("multiple_choice");
  const [explanation, setExplanation] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  // Options states depending on type
  const [mcOptions, setMcOptions] = useState<OptionItem[]>([
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
  ]);
  const [mcCorrect, setMcCorrect] = useState("a");

  const [tfCorrect, setTfCorrect] = useState("true");

  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeStarter, setCodeStarter] = useState("");
  const [codeExpected, setCodeExpected] = useState("");

  async function load() {
    setLoading(true);

    // 1. Fetch Lesson details
    const { data: lData } = await supabase
      .from("learn_lessons")
      .select("id, title, mdx_content")
      .eq("id", lessonId)
      .single();

    if (lData) setLesson(lData);

    // 2. Fetch Quizzes for this lesson
    const { data: rows } = await supabase
      .from("learn_quizzes")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });

    setData(rows ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (lessonId) {
      load();
    }
  }, [lessonId]);

  function openCreate() {
    setEditing(null);
    setQuestion("");
    setType("multiple_choice");
    setExplanation("");
    setOrderIndex(data.length > 0 ? Math.max(...data.map((d) => d.order_index)) + 1 : 1);
    
    // reset options
    setMcOptions([
      { label: "", value: "a" },
      { label: "", value: "b" },
    ]);
    setMcCorrect("a");
    setTfCorrect("true");
    setCodeLanguage("javascript");
    setCodeStarter("");
    setCodeExpected("");
    setFunctionName("");
    setTestInputRaw("[]");

    setError("");
    setSlideOpen(true);
  }

  function openEdit(row: Quiz) {
    setEditing(row);
    setQuestion(row.question);
    setType(row.type);
    setExplanation(row.explanation ?? "");
    setOrderIndex(row.order_index);

    // Parse options block
    let parsedOptions = [];
    if (row.options) {
      try {
        parsedOptions = typeof row.options === "string" ? JSON.parse(row.options) : row.options;
      } catch (e) {
        parsedOptions = [];
      }
    }

    if (row.type === "multiple_choice") {
      setMcOptions(parsedOptions.length > 0 ? parsedOptions : [{ label: "", value: "a" }]);
      setMcCorrect(row.correct_answer);
    } else if (row.type === "true_false") {
      setTfCorrect(row.correct_answer);
    } else if (row.type === "code_challenge") {
      setCodeLanguage(parsedOptions.language ?? "javascript");
      setCodeStarter(parsedOptions.starterCode ?? "");
      setCodeExpected(row.correct_answer);
      setFunctionName(row.function_name ?? "");
      setTestInputRaw(row.test_input ? (typeof row.test_input === "string" ? row.test_input : JSON.stringify(row.test_input)) : "[]");
    }

    setError("");
    setSlideOpen(true);
  }

  const handleAddMcOption = () => {
    if (mcOptions.length >= 6) return;
    const key = String.fromCharCode(97 + mcOptions.length); // a, b, c, d...
    setMcOptions([...mcOptions, { label: "", value: key }]);
  };

  const handleRemoveMcOption = (idx: number) => {
    if (mcOptions.length <= 2) return;
    const nextOpts = mcOptions.filter((_, i) => i !== idx);
    setMcOptions(nextOpts);
    // adjust correct value if deleted was selected
    if (mcCorrect === mcOptions[idx].value) {
      setMcCorrect(nextOpts[0].value);
    }
  };

  const handleMcOptionLabelChange = (idx: number, val: string) => {
    const nextOpts = [...mcOptions];
    nextOpts[idx].label = val;
    setMcOptions(nextOpts);
  };

  async function save() {
    if (!question.trim()) { setError("Question text is required."); return; }
    setSaving(true);
    setError("");

    let optionsPayload: any = null;
    let correctAnswerPayload = "";

    if (type === "multiple_choice") {
      // Validate option fields are filled
      if (mcOptions.some((o) => !o.label.trim())) {
        setError("All Multiple Choice options must have a label.");
        setSaving(false);
        return;
      }
      optionsPayload = mcOptions;
      correctAnswerPayload = mcCorrect;
    } else if (type === "true_false") {
      optionsPayload = null;
      correctAnswerPayload = tfCorrect;
    } else if (type === "code_challenge") {
      if (!codeExpected.trim()) {
        setError("Expected answer output value is required for code verification.");
        setSaving(false);
        return;
      }
      if ((codeLanguage === "javascript" || codeLanguage === "typescript") && !functionName.trim()) {
        setError("Function to test name is required for JS/TS challenges.");
        setSaving(false);
        return;
      }
      try {
        const parsed = JSON.parse(testInputRaw || "[]");
        if (!Array.isArray(parsed)) {
          setError("Test input must be a JSON array (e.g. [2500000000]).");
          setSaving(false);
          return;
        }
      } catch (err) {
        setError("Test input must be a valid JSON array.");
        setSaving(false);
        return;
      }
      optionsPayload = {
        language: codeLanguage,
        starterCode: codeStarter,
      };
      correctAnswerPayload = codeExpected;
    }

    const parsedInput = type === "code_challenge" ? JSON.parse(testInputRaw || "[]") : null;

    const payload = {
      lesson_id: lessonId,
      question,
      type,
      options: optionsPayload,
      correct_answer: correctAnswerPayload,
      explanation: explanation || null,
      function_name: type === "code_challenge" ? functionName.trim() : null,
      test_input: type === "code_challenge" ? parsedInput : null,
      order_index: orderIndex,
    };

    try {
      if (editing) {
        const { error: err } = await supabase.from("learn_quizzes").update(payload).eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("learn_quizzes").insert([payload]);
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
    await supabase.from("learn_quizzes").delete().eq("id", deleteTarget.id);
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
    await supabase.from("learn_quizzes").update({ order_index: tempIndex }).eq("id", current.id);
    await supabase.from("learn_quizzes").update({ order_index: current.order_index }).eq("id", target.id);
    await supabase.from("learn_quizzes").update({ order_index: target.order_index }).eq("id", current.id);
    await load();
  }

  const columns = [
    {
      key: "question",
      label: "Question / Prompt",
      render: (row: Quiz) => (
        <span style={{ fontWeight: 500, color: "#f0f0f0" }}>{row.question}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row: Quiz) => (
        <Badge
          variant={
            row.type === "code_challenge"
              ? "status-active"
              : row.type === "true_false"
              ? "status-past"
              : "status-upcoming"
          }
        >
          {row.type === "code_challenge"
            ? "Code Challenge"
            : row.type === "true_false"
            ? "True/False"
            : "Multiple Choice"}
        </Badge>
      ),
    },
    {
      key: "reorder",
      label: "Order",
      render: (row: Quiz) => {
        const idx = data.findIndex((x) => x.id === row.id);
        return (
          <div style={{ display: "flex", gap: "6px" }}>
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
      render: (row: Quiz) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={() => openEdit(row)}
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
      
      {/* Back link */}
      <Link
        href={`/admin/learn/${topicId}`}
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
        <span>Back to Syllabus</span>
      </Link>

      {/* Two-Column Grid: Left list, Right lesson preview */}
      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Left side Quizzes table */}
        <div style={{ flex: 1, minWidth: "320px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f0f0f0", margin: 0 }}>
                {lesson ? `${lesson.title} Challenges` : "Challenge Builder"}
              </h1>
              <p style={{ fontSize: "0.8125rem", color: "#888888", margin: "4px 0 0" }}>
                Define verification challenges. A student must complete all challenges to check off this lesson.
              </p>
            </div>
            
            <Button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#ffba08", color: "#0b0c0f" }}>
              <Plus size={14} /> Add Challenge
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data}
            keyField="id"
            loading={loading}
          />
        </div>

        {/* Right side MDX Preview box */}
        {lesson && (
          <div
            style={{
              width: "340px",
              backgroundColor: "#111318",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px",
              padding: "24px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f0f0f0", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Lightbulb size={16} style={{ color: "#ffba08" }} />
              Lesson content preview
            </h3>
            <div
              style={{
                maxHeight: "360px",
                overflowY: "auto",
                backgroundColor: "#0d0f14",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "8px",
                padding: "14px",
                fontSize: "0.8125rem",
                color: "#888888",
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
              }}
            >
              {lesson.mdx_content || "No MDX content written yet."}
            </div>
          </div>
        )}

      </div>

      {/* Challenge SlideOver Builder Form */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editing ? "Edit Challenge" : "Add Challenge"}
        width={580}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "8px 0" }}>
          
          <div>
            <label style={labelStyle}>Question or Challenge Prompt</label>
            <textarea
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What type of account is used to store data in Solana?"
            />
          </div>

          <div>
            <label style={labelStyle}>Challenge Type</label>
            <select
              style={inputStyle}
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True / False</option>
              <option value="code_challenge">Monaco Code Challenge</option>
            </select>
          </div>

          {/* Conditional Option Builders */}

          {type === "multiple_choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "16px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.01)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#cccccc" }}>Option Cards</span>
                <button
                  type="button"
                  onClick={handleAddMcOption}
                  disabled={mcOptions.length >= 6}
                  style={{ fontSize: "0.75rem", color: "#ffba08", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  + Add Option (Max 6)
                </button>
              </div>

              {mcOptions.map((opt, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="radio"
                    name="correct_choice"
                    checked={mcCorrect === opt.value}
                    onChange={() => setMcCorrect(opt.value)}
                    style={{ accentColor: "#14F195" }}
                  />
                  
                  <input
                    type="text"
                    style={{ ...inputStyle, flex: 1, padding: "8px 12px" }}
                    value={opt.label}
                    onChange={(e) => handleMcOptionLabelChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveMcOption(idx)}
                    disabled={mcOptions.length <= 2}
                    style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", display: "flex", padding: "6px" }}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
              <span style={{ fontSize: "0.7rem", color: "#888888" }}>
                * Select the radio button next to the correct answer option.
              </span>
            </div>
          )}

          {type === "true_false" && (
            <div>
              <label style={labelStyle}>Correct Answer</label>
              <select
                style={inputStyle}
                value={tfCorrect}
                onChange={(e) => setTfCorrect(e.target.value)}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          )}

          {type === "code_challenge" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "16px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.01)" }}>
              <div>
                <label style={labelStyle}>Language</label>
                <select
                  style={inputStyle}
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Starter Code Template</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", fontFamily: "monospace", fontSize: "0.8125rem", resize: "vertical" }}
                  value={codeStarter}
                  onChange={(e) => setCodeStarter(e.target.value)}
                  placeholder="// starter template here..."
                />
              </div>

              <div>
                <label style={labelStyle}>Function to test (required for JS/TS)</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  placeholder="e.g. formatBalance"
                />
                <span style={{ fontSize: "0.7rem", color: "#888888", display: "block", marginTop: "4px" }}>
                  The exact function name the runner should call after the student's code executes.
                </span>
              </div>

              <div>
                <label style={labelStyle}>Test input (JSON array, required for JS/TS)</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={testInputRaw}
                  onChange={(e) => setTestInputRaw(e.target.value)}
                  placeholder="e.g. [2500000000]"
                />
                <span style={{ fontSize: "0.7rem", color: "#888888", display: "block", marginTop: "4px" }}>
                  Arguments to call the student's function with, as a JSON array. Example: [2500000000] calls functionName(2500000000).
                </span>
              </div>

              <div>
                <label style={labelStyle}>Expected Output (Or expected pasted answer)</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={codeExpected}
                  onChange={(e) => setCodeExpected(e.target.value)}
                  placeholder="Expected output string"
                />
              </div>
            </div>
          )}

          {/* Explanation Textarea */}
          <div>
            <label style={labelStyle}>Answer Explanation (Shown after check)</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Solana accounts are owned by programs..."
            />
          </div>

          {/* Order Index */}
          <div>
            <label style={labelStyle}>Order Index position</label>
            <input
              type="number"
              style={inputStyle}
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />
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
        title="Delete Challenge?"
        message="Are you sure you want to delete this challenge? This will permanently remove it from the lesson syllabus. This action cannot be undone."
        loading={deleting}
      />

    </div>
  );
}
