import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/ideas", label: "Ideas" },
  { href: "/docs", label: "Docs" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/winners", label: "Winners" },
  { href: "/universities", label: "Universities" },
  { href: "/apply", label: "Apply" },
];

const POWERED_BY = [
  { label: "Solana", href: "https://solana.com", dot: true },
  { label: "Superteam", href: "https://superteam.fun", dot: true },
  { label: "Superteam Nigeria", href: "https://fun.superteam.fun", dot: true },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        marginTop: "auto",
        backgroundColor: "#0b0c0f",
      }}
    >
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "64px 32px 40px",
        }}
      >
        {/* Four-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr auto auto 1.2fr",
            gap: "48px",
            alignItems: "flex-start",
          }}
          className="footer-grid"
        >
          {/* Column 1 — Logo + tagline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <Image
                src="/logo-with-logotype.svg"
                alt="Superhack"
                height={26}
                width={123}
                style={{ height: "26px", width: "auto" }}
              />
            </Link>
            <span
              style={{
                fontSize: "0.8125rem",
                color: "#666666",
                fontFamily: "var(--font-dm-sans), sans-serif",
                lineHeight: 1.5,
              }}
            >
              Campus hackathons on Solana.
            </span>
          </div>

          {/* Column 2 — Nav links (centered) */}
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "center",
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="footer-link"
                style={{
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  transition: "color 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Column 3 — Contact links */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#444444",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontWeight: 600,
              }}
            >
              Contact
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a
                href="mailto:justin@superhack.fun"
                className="footer-link"
                style={{
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  transition: "color 0.2s",
                }}
              >
                justin@superhack.fun
              </a>
              <a
                href="https://t.me/thejustinson"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                style={{
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  transition: "color 0.2s",
                }}
              >
                Telegram
              </a>
              <a
                href="https://x.com/thejustinson"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                style={{
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  transition: "color 0.2s",
                }}
              >
                X (Twitter)
              </a>
            </div>
          </div>

          {/* Column 4 — Powered by (right-aligned) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#444444",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
            >
              Powered by
            </span>
            {POWERED_BY.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="footer-link footer-link--power"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  transition: "color 0.2s",
                }}
              >
                {item.dot && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      display: "inline-block",
                      background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
                      flexShrink: 0,
                    }}
                  />
                )}
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#444444",
              fontFamily: "var(--font-dm-sans), sans-serif",
            }}
          >
            {`© ${new Date().getFullYear()} Superhack. All rights reserved.`}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "#444444",
              fontFamily: "var(--font-dm-sans), sans-serif",
            }}
          >
            Built for Nigerian student builders.
          </span>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: #888888;
        }

        .footer-link:hover {
          color: #f0f0f0;
        }

        .footer-link--power:hover {
          color: #c0c0c0;
        }

        @media (max-width: 720px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .footer-grid > nav {
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .footer-grid > div:last-child {
            align-items: flex-start !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </footer>
  );
}
