"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/supabase";
import { DataTable } from "@/components/admin/DataTable";

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data: rows } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setData(rows ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleAdmin(user: UserProfile) {
    setToggling(user.id);
    await supabase
      .from("profiles")
      .update({ is_admin: !user.is_admin })
      .eq("id", user.id);
    setData((prev) =>
      prev.map((u) => u.id === user.id ? { ...u, is_admin: !u.is_admin } : u)
    );
    setToggling(null);
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "1.5rem", fontWeight: 700, color: "#f0f0f0", margin: 0,
        }}>Users</h1>
        <p style={{ color: "#888888", fontSize: "0.875rem", margin: "4px 0 0" }}>
          {data.length} registered users
        </p>
      </div>

      <DataTable
        columns={[
          { key: "full_name", label: "Name", sortable: true, render: (r) => r.full_name || <span style={{ color: "#555" }}>-</span> },
          { key: "email", label: "Email", sortable: true, render: (r) => (
            <span style={{ fontSize: "0.8rem", color: "#888888" }}>{r.email ?? "-"}</span>
          )},
          { key: "university_verified", label: "Verified", render: (r) => (
            <span style={{
              fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "20px",
              backgroundColor: r.university_verified ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)",
              color: r.university_verified ? "#4ade80" : "#888888",
            }}>
              {r.university_verified ? "Yes" : "No"}
            </span>
          )},
          { key: "is_admin", label: "Admin", render: (r) => (
            <span style={{
              fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "20px",
              backgroundColor: r.is_admin ? "rgba(255,186,8,0.12)" : "rgba(255,255,255,0.05)",
              color: r.is_admin ? "#ffba08" : "#888888",
            }}>
              {r.is_admin ? "Admin" : "User"}
            </span>
          )},
          { key: "created_at", label: "Joined", sortable: true, render: (r) =>
            new Date(r.created_at).toLocaleDateString() },
        ]}
        data={data}
        keyField="id"
        loading={loading}
        emptyMessage="No users yet."
        onRowClick={(row) => router.push(`/admin/users/${row.id}`)}
        actions={(row) => (
          <button
            onClick={(e) => { e.stopPropagation(); toggleAdmin(row); }}
            disabled={toggling === row.id}
            title={row.is_admin ? "Revoke admin" : "Grant admin"}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: "none", border: "none",
              color: row.is_admin ? "#ffba08" : "#888888",
              cursor: toggling === row.id ? "wait" : "pointer",
              padding: "4px 8px", borderRadius: "6px",
              fontSize: "0.75rem", fontWeight: 500, fontFamily: "inherit",
              transition: "background 0.15s, color 0.15s",
              opacity: toggling === row.id ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (toggling !== row.id) {
                e.currentTarget.style.backgroundColor = row.is_admin
                  ? "rgba(239,68,68,0.08)" : "rgba(255,186,8,0.08)";
                e.currentTarget.style.color = row.is_admin ? "#f87171" : "#ffba08";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = row.is_admin ? "#ffba08" : "#888888";
            }}
          >
            {row.is_admin
              ? <><ShieldOff size={13} /> Revoke</>
              : <><Shield size={13} /> Make admin</>
            }
          </button>
        )}
      />
    </div>
  );
}

