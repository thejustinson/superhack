"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, University, Zap, Lightbulb,
  FolderKanban, Users, ChevronLeft, ChevronRight,
  Shield, ClipboardList, BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/universities", label: "Universities", icon: University },
  { href: "/admin/hackathons", label: "Hackathons", icon: Zap },
  { href: "/admin/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  { href: "/admin/learn", label: "Learn", icon: BookOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { profile } = useAuth();

  function isActive(item: (typeof NAV_ITEMS)[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside style={{
      width: collapsed ? "64px" : "220px",
      flexShrink: 0,
      backgroundColor: "#0d0f14",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.22s ease",
      overflowX: "hidden",
      position: "relative",
    }}>
      {/* Logo area */}
      <div style={{
        height: "60px", display: "flex", alignItems: "center",
        padding: collapsed ? "0 18px" : "0 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}>
        <Link href="/admin" style={{
          display: "flex", alignItems: "center", gap: "10px",
          textDecoration: "none", overflow: "hidden",
        }}>
          <Shield size={20} style={{ color: "#ffba08", flexShrink: 0 }} />
          {!collapsed && (
            <span style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontWeight: 900, fontSize: "0.9375rem", color: "#f0f0f0",
              whiteSpace: "nowrap",
            }}>
              Admin
            </span>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: collapsed ? "10px 12px" : "9px 12px",
                borderRadius: "8px",
                backgroundColor: active ? "rgba(255,186,8,0.1)" : "transparent",
                color: active ? "#ffba08" : "#888888",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 400,
                transition: "background 0.15s, color 0.15s",
                overflow: "hidden",
                whiteSpace: "nowrap",
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
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profile footer */}
      {!collapsed && (
        <div style={{
          padding: "16px 14px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          fontSize: "0.8rem", color: "#888888",
          overflow: "hidden", whiteSpace: "nowrap",
        }}>
          <div style={{ fontWeight: 500, color: "#f0f0f0", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile?.full_name ?? "Admin"}
          </div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile?.email ?? ""}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        style={{
          position: "absolute", top: "50%", right: "-12px",
          transform: "translateY(-50%)",
          width: "24px", height: "24px", borderRadius: "50%",
          backgroundColor: "#181b22",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#888888",
          zIndex: 10, transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#ffba08";
          e.currentTarget.style.color = "#0b0c0f";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#181b22";
          e.currentTarget.style.color = "#888888";
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
