"use client";

const DIFFICULTY_CONFIG = {
  beginner: { label: "Beginner", color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.25)" },
  intermediate: { label: "Intermediate", color: "#ffba08", bg: "rgba(255,186,8,0.1)", border: "rgba(255,186,8,0.25)" },
  advanced: { label: "Advanced", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
};

interface DifficultyBadgeProps {
  difficulty: "beginner" | "intermediate" | "advanced" | string | null;
  size?: "sm" | "md";
}

export function DifficultyBadge({ difficulty, size = "sm" }: DifficultyBadgeProps) {
  const cfg = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG];
  if (!cfg) return null;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      fontSize: size === "sm" ? "0.6875rem" : "0.75rem",
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: cfg.color,
      backgroundColor: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: "999px",
      padding: size === "sm" ? "3px 9px" : "4px 12px",
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}
