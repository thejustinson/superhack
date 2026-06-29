"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Shield, ShieldOff, RefreshCw, Ban, Trash2,
  CheckCircle2, XCircle, Loader2, GraduationCap, Users,
  FolderGit2, ThumbsUp, UserPlus, ShieldCheck, AlertTriangle, Flag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/admin/StatCard";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  university_id: string | null;
  university_email: string | null;
  university_verified: boolean;
  university_verified_at: string | null;
  is_admin: boolean;
  is_flagged: boolean;
  flagged_reason: string | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  tagline: string | null;
  status: string;
  upvote_count: number;
  created_at: string;
}

interface CohortJoin {
  joined_at: string;
  cohorts: { id: string; title: string } | null;
}

interface VoteWithProject {
  created_at: string;
  projects: { name: string } | null;
}

interface TimelineEvent {
  type: "signup" | "verified" | "join" | "submission" | "upvote";
  date: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UserAvatar({ src, name, size = 64 }: { src?: string | null; name?: string | null; size?: number }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        onError={() => setErr(true)}
      />
    );
  }
  return <InitialsAvatar name={name ?? "?"} size={size} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h3
        style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "14px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  sublabel,
  onClick,
  variant = "default",
  loading = false,
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onClick: () => void;
  variant?: "default" | "warning" | "danger";
  loading?: boolean;
  disabled?: boolean;
}) {
  const colors = {
    default: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", text: "#f0f0f0", hoverBg: "rgba(255,255,255,0.07)" },
    warning: { bg: "rgba(251,146,60,0.06)", border: "rgba(251,146,60,0.2)", text: "#fb923c", hoverBg: "rgba(251,146,60,0.1)" },
    danger:  { bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.2)", text: "#f87171", hoverBg: "rgba(248,113,113,0.1)" },
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        borderRadius: "10px",
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        color: colors.text,
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: loading || disabled ? 0.5 : 1,
        transition: "background 0.15s",
        fontFamily: "DM Sans, system-ui, sans-serif",
        textAlign: "left",
      }}
      onMouseEnter={(e) => { if (!loading && !disabled) e.currentTarget.style.backgroundColor = colors.hoverBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.bg; }}
    >
      {loading ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }} /> : <Icon size={15} style={{ flexShrink: 0 }} />}
      <div>
        <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{label}</div>
        {sublabel && <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "1px" }}>{sublabel}</div>}
      </div>
    </button>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const statusColor = project.status === "winner" ? "#ffba08" : project.status === "submitted" ? "#4ade80" : "#888";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        gap: "12px",
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#f0f0f0" }}>{project.name}</p>
        {project.tagline && <p style={{ margin: 0, fontSize: "0.75rem", color: "#666", marginTop: "2px" }}>{project.tagline}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <span style={{ fontSize: "0.75rem", color: "#888", display: "flex", alignItems: "center", gap: "4px" }}>
          <ThumbsUp size={11} /> {project.upvote_count}
        </span>
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", backgroundColor: `${statusColor}18`, color: statusColor }}>
          {project.status}
        </span>
      </div>
    </div>
  );
}

const TIMELINE_CONFIG: Record<TimelineEvent["type"], { icon: React.ElementType; color: string }> = {
  signup:     { icon: UserPlus,    color: "#4ade80" },
  verified:   { icon: ShieldCheck, color: "#14F195" },
  join:       { icon: Users,       color: "#a78bfa" },
  submission: { icon: FolderGit2,  color: "#ffba08" },
  upvote:     { icon: ThumbsUp,    color: "#fb923c" },
};

