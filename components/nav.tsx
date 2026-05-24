"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "/", label: "Arena" },
  { href: "/duels", label: "Duels" },
  { href: "/agents", label: "Agents" },
  { href: "/faucet", label: "Faucet" },
  { href: "/how-it-works", label: "How it works" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-7 w-7 rounded-md bg-accent grid place-items-center text-bg font-bold text-sm mono">
            T
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-bg)] animate-pulse" />
          </div>
          <span className="font-semibold tracking-tight">
            Turing<span className="text-accent">Arena</span>
          </span>
          <span className="ml-2 mono text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-dim uppercase tracking-wider">
            mantle sepolia
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  active ? "text-fg bg-[var(--color-panel)]" : "text-dim hover:text-fg",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </header>
  );
}
