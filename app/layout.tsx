import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Superhack — The Campus Hackathon for Solana Builders",
    template: "%s — Superhack",
  },
  description: "The campus hackathon for Solana builders in Nigeria. One week to build, one week to judge. Powered by Solana.",
  keywords: ["Solana", "hackathon", "Superteam", "Superteam Nigeria", "blockchain", "web3", "Nigeria"],
  openGraph: {
    title: "Superhack",
    description: "The campus hackathon for Solana builders in Nigeria. One week to build, one week to judge. Powered by Solana.",
    url: "https://superhack.fun",
    siteName: "Superhack",
    images: [
      {
        url: "https://superhack.fun/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Superhack",
    description: "The campus hackathon for Solana builders in Nigeria. One week to build, one week to judge. Powered by Solana.",
    images: ["https://superhack.fun/og-image.png"],
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

