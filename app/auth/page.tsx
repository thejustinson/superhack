"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { sendOTP, verifyOTP, getUserProfile } from "@/lib/auth";
import { OTPInput } from "@/components/ui/OTPInput";
import { useAuth } from "@/context/AuthContext";

type Step = "email" | "otp";

export default function AuthPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMessage("");
    try {
      await sendOTP(email.trim().toLowerCase());
      setStep("otp");
    } catch (err: any) {
      console.error("Auth send OTP error:", err);
      setErrorMessage(err.message || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError(false);
    setErrorMessage("");
    try {
      const cleanEmail = email.trim().toLowerCase();
      await verifyOTP(cleanEmail, otp);
      
      // Get session/user and check if full_name is set
      await refreshProfile();
      
      // Let's delay slightly to fetch the latest profile state
      const session = await refreshProfile().then(() => {
        // Query profile
        return getUserProfile(cleanEmail); // Wait, getUserProfile in auth.ts takes userId, let's see.
      });

      // Let's just fetch the profile by user ID or retrieve it from supabase directly to be safe
      const { data: { user } } = await refreshProfile().then(async () => {
        const { getSession } = await import("@/lib/auth");
        const session = await getSession();
        return { data: { user: session?.user } };
      });

      let hasName = false;
      if (user) {
        const { data: profile } = await (await import("@/lib/supabase")).supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile?.full_name) {
          hasName = true;
        }
      }

      if (!hasName) {
        router.push("/auth/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth verify OTP error:", err);
      setError(true);
      setErrorMessage(err.message || "Invalid or expired code.");
      // Auto-clear error after 1 second so shake can trigger again if re-submitted
      setTimeout(() => setError(false), 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      await sendOTP(email.trim().toLowerCase());
      setErrorMessage("Code resent successfully!");
    } catch (err: any) {
      console.error("Auth resend OTP error:", err);
      setErrorMessage(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 },
    },
    idle: { x: 0 },
  };

  return (
    <main style={{
      display: "flex", flex: 1, minHeight: "100vh", alignItems: "center",
      justifyContent: "center", backgroundColor: "#0b0c0f", padding: "20px"
    }}>
      <div style={{
        width: "100%", maxWidth: "420px", backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px",
        padding: "36px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        overflow: "hidden"
      }}>
        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.25, ease: "easeInOut" as const }}
            >
              <div style={{ marginBottom: "28px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  backgroundColor: "rgba(255,186,8,0.1)", display: "flex",
                  alignItems: "center", justifyContent: "center", marginBottom: "20px"
                }}>
                  <Mail size={20} style={{ color: "#ffba08" }} />
                </div>
                <h1 style={{
                  fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 900,
                  fontSize: "1.75rem", letterSpacing: "-0.02em", color: "#f0f0f0",
                  margin: "0 0 8px"
                }}>
                  Welcome to Superhack
                </h1>
                <p style={{
                  fontFamily: "var(--font-dm-sans), sans-serif", fontWeight: 400,
                  fontSize: "0.875rem", color: "#888888", margin: 0, lineHeight: 1.5
                }}>
                  Enter your email to get started. We&apos;ll send you a one-time code.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: "100%", backgroundColor: "#0b0c0f",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px",
                      padding: "12px 16px", fontSize: "0.9375rem", color: "#f0f0f0",
                      outline: "none", fontFamily: "inherit", transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#ffba08")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                  />
                </div>

                {errorMessage && (
                  <p style={{
                    fontSize: "0.8125rem", color: errorMessage.includes("sent") ? "#ffba08" : "#f87171",
                    margin: 0
                  }}>
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                    fontSize: "0.9375rem", padding: "12px", borderRadius: "8px",
                    border: "none", cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !email.trim() ? 0.6 : 1, transition: "opacity 0.2s",
                    fontFamily: "inherit"
                  }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Send code</span><ArrowRight size={15} /></>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25, ease: "easeInOut" as const }}
            >
              <div style={{ marginBottom: "28px" }}>
                <h1 style={{
                  fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 900,
                  fontSize: "1.75rem", letterSpacing: "-0.02em", color: "#f0f0f0",
                  margin: "0 0 8px"
                }}>
                  Check your email
                </h1>
                <p style={{
                  fontFamily: "var(--font-dm-sans), sans-serif", fontWeight: 400,
                  fontSize: "0.875rem", color: "#888888", margin: 0, lineHeight: 1.5
                }}>
                  We sent a 6-digit code to <span style={{ color: "#f0f0f0", fontWeight: 500 }}>{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <motion.div
                  animate={error ? "shake" : "idle"}
                  variants={shakeVariants}
                >
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    error={error}
                    onComplete={(val) => {
                      // Trigger submit automatically when 6 digits are typed
                      setOtp(val);
                    }}
                  />
                </motion.div>

                {errorMessage && (
                  <p style={{
                    fontSize: "0.8125rem", color: errorMessage.includes("sent") || errorMessage.includes("success") ? "#ffba08" : "#f87171",
                    margin: 0, textAlign: "center"
                  }}>
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                    fontSize: "0.9375rem", padding: "12px", borderRadius: "8px",
                    border: "none", cursor: loading || otp.length !== 6 ? "not-allowed" : "pointer",
                    opacity: loading || otp.length !== 6 ? 0.6 : 1, transition: "opacity 0.2s",
                    fontFamily: "inherit"
                  }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
                </button>

                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    style={{
                      background: "none", border: "none", color: "#ffba08",
                      fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
                      textDecoration: "underline", opacity: loading ? 0.6 : 1
                    }}
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setOtp(""); setErrorMessage(""); }}
                    disabled={loading}
                    style={{
                      background: "none", border: "none", color: "#888888",
                      fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
                  >
                    â† Use a different email
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

