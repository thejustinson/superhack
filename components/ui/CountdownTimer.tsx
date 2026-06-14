"use client";

import { useEffect, useState } from "react";
import { getCountdown, type CountdownResult } from "@/lib/countdown";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  startDate: string;
  endDate: string;
}

export function CountdownTimer({ startDate, endDate }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownResult | null>(null);

  useEffect(() => {
    // Initial run
    setCountdown(getCountdown(startDate, endDate));

    const interval = setInterval(() => {
      const result = getCountdown(startDate, endDate);
      setCountdown(result);
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (!countdown || countdown.status === "past") {
    return null;
  }

  const { status, days, hours, minutes, seconds, label } = countdown;

  // Colors and styles based on status
  const color = status === "active" ? "#14F195" : "#ffba08"; // Solana green or accent yellow
  const borderColor = status === "active" ? "rgba(20, 241, 149, 0.2)" : "rgba(255, 186, 8, 0.2)";

  const blockContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "72px",
    height: "80px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: `1px solid rgba(255, 255, 255, 0.05)`,
    borderRadius: "8px",
  };

  const colonStyle: React.CSSProperties = {
    fontSize: "1.75rem",
    fontWeight: 700,
    fontFamily: "DM Sans, system-ui, sans-serif",
    color: "rgba(255, 255, 255, 0.15)",
    alignSelf: "center",
    marginTop: "-16px",
  };

  const numStyle = (val: number) => ({
    fontFamily: "DM Sans, system-ui, sans-serif",
    fontSize: "2rem",
    fontWeight: 900,
    color: color,
    margin: 0,
    lineHeight: 1.1,
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontSize: "0.6875rem",
    fontWeight: 600,
    color: "#888888",
    letterSpacing: "0.05em",
    marginTop: "4px",
    textTransform: "uppercase",
  };

  // Stagger container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const blockVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  const blocks = [
    { value: days, label: "DAYS" },
    { value: hours, label: "HRS" },
    { value: minutes, label: "MIN" },
    { value: seconds, label: "SEC" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: "100%",
        backgroundColor: "#111318",
        border: `1px solid ${borderColor}`,
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#888888",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {blocks.map((b, index) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <motion.div variants={blockVariants} style={blockContainer}>
              <motion.span
                key={b.value}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={numStyle(b.value)}
              >
                {pad(b.value)}
              </motion.span>
              <span style={labelStyle}>{b.label}</span>
            </motion.div>
            {index < blocks.length - 1 && <span style={colonStyle}>:</span>}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
