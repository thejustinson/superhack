"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { RenderedDiagram } from "./RenderedDiagram";

interface CodeBlockProps {
  language?: string;
  code?: string;
  children?: string;
}

export function CodeBlock({ language = "typescript", code, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const cleanCode = (code || children || "").trim();

  if (language === "diagram") {
    return <RenderedDiagram content={cleanCode} />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // fallback
    }
  };

  // Simple, robust tokenizer for basic syntax highlighting
  const highlightCode = (rawCode: string, lang: string) => {
    const lines = rawCode.split("\n");
    
    return lines.map((line, lineIdx) => {
      // If line is empty, render spacer
      if (line.trim() === "") {
        return <div key={lineIdx} style={{ height: "1.2rem" }} />;
      }

      // Regex matching for basic syntax groups
      // 1. Comments: // ... or # ...
      // 2. Strings: "..." or '...' or `...`
      // 3. Keywords: pub, fn, let, const, etc.
      // 4. Numbers: 0-9
      const tokenRegex = /(\/\/.*|#.*|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|`(?:\\`|[^`])*`|\b(?:fn|let|mut|pub|struct|enum|impl|use|mod|match|return|as|const|static|type|where|crate|self|Self|true|false|if|else|loop|while|for|in|var|function|import|export|from|default|class|extends|new|this|switch|case|break|continue|await|async|try|catch|finally|echo|cd|ls|mkdir|npm|cargo|git|install|run|build)\b|\b\d+\b)/g;

      const parts = line.split(tokenRegex);
      const elements = parts.map((part, partIdx) => {
        if (!part) return null;

        // Determine token type
        if (part.startsWith("//") || part.startsWith("#")) {
          // Comment: Greenish/grey
          return <span key={partIdx} style={{ color: "#6a737d", fontStyle: "italic" }}>{part}</span>;
        }
        if ((part.startsWith('"') && part.endsWith('"')) || 
            (part.startsWith("'") && part.endsWith("'")) || 
            (part.startsWith("`") && part.endsWith("`"))) {
          // String: Solana Green / Soft Green
          return <span key={partIdx} style={{ color: "#14F195" }}>{part}</span>;
        }
        if (/^\d+$/.test(part)) {
          // Number: Orange/Amber
          return <span key={partIdx} style={{ color: "#f5a623" }}>{part}</span>;
        }
        if (/^(fn|let|mut|pub|struct|enum|impl|use|mod|match|return|as|const|static|type|where|crate|self|Self|true|false|if|else|loop|while|for|in|var|function|import|export|from|default|class|extends|new|this|switch|case|break|continue|await|async|try|catch|finally|echo|cd|ls|mkdir|npm|cargo|git|install|run|build)$/.test(part)) {
          // Keyword: Yellow Accent
          return <span key={partIdx} style={{ color: "#ffba08", fontWeight: 600 }}>{part}</span>;
        }

        // Regular text
        return <span key={partIdx} style={{ color: "#e1e4e8" }}>{part}</span>;
      });

      return (
        <div key={lineIdx} style={{ fontFamily: "monospace", fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre" }}>
          {elements}
        </div>
      );
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px",
        margin: "24px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          backgroundColor: "#0d0f14",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "#888888",
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          {language}
        </span>
        
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: copied ? "#14F195" : "#888888",
            padding: "4px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.75rem",
            fontFamily: "var(--font-dm-sans), sans-serif",
            transition: "color 0.15s, background-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
            if (!copied) e.currentTarget.style.color = "#f0f0f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            if (!copied) e.currentTarget.style.color = "#888888";
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code body */}
      <pre
        style={{
          margin: 0,
          padding: "16px",
          overflowX: "auto",
          fontFamily: "monospace",
          backgroundColor: "#111318",
        }}
      >
        <code>{highlightCode(cleanCode, language)}</code>
      </pre>
    </div>
  );
}
