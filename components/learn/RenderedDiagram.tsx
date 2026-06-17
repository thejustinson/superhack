"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";

interface RenderedDiagramProps {
  content: string;
}

interface TreeLayoutProps {
  root: string;
  children: string[];
}

interface FlowLayoutProps {
  steps: string[];
  direction: "horizontal" | "vertical";
  arrowLabels?: (string | undefined)[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const rootVariants = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export const TreeLayout: React.FC<TreeLayoutProps> = ({ root, children }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      style={{
        padding: "24px",
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        margin: "28px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Root Node */}
      <motion.div
        variants={rootVariants}
        style={{
          display: "inline-block",
          padding: "10px 16px",
          backgroundColor: "#111318",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "0.95rem",
          color: "#f0f0f0",
          fontFamily: "var(--font-dm-sans), sans-serif",
          zIndex: 2,
          marginLeft: "12px",
        }}
      >
        {root}
      </motion.div>

      {/* Children container */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        paddingLeft: "32px",
        marginTop: "16px",
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}>
        {/* Vertical connector line */}
        <div style={{
          position: "absolute",
          left: "24px",
          top: "-16px",
          bottom: "22px",
          width: "1px",
          backgroundColor: "rgba(255, 255, 255, 0.12)",
        }} />

        {children.map((childText, i) => {
          const itemVariants = {
            hidden: { opacity: 0, y: 15 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" as const },
            },
          };

          return (
            <motion.div
              key={i}
              variants={itemVariants}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* Horizontal branch line */}
              <div style={{
                position: "absolute",
                left: "-8px",
                width: "8px",
                height: "1px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
              }} />

              {/* Child box */}
              <div style={{
                backgroundColor: "#0d0f14",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "0.875rem",
                color: "#c0c0c0",
                fontFamily: "var(--font-dm-sans), sans-serif",
                width: "fit-content",
                maxWidth: "calc(100% - 16px)",
                boxSizing: "border-box",
              }}>
                {childText}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export const FlowLayout: React.FC<FlowLayoutProps> = ({ steps, direction, arrowLabels }) => {
  const isVertical = direction === "vertical";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: isVertical ? 10 : 0, x: isVertical ? 0 : -10 },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      style={{
        padding: "24px",
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        margin: "28px 0",
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        flexWrap: isVertical ? "nowrap" : "wrap",
        alignItems: isVertical ? "flex-start" : "center",
        gap: "12px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <motion.div
            variants={itemVariants}
            style={{
              backgroundColor: "#0d0f14",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "0.875rem",
              color: "#c0c0c0",
              fontFamily: "var(--font-dm-sans), sans-serif",
              minWidth: isVertical ? "200px" : "100px",
              boxSizing: "border-box",
            }}
          >
            {step}
          </motion.div>

          {i < steps.length - 1 && (
            isVertical ? (
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  paddingLeft: "16px",
                  color: "#888888",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              >
                <ArrowDown size={16} />
                {arrowLabels?.[i] && <span>{arrowLabels[i]}</span>}
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888888",
                }}
              >
                <ArrowRight size={16} />
              </motion.div>
            )
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

export function RenderedDiagram({ content }: RenderedDiagramProps) {
  const rawLines = content.trim().split("\n");
  const nonEmptyLines = rawLines.map((l) => l.trim()).filter(Boolean);

  const hasTreeChars = nonEmptyLines.some((l) => l.includes("├──") || l.includes("└──"));
  const hasHorizontalArrow = nonEmptyLines.length === 1 && nonEmptyLines[0].includes("→");
  const hasVerticalArrow = nonEmptyLines.some((l) => /^↓/.test(l));

  if (hasHorizontalArrow) {
    const steps = nonEmptyLines[0].split("→").map((s) => s.trim());
    return <FlowLayout steps={steps} direction="horizontal" />;
  }

  if (hasTreeChars) {
    const root = nonEmptyLines[0];
    const children = nonEmptyLines
      .slice(1)
      .filter((line) => line.includes("├──") || line.includes("└──"))
      .map((line) => line.replace(/[├└─]+/g, "").trim());
    return <TreeLayout root={root} children={children} />;
  }

  if (hasVerticalArrow) {
    // Lines alternate: step label, then a ↓ arrow label (optional text after it), repeating
    const steps: { label: string; arrowLabel?: string }[] = [];
    let i = 0;
    while (i < nonEmptyLines.length) {
      const line = nonEmptyLines[i];
      if (line.startsWith("↓")) {
        // attach the arrow label to the previous step
        if (steps.length > 0) {
          steps[steps.length - 1].arrowLabel = line.replace("↓", "").trim();
        }
      } else {
        steps.push({ label: line });
      }
      i++;
    }
    return (
      <FlowLayout
        steps={steps.map((s) => s.label)}
        direction="vertical"
        arrowLabels={steps.map((s) => s.arrowLabel)}
      />
    );
  }

  // Fallback: render as plain text, no special layout
  return (
    <pre style={{
      backgroundColor: "#0d0f14",
      border: "1px solid rgba(255, 255, 255, 0.07)",
      borderRadius: "8px",
      padding: "16px",
      fontSize: "0.875rem",
      color: "#888888",
      whiteSpace: "pre-wrap",
      fontFamily: "monospace",
      margin: "24px 0",
    }}>
      {content}
    </pre>
  );
}

export default RenderedDiagram;
