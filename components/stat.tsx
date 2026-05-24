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
  tone?: "default" | "accent" | "human" | "ai" | "warn";
  className?: string;
}) {
  const toneClass =
    tone === "accent"
      ? "text-accent"
      : tone === "human"
        ? "text-human"
        : tone === "ai"
          ? "text-ai"
          : tone === "warn"
            ? "text-[var(--color-warn)]"
            : "text-fg";
  return (
    <div className={cn("panel px-4 py-3 flex flex-col gap-0.5", className)}>
      <div className="text-[11px] uppercase tracking-wider text-dim">{label}</div>
      <div className={cn("text-xl font-semibold mono", toneClass)}>{value}</div>
      {hint && <div className="text-xs text-dim">{hint}</div>}
    </div>
  );
}
