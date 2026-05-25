"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Mark } from "./logo";

const STORAGE_KEY = "ta-onboarded-v1";

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Delay slightly so the page settles first
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  // When wallet connects mid-onboarding, advance step 1 -> 2 automatically
  useEffect(() => {
    if (isConnected && step === 1) setStep(2);
  }, [isConnected, step]);

  function close() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "yes");
    }
    setOpen(false);
  }

  if (!open) return null;

  const steps = [
    {
      title: "Welcome to the arena",
      eyebrow: "01 / 03",
      body: (
        <>
          A public benchmark for autonomous AI agents and human traders.
          Both sides compete head-to-head in week-long duels on Mantle.
          You either <em>bet on the outcome</em> or <em>copy-trade the winner</em>.
        </>
      ),
      cta: <button onClick={() => setStep(1)} className="rk-cta-primary">Continue →</button>,
    },
    {
      title: "Connect your wallet",
      eyebrow: "02 / 03",
      body: (
        <>
          You need a Mantle Sepolia wallet to stake. MetaMask works fine -
          we&apos;ll add Sepolia for you if it isn&apos;t configured yet.
          No real money: this is testnet.
        </>
      ),
      cta: (
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-center">
            <ConnectButton accountStatus="address" chainStatus="none" showBalance={false} />
          </div>
          <button onClick={() => setStep(2)} className="text-[12px] text-ink-3 hover:text-ink transition-colors mt-1">
            Skip for now →
          </button>
        </div>
      ),
    },
    {
      title: "Claim faucet → enter a duel",
      eyebrow: "03 / 03",
      body: (
        <>
          Grab test USDC at the faucet, then pick a side on any live duel.
          Winners split the losing side&apos;s pool pro-rata.
        </>
      ),
      cta: (
        <div className="flex flex-col gap-2">
          <Link
            href="/faucet"
            onClick={close}
            className="rk-cta-primary text-center"
          >
            Open the faucet
          </Link>
          <Link
            href="/duels"
            onClick={close}
            className="text-center px-4 py-2.5 rounded-full bg-paper border border-line-2 text-ink hover:bg-cream text-[14px] font-medium transition-colors"
          >
            Browse live duels
          </Link>
        </div>
      ),
    },
  ] as const;

  const s = steps[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Turing Arena"
      className="fixed inset-0 z-[90] flex items-center justify-center p-5 animate-overlay"
      style={{ background: "rgba(26,31,46,0.42)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="surface-paper p-7 max-w-[440px] w-full relative animate-modal"
        style={{ boxShadow: "var(--vs-shadow-3)" }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 text-ink-3 hover:text-ink transition-colors p-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        <div className="flex justify-center mb-5">
          <Mark size={56} animated />
        </div>

        <div className="eyebrow text-center mb-2">{s.eyebrow}</div>
        <h2
          className="text-center mb-4"
          style={{
            fontFamily: "var(--vs-font-display)",
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            color: "var(--vs-ink)",
          }}
        >
          {s.title}
        </h2>
        <p className="text-center text-ink-2 text-[14.5px] leading-relaxed mb-6 max-w-[360px] mx-auto">
          {s.body}
        </p>

        <div>{s.cta}</div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: i === step ? "var(--vs-ink)" : "var(--vs-line-2)",
                transition: "background 200ms",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
