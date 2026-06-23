"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Cohort } from "@/lib/supabase";
import { SlideOver } from "@/components/admin/SlideOver";

export interface AnnounceResultsModalProps {
  cohort: Cohort;
  open: boolean;
  onClose: () => void;
  onAnnounced: () => void;
}

export function AnnounceResultsModal({ cohort, open, onClose, onAnnounced }: AnnounceResultsModalProps) {
  const [winnersCount, setWinnersCount] = useState<number | null>(null);
  const [announcementDate, setAnnouncementDate] = useState(cohort.results_announcement_date ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cohort?.id) return;
    // Check how many projects in this cohort have a prize_place set
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("cohort_id", cohort.id)
      .not("prize_place", "is", null)
      .then(({ count }) => setWinnersCount(count ?? 0));
  }, [cohort?.id]);

  async function handleAnnounce() {
    if (!cohort?.id) return;
    setLoading(true);
    await supabase
      .from("cohorts")
      .update({ 
        results_announced: true, 
        results_announcement_date: announcementDate || null 
      })
      .eq("id", cohort.id);
    setLoading(false);
    onAnnounced();
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    backgroundColor: "#0d0f14",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#f0f0f0",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <SlideOver open={open} title="Announce Results" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <p style={{ fontSize: "0.8125rem", color: "#888888", margin: "0 0 4px" }}>Cohort</p>
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "#f0f0f0", margin: 0 }}>{cohort?.title}</p>
        </div>

        {winnersCount === 0 && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            gap: "12px",
          }}>
            <AlertTriangle size={18} style={{ color: "#f87171", flexShrink: 0 }} />
            <p style={{ fontSize: "0.875rem", color: "#fca5a5", margin: 0, lineHeight: 1.4 }}>
              No projects in this cohort have a prize place set yet. Mark winners in the Projects tab before announcing — announcing now will show a results page with no winners.
            </p>
          </div>
        )}

        {winnersCount !== null && winnersCount > 0 && (
          <div style={{
            backgroundColor: "rgba(20, 241, 149, 0.1)",
            border: "1px solid rgba(20, 241, 149, 0.3)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            gap: "12px",
          }}>
            <CheckCircle2 size={18} style={{ color: "#14F195", flexShrink: 0 }} />
            <p style={{ fontSize: "0.875rem", color: "#f0f0f0", margin: 0, lineHeight: 1.4 }}>
              {winnersCount} winner{winnersCount > 1 ? "s" : ""} marked for this cohort. Ready to announce.
            </p>
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", color: "#888888", marginBottom: "8px" }}>
            Results announcement date (optional, for reference)
          </label>
          <input
            type="date"
            value={announcementDate}
            onChange={(e) => setAnnouncementDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleAnnounce}
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#ffba08",
            color: "#0b0c0f",
            fontWeight: 600,
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            fontFamily: "inherit",
          }}
        >
          {loading ? "Announcing..." : "Announce Results Now"}
        </button>
      </div>
    </SlideOver>
  );
}
