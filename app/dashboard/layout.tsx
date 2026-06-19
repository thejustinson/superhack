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
          minHeight: "100vh",
        }}>
          {/* Responsive padding override */}
          <style>{`
            @media (max-width: 1023px) {
              main { padding-top: 56px !important; }
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
