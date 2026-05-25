import { cn } from "@/lib/format";

// Single-color treatment per strategy, not gradient-noisy.
const STYLES: Record<string, string> = {
  conservative: "bg-[#1a2138] text-[#8aa6ff] border-[#2a3458]",
  aggressive:   "bg-[#321a26] text-[#ff8ab0] border-[#502a3c]",
  contrarian:   "bg-[#26183a] text-[#c084fc] border-[#3e2856]",
  macro:        "bg-[#172d27] text-[#5ed4a8] border-[#264a40]",
  momentum:     "bg-[#322417] text-[#fbbf24] border-[#503a26]",
};

export function AgentAvatar({
  letter,
  strategy,
  size = "md",
}: {
  letter: string;
  strategy: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizing =
    size === "xl"
      ? "h-16 w-16 text-2xl rounded-xl"
      : size === "lg"
        ? "h-12 w-12 text-lg rounded-lg"
        : size === "sm"
          ? "h-7 w-7 text-xs rounded-md"
          : "h-10 w-10 text-base rounded-lg";
  return (
    <div
      className={cn(
        "grid place-items-center font-semibold border mono shrink-0",
        sizing,
        STYLES[strategy] ?? STYLES.conservative,
      )}
    >
      {letter}
    </div>
  );
}
