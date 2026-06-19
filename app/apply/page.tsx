"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Trophy, Globe, CheckCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";

const ROLES = ["Student", "Lecturer", "Club organizer", "Other"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  backgroundColor: "#0d0f14",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#f0f0f0",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  color: "#888888",
  fontWeight: 500,
  marginBottom: "7px",
};

const BENEFITS = [
  {
    icon: Users,
    title: "Build a builder community",
    desc: "Give your students a structured path to learning Solana development and shipping real projects.",
  },
  {
    icon: Trophy,
    title: "Up to $100 toward school fees for your top 2 builders",
    desc: "The top 2 builders in each cohort receive up to $100 each toward their school fees, paid in USDC on Solana.",
  },
  {
    icon: Globe,
    title: "Connect to the ecosystem",
    desc: "Your university joins the Superteam Nigeria network, connecting students to web3 opportunities.",
  },
];

export default function ApplyPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    university_name: "",
    faculty_name: "",
    role: "",
    why: "",
    estimated_attendance: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.full_name.trim() || !form.email.trim() || !form.university_name.trim()) {
      setError("Please fill in your name, email, and university name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { error: err } = await supabase.from("host_applications").insert([{
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        university_name: form.university_name.trim(),
        faculty_name: form.faculty_name.trim() || null,
        role: form.role || null,
        why: form.why.trim() || null,
        estimated_attendance: form.estimated_attendance ? parseInt(form.estimated_attendance, 10) : null,
      }]);
      if (err) throw err;
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100svh", paddingTop: "120px", paddingBottom: "96px", backgroundColor: "#0b0c0f" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 28px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "start",
          }}
            className="apply-grid"
          >

            {/*  Left column */}
            <motion.div
              variants={stagger} initial="hidden" animate="show"
              style={{ display: "flex", flexDirection: "column", gap: "40px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <motion.span variants={fadeUp} style={{
                  display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase" as const,
                  color: "#ffba08", backgroundColor: "rgba(255,186,8,0.1)",
                  border: "1px solid rgba(255,186,8,0.25)",
                  padding: "5px 12px", borderRadius: "999px", width: "fit-content",
                }}>
                  Host Superhack
                </motion.span>
                <motion.h1 variants={fadeUp} style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 900, fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.03em", lineHeight: 1, color: "#f0f0f0", margin: 0,
                }}>
                  Bring Superhack to your school
                </motion.h1>
                <motion.p variants={fadeUp} style={{
                  color: "#888888", fontSize: "1rem", lineHeight: 1.65, margin: 0,
                }}>
                  A two-week intensive program: 1 week to build, 1 week to judge. Culminates in cash prizes, powered by Solana, Superteam, and Superteam Nigeria.
                </motion.p>
              </div>

              {/* Benefits */}
              <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {BENEFITS.map((b) => (
                  <motion.div key={b.title} variants={fadeUp}
                    style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
                  >
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
                      backgroundColor: "rgba(255,186,8,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <b.icon size={17} style={{ color: "#ffba08" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#f0f0f0", margin: "0 0 4px" }}>
                        {b.title}
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0, lineHeight: 1.5 }}>
                        {b.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quote */}
              <motion.blockquote variants={fadeUp} style={{
                borderLeft: "3px solid #ffba08",
                paddingLeft: "18px",
                margin: 0,
              }}>
                <p style={{ fontSize: "1rem", color: "#f0f0f0", fontStyle: "italic", lineHeight: 1.6, margin: "0 0 8px" }}>
                  &ldquo;We&rsquo;ve started at Uniben. You could be next.&rdquo;
                </p>
                <span style={{ fontSize: "0.8125rem", color: "#888888" }}>
                  - Superteam Nigeria
                </span>
              </motion.blockquote>
            </motion.div>

            {/* Right column: Form */}
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    backgroundColor: "#111318",
                    border: "1px solid rgba(20,241,149,0.25)",
                    borderRadius: "16px",
                    padding: "48px 32px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
                    textAlign: "center",
                  }}
                >
                  <CheckCircle size={48} style={{ color: "#14F195" }} />
                  <h2 style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "1.5rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
                  }}>
                    Application received!
                  </h2>
                  <p style={{ color: "#888888", fontSize: "0.9375rem", margin: 0, lineHeight: 1.6 }}>
                    We&apos;ll review your application and get back to you within 5 business days.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  variants={stagger} initial="hidden" animate="show"
                  style={{
                    backgroundColor: "#111318",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "16px",
                    padding: "32px",
                    display: "flex", flexDirection: "column", gap: "20px",
                  }}
                >
                  <motion.h2 variants={fadeUp} style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "1.25rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
                  }}>
                    Send an application
                  </motion.h2>

                  {/* Full name */}
                  <motion.div variants={fadeUp}>
                    <label style={labelStyle}>Full name *</label>
                    <input style={inputStyle} value={form.full_name} placeholder="Ada Okonkwo"
                      onChange={(e) => set("full_name", e.target.value)}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </motion.div>

                  {/* Email + Phone */}
                  <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input style={inputStyle} value={form.email} placeholder="ada@uni.edu.ng" type="email"
                        onChange={(e) => set("email", e.target.value)}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone number</label>
                      <input style={inputStyle} value={form.phone} placeholder="+234..."
                        onChange={(e) => set("phone", e.target.value)}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                  </motion.div>

                  {/* University */}
                  <motion.div variants={fadeUp}>
                    <label style={labelStyle}>University name *</label>
                    <input style={inputStyle} value={form.university_name} placeholder="University of Benin"
                      onChange={(e) => set("university_name", e.target.value)}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </motion.div>

                  {/* Faculty */}
                  <motion.div variants={fadeUp}>
                    <label style={labelStyle}>
                      Faculty name{" "}
                      <span style={{ color: "#555", fontWeight: 400 }}>(optional - leave blank if applying for whole university)</span>
                    </label>
                    <input style={inputStyle} value={form.faculty_name} placeholder="Faculty of Engineering"
                      onChange={(e) => set("faculty_name", e.target.value)}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </motion.div>

                  {/* Role + Attendance */}
                  <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={labelStyle}>Your role</label>
                      <select value={form.role} onChange={(e) => set("role", e.target.value)}
                        style={{ ...inputStyle, cursor: "pointer" }}>
                        <option value="">Select</option>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Estimated attendance</label>
                      <input style={inputStyle} value={form.estimated_attendance}
                        placeholder="e.g. 50" type="number" min="1"
                        onChange={(e) => set("estimated_attendance", e.target.value)}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                  </motion.div>

                  {/* Why */}
                  <motion.div variants={fadeUp}>
                    <label style={labelStyle}>Why do you want to bring Superhack to your school?</label>
                    <textarea
                      value={form.why}
                      onChange={(e) => set("why", e.target.value)}
                      placeholder="Tell us a bit about your campus, the builders community, and what you hope to achieve..."
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
                    />
                  </motion.div>

                  {error && (
                    <p style={{ color: "#f87171", fontSize: "0.8125rem", margin: 0 }}>{error}</p>
                  )}

                  <motion.button
                    variants={fadeUp}
                    onClick={submit}
                    disabled={saving}
                    style={{
                      backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 700,
                      fontSize: "0.9375rem", padding: "13px 0", borderRadius: "10px",
                      border: "none", cursor: saving ? "wait" : "pointer",
                      fontFamily: "inherit", opacity: saving ? 0.7 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      transition: "opacity 0.2s",
                    }}
                  >
                    {saving ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Sending...</> : "Send application"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .apply-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

