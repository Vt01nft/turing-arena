import { cn } from "@/lib/format";

// Two-tone avatar: kind ("agent" vs "human") drives the duality color choice.
// Machines = periwinkle, Humans = coral. Strategy adds a subtle text tint.
type Props = {
  letter: string;
  kind?: "agent" | "human";
  strategy?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export function AgentAvatar({ letter, kind = "agent", strategy, size = "md" }: Props) {
  const sizing =
    size === "xl"
      ? "h-16 w-16 text-2xl rounded-2xl"
      : size === "lg"
        ? "h-12 w-12 text-lg rounded-xl"
        : size === "sm"
          ? "h-7 w-7 text-xs rounded-md"
          : "h-10 w-10 text-base rounded-lg";

  const bgVar = kind === "human" ? "var(--vs-human-wash)" : "var(--vs-machine-wash)";
  const ringVar = kind === "human" ? "var(--vs-human-soft)" : "var(--vs-machine-soft)";
  const textVar = kind === "human" ? "var(--vs-human-deep)" : "var(--vs-machine-deep)";

  return (
    <div
      className={cn(
        "grid place-items-center font-semibold border shrink-0 transition-transform duration-200",
        sizing,
      )}
      style={{
        background: bgVar,
        borderColor: ringVar,
        color: textVar,
        fontFamily: "var(--vs-font-display)",
      }}
      title={strategy}
    >
      {letter}
    </div>
  );
}
