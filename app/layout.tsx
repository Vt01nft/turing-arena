import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Turing Arena - Humans vs. AI on Mantle",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
