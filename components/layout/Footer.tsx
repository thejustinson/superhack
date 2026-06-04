import Link from "next/link";

const footerLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/ideas", label: "Ideas" },
  { href: "/docs", label: "Docs" },
  { href: "/projects", label: "Projects" },
  { href: "/submit", label: "Submit" },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "56px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "32px",
          }}
        >
          {/* Logo + tagline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontWeight: 900,
                fontSize: "1.25rem",
                letterSpacing: "-0.02em",
                color: "#f0f0f0",
                textDecoration: "none",
              }}
            >
              Superhack
            </Link>
            <span style={{ fontSize: "0.875rem", color: "#888888" }}>
              Build on Solana. Get paid.
            </span>
          </div>

          {/* Links */}
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "0.875rem",
                  color: "#888888",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          style={{
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#888888" }}>
            © {new Date().getFullYear()} Superhack. All rights reserved.
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "#888888",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Powered by{" "}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#f0f0f0",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  display: "inline-block",
                  background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
                  flexShrink: 0,
                }}
              />
              Superteam Nigeria
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
