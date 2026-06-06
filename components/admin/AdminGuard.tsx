"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !profile?.is_admin) {
      router.replace("/");
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "#0b0c0f",
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          border: "2px solid rgba(255,186,8,0.2)", borderTopColor: "#ffba08",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  if (!user || !profile?.is_admin) return null;

  return <>{children}</>;
}
