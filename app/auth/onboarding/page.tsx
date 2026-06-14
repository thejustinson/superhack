"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, AtSign, User } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "#111318",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "14px",
  padding: "36px",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0b0c0f",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  padding: "12px 16px",
  fontSize: "0.9375rem",
  color: "#f0f0f0",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const btn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  backgroundColor: "#ffba08",
  color: "#0b0c0f",
  fontWeight: 600,
  fontSize: "0.9375rem",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  width: "100%",
  fontFamily: "inherit",
};

const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

function OnboardingContent() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");

  useEffect(() => {
    if (profile?.full_name && profile?.username) {
      router.push("/dashboard");
    } else if (profile?.full_name && !profile?.username) {
      // Already has a name but no username â€” skip to step 2
      setStep(2);
    }
  }, [profile, router]);

  // Auto-suggest username from name
  useEffect(() => {
    if (step === 2 && name && !username) {
      setUsername(slugify(name));
    }
  }, [step, name]);

  // Debounced username check
  useEffect(() => {
    if (!username || step !== 2) return;
    const clean = slugify(username);
    if (!clean || clean.length < 3) {
      setUsernameStatus(clean.length > 0 ? "invalid" : "idle");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .neq("id", user?.id ?? "")
        .maybeSingle();
      setUsernameStatus(data ? "taken" : "available");
    }, 450);
    return () => clearTimeout(timer);
  }, [username, step, user?.id]);

  async function handleNameSubmit() {
    if (!name.trim() || !user) return;
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("profiles")
        .update({ full_name: name.trim() })
        .eq("id", user.id);
      if (err) throw err;
      await refreshProfile();
      setStep(2);
    } catch (e: any) {
      setError(e.message || "Failed to save name.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUsernameSubmit() {
    if (!user || usernameStatus !== "available") return;
    const clean = slugify(username);
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("profiles")
        .update({ username: clean })
        .eq("id", user.id);
      if (err) throw err;
      await refreshProfile();
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Failed to save username.");
    } finally {
      setLoading(false);
    }
  }

  function handleUsernameInput(val: string) {
    setUsername(slugify(val) || val.toLowerCase());
    setUsernameStatus("idle");
    setError("");
  }

  const usernameHelperColor = {
    idle: "#888888",
    checking: "#888888",
    available: "#4ade80",
    taken: "#f87171",
    invalid: "#f87171",
  }[usernameStatus];

  const usernameHelperText = {
    idle: username.length > 0 ? `superhack.fun/${slugify(username)}` : "Choose a unique @handle",
    checking: "Checking availabilityâ€¦",
    available: `âœ“ Available â€” superhack.fun/${slugify(username)}`,
    taken: "That username is already taken",
    invalid: "Username must be at least 3 characters",
  }[usernameStatus];

  return (
    <main style={{
      display: "flex", flex: 1, minHeight: "100vh", alignItems: "center",
      justifyContent: "center", backgroundColor: "#0b0c0f", padding: "20px",
    }}>
      {/* Progress dots */}
      <div style={{ position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            width: s === step ? "24px" : "8px",
            height: "8px",
            borderRadius: "4px",
            backgroundColor: s <= step ? "#ffba08" : "rgba(255,255,255,0.15)",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" variants={fadeVariant} initial="hidden" animate="show" exit="exit" style={card}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px",
                backgroundColor: "rgba(255,186,8,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "16px",
              }} nests-lucide="true">
                <User size={20} style={{ color: "#ffba08" }} />
              </div>
              <h1 style={{
                fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 900,
                fontSize: "1.75rem", letterSpacing: "-0.02em", color: "#f0f0f0",
                margin: "0 0 8px",
              }}>What&apos;s your name?</h1>
              <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontWeight: 400, fontSize: "0.875rem", color: "#888888", margin: 0, lineHeight: 1.5 }}>
                This will be displayed on your public profile.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input
                type="text"
                placeholder="e.g. Justin Oso"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && name.trim() && handleNameSubmit()}
                autoFocus
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "#ffba08")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
              />
              {error && <p style={{ fontSize: "0.8125rem", color: "#f87171", margin: 0 }}>{error}</p>}
              <button
                onClick={handleNameSubmit}
                disabled={loading || !name.trim()}
                style={{ ...btn, opacity: loading || !name.trim() ? 0.5 : 1, cursor: loading || !name.trim() ? "not-allowed" : "pointer" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Continue"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="step2" variants={fadeVariant} initial="hidden" animate="show" exit="exit" style={card}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px",
                backgroundColor: "rgba(255,186,8,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "16px",
              }} nests-lucide="true">
                <AtSign size={20} style={{ color: "#ffba08" }} />
              </div>
              <h1 style={{
                fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 900,
                fontSize: "1.75rem", letterSpacing: "-0.02em", color: "#f0f0f0",
                margin: "0 0 8px",
              }}>Choose a username</h1>
              <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontWeight: 400, fontSize: "0.875rem", color: "#888888", margin: 0, lineHeight: 1.5 }}>
                This will be your public profile URL.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888", fontSize: "0.9375rem", pointerEvents: "none" }}>@</span>
                <input
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={e => handleUsernameInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && usernameStatus === "available" && handleUsernameSubmit()}
                  autoFocus
                  style={{ ...inputStyle, paddingLeft: "32px" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#ffba08")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                />
              </div>
              {username.length > 0 && (
                <p style={{ fontSize: "0.8125rem", color: usernameHelperColor, margin: 0 }}>
                  {usernameStatus === "checking" && <Loader2 size={12} style={{ display: "inline", marginRight: "4px", animation: "spin 0.8s linear infinite" }} />}
                  {usernameHelperText}
                </p>
              )}
              {error && <p style={{ fontSize: "0.8125rem", color: "#f87171", margin: 0 }}>{error}</p>}
              <button
                onClick={handleUsernameSubmit}
                disabled={loading || usernameStatus !== "available"}
                style={{ ...btn, opacity: loading || usernameStatus !== "available" ? 0.5 : 1, cursor: loading || usernameStatus !== "available" ? "not-allowed" : "pointer" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Finish setup"}
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                style={{ background: "none", border: "none", color: "#888888", fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", padding: 0, textAlign: "center" }}
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  );
}

