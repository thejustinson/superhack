"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { useAuth } from "@/context/AuthContext";

// Breadcrumb label map
const BREADCRUMBS: Record<string, string> = {
  admin: "Admin",
  universities: "Universities",
  hackathons: "Hackathons",
  ideas: "Ideas",
  projects: "Projects",
  users: "Users",
  applications: "Applications",
};

function Topbar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  // Build breadcrumbs from path segments
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header style={{
      height: "60px", flexShrink: 0,
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      backgroundColor: "#0d0f14",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
    }}>
      {/* Breadcrumbs */}
      <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem" }}>
        {segments.map((seg, i) => {
          const label = BREADCRUMBS[seg] ?? seg;
          const isLast = i === segments.length - 1;
          const href = "/" + segments.slice(0, i + 1).join("/");
          return (
            <span key={href} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {i > 0 && <span style={{ color: "#444" }}>/</span>}
              {isLast ? (
                <span style={{ color: "#f0f0f0", fontWeight: 600 }}>{label}</span>
              ) : (
                <Link href={href} style={{ color: "#888888", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
                >
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: "6px",
          fontSize: "0.8125rem", color: "#888888", textDecoration: "none",
          padding: "6px 12px", borderRadius: "7px", transition: "background 0.15s, color 0.15s",
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#f0f0f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#888888";
          }}
        >
          <Home size={13} /> View site
        </Link>
        <button onClick={signOut} style={{
          display: "flex", alignItems: "center", gap: "6px",
          fontSize: "0.8125rem", color: "#f87171",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "inherit", padding: "6px 12px", borderRadius: "7px",
          transition: "background 0.15s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div style={{
        display: "flex", height: "100vh", overflow: "hidden",
        backgroundColor: "#0b0c0f",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Topbar />
          <main style={{
            flex: 1, overflowY: "auto",
            padding: "28px 32px",
            backgroundColor: "#0b0c0f",
          }}>
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
