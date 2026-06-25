"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCohortBySlug } from "@/lib/cohorts";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { CohortResults } from "@/components/ui/CohortResults";
import { Loader2, Calendar, Trophy, Send, Award, Bell, Clock, Video, BookOpen, Hammer, FolderGit2, CheckCircle2, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { projectPath, formatDateTimeRange } from "@/lib/utils";

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatDateRange(startStr?: string | null, endStr?: string | null) {
  if (!startStr || !endStr) return "";
  try {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const startOpt: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
    const endOpt: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
    return `${start.toLocaleDateString("en-US", startOpt)} — ${end.toLocaleDateString("en-US", endOpt)}`;
  } catch {
    return "";
  }
}

function DotClusterPattern({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-0 bottom-0 ${
        side === "left"
          ? "left-0 w-full sm:w-1/2 opacity-25 sm:opacity-50"
          : "right-0 w-1/2 hidden sm:block opacity-35"
      }`}
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,186,8,0.35) 1.5px, transparent 1.5px)",
        backgroundSize: "14px 14px",
        maskImage: side === "left"
          ? "radial-gradient(ellipse 80% 60% at 10% 50%, black 20%, transparent 75%)"
          : "radial-gradient(ellipse 80% 60% at 90% 50%, black 20%, transparent 75%)",
        WebkitMaskImage: side === "left"
          ? "radial-gradient(ellipse 80% 60% at 10% 50%, black 20%, transparent 75%)"
          : "radial-gradient(ellipse 80% 60% at 90% 50%, black 20%, transparent 75%)",
      }}
    />
  );
}

interface JoinButtonProps {
  cohort: any;
  onJoinSuccess?: () => void;
}

function JoinButton({ cohort, onJoinSuccess }: JoinButtonProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [participant, setParticipant] = useState<{ id: string } | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    Promise.all([
      supabase.from("cohort_participants").select("id").eq("cohort_id", cohort.id).eq("user_id", user.id).maybeSingle(),
      supabase.from("projects").select("id, project_slug").eq("cohort_id", cohort.id).eq("user_id", user.id).maybeSingle(),
    ]).then(([p, proj]) => {
      setParticipant(p.data);
      setHasSubmitted(!!proj.data);
      if (proj.data?.project_slug) {
        setProjectSlug(proj.data.project_slug);
      }
      setLoading(false);
    });
  }, [user, cohort.id]);

  async function handleJoin() {
    if (!user) {
      router.push(`/auth?next=/hackathons/${cohort.slug}`);
      return;
    }
    if (!profile?.university_verified || profile.university_id !== cohort.university_id) {
      router.push("/dashboard/university?reason=join");
      return;
    }
    setJoining(true);
    const { data, error } = await supabase
      .from("cohort_participants")
      .insert({ cohort_id: cohort.id, user_id: user.id })
      .select("id")
      .single();

    if (error) {
      console.error("Error joining cohort:", error);
    } else {
      setParticipant(data);
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    }
    setJoining(false);
  }

  if (loading) return null;

  if (hasSubmitted && profile) {
    return (
      <Link
        href={projectPath(profile.username || "", projectSlug || "")}
        className="inline-flex items-center gap-2 bg-surface border border-white/[0.07] text-text px-6 py-3 rounded-lg font-semibold text-sm hover:bg-white/[0.02] transition-colors"
      >
        <CheckCircle2 size={16} className="text-[#14F195]" />
        View your submission
      </Link>
    );
  }

  if (participant) {
    return (
      <div className="inline-flex flex-col items-center gap-3">
        <span className="inline-flex items-center gap-2 bg-[#14F195]/10 border border-[#14F195]/30 text-[#14F195] px-5 py-2.5 rounded-lg font-semibold text-sm">
          <CheckCircle2 size={16} />
          You've joined this cohort
        </span>
        {cohort.status === "active" && (
          <Link href="/submit" className="text-sm text-accent font-medium hover:underline">
            Submit your project →
          </Link>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleJoin}
      disabled={joining}
      className="bg-accent text-bg font-semibold px-7 py-3 rounded-lg text-sm disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer"
    >
      {joining ? "Joining..." : "Join this cohort"}
    </button>
  );
}

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user, profile } = useAuth();
  
  const [cohort, setCohort] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadHackathonData();
    }
  }, [slug]);

  const loadHackathonData = async () => {
    setLoading(true);
    try {
      // Sync cohort status
      try {
        await supabase.rpc("sync_cohort_status");
      } catch (err) {
        console.error("Failed to sync cohort status:", err);
      }

      const data = await getCohortBySlug(slug);
      if (!data) {
        router.push("/hackathons");
        return;
      }
      setCohort(data);

      // Fetch participant count
      const { count: partCount } = await supabase
        .from("cohort_participants")
        .select("id", { count: "exact", head: true })
        .eq("cohort_id", data.id);
      setParticipantCount(partCount || 0);

      // Fetch projects for this cohort
      const { data: projs } = await supabase
        .from("projects")
        .select(`
          *,
          profiles!user_id (
            full_name,
            username,
            avatar_url
          ),
          cohorts (
            title,
            slug,
            universities (name, slug)
          )
        `)
        .eq("cohort_id", data.id);

      // Format projects to match ProjectCardProps
      const formattedProjs = (projs || []).map((p: any) => ({
        ...p,
        builder: {
          full_name: p.profiles?.full_name || "Anonymous",
          username: p.profiles?.username || "",
          avatar_url: p.profiles?.avatar_url || null,
        },
        cohort: {
          title: data.title,
          slug: data.slug,
        },
        university: data.universities ? {
          name: data.universities.name,
          slug: data.universities.slug,
        } : null,
      }));

      setProjects(formattedProjs);
    } catch (err) {
      console.error("Error loading hackathon:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !cohort) {
    return (
      <>
        <Navbar />
        <div style={{ display: "flex", flex: 1, minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0c0f" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "#ffba08" }} />
        </div>
        <Footer />
      </>
    );
  }

  const statusVariant =
    cohort.status === "active" ? "status-active"
    : cohort.status === "upcoming" ? "status-upcoming"
    : "status-past";

  // const scopeLabel = cohort.scope === "faculty" && cohort.faculty_name
  //   ? `${cohort.faculty_name} · ${cohort.universities?.name || ""}`
  //   : (cohort.universities?.name || "");
  const totalPrize = 200;
  const isCohortActive = cohort.status === "active";
  const userMatchesUniversity = profile?.university_id === cohort.university_id;
  const isVerified = !!profile?.university_verified;

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen text-text pt-[120px] pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          
          {/* Breadcrumb & Hero */}
          <div className="mb-12">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link href="/hackathons" className="text-sm text-muted hover:text-text transition-colors">
                ← All Hackathons
              </Link>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-6 sm:px-10">
              {/* Dot cluster background — two soft clusters, left and right, fading toward center */}
              <div className="absolute inset-0 pointer-events-none">
                <DotClusterPattern side="left" />
                <DotClusterPattern side="right" />
              </div>

              <div className="relative z-10 max-w-2xl mx-auto text-center">
                {/* <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent border border-accent/30 bg-accent/10 rounded-full px-3 py-1 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {scopeLabel}
                </div> */}

                <h1 className="text-3xl sm:text-5xl font-extrabold text-text leading-tight tracking-tight mb-4">
                  {cohort.title}
                </h1>

                <p className="text-sm text-muted mb-8 max-w-md mx-auto">
                  {formatDateTimeRange(cohort.start_date, cohort.end_date)} · ${totalPrize} prize pool
                </p>

                <div className="flex flex-col items-center">
                  <JoinButton cohort={cohort} onJoinSuccess={() => setParticipantCount(prev => prev + 1)} />

                  {cohort.show_participant_count && (
                    <p className="text-xs text-muted text-center mt-3">
                      <Users size={13} className="inline mr-1.5 -mt-0.5" />
                      {participantCount} builder{participantCount !== 1 ? "s" : ""} joined
                    </p>
                  )}

                  {cohort.status !== "past" && (
                    <CountdownTimer startDate={cohort.start_date} endDate={cohort.end_date} className="mt-2" />
                  )}

                  {cohort.kickoff_meeting_url && cohort.status === 'active' && (
                    <a
                      href={cohort.kickoff_meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-surface border border-white/[0.07] rounded-lg px-4 py-2.5 text-sm font-medium hover:border-accent/30 transition-colors mt-4"
                    >
                      <Video size={16} className="text-accent" />
                      Join kickoff meeting
                    </a>
                  )}
                </div>

                {cohort.status === "past" && (
                  <div className="mt-10">
                    {cohort.results_announced ? (
                      <div className="text-sm text-muted">
                        This hackathon has ended. Results have been announced!
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-2 text-muted">
                        <Clock size={16} className="text-muted" />
                        <span className="text-sm font-semibold text-text">
                          This hackathon has ended.
                        </span>
                        <span className="text-xs text-muted">
                          {cohort.results_announcement_date
                            ? `Results will be announced on ${formatDate(cohort.results_announcement_date)}.`
                            : "Results will be announced soon. Check back here."}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Prize Breakdown Section */}
          <section className="mb-12">
            <h2 className="text-lg font-bold text-text mb-4">Prize Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* 1st Place Card */}
              <div className="bg-surface border border-white/[0.07] rounded-xl py-6 px-4 text-center">
                <Trophy size={20} className="text-accent mx-auto mb-3" />
                <span className="text-[10px] text-muted uppercase tracking-wider block">1st Place</span>
                <span className="text-2xl font-black text-text block my-1.5">$100</span>
                <span className="text-xs text-muted">School fees contribution</span>
              </div>
              
              {/* 2nd Place Card */}
              <div className="bg-surface border border-white/[0.07] rounded-xl py-6 px-4 text-center">
                <Award size={20} className="text-muted mx-auto mb-3" />
                <span className="text-[10px] text-muted uppercase tracking-wider block">2nd Place</span>
                <span className="text-2xl font-black text-text block my-1.5">$100</span>
                <span className="text-xs text-muted">School fees contribution</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-muted/70 leading-snug max-w-xl mx-auto">
                Contributions are capped at $100 per winner and paid in USDC on Solana. Winners are selected by the Superteam Nigeria judging panel.
              </p>
            </div>
          </section>

          {/* Luma Demo Day Link */}
          {cohort.luma_event_url && (
            <section className="mb-12">
              <h2 className="text-lg font-bold text-text mb-4">Demo Day</h2>
              <div className="rounded-2xl border mt-4 border-white/[0.07] bg-surface p-6 flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm text-muted">Register to attend and watch builders present live.</p>
                <a
                  href={cohort.luma_event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent text-bg font-semibold px-5 py-2.5 rounded-lg text-sm shrink-0 hover:opacity-90 transition-opacity"
                >
                  Register for Demo Day
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </section>
          )}

          {/* Dynamic Banner CTA based on Eligibility */}
          {isCohortActive && (
            <section className="mb-12">
              {user ? (
                isVerified ? (
                  userMatchesUniversity ? (
                    <div className="bg-[#14f195]/[0.06] border border-[#14f195]/20 rounded-xl p-8 flex flex-wrap justify-between items-center gap-5">
                      <div>
                        <h3 className="text-lg font-bold text-text mb-1">You are eligible to submit!</h3>
                        <p className="text-sm text-muted">Submissions are open for builders from {cohort.universities?.name}.</p>
                      </div>
                      <Link href="/submit" className="flex items-center gap-2 bg-accent text-bg font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                        <Send size={15} /> Submit your project
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-surface border border-white/[0.07] rounded-xl p-8 flex flex-wrap justify-between items-center gap-5">
                      <div className="flex-1 min-w-[260px]">
                        <h3 className="text-lg font-bold text-text mb-1 flex items-center gap-2">
                          <Bell size={18} className="text-accent" /> This cohort is restricted
                        </h3>
                        <p className="text-sm text-muted leading-relaxed">
                          This cohort is specifically for students of <strong>{cohort.universities?.name}</strong>. Ring the bell to request a Superhack cohort at your school!
                        </p>
                      </div>
                      <Link href="/apply" className="bg-transparent border border-white/15 text-text font-semibold text-sm px-6 py-3 rounded-lg hover:bg-white/[0.04] transition-colors">
                        Apply for your school
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="bg-accent/[0.06] border border-accent/20 rounded-xl p-8 flex flex-wrap justify-between items-center gap-5">
                    <div>
                      <h3 className="text-lg font-bold text-text mb-1">Verify your student email</h3>
                      <p className="text-sm text-muted">You must verify your university email domain on your dashboard before submitting projects.</p>
                    </div>
                    <Link href="/dashboard" className="bg-accent text-bg font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                      Go to Dashboard
                    </Link>
                  </div>
                )
              ) : (
                <div className="bg-surface border border-white/[0.07] rounded-xl p-8 flex flex-wrap justify-between items-center gap-5">
                  <div>
                    <h3 className="text-lg font-bold text-text mb-1">Join the Hackathon</h3>
                    <p className="text-sm text-muted">Log in to view submission requirements or register for this cohort.</p>
                  </div>
                  <Link href="/auth" className="bg-accent text-bg font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                    Log In / Sign Up
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Submissions or Cohort Results Section */}
          {cohort.status === 'past' && cohort.results_announced ? (
            <section className="mb-12">
              <CohortResults projects={projects} cohortTitle={cohort.title} />
            </section>
          ) : cohort.status !== 'past' ? (
            <section className="mb-12">
              <h2 className="text-lg font-bold text-text mb-4">
                Submitted Projects
              </h2>
              {projects.length === 0 ? (
                <div className="rounded-2xl mt-4 border border-white/[0.07] border-dashed bg-surface/50 py-16 flex flex-col items-center text-center">
                  <FolderGit2 size={28} className="text-muted/40 mb-3" />
                  <p className="text-sm font-medium text-text mb-1">No projects yet</p>
                  <p className="text-xs text-muted">Submissions will appear here once the build week begins</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 mt-4 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </section>
          ) : null}

        </div>
      </main>
      <Footer />
    </>
  );
}
