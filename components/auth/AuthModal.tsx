"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2, CheckCircle2, Mail } from "lucide-react";
import { sendOtp, verifyOtp } from "@/lib/auth";
import { useUser } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "otp" | "done";

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { refreshProfile } = useUser();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setStep("email");
    setEmail("");
    setOtp("");
    setError("");
    setLoading(false);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await sendOtp(email.trim().toLowerCase());
      setStep("otp");
    } catch (err: unknown) {
      console.error("AuthModal send OTP error:", err);
      setError((err as Error).message ?? "Failed to send code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim());
      await refreshProfile();
      setStep("done");
      setTimeout(handleClose, 1800);
    } catch (err: unknown) {
      console.error("AuthModal verify OTP error:", err);
      setError((err as Error).message ?? "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#0b0c0f",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "1rem",
    color: "#f0f0f0",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    letterSpacing: step === "otp" ? "0.18em" : "normal",
    textAlign: step === "otp" ? "center" : "left",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 201, width: "100%", maxWidth: "420px",
              backgroundColor: "#111318",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "32px",
              boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
            }}
          >
            {/* Close */}
            <button onClick={handleClose} style={{
              position: "absolute", top: "16px", right: "16px",
              background: "none", border: "none", color: "#888888",
              cursor: "pointer", padding: "4px", display: "flex", alignItems: "center",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
            >
              <X size={18} />
            </button>

            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.div key="email"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }}
                >
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "10px",
                      backgroundColor: "rgba(255,186,8,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "16px",
                    }}>
                      <Mail size={18} style={{ color: "#ffba08" }} />
                    </div>
                    <h2 style={{
                      fontFamily: "var(--font-fraunces)", fontWeight: 900,
                      fontSize: "1.5rem", letterSpacing: "-0.02em", color: "#f0f0f0", margin: "0 0 6px",
                    }}>
                      Sign in to Superhack
                    </h2>
                    <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0 }}>
                      Enter your email to receive a one-time code.
                    </p>
                  </div>

                  <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#ffba08")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                    />
                    {error && <p style={{ fontSize: "0.8125rem", color: "#f87171", margin: 0 }}>{error}</p>}
                    <button type="submit" disabled={loading || !email.trim()} style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                      fontSize: "0.9375rem", padding: "12px", borderRadius: "8px",
                      border: "none", cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading || !email.trim() ? 0.6 : 1,
                      fontFamily: "inherit", transition: "opacity 0.2s",
                    }}>
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Continue</span><ArrowRight size={15} /></>}
                    </button>
                  </form>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div key="otp"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}
                >
                  <div style={{ marginBottom: "24px" }}>
                    <h2 style={{
                      fontFamily: "var(--font-fraunces)", fontWeight: 900,
                      fontSize: "1.5rem", letterSpacing: "-0.02em", color: "#f0f0f0", margin: "0 0 6px",
                    }}>
                      Check your email
                    </h2>
                    <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0, lineHeight: 1.6 }}>
                      We sent a 6-digit code to{" "}
                      <strong style={{ color: "#f0f0f0" }}>{email}</strong>.
                      Enter it below.
                    </p>
                  </div>

                  <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input
                      id="auth-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      autoFocus
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#ffba08")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                    />
                    {error && <p style={{ fontSize: "0.8125rem", color: "#f87171", margin: 0 }}>{error}</p>}
                    <button type="submit" disabled={loading || otp.length !== 6} style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                      fontSize: "0.9375rem", padding: "12px", borderRadius: "8px",
                      border: "none", cursor: loading || otp.length !== 6 ? "not-allowed" : "pointer",
                      opacity: loading || otp.length !== 6 ? 0.6 : 1,
                      fontFamily: "inherit",
                    }}>
                      {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify code"}
                    </button>
                    <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                      style={{
                        background: "none", border: "none", color: "#888888",
                        fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
                    >
                      ← Use a different email
                    </button>
                  </form>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "16px 0", textAlign: "center" }}
                >
                  <CheckCircle2 size={48} strokeWidth={1.5} style={{ color: "#14F195" }} />
                  <h2 style={{
                    fontFamily: "var(--font-fraunces)", fontWeight: 900,
                    fontSize: "1.5rem", color: "#f0f0f0", margin: 0,
                  }}>
                    You&apos;re in!
                  </h2>
                  <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0 }}>
                    Signed in as {email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
