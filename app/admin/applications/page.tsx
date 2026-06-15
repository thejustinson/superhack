"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SlideOver } from "@/components/admin/SlideOver";
import { Eye } from "lucide-react";

type ApplicationStatus = "pending" | "reviewed" | "approved" | "rejected";

interface HostApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  university_name: string;
  faculty_name: string | null;
  role: string | null;
  why: string | null;
  estimated_attendance: number | null;
  status: ApplicationStatus;
  created_at: string;
}

type FilterTab = "all" | "pending" | "reviewed" | "approved_rejected";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: "#ffba08",
  reviewed: "#888888",
  approved: "#4ade80",
  rejected: "#f87171",
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.9375rem", color: "#f0f0f0", lineHeight: 1.5 }}>
        {value || <span style={{ color: "#555" }}>-</span>}
      </div>
    </div>
  );
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "reviewed", label: "Reviewed" },
  { key: "approved_rejected", label: "Approved / Rejected" },
];

const COLUMNS: Column<HostApplication>[] = [
  { key: "full_name", label: "Full Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "university_name", label: "University", sortable: true },
  {
    key: "faculty_name",
    label: "Faculty",
    render: (row) => <span style={{ color: row.faculty_name ? "#f0f0f0" : "#555" }}>{row.faculty_name || "-"}</span>,
  },
  {
    key: "role",
    label: "Role",
    render: (row) => <span style={{ color: row.role ? "#f0f0f0" : "#555" }}>{row.role || "-"}</span>,
  },
  {
    key: "estimated_attendance",
    label: "Attendance",
    render: (row) => (
      <span style={{ color: row.estimated_attendance != null ? "#f0f0f0" : "#555" }}>
        {row.estimated_attendance != null ? row.estimated_attendance.toLocaleString() : "-"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "created_at",
    label: "Date",
    sortable: true,
    render: (row) => (
      <span style={{ color: "#888888", fontSize: "0.8125rem" }}>
        {new Date(row.created_at).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
        })}
      </span>
    ),
  },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<HostApplication | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    const { data, error } = await supabase
      .from("host_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApplications(data as HostApplication[]);
    }
    setLoading(false);
  }

  const filtered = applications.filter((app) => {
    if (activeTab === "all") return true;
    if (activeTab === "approved_rejected") return app.status === "approved" || app.status === "rejected";
    return app.status === activeTab;
  });

  async function handleStatusChange(id: string, newStatus: ApplicationStatus) {
    setStatusUpdating(true);

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selected?.id === id) {
      setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
    }

    await supabase
      .from("host_applications")
      .update({ status: newStatus })
      .eq("id", id);

    setStatusUpdating(false);
  }

  const tabCounters: Record<FilterTab, number> = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    approved_rejected: applications.filter((a) => a.status === "approved" || a.status === "rejected").length,
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "1.5rem", fontWeight: 700, color: "#f0f0f0", margin: "0 0 4px",
        }}>
          Host Applications
        </h1>
        <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0 }}>
          {applications.length} total application{applications.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: "flex", gap: "4px", marginBottom: "20px",
        backgroundColor: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px",
        padding: "4px",
        width: "fit-content",
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: isActive ? "#ffba08" : "transparent",
                color: isActive ? "#0b0c0f" : "#888888",
                border: "none",
                borderRadius: "7px",
                padding: "6px 14px",
                fontSize: "0.8125rem",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "#888888";
              }}
            >
              {tab.label}
              <span style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                backgroundColor: isActive ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.08)",
                color: isActive ? "#0b0c0f" : "#888888",
                borderRadius: "999px",
                padding: "1px 6px",
                minWidth: "18px",
                textAlign: "center",
              }}>
                {tabCounters[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Data table */}
      <DataTable<HostApplication>
        columns={COLUMNS}
        data={filtered}
        keyField="id"
        loading={loading}
        emptyMessage="No applications found for this filter."
        actions={(row) => (
          <button
            onClick={() => setSelected(row)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              backgroundColor: "rgba(255,186,8,0.08)",
              border: "1px solid rgba(255,186,8,0.2)",
              color: "#ffba08",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
              fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,186,8,0.08)")}
          >
            <Eye size={12} /> Details
          </button>
        )}
      />

      {/* SlideOver */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.full_name ?? "Application Details"}
        width={560}
      >
        {selected && (
          <div style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
            {/* Contact */}
            <div style={{
              backgroundColor: "#0d0f14",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
            }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#ffba08", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                Contact
              </div>
              <InfoRow label="Full Name" value={selected.full_name} />
              <InfoRow label="Email" value={
                <a href={`mailto:${selected.email}`} style={{ color: "#ffba08", textDecoration: "none" }}>
                  {selected.email}
                </a>
              } />
              <InfoRow label="Phone" value={selected.phone} />
            </div>

            {/* University */}
            <div style={{
              backgroundColor: "#0d0f14",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
            }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#ffba08", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                University
              </div>
              <InfoRow label="University Name" value={selected.university_name} />
              <InfoRow label="Faculty" value={selected.faculty_name} />
            </div>

            {/* Application */}
            <div style={{
              backgroundColor: "#0d0f14",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
            }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#ffba08", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                Application
              </div>
              <InfoRow label="Role" value={selected.role} />
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Why
                </div>
                {selected.why ? (
                  <div style={{
                    fontSize: "0.875rem", color: "#c0c0c0", lineHeight: 1.65,
                    backgroundColor: "#0b0c0f",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    padding: "12px",
                    whiteSpace: "pre-wrap",
                  }}>
                    {selected.why}
                  </div>
                ) : (
                  <span style={{ color: "#555" }}>-</span>
                )}
              </div>
              <InfoRow
                label="Estimated Attendance"
                value={selected.estimated_attendance != null ? selected.estimated_attendance.toLocaleString() + " people" : null}
              />
            </div>

            {/* Status update */}
            <div style={{
              backgroundColor: "#0d0f14",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "16px",
            }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#ffba08", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                Status
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <StatusBadge status={selected.status} />
                <div style={{ flex: 1 }}>
                  <select
                    value={selected.status}
                    disabled={statusUpdating}
                    onChange={(e) => handleStatusChange(selected.id, e.target.value as ApplicationStatus)}
                    style={{
                      width: "100%",
                      backgroundColor: "#111318",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "0.875rem",
                      color: "#f0f0f0",
                      cursor: "pointer",
                      outline: "none",
                      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                      appearance: "auto",
                      opacity: statusUpdating ? 0.5 : 1,
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#888888", margin: "8px 0 0" }}>
                Applied {new Date(selected.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}

