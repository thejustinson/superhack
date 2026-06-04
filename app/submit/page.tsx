"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

interface FormData {
  projectName: string;
  builderName: string;
  school: string;
  description: string;
  link: string;
  programAddress: string;
}

const empty: FormData = {
  projectName: "",
  builderName: "",
  school: "",
  description: "",
  link: "",
  programAddress: "",
};

async function submitProject(data: FormData) {
  // TODO: wire to Supabase
  // await supabase.from("projects").insert({ ... })
  console.log("Submitting project:", data);
  await new Promise((res) => setTimeout(res, 1200));
}

const containerStyle: React.CSSProperties = {
  maxWidth: "680px",
  margin: "0 auto",
  padding: "0 32px",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#111318",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  padding: "12px 16px",
  fontSize: "0.9375rem",
  color: "#f0f0f0",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#f0f0f0",
  display: "block",
  marginBottom: "8px",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

export default function SubmitPage() {
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [focused, setFocused] = useState<string | null>(null);

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.projectName.trim()) e.projectName = "Required";
    if (!form.builderName.trim()) e.builderName = "Required";
    if (!form.school.trim()) e.school = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.link.trim()) e.link = "Required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try { await submitProject(form); setSubmitted(true); } catch { /* noop */ } finally { setLoading(false); }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function getInputStyle(field: keyof FormData): React.CSSProperties {
    return {
      ...inputBase,
      borderColor: errors[field]
        ? "rgba(248,113,113,0.6)"
        : focused === field
        ? "#ffba08"
        : "rgba(255,255,255,0.1)",
    };
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main
          style={{
            minHeight: "100svh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "96px 32px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              maxWidth: "420px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              textAlign: "center",
              padding: "48px",
              backgroundColor: "#111318",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
            }}
          >
            <CheckCircle2 size={48} strokeWidth={1.5} style={{ color: "#ffba08" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h1
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontWeight: 900,
                  fontSize: "2rem",
                  color: "#f0f0f0",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Project submitted!
              </h1>
              <p style={{ color: "#888888", fontSize: "0.9375rem", margin: 0, lineHeight: 1.6 }}>
                Your project has been received. It will appear in the projects showcase once reviewed.
              </p>
            </div>
            <Link
              href="/projects"
              style={{
                backgroundColor: "#ffba08",
                color: "#0b0c0f",
                fontWeight: 600,
                fontSize: "0.9375rem",
                padding: "12px 28px",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              View all projects
            </Link>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100svh", paddingTop: "120px", paddingBottom: "96px" }}>
        <div style={containerStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>

            {/* Header */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <motion.span
                variants={fadeUp}
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#888888",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  width: "fit-content",
                }}
              >
                Submit
              </motion.span>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontWeight: 900,
                  fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                  color: "#f0f0f0",
                  margin: 0,
                }}
              >
                Ship your project
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{ color: "#888888", fontSize: "1.0625rem", margin: 0, lineHeight: 1.6 }}
              >
                Fields marked <span style={{ color: "#ffba08" }}>*</span> are required.
              </motion.p>
            </motion.div>

            {/* Form */}
            <motion.form
              variants={stagger}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Project name */}
              <motion.div variants={fadeUp} style={fieldStyle}>
                <label htmlFor="projectName" style={labelStyle}>
                  Project name <span style={{ color: "#ffba08" }}>*</span>
                </label>
                <input
                  id="projectName"
                  name="projectName"
                  type="text"
                  placeholder="e.g. Solana Pay Checkout"
                  value={form.projectName}
                  onChange={handleChange}
                  onFocus={() => setFocused("projectName")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("projectName")}
                />
                {errors.projectName && (
                  <span style={{ fontSize: "0.75rem", color: "rgba(248,113,113,0.9)", marginTop: "5px" }}>
                    {errors.projectName}
                  </span>
                )}
              </motion.div>

              {/* Builder name */}
              <motion.div variants={fadeUp} style={fieldStyle}>
                <label htmlFor="builderName" style={labelStyle}>
                  Builder name <span style={{ color: "#ffba08" }}>*</span>
                </label>
                <input
                  id="builderName"
                  name="builderName"
                  type="text"
                  placeholder="Your full name"
                  value={form.builderName}
                  onChange={handleChange}
                  onFocus={() => setFocused("builderName")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("builderName")}
                />
                {errors.builderName && (
                  <span style={{ fontSize: "0.75rem", color: "rgba(248,113,113,0.9)", marginTop: "5px" }}>
                    {errors.builderName}
                  </span>
                )}
              </motion.div>

              {/* School */}
              <motion.div variants={fadeUp} style={fieldStyle}>
                <label htmlFor="school" style={labelStyle}>
                  School / University <span style={{ color: "#ffba08" }}>*</span>
                </label>
                <input
                  id="school"
                  name="school"
                  type="text"
                  placeholder="e.g. University of Lagos"
                  value={form.school}
                  onChange={handleChange}
                  onFocus={() => setFocused("school")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("school")}
                />
                {errors.school && (
                  <span style={{ fontSize: "0.75rem", color: "rgba(248,113,113,0.9)", marginTop: "5px" }}>
                    {errors.school}
                  </span>
                )}
              </motion.div>

              {/* Description */}
              <motion.div variants={fadeUp} style={fieldStyle}>
                <label htmlFor="description" style={labelStyle}>
                  Short description <span style={{ color: "#ffba08" }}>*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="What does your project do? What problem does it solve?"
                  value={form.description}
                  onChange={handleChange}
                  onFocus={() => setFocused("description")}
                  onBlur={() => setFocused(null)}
                  style={{ ...getInputStyle("description"), resize: "vertical" }}
                />
                {errors.description && (
                  <span style={{ fontSize: "0.75rem", color: "rgba(248,113,113,0.9)", marginTop: "5px" }}>
                    {errors.description}
                  </span>
                )}
              </motion.div>

              {/* Link */}
              <motion.div variants={fadeUp} style={fieldStyle}>
                <label htmlFor="link" style={labelStyle}>
                  GitHub or live link <span style={{ color: "#ffba08" }}>*</span>
                </label>
                <input
                  id="link"
                  name="link"
                  type="url"
                  placeholder="https://github.com/you/your-project"
                  value={form.link}
                  onChange={handleChange}
                  onFocus={() => setFocused("link")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("link")}
                />
                {errors.link && (
                  <span style={{ fontSize: "0.75rem", color: "rgba(248,113,113,0.9)", marginTop: "5px" }}>
                    {errors.link}
                  </span>
                )}
              </motion.div>

              {/* Program address */}
              <motion.div variants={fadeUp} style={fieldStyle}>
                <label htmlFor="programAddress" style={labelStyle}>
                  Solana program address or devnet link{" "}
                  <span style={{ color: "#888888", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="programAddress"
                  name="programAddress"
                  type="text"
                  placeholder="e.g. Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
                  value={form.programAddress}
                  onChange={handleChange}
                  onFocus={() => setFocused("programAddress")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("programAddress")}
                />
              </motion.div>

              {/* Submit button */}
              <motion.div variants={fadeUp} style={{ paddingTop: "8px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: loading ? "rgba(255,186,8,0.7)" : "#ffba08",
                    color: "#0b0c0f",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    padding: "14px 32px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      Submitting...
                    </>
                  ) : (
                    "Submit project"
                  )}
                </button>
              </motion.div>
            </motion.form>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
