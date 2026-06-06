"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, keyField, loading, emptyMessage = "No records found.", actions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const va = a[sortKey] ?? "";
    const vb = b[sortKey] ?? "";
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const thStyle: React.CSSProperties = {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#888888",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    backgroundColor: "#0d0f14",
  };

  const tdStyle: React.CSSProperties = {
    padding: "12px 16px",
    fontSize: "0.875rem",
    color: "#f0f0f0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "middle",
  };

  return (
    <div style={{
      backgroundColor: "#111318",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{ ...thStyle, width: col.width, cursor: col.sortable ? "pointer" : "default" }}
                  onClick={() => col.sortable && toggleSort(String(col.key))}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {col.label}
                    {col.sortable && (
                      <span style={{ color: sortKey === String(col.key) ? "#ffba08" : "#555" }}>
                        {sortKey === String(col.key) && sortDir === "desc"
                          ? <ChevronDown size={12} />
                          : <ChevronUp size={12} />
                        }
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {actions && <th style={{ ...thStyle, width: "100px" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ ...tdStyle, textAlign: "center", padding: "40px" }}>
                  <div style={{
                    display: "inline-block", width: "24px", height: "24px",
                    border: "2px solid rgba(255,186,8,0.15)", borderTopColor: "#ffba08",
                    borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  }} />
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}
                  style={{ ...tdStyle, textAlign: "center", padding: "40px", color: "#888888" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr key={String(row[keyField])}
                  style={{ transition: "background 0.12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} style={tdStyle}>
                      {col.render ? col.render(row) : String(row[String(col.key)] ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ ...tdStyle }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