function TimelineItem({ event }: { event: TimelineEvent }) {
  const { icon: Icon, color } = TIMELINE_CONFIG[event.type];
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: "16px" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#f0f0f0" }}>{event.label}</p>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "#555", marginTop: "2px" }}>
          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// Flag modal with optional reason input
function FlagModal({ onClose, onConfirm, loading }: { onClose: () => void; onConfirm: (reason: string) => void; loading: boolean }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", zIndex: 1, backgroundColor: "#181b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "28px", width: "420px", maxWidth: "90vw", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "rgba(251,146,60,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Flag size={18} style={{ color: "#fb923c" }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#f0f0f0", margin: "0 0 6px" }}>Flag account</h3>
            <p style={{ fontSize: "0.875rem", color: "#888", margin: 0, lineHeight: 1.5 }}>
              Flagged accounts are visible to admins only. Optionally add a reason.
            </p>
          </div>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          rows={2}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f0f0f0", padding: "10px 12px", fontSize: "0.875rem", fontFamily: "DM Sans, system-ui, sans-serif", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: "18px" }}
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={() => onConfirm(reason)} disabled={loading}
            style={{ backgroundColor: "rgba(251,146,60,0.12)", borderColor: "rgba(251,146,60,0.3)", color: "#fb923c" } as React.CSSProperties}>
            {loading ? "Flagging…" : "Flag account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Delete modal requiring typed username confirmation
function DeleteModal({ username, onClose, onConfirm, loading }: { username: string; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  const [typed, setTyped] = useState("");
  const confirmed = typed === username;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", zIndex: 1, backgroundColor: "#181b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "28px", width: "440px", maxWidth: "90vw", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={18} style={{ color: "#f87171" }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#f0f0f0", margin: "0 0 6px" }}>Delete account permanently</h3>
            <p style={{ fontSize: "0.875rem", color: "#888", margin: 0, lineHeight: 1.5 }}>
              This will delete the user&apos;s profile, projects, votes, and all associated data. <strong style={{ color: "#f0f0f0" }}>This cannot be undone.</strong>
            </p>
          </div>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "#888", margin: "0 0 8px" }}>
          Type <strong style={{ color: "#f0f0f0", fontFamily: "monospace" }}>{username}</strong> to confirm:
        </p>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={username}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${confirmed ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", color: "#f0f0f0", padding: "10px 12px", fontSize: "0.875rem", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "18px", transition: "border-color 0.15s" }}
          autoFocus
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={onConfirm} disabled={!confirmed || loading}>
            {loading ? "Deleting…" : "Delete account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [joins, setJoins] = useState<CohortJoin[]>([]);
  const [votes, setVotes] = useState<VoteWithProject[]>([]);
  const [university, setUniversity] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; confirmLabel: string; action: () => Promise<void> } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !profileData) { setNotFound(true); setLoading(false); return; }
      setProfile(profileData as Profile);

      const [{ data: projectData }, { data: joinData }, { data: voteData }] = await Promise.all([
        supabase.from("projects").select("id, name, tagline, status, upvote_count, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("cohort_participants").select("joined_at, cohorts(id, title)").eq("user_id", userId),
        supabase.from("votes").select("created_at, projects(name)").eq("user_id", userId),
      ]);

      setProjects((projectData ?? []) as Project[]);
      setJoins((joinData ?? []) as unknown as CohortJoin[]);
      setVotes((voteData ?? []) as unknown as VoteWithProject[]);

      if (profileData.university_id) {
        const { data: uni } = await supabase.from("universities").select("name").eq("id", profileData.university_id).single();
        setUniversity(uni);
      }

      setLoading(false);
    }
    load();
  }, [userId]);

  // ── Timeline assembly ──────────────────────────────────────────────────
  const timeline: TimelineEvent[] = profile ? ([
    { type: "signup",     date: profile.created_at,              label: "Joined Superhack" },
    ...(profile.university_verified_at
      ? [{ type: "verified" as const, date: profile.university_verified_at, label: "Verified university email" }]
      : []),
    ...joins.map((j) => ({ type: "join" as const, date: j.joined_at, label: `Joined cohort: ${j.cohorts?.title ?? "Unknown"}` })),
    ...projects.map((p) => ({ type: "submission" as const, date: p.created_at, label: `Submitted project: ${p.name}` })),
    ...votes.map((v) => ({ type: "upvote" as const, date: v.created_at, label: `Upvoted: ${v.projects?.name ?? "a project"}` })),
  ] as TimelineEvent[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  // ── Action handlers ────────────────────────────────────────────────────
  function openConfirm(title: string, message: string, confirmLabel: string, action: () => Promise<void>) {
    setConfirmModal({ title, message, confirmLabel, action });
  }

  async function runConfirm() {
    if (!confirmModal) return;
    setConfirmLoading(true);
    await confirmModal.action();
    setConfirmLoading(false);
    setConfirmModal(null);
  }

  async function handleToggleAdmin() {
    if (!profile) return;
    await supabase.from("profiles").update({ is_admin: !profile.is_admin }).eq("id", userId);
    setProfile((p) => p ? { ...p, is_admin: !p.is_admin } : p);
  }

  async function handleResetVerification() {
    await supabase.from("profiles").update({
      university_verified: false,
      university_id: null,
      university_email: null,
      university_verified_at: null,
    }).eq("id", userId);
    setProfile((p) => p ? { ...p, university_verified: false, university_id: null, university_email: null, university_verified_at: null } : p);
    setUniversity(null);
  }

  async function handleFlag(reason: string) {
    setFlagLoading(true);
    await supabase.from("profiles").update({ is_flagged: true, flagged_reason: reason || null }).eq("id", userId);
    setProfile((p) => p ? { ...p, is_flagged: true, flagged_reason: reason || null } : p);
    setFlagLoading(false);
    setShowFlagModal(false);
  }

  async function handleUnflag() {
    await supabase.from("profiles").update({ is_flagged: false, flagged_reason: null }).eq("id", userId);
    setProfile((p) => p ? { ...p, is_flagged: false, flagged_reason: null } : p);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    await supabase.from("profiles").delete().eq("id", userId);
    router.push("/admin/users");
  }

  const totalUpvotes = projects.reduce((s, p) => s + (p.upvote_count ?? 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(255,186,8,0.15)", borderTopColor: "#ffba08", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div>
        <Link href="/admin/users" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", color: "#888", textDecoration: "none", marginBottom: "24px" }}>
          <ArrowLeft size={15} /> Back to users
        </Link>
        <p style={{ color: "#888" }}>User not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link href="/admin/users" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", color: "#888", textDecoration: "none", marginBottom: "28px", transition: "color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f0")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
      >
        <ArrowLeft size={15} /> Back to users
      </Link>

      {/* Flag banner */}
      {profile.is_flagged && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", backgroundColor: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: "10px", marginBottom: "24px" }}>
          <Flag size={14} style={{ color: "#fb923c", flexShrink: 0 }} />
          <span style={{ fontSize: "0.875rem", color: "#fb923c" }}>
            This account is flagged{profile.flagged_reason ? `: ${profile.flagged_reason}` : ""}.
          </span>
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 272px", gap: "32px", alignItems: "flex-start" }} className="user-detail-grid">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div>
          {/* Profile header */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
            <UserAvatar src={profile.avatar_url} name={profile.full_name} size={64} />
            <div>
              <h1 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.375rem", fontWeight: 700, color: "#f0f0f0", margin: 0 }}>
                {profile.full_name ?? "Unnamed user"}
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#888", margin: "3px 0 0" }}>
                {profile.username ? `@${profile.username} · ` : ""}{profile.email ?? "No email"}
              </p>
            </div>
          </div>

          {/* Mini stat grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
            <StatCard label="Projects" value={projects.length} />
            <StatCard label="Upvotes received" value={totalUpvotes} />
            <StatCard label="Cohorts joined" value={joins.length} />
            <StatCard label="Member since" value={new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })} />
          </div>

          {/* University status */}
          <Section title="University status">
            {profile.university_verified ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "#14F195" }}>
                <CheckCircle2 size={16} />
                Verified — {university?.name ?? "Unknown university"}{profile.university_email ? ` (${profile.university_email})` : ""}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "#888" }}>
                <XCircle size={16} /> Not verified
              </div>
            )}
          </Section>

          {/* Projects */}
          <Section title={`Projects (${projects.length})`}>
            {projects.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "#555" }}>No projects submitted.</p>
            ) : (
              projects.map((p) => <ProjectRow key={p.id} project={p} />)
            )}
          </Section>

          {/* Activity timeline */}
          <Section title="Activity timeline">
            {timeline.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "#555" }}>No activity yet.</p>
            ) : (
              timeline.map((event, i) => <TimelineItem key={i} event={event} />)
            )}
          </Section>
        </div>

        {/* ── RIGHT COLUMN (sticky) ───────────────────────────────────── */}
        <aside style={{ position: "sticky", top: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>
            Account actions
          </p>

          <ActionButton
            icon={profile.is_admin ? ShieldOff : Shield}
            label={profile.is_admin ? "Remove admin" : "Make admin"}
            sublabel={profile.is_admin ? "Revoke admin privileges" : "Grant admin access"}
            onClick={() => openConfirm(
              profile.is_admin ? "Remove admin access" : "Grant admin access",
              profile.is_admin
                ? `${profile.full_name ?? "This user"} will lose all admin privileges immediately.`
                : `${profile.full_name ?? "This user"} will have full access to the admin panel.`,
              profile.is_admin ? "Remove admin" : "Grant admin",
              handleToggleAdmin
            )}
          />

          <ActionButton
            icon={RefreshCw}
            label="Reset verification"
            sublabel="Clear university status"
            onClick={() => openConfirm(
              "Reset university verification",
              "This will clear their verified email and university association. They'll need to verify again.",
              "Reset",
              handleResetVerification
            )}
            disabled={!profile.university_verified}
          />

          {profile.is_flagged ? (
            <ActionButton
              icon={Flag}
              label="Remove flag"
              sublabel="Clear flagged status"
              onClick={() => openConfirm(
                "Remove flag",
                "This will clear the flag and reason from this account.",
                "Remove flag",
                handleUnflag
              )}
              variant="warning"
            />
          ) : (
            <ActionButton
              icon={Ban}
              label="Flag account"
              sublabel="Mark for review"
              onClick={() => setShowFlagModal(true)}
              variant="warning"
            />
          )}

          <ActionButton
            icon={Trash2}
            label="Delete account"
            sublabel="Permanently remove all data"
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
          />
        </aside>
      </div>

      {/* Responsive style */}
      <style>{`
        @media (max-width: 768px) {
          .user-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Standard confirm modal */}
      {confirmModal && (
        <ConfirmModal
          open
          onClose={() => setConfirmModal(null)}
          onConfirm={runConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          loading={confirmLoading}
        />
      )}

      {/* Flag modal */}
      {showFlagModal && (
        <FlagModal
          onClose={() => setShowFlagModal(false)}
          onConfirm={handleFlag}
          loading={flagLoading}
        />
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <DeleteModal
          username={profile.username ?? profile.email ?? profile.id}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
