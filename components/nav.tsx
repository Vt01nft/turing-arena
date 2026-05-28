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
  { href: "/portfolio", label: "My Bets" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/faucet", label: "Faucet" },
  { href: "/how-it-works", label: "How" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [menuOpen]);

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
        <div className="mx-auto max-w-[1240px] grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6 px-5 md:px-8 py-3.5">
          {/* Left */}
          <Link href="/" className="flex items-center" aria-label="Turing Arena home">
            <LockUp markSize={36} animated />
          </Link>

          {/* Center pill — desktop only */}
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
          <div className="flex items-center gap-2 md:gap-3.5 justify-end">
            <DarkToggle />
            <div className="hidden md:block">
              <WalletButtons />
            </div>
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden h-9 w-9 grid place-items-center rounded-full border border-line-2 bg-paper text-ink hover:bg-cream transition-colors"
            >
              {menuOpen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
      <LiveRibbon />

      {/* Mobile menu sheet */}
      <MobileMenu open={menuOpen} pathname={pathname} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

function MobileMenu({
  open,
  pathname,
  onClose,
}: {
  open: boolean;
  pathname: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden
        onClick={onClose}
        className="md:hidden fixed inset-0 z-40 animate-overlay"
        style={{
          background: "rgba(26,31,46,0.42)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />
      {/* Sheet */}
      <div
        className="md:hidden fixed top-[64px] left-3 right-3 z-50 animate-modal"
        style={{ maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}
      >
        <div className="surface-paper p-4" style={{ boxShadow: "var(--vs-shadow-3)" }}>
          <div className="grid gap-1.5 mb-4">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className={cn(
                    "px-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
                    active ? "bg-ink text-paper" : "text-ink hover:bg-cream",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-3 border-t border-line">
            <div className="eyebrow mb-2">Wallet</div>
            <WalletButtons />
          </div>
        </div>
      </div>
    </>
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
