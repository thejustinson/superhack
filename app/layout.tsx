import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Superhack — Build on Solana. Get paid.", template: "%s | Superhack" },
  description: "A Superteam Nigeria hackathon initiative. Learn Solana, ship a real project, and compete for prizes.",
  keywords: ["Solana", "hackathon", "Superteam Nigeria", "blockchain", "web3", "Nigeria"],
  openGraph: {
    title: "Superhack — Build on Solana. Get paid.",
    description: "A Superteam Nigeria hackathon initiative. Build on Solana in two weeks.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
