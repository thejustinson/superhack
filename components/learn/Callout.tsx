"use client";

import React from "react";
import { Info, AlertTriangle, Lightbulb } from "lucide-react";

interface CalloutProps {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}

export function Callout({ type = "info", children }: CalloutProps) {
  const styles = {
    info: {
      borderLeft: "3px solid #3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.06)",
      icon: <Info size={18} style={{ color: "#3b82f6", flexShrink: 0 }} />,
    },
    warning: {
      borderLeft: "3px solid #ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.06)",
      icon: <AlertTriangle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />,
    },
    tip: {
      borderLeft: "3px solid #ffba08",
      backgroundColor: "rgba(255, 186, 8, 0.06)",
      icon: <Lightbulb size={18} style={{ color: "#ffba08", flexShrink: 0 }} />,
    },
  }[type];

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "16px",
        borderRadius: "0 8px 8px 0",
        borderLeft: styles.borderLeft,
        backgroundColor: styles.backgroundColor,
        margin: "24px 0",
      }}
    >
      {styles.icon}
      <div
        style={{
          fontSize: "0.9375rem",
          color: "#d0d0d0",
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
