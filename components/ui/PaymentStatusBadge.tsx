"use client";

import { Clock, RefreshCw, Send, CheckCircle2 } from "lucide-react";

type PaymentStatus = "pending" | "processing" | "sent" | "confirmed";

const STATUS_CONFIG: Record<PaymentStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}> = {
  pending: {
    label: "Payment pending",
    color: "#888888",
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.07)",
    icon: Clock,
  },
  processing: {
    label: "Payment processing",
    color: "#ffba08",
    bg: "rgba(255,186,8,0.1)",
    border: "rgba(255,186,8,0.3)",
    icon: RefreshCw,
  },
  sent: {
    label: "Payment sent",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.3)",
    icon: Send,
  },
  confirmed: {
    label: "Payment confirmed",
    color: "#14F195",
    bg: "rgba(20,241,149,0.1)",
    border: "rgba(20,241,149,0.3)",
    icon: CheckCircle2,
  },
};

export function PaymentStatusBadge({ status }: { status: string | null | undefined }) {
  const cfg = STATUS_CONFIG[(status as PaymentStatus) ?? "pending"] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "0.75rem",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: "20px",
        border: `1px solid ${cfg.border}`,
        backgroundColor: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
        fontFamily: "DM Sans, system-ui, sans-serif",
      }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}
