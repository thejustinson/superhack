"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { CheckCircle2, XCircle, Play, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CodeChallengeProps {
  question: string;
  correctAnswer: string; // Expected console output (for JS) or manual output verify (for Rust)
  explanation?: string | null;
  language?: string; // "javascript" | "typescript" | "rust"
  starterCode?: string;
  onPass: (passed: boolean) => void;
  isPassed?: boolean;
}

export function CodeChallenge({
  question,
  correctAnswer,
  explanation,
  language = "javascript",
  starterCode = "",
  onPass,
  isPassed = false,
}: CodeChallengeProps) {
  const [code, setCode] = useState(starterCode);
  const [outputVal, setOutputVal] = useState("");
  const [pastedAnswer, setPastedAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [running, setRunning] = useState(false);

  const isJavaScriptChallenge = language.toLowerCase() === "javascript" || language.toLowerCase() === "typescript";

  useEffect(() => {
    setCode(starterCode);
  }, [starterCode]);

  const handleRunJS = () => {
    setRunning(true);
    setChecked(false);
    
    setTimeout(() => {
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: any[]) => {
          logs.push(
            args.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(" ")
          );
        },
        error: (...args: any[]) => {
          logs.push("[ERROR] " + args.join(" "));
        },
      };

      try {
        // Evaluate code client-side
        const runner = new Function("console", code);
        runner(mockConsole);

        const runResult = logs.join("\n").trim();
        const expected = correctAnswer.trim();

        setOutputVal(runResult || "Code executed successfully with no console logs.");
        
        const passed = runResult === expected;
        setIsCorrect(passed);
        setChecked(true);
        onPass(passed);
      } catch (err: any) {
        setOutputVal(`Runtime Error: ${err.message}`);
        setIsCorrect(false);
        setChecked(true);
        onPass(false);
      }
      setRunning(false);
    }, 400);
  };

  const handleVerifyPasted = () => {
    const passed = pastedAnswer.trim() === correctAnswer.trim();
    setIsCorrect(passed);
    setChecked(true);
    onPass(passed);
  };

  const handleReset = () => {
    setCode(starterCode);
    setPastedAnswer("");
    setOutputVal("");
    setChecked(false);
    setIsCorrect(false);
    onPass(false);
  };

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
      <div>
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#ffba08",
            backgroundColor: "rgba(255,186,8,0.1)",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {language} Challenge
        </span>
        <p
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontWeight: 500,
            fontSize: "1rem",
            color: "#f0f0f0",
            marginTop: "12px",
            marginBottom: 0,
            lineHeight: 1.5,
          }}
        >
          {question}
        </p>
      </div>

      {/* Editor view */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#1e1e1e",
        }}
      >
        <Editor
          height="220px"
          language={isJavaScriptChallenge ? "javascript" : "rust"}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollbar: { vertical: "auto", horizontal: "auto" },
            tabSize: 2,
            readOnly: checked && isCorrect,
          }}
        />
      </div>

      {/* Runner actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {isJavaScriptChallenge ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleRunJS}
              disabled={running}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor: "#ffba08",
                color: "#0b0c0f",
                border: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: running ? "wait" : "pointer",
                transition: "opacity 0.15s ease",
              }}
            >
              <Play size={14} fill="#0b0c0f" />
              {running ? "Evaluating..." : "Run & Check Code"}
            </button>
            
            {checked && (
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
                }}
              >
                Reset code
              </button>
            )}
          </div>
        ) : (
          /* Rust / Solana Paste expected output check */
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "0.8125rem", color: "#888888", margin: 0 }}>
              Write your solution above. To complete this challenge, run your code locally or in the terminal, and paste the exact expected response below to verify:
            </p>
            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <input
                type="text"
                value={pastedAnswer}
                onChange={(e) => setPastedAnswer(e.target.value)}
                placeholder="Paste expected output here..."
                disabled={checked && isCorrect}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  backgroundColor: "#0d0f14",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#f0f0f0",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
              <button
                onClick={handleVerifyPasted}
                disabled={!pastedAnswer.trim() || (checked && isCorrect)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  backgroundColor: pastedAnswer.trim() ? "#ffba08" : "rgba(255,255,255,0.05)",
                  color: pastedAnswer.trim() ? "#0b0c0f" : "#666666",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: pastedAnswer.trim() ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                Verify Output
              </button>
              {checked && (
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
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Output Console (only for JS/TS runs) */}
      {isJavaScriptChallenge && outputVal && (
        <div
          style={{
            backgroundColor: "#0d0f14",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "8px",
            padding: "12px 16px",
            fontFamily: "monospace",
          }}
        >
          <span style={{ fontSize: "0.6875rem", color: "#666666", textTransform: "uppercase" }}>Console Output</span>
          <pre style={{ margin: "6px 0 0", fontSize: "0.8125rem", color: "#e1e4e8", whiteSpace: "pre-wrap" }}>
            {outputVal}
          </pre>
        </div>
      )}

      {/* Result block */}
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
                {isCorrect ? "Challenge Completed!" : "Output Mismatch"}
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
