"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{
        display: "flex", flex: 1, minHeight: "60vh",
        alignItems: "center", justifyContent: "center",
        backgroundColor: "#0b0c0f", color: "#888888"
      }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "#ffba08" }} />
      </div>
    );
  }

  return <>{children}</>;
}
