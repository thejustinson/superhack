"use client";

interface ScopeToggleProps {
  value: "university" | "faculty";
  onChange: (val: "university" | "faculty") => void;
}

export function ScopeToggle({ value, onChange }: ScopeToggleProps) {
  const btnBase: React.CSSProperties = {
    flex: 1,
    padding: "9px 0",
    fontSize: "0.875rem",
    fontWeight: 600,
    fontFamily: "inherit",
    border: "none",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
    borderRadius: "6px",
  };

  return (
    <div style={{
      display: "flex",
      gap: "4px",
      backgroundColor: "#0d0f14",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      padding: "4px",
    }}>
      <button
        type="button"
        onClick={() => onChange("university")}
        style={{
          ...btnBase,
          backgroundColor: value === "university" ? "#ffba08" : "transparent",
          color: value === "university" ? "#0b0c0f" : "#888888",
        }}
      >
        University-wide
      </button>
      <button
        type="button"
        onClick={() => onChange("faculty")}
        style={{
          ...btnBase,
          backgroundColor: value === "faculty" ? "#ffba08" : "transparent",
          color: value === "faculty" ? "#0b0c0f" : "#888888",
        }}
      >
        Faculty
      </button>
    </div>
  );
}
