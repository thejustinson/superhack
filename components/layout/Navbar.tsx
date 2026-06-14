"use client";

import Link from "next/link";
import Image from "next/image";
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
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      backgroundColor: scrolled ? "rgba(11,12,15,0.94)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.04)" : "none",
      transition: "all 0.3s ease",
    }}>
      <nav style={{
        maxWidth: "1200px", margin: "0 auto", padding: "0 28px",
        height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Image
            src="/logo-with-logotype.svg"
            alt="Superhack"
            height={28}
            width={133}
            style={{ height: "28px", width: "auto" }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }} className="hidden lg:flex">
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

          {!loading && (
            user ? (
              <div style={{ position: "relative" }}>
                <button onClick={() => setUserMenuOpen((v) => !v)} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", padding: "7px 14px", cursor: "pointer", color: "#f0f0f0",
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
                    borderRadius: "12px", padding: "6px", minWidth: "180px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 100,
                  }}>
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 14px", borderRadius: "8px", color: "#f0f0f0",
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
                        padding: "10px 14px", borderRadius: "8px", color: "#ffba08",
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
                      padding: "10px 14px", borderRadius: "8px", color: "#f87171",
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
                <Link href="/auth" style={{
                  backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                  fontSize: "0.875rem", padding: "9px 22px", borderRadius: "8px",
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

        {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          backgroundColor: "#111318",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "16px 28px 24px",
          display: "flex", flexDirection: "column", gap: "4px",
        }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: "11px 0", fontSize: "0.9375rem", fontWeight: 500,
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
                  fontSize: "0.875rem", cursor: "pointer", padding: "0", fontFamily: "inherit",
                }}>
                  <LogOut size={14} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" style={{
                  backgroundColor: "#ffba08", color: "#0b0c0f", fontWeight: 600,
                  fontSize: "0.875rem", padding: "11px 20px", borderRadius: "8px",
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
