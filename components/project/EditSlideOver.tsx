"use client";

import { useState } from "react";
import { X, Loader2, Info, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface EditSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string | null;
    tagline: string | null;
    logo_url: string | null;
    github_url: string | null;
    live_url: string | null;
    website_url: string | null;
    twitter_url: string | null;
    telegram_url: string | null;
    solana_address: string | null;
    screenshots: string[] | null;
  };
  onSave: () => void;
}

export function EditSlideOver({ isOpen, onClose, project, onSave }: EditSlideOverProps) {
  const [name, setName] = useState(project.name);
  const [tagline, setTagline] = useState(project.tagline || "");
  const [description, setDescription] = useState(project.description || "");
  const [logoUrl, setLogoUrl] = useState(project.logo_url || "");
  const [githubUrl, setGithubUrl] = useState(project.github_url || "");
  const [liveUrl, setLiveUrl] = useState(project.live_url || "");
  const [websiteUrl, setWebsiteUrl] = useState(project.website_url || "");
  const [twitterUrl, setTwitterUrl] = useState(project.twitter_url || "");
  const [telegramUrl, setTelegramUrl] = useState(project.telegram_url || "");
  const [solanaAddress, setSolanaAddress] = useState(project.solana_address || "");
  const [screenshots, setScreenshots] = useState<string[]>(project.screenshots || []);
  const [newScreenshot, setNewScreenshot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddScreenshot() {
    if (!newScreenshot.trim()) return;
    if (screenshots.length >= 5) {
      setError("Maximum of 5 screenshots allowed.");
      return;
    }
    setScreenshots([...screenshots, newScreenshot.trim()]);
    setNewScreenshot("");
    setError(null);
  }

  function handleRemoveScreenshot(index: number) {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Project Name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          name: name.trim(),
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          logo_url: logoUrl.trim() || null,
          github_url: githubUrl.trim() || null,
          live_url: liveUrl.trim() || null,
          website_url: websiteUrl.trim() || null,
          twitter_url: twitterUrl.trim() || null,
          telegram_url: telegramUrl.trim() || null,
          solana_address: solanaAddress.trim() || null,
          screenshots: screenshots.length > 0 ? screenshots : null,
        })
        .eq("id", project.id);

      if (updateError) throw updateError;
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong saving the project.");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#888888",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "6px",
    padding: "10px 14px",
    color: "#f0f0f0",
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s, background-color 0.2s",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: "vertical",
    minHeight: "120px",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 999,
            }}
          />

          {/* Slide Over Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "100%",
              maxWidth: "540px",
              height: "100%",
              backgroundColor: "#111318",
              borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: "#f0f0f0",
                    margin: 0,
                  }}
                >
                  Edit Project Details
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#888888", margin: "4px 0 0 0" }}>
                  Elevate your project listing with rich metadata.
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888888",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {error && (
                <div
                  style={{
                    backgroundColor: "rgba(248, 113, 113, 0.08)",
                    border: "1px solid rgba(248, 113, 113, 0.3)",
                    borderRadius: "6px",
                    padding: "12px",
                    color: "#f87171",
                    fontSize: "0.8125rem",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Project Name */}
              <label style={labelStyle}>
                Project Name *
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. SolFund"
                />
              </label>

              {/* Tagline */}
              <label style={labelStyle}>
                Tagline
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  style={inputStyle}
                  placeholder="A concise, hooky sentence description"
                />
              </label>

              {/* Logo URL */}
              <label style={labelStyle}>
                Logo Image URL
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  style={inputStyle}
                  placeholder="https://example.com/logo.png"
                />
              </label>

              {/* Description (Markdown support note) */}
              <label style={labelStyle}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  Description (Markdown Supported)
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", textTransform: "none", fontWeight: 400, color: "#ffba08" }}>
                    <Info size={12} /> Rich editing enabled
                  </span>
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={textareaStyle}
                  placeholder="Tell the community about your project... Support # headers, **bold**, *italics*, and lists!"
                />
              </label>

              {/* Solana Address */}
              <label style={labelStyle}>
                Solana Wallet Address (Optional)
                <input
                  type="text"
                  value={solanaAddress}
                  onChange={(e) => setSolanaAddress(e.target.value)}
                  style={inputStyle}
                  placeholder="For prize payouts"
                />
              </label>

              {/* External Links */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <label style={labelStyle}>
                  GitHub Link
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    style={inputStyle}
                    placeholder="https://github.com/..."
                  />
                </label>
                <label style={labelStyle}>
                  Live Application Link
                  <input
                    type="text"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    style={inputStyle}
                    placeholder="https://..."
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <label style={labelStyle}>
                  Website URL (Optional)
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    style={inputStyle}
                    placeholder="https://solfund.org"
                  />
                </label>
                <label style={labelStyle}>
                  Twitter Profile URL
                  <input
                    type="text"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    style={inputStyle}
                    placeholder="https://twitter.com/..."
                  />
                </label>
              </div>

              <label style={labelStyle}>
                Telegram Group URL
                <input
                  type="text"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  style={inputStyle}
                  placeholder="https://t.me/..."
                />
              </label>

              {/* Screenshots Array */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={labelStyle}>Screenshots (Max 5)</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={newScreenshot}
                    onChange={(e) => setNewScreenshot(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="https://example.com/screenshot.jpg"
                  />
                  <button
                    onClick={handleAddScreenshot}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "6px",
                      color: "#f0f0f0",
                      width: "42px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Screenshots List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  {screenshots.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        padding: "8px 12px",
                        borderRadius: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#888888",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          maxWidth: "360px",
                        }}
                      >
                        {url}
                      </span>
                      <button
                        onClick={() => handleRemoveScreenshot(idx)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#f87171",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div
              style={{
                padding: "24px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={onClose}
                disabled={loading}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  padding: "10px 20px",
                  color: "#888888",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  backgroundColor: "#ffba08",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 24px",
                  color: "#0b0c0f",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </ AnimatePresence>
  );
}
