"use client";

interface StackPillProps {
  label: string;
}

export function StackPill({ label }: StackPillProps) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "6px",
      padding: "5px 12px",
      fontSize: "0.8125rem",
      fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace",
      color: "#f0f0f0",
      whiteSpace: "nowrap",
      transition: "border-color 0.15s, background 0.15s",
      cursor: "default",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,186,8,0.4)";
        e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
      }}
    >
      {label}
    </span>
  );
}
