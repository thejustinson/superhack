"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Editor from "@monaco-editor/react";
import { MDXRemote } from "next-mdx-remote";
import { MDX_COMPONENTS } from "@/components/learn/MDXRenderer";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{
    "topic-id": string;
    "lesson-id": string;
  }>;
}

export default function EditLessonPage({ params }: PageProps) {
  const router = useRouter();
  const { "topic-id": topicId, "lesson-id": lessonId } = use(params);

  // Core fields state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [mdxContent, setMdxContent] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  // App & loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview compile states
  const [compiledSource, setCompiledSource] = useState<any>(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  // Toast confirmation state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Slugifier helper
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

  // Load lesson details on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data, error: fetchErr } = await supabase
          .from("learn_lessons")
          .select("*")
          .eq("id", lessonId)
          .single();

        if (fetchErr) throw fetchErr;

        if (data) {
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setMdxContent(data.mdx_content || "");
          setOrderIndex(data.order_index || 0);
          setIsPublished(data.is_published || false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load lesson details.");
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) {
      load();
    }
  }, [lessonId]);

  // Debounce compile preview (500ms)
  useEffect(() => {
    if (loading) return;

    setCompiling(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/compile-mdx", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: mdxContent }),
        });

        const data = await res.json();

        if (res.ok && data.mdxSource) {
          setCompiledSource(data.mdxSource);
          setCompileError(null);
        } else {
          setCompileError(data.error || "Failed to parse markdown content.");
        }
      } catch (err: any) {
        setCompileError(err.message || "Compilation connection error.");
      } finally {
        setCompiling(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [mdxContent, loading]);

  // Handle title changes and auto-suggest matching slug
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    
    // Auto-generate slug from title unless the slug has been customized
    setSlug((prevSlug) => {
      const oldAutoSlug = slugify(title);
      if (prevSlug === oldAutoSlug || prevSlug === "") {
        return slugify(newTitle);
      }
      return prevSlug;
    });
  };

  // Handle Save (upsert/update)
  const handleSave = async () => {
    if (!title.trim()) {
      setToast({ message: "Lesson title cannot be empty", type: "error" });
      return;
    }
    if (!slug.trim()) {
      setToast({ message: "Lesson slug cannot be empty", type: "error" });
      return;
    }

    try {
      setSaving(true);
      const { error: saveErr } = await supabase
        .from("learn_lessons")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          mdx_content: mdxContent,
          order_index: orderIndex,
          is_published: isPublished,
        })
        .eq("id", lessonId);

      if (saveErr) throw saveErr;

      setToast({ message: "Lesson saved successfully!", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to save lesson.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 60px)",
        backgroundColor: "#0b0c0f",
        color: "#888888",
        gap: "12px",
      }}>
        <Loader2 size={32} style={{ color: "#ffba08", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "0.875rem" }}>Loading lesson editor...</span>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 60px)",
        backgroundColor: "#0b0c0f",
        color: "#888888",
        gap: "16px",
      }}>
        <AlertCircle size={32} style={{ color: "#f87171" }} />
        <span style={{ color: "#f87171", fontSize: "1rem" }}>{error}</span>
        <Link href={`/admin/learn/${topicId}`} style={{
          color: "#ffba08",
          textDecoration: "underline",
          fontSize: "0.875rem",
        }}>
          Back to Syllabus
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      margin: "-28px -32px",
      height: "calc(100vh - 60px)",
      display: "flex",
      backgroundColor: "#0b0c0f",
      overflow: "hidden",
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "80px",
          right: "24px",
          padding: "12px 20px",
          backgroundColor: toast.type === "success" ? "rgba(20, 241, 149, 0.15)" : "rgba(239, 68, 68, 0.15)",
          border: `1px solid ${toast.type === "success" ? "#14F195" : "#ef4444"}`,
          borderRadius: "8px",
          color: toast.type === "success" ? "#14F195" : "#ef4444",
          fontSize: "0.875rem",
          fontWeight: 500,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          animation: "slideIn 0.2s ease-out",
        }}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* CSS keyframe helper animation inline */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Left Column — Editor */}
      <div style={{
        width: "50%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        backgroundColor: "#0d0f14",
      }}>
        {/* Form Inputs Header */}
        <div style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Lesson Title"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#f0f0f0",
                outline: "none",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
            />
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.875rem",
            color: "#888888",
          }}>
            <span style={{ userSelect: "none" }}>URL Slug:</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="lesson-slug"
              style={{
                background: "transparent",
                border: "none",
                borderBottom: "1px dashed rgba(255, 255, 255, 0.3)",
                color: "#cccccc",
                outline: "none",
                fontSize: "0.875rem",
                padding: "2px 0",
                flex: 1,
              }}
            />
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            marginTop: "4px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8125rem",
              color: "#888888",
            }}>
              <span>Order Index:</span>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                style={{
                  width: "60px",
                  padding: "4px 8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "6px",
                  color: "#f0f0f0",
                  fontSize: "0.8125rem",
                  outline: "none",
                  textAlign: "center",
                }}
              />
            </div>

            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8125rem",
              color: "#888888",
              cursor: "pointer",
              userSelect: "none",
            }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{
                  accentColor: "#ffba08",
                  width: "14px",
                  height: "14px",
                  cursor: "pointer",
                }}
              />
              <span>Published Toggle</span>
            </label>
          </div>
        </div>

        {/* Monaco Editor Workspace */}
        <div style={{
          flex: 1,
          width: "100%",
          position: "relative",
          backgroundColor: "#1e1e1e",
        }}>
          <Editor
            height="100%"
            language="markdown"
            theme="vs-dark"
            value={mdxContent}
            onChange={(val) => setMdxContent(val || "")}
            options={{
              minimap: { enabled: false },
              wordWrap: "on",
              fontSize: 14,
              fontFamily: "monospace",
              lineNumbers: "on",
              lineHeight: 1.5,
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
              },
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>

        {/* Fixed Footer Bar */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#0d0f14",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Link
            href={`/admin/learn/${topicId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8125rem",
              color: "#888888",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
          >
            <ArrowLeft size={14} />
            <span>Back to Syllabus</span>
          </Link>

          <Button
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: "#ffba08",
              color: "#0b0c0f",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
              padding: "8px 16px",
            }}
          >
            {saving ? (
              <>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Lesson</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Column — Live Preview */}
      <div style={{
        width: "50%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0b0c0f",
      }}>
        {/* Preview Header */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#0b0c0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
          boxSizing: "border-box",
        }}>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: "#666666",
            textTransform: "uppercase",
          }}>
            Preview
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {compiling && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Loader2 size={12} style={{ color: "#ffba08", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "0.75rem", color: "#888888" }}>Compiling...</span>
              </div>
            )}
            {!compiling && compileError && (
              <span style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 500 }}>
                Parse Error
              </span>
            )}
            {!compiling && !compileError && (
              <span style={{ fontSize: "0.75rem", color: "#14F195", fontWeight: 500 }}>
                Live
              </span>
            )}
          </div>
        </div>

        {/* Preview Content Area */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px",
          backgroundColor: "#0b0c0f",
        }}>
          {compileError ? (
            <div style={{
              padding: "16px",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "0.875rem",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
            }}>
              <strong style={{ display: "block", marginBottom: "8px" }}>MDX Compilation Error:</strong>
              {compileError}
            </div>
          ) : compiledSource ? (
            <div style={{
              maxWidth: "680px",
              margin: "0 auto",
              paddingBottom: "80px",
            }}>
              <MDXRemote {...compiledSource} components={MDX_COMPONENTS} />
            </div>
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#444444",
              fontSize: "0.875rem",
            }}>
              No content to display
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
