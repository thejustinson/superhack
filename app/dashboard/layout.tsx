"use client";

import { DashSidebar } from "@/components/dashboard/DashSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#0b0c0f",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}>
        <DashSidebar />

        {/* Main content area */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          // Desktop: offset left for sidebar
          paddingLeft: "220px",
          // Mobile: offset bottom for tab bar
          paddingBottom: "64px",
          minHeight: "100vh",
        }}>
          {/* Responsive padding override */}
          <style>{`
            @media (max-width: 1023px) {
              main { padding-left: 0 !important; }
            }
          `}</style>
          <div style={{ padding: "32px 28px", maxWidth: "1000px" }}>
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
