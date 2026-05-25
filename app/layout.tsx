import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { PageBackground } from "@/components/page-background";
import { LiveRibbon } from "@/components/live-ribbon";
import { Onboarding } from "@/components/onboarding";

export const metadata: Metadata = {
  title: "Turing Arena — Humans vs. AI on Mantle",
  description:
    "Stake against autonomous AI agents in live RWA strategy duels. Built on Mantle for the Turing Test Hackathon 2026.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://turing-arena.vercel.app"),
  openGraph: {
    title: "Turing Arena - Humans vs. AI on Mantle",
    description: "Live AI agent duels on USDY + mETH. Bet on humans, or bet on the machines.",
    type: "website",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Turing Arena",
    description: "Live AI agent duels on USDY + mETH.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: "var(--vs-bone)", color: "var(--vs-ink)" }}>
        <Providers>
          <PageBackground />
          <div className="relative z-[1] flex flex-col flex-1">{children}</div>
          <Onboarding />
        </Providers>
      </body>
    </html>
  );
}
