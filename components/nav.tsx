"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LockUp } from "./logo";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "/", label: "Arena" },
  { href: "/duels", label: "Duels" },
  { href: "/agents", label: "Agents" },
  { href: "/faucet", label: "Faucet" },
  { href: "/how-it-works", label: "How" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <LockUp markSize={22} wordmarkClassName="text-[15px]" />
          </Link>
          <span className="hidden md:inline mono text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-faint uppercase tracking-wider">
            sepolia
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-1.5 text-[13px] rounded-md transition-colors",
                  active ? "text-fg bg-[var(--color-surface)]" : "text-dim hover:text-fg",
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
