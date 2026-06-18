"use client";

import React, { useState, useEffect } from "react";
import Editor, { BeforeMount } from "@monaco-editor/react";
import { Play, RotateCcw, CheckCircle2, XCircle, Terminal } from "lucide-react";
import { runCodeChallenge } from "@/lib/code-challenge-runner";

interface CodeChallengeProps {
  question: string;
  correctAnswer: string; // Expected console output (for JS/TS) or manual output verify (for Rust)
  explanation?: string | null;
  language?: string; // "javascript" | "typescript" | "rust"
  starterCode?: string;
  functionName?: string | null;
  testInput?: any;
  onPass: (passed: boolean) => void;
  isPassed?: boolean;
}

const handleEditorWillMount: BeforeMount = (monaco) => {
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore: [2304, 2305, 2307], // "Cannot find name", "no exported member", "cannot find module"
  });

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore: [2304, 2305, 2307],
  });

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
    esModuleInterop: true,
    lib: ["ES2020"],
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
    esModuleInterop: true,
    lib: ["ES2020"],
  });

  // Declare known globals so Monaco recognizes them without a real import
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `
    declare class PublicKey {
      constructor(value: string);
      toString(): string;
      toBase58(): string;
    }
    declare const LAMPORTS_PER_SOL: number;
    declare class Connection { constructor(endpoint: string, commitment?: string); }
    declare class SystemProgram {
      static transfer(params: { fromPubkey: PublicKey; toPubkey: PublicKey; lamports: number }): any;
    }
    declare class Transaction {
      add(...args: any[]): this;
    }
    declare class Keypair {
      publicKey: PublicKey;
      secretKey: Uint8Array;
      static generate(): Keypair;
      static fromSecretKey(secretKey: Uint8Array): Keypair;
    }
    `,
    "ts:globals.d.ts"
  );
};

export function CodeChallenge({
  question,
  correctAnswer,
  explanation,
  language = "javascript",
  starterCode = "",
  functionName = "",
  testInput = [],
  onPass,
  isPassed = false,
}: CodeChallengeProps) {
  const [code, setCode] = useState(starterCode);
  const [result, setResult] = useState<{ passed: boolean; output: string; error?: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pastedAnswer, setPastedAnswer] = useState("");

  const isJavaScriptChallenge = language.toLowerCase() === "javascript" || language.toLowerCase() === "typescript";

  useEffect(() => {
    setCode(starterCode);
    setResult(null);
    setPastedAnswer("");
  }, [starterCode]);

  async function handleRun() {
    setIsRunning(true);
    // small artificial delay so the running state is visible, feels intentional rather than instant/jarring
    await new Promise((r) => setTimeout(r, 300));

    const runResult = runCodeChallenge({
      studentCode: code,
      functionName: functionName || "",
      testInput: Array.isArray(testInput) ? testInput : [],
      expectedOutput: correctAnswer.trim(),
    });

    setResult(runResult);
    setIsRunning(false);

    if (runResult.passed) {
      onPass(true);
    } else {
      onPass(false);
    }
  }

  function handleVerifyPasted() {
    const passed = pastedAnswer.trim() === correctAnswer.trim();
    const runResult = {
      passed,
      output: pastedAnswer,
    };
    setResult(runResult);
    onPass(passed);
  }

  function handleReset() {
    setCode(starterCode);
    setPastedAnswer("");
    setResult(null);
    onPass(false);
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-surface overflow-hidden my-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/30 rounded-full px-3 py-1">
          {language} Challenge
        </span>
      </div>

      {/* Prompt */}
      <div className="px-5 py-4 text-sm text-text leading-relaxed border-b border-white/[0.07]">
        {question}
      </div>

      {/* Editor */}
      <div className="border-b border-white/[0.07]">
        <Editor
          height="220px"
          language={isJavaScriptChallenge ? (language.toLowerCase() === "typescript" ? "typescript" : "javascript") : "rust"}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          beforeMount={handleEditorWillMount}
          options={{
            fontSize: 14,
            fontFamily: "var(--font-mono, monospace)",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbersMinChars: 3,
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            readOnly: isRunning || (result?.passed && isPassed),
          }}
        />
      </div>

      {/* Actions */}
      {isJavaScriptChallenge ? (
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-2 bg-accent text-bg font-semibold text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 cursor-pointer transition-opacity"
          >
            <Play size={15} fill="currentColor" />
            {isRunning ? "Running..." : "Run & Check Code"}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 border border-white/[0.12] text-sm px-4 py-2.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors"
          >
            <RotateCcw size={15} />
            Reset code
          </button>
        </div>
      ) : (
        /* Rust / Solana Paste expected output check */
        <div className="px-5 pb-5 pt-4 space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            Write your solution above. To complete this challenge, run your code locally or in the terminal, and paste the exact expected response below to verify:
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={pastedAnswer}
              onChange={(e) => setPastedAnswer(e.target.value)}
              placeholder="Paste expected output here..."
              disabled={result?.passed && isPassed}
              className="flex-1 bg-bg border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-text outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleVerifyPasted}
              disabled={!pastedAnswer.trim() || (result?.passed && isPassed)}
              className="bg-accent text-bg font-semibold text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 cursor-pointer transition-opacity whitespace-nowrap"
            >
              Verify Output
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 border border-white/[0.12] text-sm px-4 py-2.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <RotateCcw size={15} />
              Reset code
            </button>
          </div>
        </div>
      )}

      {/* Console output & Result block */}
      {result && (
        <div className="px-5 pb-5 space-y-3">
          {isJavaScriptChallenge && (
            <div className="rounded-lg border border-white/[0.07] bg-bg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.07] text-muted text-xs uppercase tracking-wider">
                <Terminal size={13} />
                Console output
              </div>
              <div className="px-4 py-3 font-mono text-sm">
                {result.error ? (
                  <span className="text-red-400">{result.error}</span>
                ) : (
                  <span className="text-muted">
                    <span className="text-accent">{">"}</span> {functionName}({Array.isArray(testInput) ? testInput.map((val: any) => JSON.stringify(val)).join(", ") : ""}) {"→"}{" "}
                    <span className="text-text">{result.output}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          <div
            className={`rounded-lg border-l-[3px] px-4 py-3.5 ${
              result.passed
                ? "border-l-[#14F195] bg-[#14F195]/[0.06]"
                : "border-l-red-500 bg-red-500/[0.06]"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm mb-1.5">
              {result.passed ? (
                <CheckCircle2 size={16} className="text-[#14F195]" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
              {result.passed ? "Correct!" : "Output Mismatch"}
            </div>
            {explanation && (
              <p className="text-sm text-muted leading-relaxed">{explanation}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
