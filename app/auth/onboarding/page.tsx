"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";

function OnboardingContent() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (profile?.full_name) {
      router.push("/dashboard");
    }
  }, [profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: name.trim() })
        .eq("id", user.id);

      if (updateError) throw updateError;
      
      await refreshProfile();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to update profile name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      display: "flex", flex: 1, minHeight: "100vh", alignItems: "center",
      justifyContent: "center", backgroundColor: "#0b0c0f", padding: "20px"
    }}>
      <div style={{
        width: "100%", maxWidth: "420px", backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px",
        padding: "36px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)"
      }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "var(--font-fraunces), serif", fontWeight: 900,
            fontSize: "1.75rem", letterSpacing: "-0.02em", color: "#f0f0f0",
            margin: "0 0 8px"
          }}>
            What&apos;s your name?
          </h1>
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif", fontWeight: 400,
            fontSize: "0.875rem", color: "#888888", margin: 0, lineHeight: 1.5
          }}>
            Please enter your full name to set up your builder profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <input
              type="text"
              placeholder="e.g. Justin Oso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
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

          {error && <p style={{ fontSize: "0.8125rem", color: "#f87171", margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
              fontSize: "0.9375rem", padding: "12px", borderRadius: "8px",
              border: "none", cursor: loading || !name.trim() ? "not-allowed" : "pointer",
              opacity: loading || !name.trim() ? 0.6 : 1, transition: "opacity 0.2s",
              fontFamily: "inherit"
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Continue"}
          </button>
        </form>
      </div>
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
