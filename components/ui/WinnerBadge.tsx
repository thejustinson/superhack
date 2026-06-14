"use client";

import { Trophy } from "lucide-react";

interface WinnerBadgeProps {
  place: string | null;
  style?: React.CSSProperties;
}

export function WinnerBadge({ place, style }: WinnerBadgeProps) {
  const label = place ? `${place} Place` : "Winner";
  
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: "rgba(255, 186, 8, 0.12)",
        border: "1px solid rgba(255, 186, 8, 0.4)",
        color: "#ffba08",
        fontSize: "0.75rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "4px 10px",
        borderRadius: "999px",
        width: "fit-content",
        fontFamily: "var(--font-dm-sans), sans-serif",
        ...style,
      }}
    >
      <Trophy size={12} strokeWidth={2.5} />
      <span>{label}</span>
    </div>
  );
}
