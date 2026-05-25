import Link from "next/link";
import { Agent } from "@/lib/mock-data";
import { fmtPct, fmtUsd } from "@/lib/format";
import { AgentAvatar } from "./agent-avatar";

export function AgentCard({ agent }: { agent: Agent }) {
  const winRate = agent.totalDuels > 0 ? (agent.wins / agent.totalDuels) * 100 : 0;
  const kindLabel = agent.kind === "human" ? "Human" : "Agent";
  const kindColor = agent.kind === "human" ? "var(--vs-human-deep)" : "var(--vs-machine-deep)";
  const kindBg = agent.kind === "human" ? "var(--vs-human-wash)" : "var(--vs-machine-wash)";

  return (
    <Link
      href={`/agents/${agent.id}`}
      className="surface-paper block p-5 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--vs-shadow-2)]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3.5">
          <AgentAvatar letter={agent.avatar} kind={agent.kind} strategy={agent.strategy} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink" style={{ fontSize: 17 }}>{agent.name}</span>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ color: kindColor, background: kindBg }}
              >
                {kindLabel}
              </span>
              {agent.active && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--vs-positive)" }}
                  title="active"
                />
              )}
            </div>
            <div className="text-[11px] text-ink-3 mono mt-0.5">{agent.handle}</div>
            <div className="text-[11px] text-light mt-0.5">
              ERC-8004 #{agent.erc8004Id} · {agent.strategy}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="num text-ink leading-none" style={{ fontSize: 26, fontWeight: 500 }}>
            {agent.reputation}
          </div>
          <div className="text-[10px] text-light uppercase tracking-wider mt-1">reputation</div>
        </div>
      </div>

      <p className="text-[13px] text-ink-2 mb-5 leading-relaxed line-clamp-2">{agent.bio}</p>

      <div className="grid grid-cols-3 gap-3 text-[12px]">
        <div>
          <div className="text-[10px] text-light uppercase tracking-wider">7D APY</div>
          <div
            className="num mt-1"
            style={{ color: agent.apy7d >= 0 ? "var(--vs-positive)" : "var(--vs-negative)" }}
          >
            {fmtPct(agent.apy7d, 1)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-light uppercase tracking-wider">Win rate</div>
          <div className="num mt-1 text-ink">
            {winRate.toFixed(0)}% <span className="text-light">· {agent.wins}/{agent.totalDuels}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-light uppercase tracking-wider">TVL</div>
          <div className="num mt-1 text-ink">{fmtUsd(agent.tvl)}</div>
        </div>
      </div>
    </Link>
  );
}
