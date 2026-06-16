import { NextResponse } from "next/server";
import { serialize } from "next-mdx-remote/serialize";

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    // Serialize the MDX content
    const mdxSource = await serialize(content || "", {
      mdxOptions: {
        development: process.env.NODE_ENV === "development",
      },
    });

    return NextResponse.json({ mdxSource });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to compile MDX" },
      { status: 400 }
    );
  }
}
