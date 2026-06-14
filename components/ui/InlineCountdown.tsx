"use client";

import { useEffect, useState } from "react";
import { getCountdown, type CountdownResult } from "@/lib/countdown";
import { Clock } from "lucide-react";

interface InlineCountdownProps {
  startDate: string;
  endDate: string;
}

export function InlineCountdown({ startDate, endDate }: InlineCountdownProps) {
  const [countdown, setCountdown] = useState<CountdownResult | null>(null);

  useEffect(() => {
    setCountdown(getCountdown(startDate, endDate));

    const interval = setInterval(() => {
      setCountdown(getCountdown(startDate, endDate));
    }, 60000); // Ticks every minute since we only show days/hours compact

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (!countdown) return null;

  const { status, days, hours, label } = countdown;

  if (status === "past") {
    const endStr = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: "0.8rem",
          color: "#888888",
        }}
        nests-lucide="true"
      >
        <Clock size={12} />
        <span>Ended {endStr}</span>
      </div>
    );
  }

  const color = status === "active" ? "#14F195" : "#ffba08";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: "0.8rem",
        color: color,
        fontWeight: 500,
      }}
      nests-lucide="true"
    >
      <Clock size={12} style={{ color }} />
      <span>
        {label} {days > 0 ? `${days}d ` : ""}{hours}h
      </span>
    </div>
  );
}
