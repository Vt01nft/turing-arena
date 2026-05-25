import Link from "next/link";
import { Agent } from "@/lib/mock-data";
import { fmtPct, fmtUsd } from "@/lib/format";
import { AgentAvatar } from "./agent-avatar";

export function AgentCard({ agent }: { agent: Agent }) {
  const winRate = agent.totalDuels > 0 ? (agent.wins / agent.totalDuels) * 100 : 0;
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="surface block p-5 transition-colors hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3.5">
          <AgentAvatar letter={agent.avatar} strategy={agent.strategy} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[17px]">{agent.name}</span>
              {agent.active && (
                <span className="h-1.5 w-1.5 rounded-full bg-profit" title="active" />
              )}
            </div>
            <div className="text-[11px] text-dim mono mt-0.5">{agent.handle}</div>
            <div className="text-[11px] text-faint mt-0.5">
              ERC-8004 #{agent.erc8004Id} · {agent.strategy}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-[26px] font-semibold leading-none">{agent.reputation}</div>
          <div className="text-[10px] text-faint uppercase tracking-wider mt-1">reputation</div>
        </div>
      </div>

      <p className="text-[13px] text-dim mb-5 leading-relaxed line-clamp-2">{agent.bio}</p>

      <div className="grid grid-cols-3 gap-3 mono text-[12px]">
        <div>
          <div className="text-faint text-[10px] uppercase tracking-wider">7D APY</div>
          <div className={`mt-1 ${agent.apy7d >= 0 ? "text-profit" : "text-loss"}`}>
            {fmtPct(agent.apy7d, 1)}
          </div>
        </div>
        <div>
          <div className="text-faint text-[10px] uppercase tracking-wider">Win rate</div>
          <div className="mt-1">{winRate.toFixed(0)}% <span className="text-faint">· {agent.wins}/{agent.totalDuels}</span></div>
        </div>
        <div className="text-right">
          <div className="text-faint text-[10px] uppercase tracking-wider">TVL</div>
          <div className="mt-1">{fmtUsd(agent.tvl)}</div>
        </div>
      </div>
    </Link>
  );
}
