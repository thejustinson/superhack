"use client";

interface InitialsAvatarProps {
  name: string;
  size?: number;
  style?: React.CSSProperties;
}

export function InitialsAvatar({ name, size = 48, style }: InitialsAvatarProps) {
  const words = name.split(/\s+/).filter(Boolean);
  const initials = words
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(255,186,8,0.2) 0%, rgba(255,186,8,0.05) 100%)",
        border: "1px solid rgba(255, 186, 8, 0.3)",
        color: "#ffba08",
        fontWeight: 700,
        fontSize: `${size * 0.38}px`,
        fontFamily: "DM Sans, system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        flexShrink: 0,
        ...style,
      }}
    >
      {initials}
    </div>
  );
}
