"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface MultipleChoiceProps {
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation?: string | null;
  onPass: (passed: boolean) => void;
  isPassed?: boolean;
}

export function MultipleChoice({
  question,
  options,
  correctAnswer,
  explanation,
  onPass,
  isPassed = false,
}: MultipleChoiceProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (val: string) => {
    if (checked) return; // Block selecting after checking
    setSelectedOption(val);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    const correct = selectedOption === correctAnswer;
    setIsCorrect(correct);
    setChecked(true);
    if (correct) {
      onPass(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setChecked(false);
    setIsCorrect(false);
    onPass(false);
  };

  // Stagger animation variants
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  } as any;

  return (
    <div
      style={{
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "24px",
        margin: "24px 0",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h4
        style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontWeight: 600,
          fontSize: "1.0625rem",
          color: "#f0f0f0",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {question}
      </h4>

      {/* Options Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {options.map((opt) => {
          const isSelected = selectedOption === opt.value;
          const isThisCorrect = opt.value === correctAnswer;
          const isThisWrong = isSelected && !isThisCorrect;

          let borderStyle = "1px solid rgba(255,255,255,0.07)";
          let bgStyle = "rgba(255,255,255,0.02)";
          let textColor = "#cccccc";

          if (checked) {
            if (isThisCorrect) {
              borderStyle = "1px solid #14F195"; // Solana Green
              bgStyle = "rgba(20,241,149,0.06)";
              textColor = "#14F195";
            } else if (isThisWrong) {
              borderStyle = "1px solid #ef4444"; // Red error
              bgStyle = "rgba(239,68,68,0.06)";
              textColor = "#ef4444";
            }
          } else if (isSelected) {
            borderStyle = "1px solid #ffba08"; // Amber accent selected
            bgStyle = "rgba(255,186,8,0.08)";
            textColor = "#ffba08";
          }

          return (
            <motion.div
              key={opt.value}
              variants={itemVariants}
              onClick={() => handleSelect(opt.value)}
              style={{
                border: borderStyle,
                backgroundColor: bgStyle,
                borderRadius: "10px",
                padding: "14px 18px",
                cursor: checked ? "default" : "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
              onMouseEnter={(e) => {
                if (!checked && !isSelected) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!checked && !isSelected) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                }
              }}
            >
              <span style={{ fontSize: "0.9375rem", fontWeight: 400, color: textColor }}>
                {opt.label}
              </span>

              {checked && isThisCorrect && <CheckCircle2 size={16} style={{ color: "#14F195", flexShrink: 0 }} />}
              {checked && isThisWrong && <XCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!selectedOption}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: selectedOption ? "#ffba08" : "rgba(255,255,255,0.05)",
              color: selectedOption ? "#0b0c0f" : "#666666",
              border: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: selectedOption ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (selectedOption) e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              if (selectedOption) e.currentTarget.style.opacity = "1";
            }}
          >
            Check answer
          </button>
        ) : (
          <button
            onClick={handleReset}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#f0f0f0",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Retry challenge
          </button>
        )}
      </div>

      {/* Explanation Banner */}
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: "12px",
                padding: "14px 18px",
                borderRadius: "10px",
                borderLeft: isCorrect ? "3px solid #14F195" : "3px solid #ef4444",
                backgroundColor: isCorrect ? "rgba(20,241,149,0.04)" : "rgba(239,68,68,0.04)",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: isCorrect ? "#14F195" : "#ef4444",
                }}
              >
                {isCorrect ? "Correct answer!" : "Incorrect answer"}
              </p>
              {explanation && (
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#a0a0a0", lineHeight: 1.5 }}>
                  {explanation}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
