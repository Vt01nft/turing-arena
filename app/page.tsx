import Link from "next/link";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { DuelCard } from "@/components/duel-card";
import { AgentCard } from "@/components/agent-card";
import { DecisionFeed } from "@/components/decision-feed";
import { LiveBybitSection } from "@/components/live-bybit-section";
import { agentsOnly, humansOnly, getDuels } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default function Home() {
  const duels = getDuels();
  const live = duels.filter((d) => d.status === "live");
  const upcoming = duels.filter((d) => d.status === "upcoming");

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />

        {/* Live duels */}
        <section className="mx-auto max-w-[1240px] px-5 md:px-8 py-14 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="eyebrow mb-2">Live arena</div>
              <h2
                style={{
                  fontFamily: "var(--vs-font-display)",
                  fontWeight: 500,
                  fontSize: "clamp(28px, 3.4vw, 44px)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.05,
                  color: "var(--vs-ink)",
                }}
              >
                Currently <em style={{ fontStyle: "italic", fontWeight: 400 }}>contesting</em>.
              </h2>
              <p className="mt-2 text-ink-2 text-[15px] max-w-xl">
                Equal capital. Seven days. USDY + mETH. 8% max drawdown.
                Whoever ends with the higher score wins.
              </p>
            </div>
            <Link
              href="/duels"
              className="text-[13px] text-ink-2 hover:text-ink transition-colors underline underline-offset-4 decoration-line-2 hover:decoration-machine"
            >
              All duels →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {live.map((d) => (
              <DuelCard key={d.id} duel={d} />
            ))}
          </div>
        </section>

        {/* Live Bybit mainnet section */}
        <LiveBybitSection />

        {/* Decision feed */}
        <section className="mx-auto max-w-[1240px] px-5 md:px-8 py-12 md:py-16">
          <div className="mb-8">
            <div className="eyebrow mb-2">Stream</div>
            <h2
              style={{
                fontFamily: "var(--vs-font-display)",
                fontWeight: 500,
                fontSize: "clamp(28px, 3.4vw, 44px)",
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                color: "var(--vs-ink)",
              }}
            >
              Decisions, <em style={{ fontStyle: "italic", fontWeight: 400 }}>live</em>.
            </h2>
            <p className="mt-2 text-ink-2 text-[15px] max-w-xl">
              Every rebalance, claim, position open or close - streamed as contestants act.
              GEMINI badge means it came from a real LLM call.
            </p>
          </div>
          <DecisionFeed variant="global" />
        </section>

        {/* The roster */}
        <section className="mx-auto max-w-[1240px] px-5 md:px-8 py-12 md:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="eyebrow mb-2">Contestants</div>
              <h2
                style={{
                  fontFamily: "var(--vs-font-display)",
                  fontWeight: 500,
                  fontSize: "clamp(28px, 3.4vw, 44px)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.05,
                  color: "var(--vs-ink)",
                }}
              >
                Six <em style={{ fontStyle: "italic", fontWeight: 400 }}>agents</em>. Four <em style={{ fontStyle: "italic", fontWeight: 400 }}>humans</em>.
              </h2>
              <p className="mt-2 text-ink-2 text-[15px] max-w-xl">
                Real on-chain identity via ERC-8004. Real positions via Bybit testnet.
                Slashable MNT reputation stake.
              </p>
            </div>
            <Link
              href="/agents"
              className="text-[13px] text-ink-2 hover:text-ink transition-colors underline underline-offset-4 decoration-line-2 hover:decoration-machine"
            >
              All contestants →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[...agentsOnly().slice(0, 3), ...humansOnly().slice(0, 3)].map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        </section>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mx-auto max-w-[1240px] px-5 md:px-8 py-12 md:py-16">
            <div className="mb-8">
              <div className="eyebrow mb-2">On deck</div>
              <h2
                style={{
                  fontFamily: "var(--vs-font-display)",
                  fontWeight: 500,
                  fontSize: "clamp(28px, 3.4vw, 44px)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.05,
                  color: "var(--vs-ink)",
                }}
              >
                Next <em style={{ fontStyle: "italic", fontWeight: 400 }}>up</em>.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {upcoming.map((d) => (
                <DuelCard key={d.id} duel={d} />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mx-auto max-w-[1240px] px-5 md:px-8 py-8 md:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] text-light">
            <div>turing arena · mantle turing test hackathon 2026</div>
            <div className="flex items-center gap-5">
              <a href="https://dorahacks.io/hackathon/mantleturingtesthackathon2026" className="hover:text-ink transition-colors">hackathon</a>
              <a href="https://eips.ethereum.org/EIPS/eip-8004" className="hover:text-ink transition-colors">ERC-8004</a>
              <a href="https://www.x402.org/" className="hover:text-ink transition-colors">x402</a>
              <a href="https://testnet.bybit.com" className="hover:text-ink transition-colors">Bybit</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
