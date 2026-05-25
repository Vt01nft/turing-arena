"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Mark } from "./logo";
import { DarkToggle } from "./dark-toggle";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "/", label: "Arena" },
  { href: "/duels", label: "Duels" },
  { href: "/agents", label: "Agents" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/faucet", label: "Faucet" },
  { href: "/how-it-works", label: "How" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 transition-all duration-300",
        scrolled
          ? "bg-[rgba(232,235,243,0.55)] backdrop-blur-xl border-b border-line"
          : "bg-transparent border-b border-transparent",
      )}
      style={{
        backdropFilter: scrolled ? "blur(22px) saturate(1.6)" : undefined,
        WebkitBackdropFilter: scrolled ? "blur(22px) saturate(1.6)" : undefined,
      }}
    >
      <div className="mx-auto max-w-[1240px] grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 py-3.5">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center" aria-label="Turing Arena home">
            <Mark size={56} rotating />
          </Link>
          <span
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md mono text-[11px] font-medium uppercase tracking-[0.08em]"
            style={{ background: "var(--vs-indigo-soft)", color: "var(--vs-indigo)" }}
          >
            Sepolia
          </span>
        </div>

        {/* Center pill */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full border border-line bg-paper">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[13.5px] font-medium transition-all duration-150",
                  active ? "bg-ink text-paper" : "text-ink-2 hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 justify-end">
          <DarkToggle />
          <div className="hidden sm:block">
            <ConnectButton
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
