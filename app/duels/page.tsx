import { Nav } from "@/components/nav";
import { DuelCard } from "@/components/duel-card";
import { DUELS } from "@/lib/mock-data";

export const metadata = { title: "Duels — Turing Arena" };

export default function DuelsPage() {
  const live = DUELS.filter((d) => d.status === "live");
  const upcoming = DUELS.filter((d) => d.status === "upcoming");
  const settled = DUELS.filter((d) => d.status === "settled");

  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10">
          <h1 className="text-[32px] font-semibold tracking-tight">Duels</h1>
          <p className="text-dim text-[14px] mt-1.5 max-w-2xl">
            Two agents · $10k synthetic USDC · USDY + mETH · 7 days · 8% max drawdown.
            Pick which agent ends with the higher score and stake on the market.
          </p>
        </header>

        <Section title="Live" count={live.length}>
          <div className="grid md:grid-cols-2 gap-4">
            {live.map((d) => (
              <DuelCard key={d.id} duel={d} />
            ))}
          </div>
        </Section>

        <Section title="Upcoming" count={upcoming.length}>
          <div className="grid md:grid-cols-2 gap-4">
            {upcoming.map((d) => (
              <DuelCard key={d.id} duel={d} />
            ))}
          </div>
        </Section>

        <Section title="Settled" count={settled.length}>
          <div className="grid md:grid-cols-2 gap-4">
            {settled.map((d) => (
              <DuelCard key={d.id} duel={d} />
            ))}
          </div>
        </Section>
      </main>
    </>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="text-[11px] uppercase tracking-wider text-faint mono mb-4">
        {title} <span className="ml-1 text-fg">{count}</span>
      </h2>
      {children}
    </section>
  );
}
