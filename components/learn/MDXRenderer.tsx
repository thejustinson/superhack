import React from "react";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";

export const MDX_COMPONENTS = {
  h1: (props: any) => (
    <h1
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontWeight: 800,
        fontSize: "1.75rem",
        marginTop: "2rem",
        marginBottom: "1rem",
        color: "#f0f0f0",
      }}
      {...props}
    />
  ),
  h2: (props: any) => (
    <h2
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontWeight: 800,
        fontSize: "1.4rem",
        marginTop: "1.75rem",
        marginBottom: "0.75rem",
        color: "#f0f0f0",
      }}
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontWeight: 700,
        fontSize: "1.15rem",
        marginTop: "1.5rem",
        marginBottom: "0.5rem",
        color: "#f0f0f0",
      }}
      {...props}
    />
  ),
  p: (props: any) => (
    <p
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: "1rem",
        lineHeight: 1.8,
        color: "#c0c0c0",
        marginBottom: "1.25rem",
      }}
      {...props}
    />
  ),
  ul: (props: any) => (
    <ul
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: "1rem",
        lineHeight: 1.8,
        color: "#c0c0c0",
        paddingLeft: "20px",
        marginBottom: "1.25rem",
        listStyleType: "disc",
      }}
      {...props}
    />
  ),
  ol: (props: any) => (
    <ol
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: "1rem",
        lineHeight: 1.8,
        color: "#c0c0c0",
        paddingLeft: "20px",
        marginBottom: "1.25rem",
        listStyleType: "decimal",
      }}
      {...props}
    />
  ),
  li: (props: any) => (
    <li
      style={{
        marginBottom: "0.5rem",
      }}
      {...props}
    />
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          style={{
            fontFamily: "monospace",
            backgroundColor: "rgba(255,186,8,0.1)",
            color: "#ffba08",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.875rem",
          }}
          {...props}
        >
          {children}
        </code>
      );
    }
    const lang = className.replace("language-", "");
    return <CodeBlock language={lang} code={String(children)} />;
  },
  pre: (props: any) => {
    return <>{props.children}</>;
  },
  a: (props: any) => (
    <a
      style={{
        color: "#ffba08",
        textDecoration: "underline",
        cursor: "pointer",
      }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  table: (props: any) => (
    <div style={{ overflowX: "auto", margin: "24px 0", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
      <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }} {...props} />
    </div>
  ),
  thead: (props: any) => (
    <thead style={{ backgroundColor: "#111318", borderBottom: "1px solid rgba(255, 255, 255, 0.07)" }} {...props} />
  ),
  th: (props: any) => (
    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#f0f0f0" }} {...props} />
  ),
  tbody: (props: any) => <tbody {...props} />,
  tr: (props: any) => (
    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }} {...props} />
  ),
  td: (props: any) => (
    <td style={{ padding: "12px 16px", color: "#888888" }} {...props} />
  ),
  
  // Custom blocks
  Callout: (props: any) => <Callout {...props} />,
  CodeBlock: (props: any) => <CodeBlock {...props} />,
  ImageBlock: ({ src, alt, caption }: any) => (
    <div style={{ margin: "28px 0", textAlign: "center" }}>
      <img
        src={src}
        alt={alt ?? "Image"}
        style={{
          maxWidth: "100%",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      />
      {caption && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "#888888",
            marginTop: "8px",
            fontStyle: "italic",
          }}
        >
          {caption}
        </p>
      )}
    </div>
  ),
};
