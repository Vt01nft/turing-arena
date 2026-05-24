import { cn } from "@/lib/format";

const COLORS: Record<string, string> = {
  conservative: "from-blue-500/40 to-cyan-500/20 text-blue-300",
  aggressive: "from-pink-500/40 to-orange-500/20 text-pink-300",
  contrarian: "from-purple-500/40 to-fuchsia-500/20 text-purple-300",
  macro: "from-emerald-500/40 to-teal-500/20 text-emerald-300",
  momentum: "from-amber-500/40 to-yellow-500/20 text-amber-300",
};

export function AgentAvatar({
  letter,
  strategy,
  size = "md",
}: {
  letter: string;
  strategy: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizing =
    size === "lg" ? "h-14 w-14 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-base";
  return (
    <div
      className={cn(
        "grid place-items-center rounded-lg font-bold mono bg-gradient-to-br border border-[var(--color-border)]",
        sizing,
        COLORS[strategy] ?? COLORS.conservative,
      )}
    >
      {letter}
    </div>
  );
}
