"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LockUp } from "./logo";
import { DarkToggle } from "./dark-toggle";
import { LiveRibbon } from "./live-ribbon";
import { WalletButtons } from "./wallet-buttons";
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
    <header className="sticky top-0 z-30">
    <nav
      className={cn(
        "transition-all duration-300",
        scrolled
          ? "border-b border-[rgba(212,216,229,0.45)]"
          : "bg-transparent border-b border-transparent",
      )}
      style={{
        background: scrolled ? "rgba(232,235,243,0.32)" : "transparent",
        backdropFilter: scrolled ? "blur(28px) saturate(1.85)" : undefined,
        WebkitBackdropFilter: scrolled ? "blur(28px) saturate(1.85)" : undefined,
        boxShadow: scrolled
          ? "inset 0 1px 0 rgba(255,255,255,0.65), 0 12px 40px -24px rgba(26,31,46,0.22)"
          : undefined,
      }}
    >
      <div className="mx-auto max-w-[1240px] grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 py-3.5">
        {/* Left */}
        <Link href="/" className="flex items-center" aria-label="Turing Arena home">
          <LockUp markSize={42} animated />
        </Link>

        {/* Center pill */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full border border-line bg-paper">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <NavPill key={l.href} href={l.href} active={active}>
                {l.label}
              </NavPill>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3.5 justify-end">
          <DarkToggle />
          <div className="hidden sm:block">
            <WalletButtons />
          </div>
        </div>
      </div>
    </nav>
    <LiveRibbon />
    </header>
  );
}

function NavPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "nav-link inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13.5px] font-medium relative",
        active ? "bg-ink text-paper" : "text-ink-2 hover:text-ink",
      )}
    >
      {children}
      <NavPending />
    </Link>
  );
}

/// Tiny spinner that only shows while THIS link is pending navigation.
function NavPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      className="inline-block animate-spin"
      style={{ animationDuration: "0.8s" }}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        d="M12 3a9 9 0 0 1 9 9"
      />
    </svg>
  );
}
