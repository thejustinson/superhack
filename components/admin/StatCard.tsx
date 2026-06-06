"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}

export function StatCard({ label, value, sub, trend, trendValue, icon, accent }: StatCardProps) {
  const trendColor = trend === "up" ? "#4ade80" : trend === "down" ? "#f87171" : "#888888";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div style={{
      backgroundColor: accent ? "rgba(255,186,8,0.06)" : "#111318",
      border: `1px solid ${accent ? "rgba(255,186,8,0.2)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: "12px",
      padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: "12px",
      transition: "border-color 0.2s",
    }}>
      {/* Top row: label + icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.8125rem", color: "#888888", fontWeight: 500, letterSpacing: "0.02em" }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            backgroundColor: accent ? "rgba(255,186,8,0.12)" : "rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: accent ? "#ffba08" : "#888888",
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <div style={{
          fontSize: "2rem", fontWeight: 700,
          fontFamily: "var(--font-fraunces), Georgia, serif",
          color: accent ? "#ffba08" : "#f0f0f0",
          lineHeight: 1,
        }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: "0.8rem", color: "#888888", marginTop: "4px" }}>{sub}</div>
        )}
      </div>

      {/* Trend */}
      {trend && trendValue && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <TrendIcon size={13} style={{ color: trendColor }} />
          <span style={{ fontSize: "0.8rem", color: trendColor, fontWeight: 500 }}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
