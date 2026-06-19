import React, { useEffect } from "react";
import { AtSign, CheckCircle, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isReservedUsername } from "@/lib/reserved-usernames";

export type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "reserved";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface UsernameInputProps {
  value: string;
  onChange: (val: string) => void;
  status: UsernameStatus;
  onStatusChange: (status: UsernameStatus) => void;
  userId?: string;
  currentUsername?: string;
  placeholder?: string;
  inputStyle?: React.CSSProperties;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isDashboard?: boolean;
}

export function UsernameInput({
  value,
  onChange,
  status,
  onStatusChange,
  userId,
  currentUsername,
  placeholder = "yourname",
  inputStyle: customInputStyle,
  autoFocus = false,
  onKeyDown,
  isDashboard = false,
}: UsernameInputProps) {
  // Debounced username check
  useEffect(() => {
    if (!value || value === currentUsername) {
      onStatusChange("idle");
      return;
    }
    const clean = slugify(value);
    if (!clean || clean.length < 3) {
      onStatusChange(clean.length > 0 ? "invalid" : "idle");
      return;
    }
    if (isReservedUsername(clean)) {
      onStatusChange("reserved");
      return;
    }
    onStatusChange("checking");
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .neq("id", userId ?? "")
        .maybeSingle();
      onStatusChange(data ? "taken" : "available");
    }, 450);
    return () => clearTimeout(timer);
  }, [value, currentUsername, userId, onStatusChange]);

  const helperColor = {
    idle: "#888888",
    checking: "#888888",
    available: "#4ade80",
    taken: "#f87171",
    invalid: "#f87171",
    reserved: "#f87171",
  }[status];

  const helperText = {
    idle: !isDashboard && value.length > 0 ? `superhack.fun/${slugify(value)}` : "",
    checking: "Checking availability...",
    available: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <CheckCircle size={11} /> Available - superhack.fun/{slugify(value)}
      </span>
    ),
    taken: "That username is already taken",
    invalid: "Username must be at least 3 characters",
    reserved: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <XCircle size={11} /> This username is reserved and cannot be used.
      </span>
    ),
  }[status];

  const baseInputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: isDashboard ? "#0d0f14" : "#0b0c0f",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: isDashboard ? "11px 14px 11px 32px" : "12px 16px 12px 32px",
    fontSize: isDashboard ? "0.875rem" : "0.9375rem",
    color: "#f0f0f0",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    ...customInputStyle,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      <div style={{ position: "relative", width: "100%" }}>
        <span style={{ position: "absolute", left: isDashboard ? "12px" : "14px", top: "50%", transform: "translateY(-50%)", color: "#888888", pointerEvents: "none", display: "flex", alignItems: "center" }}>
          <AtSign size={isDashboard ? 14 : 15} />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(slugify(e.target.value) || e.target.value.toLowerCase());
            onStatusChange("idle");
          }}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          style={baseInputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#ffba08";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = isDashboard ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.12)";
          }}
        />
      </div>
      {value.length > 0 && value !== currentUsername && (
        <p style={{ fontSize: isDashboard ? "0.75rem" : "0.8125rem", color: helperColor, margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
          {status === "checking" && <Loader2 size={isDashboard ? 11 : 12} style={{ display: "inline", animation: "spin 0.8s linear infinite" }} />}
          {helperText}
        </p>
      )}
      {isDashboard && currentUsername && value === currentUsername && (
        <p style={{ fontSize: "0.75rem", color: "#555", margin: 0 }}>superhack.fun/{currentUsername}</p>
      )}
    </div>
  );
}
