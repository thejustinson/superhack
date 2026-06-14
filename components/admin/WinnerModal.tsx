"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface WinnerModalProps {
  open: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    status: string;
    prize_place: string | null;
  } | null;
  onConfirm: () => void;
}

export function WinnerModal({ open, onClose, project, onConfirm }: WinnerModalProps) {
  const [place, setPlace] = useState(project?.prize_place || "1st");
  const [isWinner, setIsWinner] = useState(project?.status === "winner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!project) return;
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status: isWinner ? "winner" : "submitted",
          prize_place: isWinner ? place : null,
        })
        .eq("id", project.id);

      if (updateError) throw updateError;
      onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update project winner status.");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#888888",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  const selectStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "6px",
    padding: "10px 14px",
    color: "#f0f0f0",
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <AnimatePresence>
      {open && project && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              backgroundColor: "#111318",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "28px",
              maxWidth: "440px",
              width: "100%",
              position: "relative",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", color: "#f0f0f0", margin: 0 }}>
                Project Winner Status
              </h3>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "#888888", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#888888", margin: "0 0 20px 0" }}>
              Set <strong>{project.name}</strong> as a hackathon winner.
            </p>

            {error && (
              <div style={{ color: "#f87171", fontSize: "0.8125rem", padding: "10px", backgroundColor: "rgba(248,113,113,0.1)", borderRadius: "6px", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            {/* Checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <input
                type="checkbox"
                id="isWinner"
                checked={isWinner}
                onChange={(e) => setIsWinner(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#ffba08" }}
              />
              <label htmlFor="isWinner" style={{ fontSize: "0.875rem", color: "#f0f0f0", fontWeight: 600, cursor: "pointer" }}>
                Designate as Winner
              </label>
            </div>

            {/* Selection Dropdown */}
            {isWinner && (
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>
                  Select Prize / Place
                  <select
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="1st">1st Place</option>
                    <option value="2nd">2nd Place</option>
                    <option value="3rd">3rd Place</option>
                    <option value="Community">Community Choice</option>
                    <option value="Runner Up">Runner Up</option>
                  </select>
                </label>
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={onClose}
                disabled={loading}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  color: "#888888",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  backgroundColor: "#ffba08",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 20px",
                  color: "#0b0c0f",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Save Status"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
