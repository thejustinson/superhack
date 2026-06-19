"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useUploadThing } from "@/lib/uploadthing";
import { Loader2, CheckCircle, User, Lock, Trash2, Camera, Globe, Check } from "lucide-react";
import { UsernameInput, UsernameStatus } from "@/components/ui/UsernameInput";

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  backgroundColor: "#0d0f14",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#f0f0f0",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  color: "#888888",
  fontWeight: 500,
  marginBottom: "7px",
};

export default function DashboardProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("avatarUploader", {
    onUploadBegin: () => setUploadingAvatar(true),
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        const url = res[0].url;
        setAvatarUrl(url);
        supabase.from("profiles").update({ avatar_url: url }).eq("id", user!.id).then(() => refreshProfile());
      }
      setUploadingAvatar(false);
    },
    onUploadError: () => setUploadingAvatar(false),
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setUsername(profile.username ?? "");
      setAbout(profile.about ?? "");
      setTwitterUrl(profile.twitter_url ?? "");
      setGithubUrl(profile.github_url ?? "");
      setWebsiteUrl(profile.website_url ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  async function handleSave() {
    if (!user || !fullName.trim()) return;
    if (username && usernameStatus === "taken") { setError("Choose a different username."); return; }
    setSaving(true); setError("");
    const updateData: Record<string, any> = {
      full_name: fullName.trim(),
      about: about.trim() || null,
      twitter_url: twitterUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      website_url: websiteUrl.trim() || null,
    };
    if (username && usernameStatus === "available") updateData.username = slugify(username);
    if (username === profile?.username) updateData.username = username;
    const { error: err } = await supabase.from("profiles").update(updateData as any).eq("id", user.id);
    if (err) { setError(err.message); setSaving(false); return; }
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    await startUpload(files);
  }

  const initials = (profile?.full_name ?? user?.email ?? "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "560px" }}
    >
      <motion.div variants={fadeUp}>
        <h1 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.75rem", fontWeight: 900, color: "#f0f0f0", margin: "0 0 4px" }}>Profile</h1>
        <p style={{ color: "#888888", fontSize: "0.875rem", margin: 0 }}>Manage your public builder profile.</p>
      </motion.div>

      {/* Avatar card */}
      <motion.div variants={fadeUp} style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,186,8,0.2)" }} />
          ) : (
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "rgba(255,186,8,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 900, fontSize: "1.25rem", color: "#ffba08", border: "2px solid rgba(255,186,8,0.15)" }}>
              {initials}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            style={{ position: "absolute", bottom: 0, right: 0, width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#ffba08", border: "2px solid #111318", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            {uploadingAvatar ? <Loader2 size={12} style={{ color: "#0b0c0f", animation: "spin 0.8s linear infinite" }} /> : <Camera size={12} style={{ color: "#0b0c0f" }} />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFile} />
        </div>
        <div>
          <p style={{ fontWeight: 600, color: "#f0f0f0", margin: "0 0 2px", fontSize: "0.9375rem" }}>{profile?.full_name || "Builder"}</p>
          <p style={{ color: "#888888", margin: 0, fontSize: "0.8125rem" }}>{profile?.username ? `@${profile.username}` : user?.email}</p>
          <p style={{ color: "#555", margin: "4px 0 0", fontSize: "0.75rem" }}>Click the camera to change your photo</p>
        </div>
      </motion.div>

      {/* Main profile card */}
      <motion.div variants={fadeUp} style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Full name */}
        <div>
          <label style={labelStyle}>Full name</label>
          <input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
        </div>

        {/* Username */}
        <div>
          <label style={labelStyle}>Username</label>
          <UsernameInput
            value={username}
            onChange={setUsername}
            status={usernameStatus}
            onStatusChange={setUsernameStatus}
            userId={user?.id}
            currentUsername={profile?.username}
            isDashboard
          />
        </div>

        {/* About */}
        <div>
          <label style={labelStyle}>About</label>
          <textarea
            value={about}
            onChange={e => setAbout(e.target.value)}
            placeholder="Tell the community about yourself..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
        </div>

        {/* Email read-only */}
        <div>
          <label style={labelStyle}>Email <span style={{ color: "#555" }}>(read-only)</span></label>
          <div style={{ position: "relative" }}>
            <input style={{ ...inputStyle, color: "#555", cursor: "not-allowed", paddingRight: "40px" }} value={user?.email ?? ""} readOnly />
            <Lock size={13} style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", color: "#444" }} />
          </div>
        </div>

        {/* Social divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#888888", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Social Links</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Twitter / X</label>
              <input style={inputStyle} value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} placeholder="https://x.com/yourname"
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
            </div>
            <div>
              <label style={labelStyle}>GitHub</label>
              <input style={inputStyle} value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/yourname"
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
            </div>
            <div>
              <label style={labelStyle}>Website</label>
              <input style={inputStyle} value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com"
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,186,8,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} />
            </div>
          </div>
        </div>

        {error && <p style={{ color: "#f87171", fontSize: "0.8125rem", margin: 0 }}>{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !fullName.trim()}
          style={{
            backgroundColor: saved ? "rgba(20,241,149,0.15)" : "#ffba08",
            color: saved ? "#14F195" : "#0b0c0f",
            border: saved ? "1px solid rgba(20,241,149,0.3)" : "none",
            fontWeight: 600, fontSize: "0.9375rem", padding: "11px 0",
            borderRadius: "9px", cursor: saving ? "wait" : "pointer",
            fontFamily: "inherit", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: (!fullName.trim() && !saving) ? 0.5 : 1,
          }}
        >
          {saving ? (<><Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Saving...</>) : saved ? (<><CheckCircle size={15} /> Saved!</>) : ("Save changes")}
        </button>
      </motion.div>

      {/* Danger zone */}
      <motion.div variants={fadeUp} style={{ backgroundColor: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "14px", padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <Trash2 size={16} style={{ color: "#f87171" }} />
          <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#f87171", margin: 0 }}>Danger zone</h3>
        </div>
        <p style={{ color: "#888888", fontSize: "0.875rem", margin: "0 0 6px", lineHeight: 1.5 }}>To permanently delete your account and all associated data, please contact us directly.</p>
        <a href="mailto:superteamnigeria@gmail.com?subject=Account Deletion Request" style={{ color: "#f87171", fontSize: "0.8125rem", textDecoration: "underline" }}>Contact support to delete account</a>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

