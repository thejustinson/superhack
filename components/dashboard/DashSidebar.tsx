"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderGit2, Heart, GraduationCap, User,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "My Projects", icon: FolderGit2 },
  { href: "/dashboard/upvoted", label: "Upvoted", icon: Heart },
  { href: "/dashboard/university", label: "My University", icon: GraduationCap },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashSidebar() {
  const pathname = usePathname();

  function isActive(item: (typeof NAV_ITEMS)[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <>
      {/* ─── Desktop Sidebar (≥1024px) ─── */}
      <aside className="dash-sidebar-desktop" style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: "220px",
        backgroundColor: "#0d0f14",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          height: "60px", display: "flex", alignItems: "center",
          padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          <Link href="/" style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontWeight: 900, fontSize: "1.125rem", color: "#f0f0f0",
            textDecoration: "none", letterSpacing: "-0.02em",
            transition: "color 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffba08")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#f0f0f0")}
          >
            Superhack
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 10px", marginBottom: "6px" }}>
            Dashboard
          </p>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "9px 12px", borderRadius: "8px",
                  backgroundColor: active ? "rgba(255,186,8,0.1)" : "transparent",
                  color: active ? "#ffba08" : "#888888",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 400,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#f0f0f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#888888";
                  }
                }}
              >
                <item.icon size={15} style={{ flexShrink: 0 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontSize: "0.8125rem", color: "#555", textDecoration: "none",
            padding: "8px 10px", borderRadius: "6px", transition: "color 0.15s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#888888")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* ─── Mobile Bottom Tab Bar (<1024px) ─── */}
      <nav className="dash-sidebar-mobile" style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: "64px",
        backgroundColor: "#0d0f14",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 40,
        padding: "0 8px",
      }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                color: active ? "#ffba08" : "#555",
                textDecoration: "none",
                fontSize: "0.625rem",
                fontWeight: active ? 600 : 400,
                padding: "6px 10px", borderRadius: "8px",
                transition: "color 0.15s",
                flex: 1,
              }}
            >
              <item.icon size={18} />
              <span style={{ lineHeight: 1 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Responsive CSS */}
      <style>{`
        .dash-sidebar-desktop { display: flex !important; }
        .dash-sidebar-mobile { display: none !important; }
        @media (max-width: 1023px) {
          .dash-sidebar-desktop { display: none !important; }
          .dash-sidebar-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
