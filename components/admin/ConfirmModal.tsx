"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmLabel = "Delete", loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(3px)",
          animation: "fadeIn 0.15s ease",
        }}
      />
      {/* Dialog */}
      <div style={{
        position: "relative", zIndex: 1,
        backgroundColor: "#181b22",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "14px",
        padding: "28px",
        width: "420px", maxWidth: "90vw",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        animation: "slideUp 0.2s ease",
      }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
            backgroundColor: "rgba(239,68,68,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle size={18} style={{ color: "#f87171" }} />
          </div>
          <div>
            <h3 style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: "1rem", fontWeight: 700, color: "#f0f0f0", margin: "0 0 6px",
            }}>
              {title}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#888888", margin: 0, lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
