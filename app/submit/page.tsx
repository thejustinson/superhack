"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Bell, 
  Check, 
  UploadCloud, 
  Rocket, 
  GitFork, 
  Globe, 
  Share2, 
  Send, 
  X,
  AlertCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/Badge";
import { getCountdown } from "@/lib/countdown";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 150 : -150,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 350, damping: 35 },
      opacity: { duration: 0.18 }
    }
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -150 : 150,
    opacity: 0,
    transition: {
      x: { type: "spring" as const, stiffness: 350, damping: 35 },
      opacity: { duration: 0.18 }
    }
  })
};

const inputBase: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#111318",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "8px",
  padding: "12px 16px",
  fontSize: "0.9375rem",
  color: "#f0f0f0",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  fontFamily: "var(--font-dm-sans), sans-serif",
  boxSizing: "border-box"
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#f0f0f0",
  display: "block",
  marginBottom: "8px"
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  boxSizing: "border-box"
};

export default function SubmitPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect non-authenticated or onboarding users
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth?next=/submit");
      } else if (!profile?.username) {
        router.push("/auth/onboarding");
      }
    }
  }, [user, profile, authLoading, router]);

  // Form State
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [selectedCohort, setSelectedCohort] = useState<any | null>(null);
  
  // Form fields
  const [projectName, setProjectName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Payments");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [solanaAddress, setSolanaAddress] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  
  // UI States
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  // Fetch active cohorts
  useEffect(() => {
    async function fetchActiveCohorts() {
      try {
        setLoadingCohorts(true);
        const { data } = await supabase
          .from("cohorts")
          .select("*, universities(*)")
          .eq("status", "active");
        
        setCohorts(data ?? []);
      } catch (err) {
        console.error("Failed to load active cohorts:", err);
      } finally {
        setLoadingCohorts(false);
      }
    }
    fetchActiveCohorts();
  }, []);

  const hasVerifiedUniversity = !!profile?.university_verified;
  const userUniversityId = profile?.university_id;

  // Filter & sort cohorts
  const universityCohorts = cohorts.filter(c => c.university_id === userUniversityId);
  const otherCohorts = cohorts.filter(c => c.university_id !== userUniversityId);
  
  // Show user's university cohort first
  const displayCohorts = userUniversityId 
    ? [...universityCohorts, ...otherCohorts] 
    : cohorts;

  const hasActiveCohortAtSchool = universityCohorts.length > 0;

  // Form helpers
  const getPrizeTotal = (prizePool: any): number => {
    if (!prizePool || typeof prizePool !== "object") return 0;
    return Object.values(prizePool as Record<string, number>).reduce((a, b) => a + b, 0);
  };

  const getInputFieldStyle = (field: string): React.CSSProperties => {
    const hasError = !!errors[field];
    const isFocused = focusedField === field;
    return {
      ...inputBase,
      border: hasError 
        ? "1px solid #f87171" 
        : isFocused 
        ? "1.5px solid #ffba08" 
        : "1px solid rgba(255, 255, 255, 0.07)",
      boxShadow: isFocused && !hasError ? "0 0 0 2px rgba(255, 186, 8, 0.1)" : "none"
    };
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!projectName.trim()) newErrors.projectName = "Project name is required";
    if (!tagline.trim()) {
      newErrors.tagline = "Tagline is required";
    } else if (tagline.length > 80) {
      newErrors.tagline = "Tagline must be 80 characters or less";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 100) {
      newErrors.description = "Description must be at least 100 characters";
    }
    if (!category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!githubUrl.trim()) {
      newErrors.githubUrl = "GitHub URL is required";
    } else if (!githubUrl.startsWith("http://") && !githubUrl.startsWith("https://")) {
      newErrors.githubUrl = "Please enter a valid URL (starting with https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedCohort) return;
      setDirection(1);
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      setDirection(1);
      setStep(3);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohort || !user) return;
    if (!validateStep3()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const project_slug = slugify(projectName);
      const slug = `${profile.username}/${project_slug}`;

      const { error } = await supabase.from("projects").insert({
        cohort_id: selectedCohort.id,
        user_id: user.id,
        name: projectName.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        category,
        logo_url: logoUrl || null,
        github_url: githubUrl.trim(),
        live_url: liveUrl.trim() || null,
        website_url: websiteUrl.trim() || null,
        twitter_url: twitterUrl.trim() || null,
        telegram_url: telegramUrl.trim() || null,
        solana_address: solanaAddress.trim() || null,
        screenshots: screenshots.length > 0 ? screenshots : null,
        project_slug,
        slug,
        status: "submitted"
      });

      if (error) throw error;

      router.push(`/${profile.username}/${project_slug}`);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(err.message || "Failed to submit project.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step Renders
  const renderProgressBar = () => {
    const stepsConfig = [
      { num: 1, label: "Hackathon" },
      { num: 2, label: "Project" },
      { num: 3, label: "Links" }
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", width: "100%", padding: "0 10px", boxSizing: "border-box" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "2px", backgroundColor: "rgba(255,255,255,0.06)", zIndex: 1, transform: "translateY(-50%)" }} />
          <div style={{
            position: "absolute", top: "50%", left: 0, height: "2px",
            backgroundColor: "#ffba08", zIndex: 2, transform: "translateY(-50%)",
            width: step === 1 ? "16.6%" : step === 2 ? "50%" : "83.3%",
            transition: "width 0.3s ease-out"
          }} />
          
          {stepsConfig.map((s) => {
            const isActive = step >= s.num;
            return (
              <div
                key={s.num}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  backgroundColor: isActive ? "#ffba08" : "#111318",
                  border: `2px solid ${isActive ? "#ffba08" : "rgba(255,255,255,0.1)"}`,
                  color: isActive ? "#0b0c0f" : "#888888",
                  fontWeight: 700, fontSize: "0.8125rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 3, position: "relative",
                  transition: "background-color 0.2s, border-color 0.2s, color 0.2s"
                }}
              >
                {step > s.num ? <Check size={14} strokeWidth={2.5} /> : s.num}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: "0.75rem", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {stepsConfig.map((s) => (
            <span key={s.num} style={{ color: step >= s.num ? "#ffba08" : "#888888", transition: "color 0.2s" }}>
              {s.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    if (hasVerifiedUniversity && !hasActiveCohortAtSchool) {
      return (
        <div style={{
          border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px",
          padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px"
        }}>
          <Bell size={32} style={{ color: "#888888" }} />
          <div>
            <h3 style={{ fontSize: "1.125rem", color: "#f0f0f0", margin: "0 0 8px", fontWeight: 600 }}>No active Superhack</h3>
            <p style={{ color: "#888888", margin: 0, fontSize: "0.9375rem" }}>There's no active Superhack at your school right now.</p>
          </div>
          <Link href="/apply" style={{
            backgroundColor: "rgba(255,255,255,0.08)", color: "#f0f0f0", fontWeight: 500,
            fontSize: "0.875rem", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", marginTop: "8px"
          }}>
            Alert Us to host in your school
          </Link>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {displayCohorts.map((cohort) => {
          const isUserSchool = cohort.university_id === userUniversityId;
          const isSelected = selectedCohort?.id === cohort.id;
          const prizePoolTotal = getPrizeTotal(cohort.prize_pool);
          const countdown = getCountdown(cohort.start_date, cohort.end_date);
          
          return (
            <div
              key={cohort.id}
              onClick={() => setSelectedCohort(cohort)}
              style={{
                width: "100%",
                backgroundColor: "#111318",
                border: isSelected ? "1.5px solid #ffba08" : "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxSizing: "border-box"
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "rgba(255, 186, 8, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                {cohort.scope === "faculty" && cohort.faculty_logo_url ? (
                  <img src={cohort.faculty_logo_url} alt="" style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "8px", flexShrink: 0 }} />
                ) : cohort.universities?.logo_url ? (
                  <img src={cohort.universities.logo_url} alt="" style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "8px", flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "8px",
                    backgroundColor: "rgba(255, 186, 8, 0.12)",
                    display: "flex", alignItems: "center",
                    fontSize: "0.875rem", fontWeight: 700, color: "#ffba08", flexShrink: 0,
                    justifyContent: "center"
                  }}>
                    {(cohort.universities?.name || "U").charAt(0)}
                  </div>
                )}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#888888", fontWeight: 500 }}>
                      {cohort.universities?.name} {cohort.scope === "faculty" && cohort.faculty_name ? `· ${cohort.faculty_name}` : ""}
                    </span>
                    {isUserSchool && (
                      <Badge variant="accent" style={{ fontSize: "0.6875rem", padding: "2px 8px" }}>Your school</Badge>
                    )}
                  </div>
                  <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.15rem", fontWeight: 700, color: "#f0f0f0", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cohort.title}
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.8rem", color: "#888888" }}>
                    <span>
                      {new Date(cohort.start_date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} - {new Date(cohort.end_date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span>·</span>
                    <span style={{ color: "#14F195", fontWeight: 500 }}>
                      Ends in {countdown.days}d {countdown.hours}h
                    </span>
                    {prizePoolTotal > 0 && (
                      <>
                        <span>·</span>
                        <span style={{ color: "#ffba08", fontWeight: 500 }}>${prizePoolTotal} Pool</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                width: "22px", height: "22px", borderRadius: "50%",
                border: isSelected ? "2px solid #ffba08" : "2px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: isSelected ? "#ffba08" : "transparent",
                flexShrink: 0
              }}>
                {isSelected && <Check size={14} style={{ color: "#0b0c0f", strokeWidth: 3 }} />}
              </div>
            </div>
          );
        })}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
          <button
            onClick={handleNext}
            disabled={!selectedCohort}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              backgroundColor: !selectedCohort ? "rgba(255,186,8,0.4)" : "#ffba08", color: "#0b0c0f",
              fontWeight: 600, fontSize: "0.9375rem", padding: "12px 28px", borderRadius: "8px", border: "none",
              cursor: !selectedCohort ? "not-allowed" : "pointer", transition: "opacity 0.2s"
            }}
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Project Name */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Project name <span style={{ color: "#ffba08" }}>*</span></label>
          <input
            type="text"
            placeholder="e.g. Solana Pay Checkout"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (errors.projectName) setErrors(prev => ({ ...prev, projectName: "" }));
            }}
            onFocus={() => setFocusedField("projectName")}
            onBlur={() => setFocusedField(null)}
            style={getInputFieldStyle("projectName")}
          />
          {errors.projectName && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "5px" }}>{errors.projectName}</span>}
          
          {/* Slug Preview */}
          <span style={{ display: "block", fontSize: "0.8rem", color: "#888888", marginTop: "6px", fontFamily: "monospace" }}>
            Preview slug: superhack.fun/{profile?.username || "username"}/{projectName ? slugify(projectName) : "project-name"}
          </span>
        </div>

        {/* Tagline */}
        <div style={fieldStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ ...labelStyle, margin: 0 }}>Tagline <span style={{ color: "#ffba08" }}>*</span></label>
            <span style={{ fontSize: "0.75rem", color: tagline.length > 80 ? "#f87171" : "#888888" }}>{tagline.length}/80</span>
          </div>
          <input
            type="text"
            placeholder="A short one-line description of your project"
            value={tagline}
            onChange={(e) => {
              setTagline(e.target.value.slice(0, 100)); // allow slightly over typing but validate
              if (errors.tagline) setErrors(prev => ({ ...prev, tagline: "" }));
            }}
            onFocus={() => setFocusedField("tagline")}
            onBlur={() => setFocusedField(null)}
            style={getInputFieldStyle("tagline")}
          />
          {errors.tagline && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "5px" }}>{errors.tagline}</span>}
        </div>

        {/* Description */}
        <div style={fieldStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ ...labelStyle, margin: 0 }}>Description <span style={{ color: "#ffba08" }}>*</span></label>
            <span style={{ fontSize: "0.75rem", color: description.length < 100 ? "#ffba08" : "#888888" }}>{description.length} chars (min 100)</span>
          </div>
          <textarea
            rows={5}
            placeholder="Markdown supported. Explain what you built, the problem it solves, and how it works."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
            }}
            onFocus={() => setFocusedField("description")}
            onBlur={() => setFocusedField(null)}
            style={{ ...getInputFieldStyle("description"), resize: "vertical" }}
          />
          {errors.description && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "5px" }}>{errors.description}</span>}
          <span style={{ fontSize: "0.75rem", color: "#666666", marginTop: "4px" }}>
            Explain what you built, the problem it solves, and how it works.
          </span>
        </div>

        {/* Category */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Category <span style={{ color: "#ffba08" }}>*</span></label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              ...inputBase,
              cursor: "pointer"
            }}
          >
            {["Payments", "Tokens", "Governance", "Identity", "DeFi", "Tools"].map(cat => (
              <option key={cat} value={cat} style={{ backgroundColor: "#111318", color: "#f0f0f0" }}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Project Logo Upload */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Project logo</label>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", backgroundColor: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "10px", padding: "20px" }}>
            {logoUrl ? (
              <div style={{ position: "relative" }}>
                <img src={logoUrl} alt="Logo Preview" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }} />
                <button type="button" onClick={() => setLogoUrl(null)} style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#f87171", border: "none", borderRadius: "50%", padding: "2px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "100%" }}>
                <UploadButton<OurFileRouter, "projectLogoUploader">
                  endpoint="projectLogoUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]?.url) setLogoUrl(res[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload failed: ${error.message}`);
                  }}
                  appearance={{
                    button: {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f0f0f0",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      padding: "8px 16px",
                      borderRadius: "6px",
                      height: "auto",
                      width: "auto",
                      cursor: "pointer"
                    },
                    allowedContent: { display: "none" }
                  }}
                />
                <span style={{ fontSize: "0.725rem", color: "#888888" }}>Max 4MB (Optional)</span>
              </div>
            )}
          </div>
        </div>

        {/* Step Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              backgroundColor: "transparent", border: "none", color: "#888888",
              fontSize: "0.9375rem", cursor: "pointer", padding: "8px"
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              backgroundColor: "#ffba08", color: "#0b0c0f",
              fontWeight: 600, fontSize: "0.9375rem", padding: "12px 28px", borderRadius: "8px", border: "none",
              cursor: "pointer", transition: "opacity 0.2s"
            }}
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <form onSubmit={handleFinalSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* GitHub URL */}
        <div style={fieldStyle}>
          <label style={labelStyle}>GitHub repository URL <span style={{ color: "#ffba08" }}>*</span></label>
          <div style={{ position: "relative" }}>
            <GitFork size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
            <input
              type="text"
              placeholder="https://github.com/your-username/repo-name"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                if (errors.githubUrl) setErrors(prev => ({ ...prev, githubUrl: "" }));
              }}
              onFocus={() => setFocusedField("githubUrl")}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputFieldStyle("githubUrl"), paddingLeft: "42px" }}
            />
          </div>
          {errors.githubUrl && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "5px" }}>{errors.githubUrl}</span>}
        </div>

        {/* Live URL */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Live deployment URL <span style={{ color: "#888888", fontWeight: 400 }}>(optional)</span></label>
          <div style={{ position: "relative" }}>
            <Globe size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
            <input
              type="text"
              placeholder="https://your-demo-url.vercel.app"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              onFocus={() => setFocusedField("liveUrl")}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputFieldStyle("liveUrl"), paddingLeft: "42px" }}
            />
          </div>
        </div>

        {/* Website URL */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Project website <span style={{ color: "#888888", fontWeight: 400 }}>(optional)</span></label>
          <div style={{ position: "relative" }}>
            <Globe size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
            <input
              type="text"
              placeholder="https://project-website.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              onFocus={() => setFocusedField("websiteUrl")}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputFieldStyle("websiteUrl"), paddingLeft: "42px" }}
            />
          </div>
        </div>

        {/* Social Link Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Twitter */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Twitter URL <span style={{ color: "#888888", fontWeight: 400 }}>(optional)</span></label>
            <div style={{ position: "relative" }}>
              <Share2 size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
              <input
                type="text"
                placeholder="https://x.com/username"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                onFocus={() => setFocusedField("twitterUrl")}
                onBlur={() => setFocusedField(null)}
                style={{ ...getInputFieldStyle("twitterUrl"), paddingLeft: "42px" }}
              />
            </div>
          </div>

          {/* Telegram */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Telegram URL <span style={{ color: "#888888", fontWeight: 400 }}>(optional)</span></label>
            <div style={{ position: "relative" }}>
              <Send size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
              <input
                type="text"
                placeholder="https://t.me/username"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                onFocus={() => setFocusedField("telegramUrl")}
                onBlur={() => setFocusedField(null)}
                style={{ ...getInputFieldStyle("telegramUrl"), paddingLeft: "42px" }}
              />
            </div>
          </div>
        </div>

        {/* Solana Address */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Solana program address <span style={{ color: "#888888", fontWeight: 400 }}>(optional)</span></label>
          <input
            type="text"
            placeholder="Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
            value={solanaAddress}
            onChange={(e) => setSolanaAddress(e.target.value)}
            onFocus={() => setFocusedField("solanaAddress")}
            onBlur={() => setFocusedField(null)}
            style={{ ...getInputFieldStyle("solanaAddress"), fontFamily: "monospace" }}
          />
          <span style={{ fontSize: "0.725rem", color: "#666666", marginTop: "4px" }}>
            Your deployed program address on devnet or mainnet.
          </span>
        </div>

        {/* Screenshots Multi-Upload */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Product screenshots <span style={{ color: "#888888", fontWeight: 400 }}>(optional, max 5)</span></label>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {screenshots.map((url, idx) => (
                <div key={idx} style={{ position: "relative", width: "90px", height: "60px" }}>
                  <img src={url} alt="Screenshot Preview" style={{ width: "100%", height: "100%", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button type="button" onClick={() => setScreenshots(prev => prev.filter((_, i) => i !== idx))} style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#f87171", border: "none", borderRadius: "50%", padding: "2px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            {screenshots.length < 5 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px", padding: "16px" }}>
                <UploadButton<OurFileRouter, "screenshotUploader">
                  endpoint="screenshotUploader"
                  onClientUploadComplete={(res) => {
                    if (res) {
                      const urls = res.map(r => r.url).filter(Boolean);
                      setScreenshots(prev => [...prev, ...urls].slice(0, 5));
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload failed: ${error.message}`);
                  }}
                  appearance={{
                    button: {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f0f0f0",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      padding: "8px 16px",
                      borderRadius: "6px",
                      height: "auto",
                      width: "auto",
                      cursor: "pointer"
                    },
                    allowedContent: { display: "none" }
                  }}
                />
                <span style={{ fontSize: "0.725rem", color: "#888888" }}>Upload screenshots (max 5)</span>
              </div>
            )}
          </div>
        </div>

        {submitError && (
          <div style={{ padding: "12px 16px", backgroundColor: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "0.875rem" }}>
            {submitError}
          </div>
        )}

        {/* Step Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              backgroundColor: "transparent", border: "none", color: "#888888",
              fontSize: "0.9375rem", cursor: "pointer", padding: "8px"
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              backgroundColor: submitting ? "rgba(255,186,8,0.7)" : "#ffba08", color: "#0b0c0f",
              fontWeight: 600, fontSize: "0.9375rem", padding: "14px 32px", borderRadius: "8px", border: "none",
              cursor: submitting ? "not-allowed" : "pointer", transition: "opacity 0.2s"
            }}
          >
            {submitting ? (
              <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Submitting...</>
            ) : (
              <><Rocket size={16} /> Submit project</>
            )}
          </button>
        </div>
      </form>
    );
  };

  // Render Gates loading
  if (authLoading || (user && !profile)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0c0f" }}>
        <Loader2 size={32} style={{ color: "#ffba08", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  // Verification Gate Overlay (modal prompt)
  const showVerificationPrompt = user && !authLoading && !profile?.university_verified;

  return (
    <AuthGuard>
      <Navbar />
      
      <main style={{ minHeight: "100vh", paddingTop: "120px", paddingBottom: "96px", backgroundColor: "#0b0c0f", color: "#f0f0f0" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px", boxSizing: "border-box" }}>
          
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
            <span style={{
              display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase", color: "#888888",
              backgroundColor: "rgba(255,255,255,0.06)", padding: "5px 12px",
              borderRadius: "999px", width: "fit-content",
            }}>
              Submit
            </span>
            <h1 style={{
              fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 900,
              fontSize: "clamp(2.25rem, 5vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.1, color: "#f0f0f0", margin: 0,
            }}>
              Submit your project
            </h1>
            <p style={{ color: "#888888", fontSize: "1rem", margin: 0, lineHeight: 1.5 }}>
              Share your program and web app link with the Superteam community.
            </p>
          </div>

          {/* Form Progress Bar */}
          {(!showVerificationPrompt && !(hasVerifiedUniversity && !hasActiveCohortAtSchool)) && renderProgressBar()}

          {/* Form container */}
          {loadingCohorts ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
              <Loader2 size={32} style={{ color: "#ffba08", animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <div style={{ position: "relative", overflow: "hidden", width: "100%", minHeight: "400px" }}>
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ width: "100%" }}
                >
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Verification Prompt Modal */}
      <AnimatePresence>
        {showVerificationPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: "#111318",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                padding: "40px",
                maxWidth: "440px",
                width: "100%",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px"
              }}
            >
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                backgroundColor: "rgba(255, 186, 8, 0.1)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Lock size={24} style={{ color: "#ffba08" }} />
              </div>
              
              <div>
                <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.35rem", fontWeight: 900, color: "#f0f0f0", margin: "0 0 8px" }}>
                  Verify your university email
                </h3>
                <p style={{ color: "#888888", fontSize: "0.9375rem", margin: 0, lineHeight: 1.6 }}>
                  To participate in Superhack cohorts and submit projects, you must first verify your student status.
                </p>
              </div>

              <Link
                href="/dashboard/university"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#ffba08",
                  color: "#0b0c0f",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                Go to verification
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AuthGuard>
  );
}

