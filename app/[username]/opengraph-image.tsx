import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const fallbackResponse = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", backgroundColor: "#0b0c0f" }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#f0f0f0" }}>
          Superhack
        </div>
        <div style={{ fontSize: 28, color: "#888888", marginTop: 16 }}>
          The campus hackathon for Solana builders.
        </div>
      </div>
    ),
    { ...size }
  );

  try {
    const { username } = await params;
    if (!username) return fallbackResponse;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, about, university_verified, university_id")
      .eq("username", username)
      .single();

    if (error || !profile) {
      return fallbackResponse;
    }

    let universityName = "";
    if (profile?.university_id && profile?.university_verified) {
      const { data: uni } = await supabase
        .from("universities")
        .select("name")
        .eq("id", profile.university_id)
        .single();
      if (uni) {
        universityName = uni.name;
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px",
            backgroundColor: "#0b0c0f",
            backgroundImage:
              "radial-gradient(circle, rgba(255,186,8,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div
              style={{
                fontSize: 14,
                color: "#ffba08",
                border: "1px solid rgba(255,186,8,0.3)",
                borderRadius: 99,
                padding: "6px 16px",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Superhack Builder
            </div>
            {profile?.university_verified && (
              <div
                style={{
                  fontSize: 14,
                  color: "#ffba08",
                  fontWeight: 600,
                }}
              >
                Verified Student
              </div>
            )}
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#f0f0f0", marginBottom: 16 }}>
            {profile?.full_name ?? "Anonymous"}
          </div>
          <div style={{ fontSize: 28, color: "#888888", marginBottom: 16 }}>
            @{profile?.username ?? ""}
          </div>
          {universityName && (
            <div style={{ fontSize: 22, color: "#555555", marginBottom: 16 }}>
              Student at {universityName}
            </div>
          )}
          {profile?.about && (
            <div style={{ fontSize: 20, color: "#666666", marginTop: 16, overflow: "hidden" }}>
              {profile.about}
            </div>
          )}
        </div>
      ),
      { ...size }
    );
  } catch (err) {
    return fallbackResponse;
  }
}
