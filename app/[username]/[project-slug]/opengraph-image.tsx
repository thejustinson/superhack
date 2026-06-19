import { ImageResponse } from "next/og";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const alt = "Superhack Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { username: string; "project-slug": string };
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {}
      }
    }
  );

  const { data: project } = await supabase
    .from("projects")
    .select("name, tagline, logo_url, profiles!inner(full_name), cohorts(universities(name))")
    .eq("profiles.username", params.username)
    .eq("project_slug", params["project-slug"])
    .single();

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
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
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
            Superhack Project
          </div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#f0f0f0", marginBottom: 16 }}>
          {(project as any)?.name ?? "Untitled Project"}
        </div>
        <div style={{ fontSize: 28, color: "#888888", marginBottom: 32 }}>
          {(project as any)?.tagline ?? ""}
        </div>
        <div style={{ fontSize: 22, color: "#555555" }}>
          by {(project as any)?.profiles?.full_name ?? "Anonymous"} · {(project as any)?.cohorts?.universities?.name ?? ""}
        </div>
      </div>
    ),
    { ...size }
  );
}
