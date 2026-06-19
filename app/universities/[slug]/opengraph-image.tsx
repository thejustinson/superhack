import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
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
    const { slug } = await params;
    if (!slug) return fallbackResponse;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: university, error } = await supabase
      .from("universities")
      .select("name, city, state")
      .eq("slug", slug)
      .single();

    if (error || !university) {
      return fallbackResponse;
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
          <div style={{ fontSize: 14, color: "#ffba08", marginBottom: 24, textTransform: "uppercase", letterSpacing: 2 }}>
            Superhack University
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#f0f0f0", marginBottom: 16 }}>
            {university.name}
          </div>
          <div style={{ fontSize: 28, color: "#888888" }}>
            {university.city ? `${university.city}, ` : ""}{university.state ?? ""}
          </div>
        </div>
      ),
      { ...size }
    );
  } catch (err) {
    return fallbackResponse;
  }
}
