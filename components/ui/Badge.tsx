"use client";

import React from "react";

type BadgeVariant =
  | "accent"
  | "outline"
  | "muted"
  | "initiative"
  | "status-active"
  | "status-upcoming"
  | "status-past";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  accent: {
    backgroundColor: "#ffba08",
    color: "#0b0c0f",
    border: "none",
  },
  outline: {
    backgroundColor: "transparent",
    color: "#888888",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  muted: {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#888888",
    border: "none",
  },
  initiative: {
    backgroundColor: "rgba(255,186,8,0.1)",
    color: "#ffba08",
    border: "1px solid rgba(255,186,8,0.3)",
  },
  "status-active": {
    backgroundColor: "rgba(20,241,149,0.1)",
    color: "#14F195",
    border: "1px solid rgba(20,241,149,0.25)",
  },
  "status-upcoming": {
    backgroundColor: "rgba(255,186,8,0.1)",
    color: "#ffba08",
    border: "1px solid rgba(255,186,8,0.25)",
  },
  "status-past": {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#888888",
    border: "1px solid rgba(255,255,255,0.1)",
  },
};

export function Badge({ children, variant = "muted", className }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}
