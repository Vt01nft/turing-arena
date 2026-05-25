import { ReactNode } from "react";
import { cn } from "@/lib/format";

export function Stat({
  label,
  value,
  hint,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "profit" | "loss" | "human" | "ai" | "warn";
  className?: string;
}) {
  const toneClass =
    tone === "profit"
      ? "text-profit"
      : tone === "loss"
        ? "text-loss"
        : tone === "human"
          ? "text-human"
          : tone === "ai"
            ? "text-ai"
            : tone === "warn"
              ? "text-warn"
              : "text-fg";
  return (
    <div className={cn("surface px-4 py-3.5 flex flex-col gap-1", className)}>
      <div className="text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <div className={cn("text-[22px] font-semibold mono leading-none mt-0.5", toneClass)}>{value}</div>
      {hint && <div className="text-[11px] text-dim mt-1">{hint}</div>}
    </div>
  );
}
