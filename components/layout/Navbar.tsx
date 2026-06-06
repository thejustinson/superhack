"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useUser } from "@/context/AuthContext";


const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/universities", label: "Universities" },
  { href: "/ideas", label: "Ideas" },
  { href: "/docs", label: "Docs" },
];

interface NavbarProps {
  onAuthOpen?: () => void;
}

export function Navbar({ onAuthOpen }: NavbarProps) {
  const pathname = usePathname();
  const { user, profile, signOut, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  function isActive(href: string) {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
      backgroundColor: scrolled ? "rgba(11,12,15,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      transition: "all 0.3s ease",
    }}>
      <nav style={{
        maxWidth: "1200px", margin: "0 auto", padding: "0 28px",
        height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 900,
          fontSize: "1.25rem", letterSpacing: "-0.02em", color: "#f0f0f0", flexShrink: 0,
          transition: "color 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffba08")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#f0f0f0")}
        >
          Superhack
        </Link>

        {/* Desktop nav — hidden below lg (1024px) */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }} className="hidden lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{
              fontSize: "0.875rem", fontWeight: 400,
              color: isActive(link.href) ? "#ffba08" : "#888888",
              transition: "color 0.2s",
            }}
              onMouseEnter={(e) => { if (!isActive(link.href)) e.currentTarget.style.color = "#f0f0f0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = isActive(link.href) ? "#ffba08" : "#888888"; }}
            >
              {link.label}
            </Link>
          ))}

          {/* Auth area */}
          {!loading && (
            user ? (
              <div style={{ position: "relative" }}>
                <button onClick={() => setUserMenuOpen((v) => !v)} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: "#f0f0f0",
                  fontSize: "0.8125rem", fontWeight: 500, fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  <User size={14} />
                  {profile?.full_name?.split(" ")[0] ?? "Account"}
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    backgroundColor: "#181b22", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px", padding: "6px", minWidth: "180px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 100,
                  }}>
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 14px", borderRadius: "7px", color: "#f0f0f0",
                      fontSize: "0.875rem", textDecoration: "none", transition: "background 0.15s",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <LayoutDashboard size={14} style={{ color: "#888888" }} /> Dashboard
                    </Link>
                    {profile?.is_admin && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 14px", borderRadius: "7px", color: "#ffba08",
                        fontSize: "0.875rem", textDecoration: "none", transition: "background 0.15s",
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Shield size={14} /> Admin
                      </Link>
                    )}
                    <button onClick={() => { signOut(); setUserMenuOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: "10px", width: "100%",
                      padding: "10px 14px", borderRadius: "7px", color: "#f87171",
                      fontSize: "0.875rem", backgroundColor: "transparent", border: "none",
                      cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={onAuthOpen} style={{
                  fontSize: "0.875rem", color: "#888888", background: "none", border: "none",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "color 0.2s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
                >
                  Sign in
                </button>
                <Link href="/submit" style={{
                  backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                  fontSize: "0.8125rem", padding: "8px 18px", borderRadius: "7px",
                  textDecoration: "none", transition: "opacity 0.2s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Get started
                </Link>
              </div>
            )
          )}
        </div>

        {/* Mobile hamburger — hidden on lg+ */}
        <button className="flex lg:hidden" onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{
            background: "none", border: "none", color: "#888888",
            cursor: "pointer", padding: "4px", alignItems: "center",
          }}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu — shown only when hamburger is open */}
      {menuOpen && (
        <div style={{
          backgroundColor: "#111318",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "16px 28px 24px",
          display: "flex", flexDirection: "column", gap: "4px",
        }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: "10px 0", fontSize: "0.9375rem", fontWeight: 500,
              color: isActive(link.href) ? "#ffba08" : "#f0f0f0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              {link.label}
            </Link>
          ))}
          <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {user ? (
              <>
                <Link href="/dashboard" style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  fontSize: "0.875rem", color: "#f0f0f0",
                }}>
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <button onClick={signOut} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "none", border: "none", color: "#f87171",
                  fontSize: "0.875rem", cursor: "pointer", padding: 0, fontFamily: "inherit",
                }}>
                  <LogOut size={14} /> Sign out
                </button>
              </>
            ) : (
              <>
                <button onClick={onAuthOpen} style={{
                  background: "none", border: "none", color: "#888888",
                  fontSize: "0.875rem", cursor: "pointer", padding: 0,
                  fontFamily: "inherit", textAlign: "left",
                }}>
                  Sign in
                </button>
                <Link href="/submit" style={{
                  backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                  fontSize: "0.875rem", padding: "11px 20px", borderRadius: "7px",
                  textDecoration: "none", alignSelf: "flex-start",
                }}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
