import { cn } from "@/lib/format";

/// A geometric mark: rounded square divided diagonally into two triangles.
/// The "human" half (cool blue) and "AI" half (warm pink) carry the duality.
/// Reads cleanly from 16px favicon to 200px hero.
export function Mark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill="var(--mark-bg, #15181f)" />
      <path d="M 4.5 27.5 L 4.5 4.5 L 27.5 27.5 Z" fill="var(--color-human)" />
      <path d="M 27.5 4.5 L 27.5 27.5 L 4.5 4.5 Z" fill="var(--color-ai)" />
      <path
        d="M 4.5 4.5 L 27.5 27.5"
        stroke="var(--mark-bg, #15181f)"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "tracking-tight font-semibold text-fg leading-none",
        className,
      )}
    >
      turing<span className="font-light text-dim">·</span>arena
    </span>
  );
}

export function LockUp({
  markSize = 26,
  className,
  wordmarkClassName,
}: {
  markSize?: number;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark size={markSize} />
      <Wordmark className={wordmarkClassName} />
    </div>
  );
}
