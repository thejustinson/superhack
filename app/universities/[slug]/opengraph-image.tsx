import { ImageResponse } from "next/og";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  const { data: university } = await supabase
    .from("universities")
    .select("name, city, state")
    .eq("slug", slug)
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
        <div style={{ fontSize: 14, color: "#ffba08", marginBottom: 24, textTransform: "uppercase", letterSpacing: 2 }}>
          Superhack University
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#f0f0f0", marginBottom: 16 }}>
          {university?.name ?? "Superhack Partner University"}
        </div>
        <div style={{ fontSize: 28, color: "#888888" }}>
          {university?.city ? `${university.city}, ` : ""}{university?.state ?? ""}
        </div>
      </div>
    ),
    { ...size }
  );
}
