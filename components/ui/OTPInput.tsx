"use client";

import React, { useRef, useState, useEffect } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
}: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Sync internal state with external value prop
  useEffect(() => {
    const valDigits = value.split("").slice(0, length);
    const newDigits = [...valDigits];
    while (newDigits.length < length) {
      newDigits.push("");
    }
    setDigits(newDigits);
  }, [value, length]);

  const handleChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      onChange(nextDigits.join(""));
      return;
    }

    const nextDigits = [...digits];
    const char = cleanVal[cleanVal.length - 1];
    nextDigits[index] = char;
    setDigits(nextDigits);

    const updatedValue = nextDigits.join("");
    onChange(updatedValue);

    if (updatedValue.length === length && onComplete) {
      onComplete(updatedValue);
    }

    // Auto-advance
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
        onChange(nextDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      } else {
        const nextDigits = [...digits];
        nextDigits[index] = "";
        setDigits(nextDigits);
        onChange(nextDigits.join(""));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const newDigits = [...digits];
    pasted.split("").forEach((char, i) => {
      newDigits[i] = char;
    });

    setDigits(newDigits);
    const fullValue = newDigits.join("");
    onChange(fullValue);

    if (pasted.length === length && onComplete) {
      onComplete(pasted);
    }

    // Focus the box after the last pasted digit, or the last box if all length filled
    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const boxStyle: React.CSSProperties = {
    width: "44px",
    height: "52px",
    backgroundColor: "#0b0c0f",
    border: error ? "1.5px solid #f87171" : "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "8px",
    fontSize: "1.5rem",
    fontWeight: "600",
    color: error ? "#f87171" : "#f0f0f0",
    textAlign: "center",
    outline: "none",
    fontFamily: "var(--font-dm-sans), sans-serif",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
      {Array(length)
        .fill(null)
        .map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              if (el) inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={boxStyle}
            onFocus={(e) => {
              if (!error) e.currentTarget.style.borderColor = "#ffba08";
            }}
            onBlur={(e) => {
              if (!error) e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
            }}
          />
        ))}
    </div>
  );
}
