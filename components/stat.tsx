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
  tone?: "default" | "positive" | "negative" | "human" | "machine" | "warn";
  className?: string;
}) {
  const toneColor =
    tone === "positive"
      ? "var(--vs-positive)"
      : tone === "negative"
        ? "var(--vs-negative)"
        : tone === "human"
          ? "var(--vs-human-deep)"
          : tone === "machine"
            ? "var(--vs-machine-deep)"
            : tone === "warn"
              ? "var(--vs-ochre-deep)"
              : "var(--vs-ink)";
  return (
    <div className={cn("bg-paper border border-line rounded-2xl p-5", className)}>
      <div className="eyebrow mb-2">{label}</div>
      <div className="num leading-none" style={{ fontSize: 28, fontWeight: 500, color: toneColor }}>
        {value}
      </div>
      {hint && <div className="text-[12px] text-ink-3 mt-2">{hint}</div>}
    </div>
  );
}
