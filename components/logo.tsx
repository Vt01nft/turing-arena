import { cn } from "@/lib/format";

/// Trefoil mark: tri-lobed medallion with thick ochre gold rim and deep navy
/// interior. Reads as the "stake / pot" symbol of the arena. Optionally
/// rotates slowly (one full revolution every ~22s) for a quiet liveness cue.
export function Mark({
  size = 56,
  rotating = true,
  showText = true,
  className,
}: {
  size?: number;
  rotating?: boolean;
  /** Include "TURING ARENA" text inside the medallion (hide at small sizes). */
  showText?: boolean;
  className?: string;
}) {
  const id = `tm-${size}`;
  const tooSmallForText = size < 44 ? false : showText;
  return (
    <span
      className={cn("ta-trefoil inline-block leading-none", rotating && "rotating", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        style={{ overflow: "visible", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${id}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4C892" />
            <stop offset="38%" stopColor="#E8A452" />
            <stop offset="78%" stopColor="#B57F36" />
            <stop offset="100%" stopColor="#8B5E1F" />
          </linearGradient>
          <linearGradient id={`${id}-rimInner`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F4C892" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#E8A452" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8B5E1F" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id={`${id}-shine`} cx="35%" cy="22%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer tri-lobed gold rim */}
        <path
          d="M 31.7,50.6 A 34 34 0 1 1 96.3,50.6 A 34 34 0 0 1 64,105.9 A 34 34 0 0 1 31.7,50.6 Z"
          fill="#1A1F2E"
          stroke={`url(#${id}-rim)`}
          strokeWidth="10"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Inner gold hairline border (the bevel) */}
        <path
          d="M 35.5,53 A 30 30 0 1 1 92.5,53 A 30 30 0 0 1 64,101 A 30 30 0 0 1 35.5,53 Z"
          fill="none"
          stroke={`url(#${id}-rimInner)`}
          strokeWidth="1.4"
          opacity="0.9"
          strokeLinejoin="round"
        />

        {/* Subtle highlight wash */}
        <path
          d="M 31.7,50.6 A 34 34 0 1 1 96.3,50.6 A 34 34 0 0 1 64,105.9 A 34 34 0 0 1 31.7,50.6 Z"
          fill={`url(#${id}-shine)`}
          stroke="none"
        />

        {tooSmallForText && (
          <g>
            <text
              x="64"
              y="68"
              textAnchor="middle"
              fill="#E8A452"
              style={{
                fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.10em",
              }}
            >
              TURING
            </text>
            <text
              x="64"
              y="82"
              textAnchor="middle"
              fill="#E8A452"
              style={{
                fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif",
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: "0.22em",
              }}
            >
              ARENA
            </text>
          </g>
        )}
      </svg>
    </span>
  );
}

/// Compact wordmark for places where the medallion alone isn't readable
/// (or as a complement next to a small mark). The medallion already contains
/// the lock-up, so this is usually omitted.
export function Wordmark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-baseline gap-1.5 font-semibold leading-none tracking-tight", className)}
      style={{ fontSize: size, letterSpacing: "-0.04em", color: "var(--vs-ink)" }}
    >
      <span>turing</span>
      <span
        className="rounded-full"
        style={{
          width: Math.max(4, size * 0.18),
          height: Math.max(4, size * 0.18),
          background: "var(--vs-ochre)",
          alignSelf: "center",
        }}
      />
      <span>arena</span>
    </span>
  );
}

/// LockUp = the medallion. Text is inside the mark above ~44px, so the
/// separate wordmark is hidden by default. Pass `withWordmark` to force it.
export function LockUp({
  markSize = 56,
  rotating = true,
  withWordmark = false,
  className,
}: {
  markSize?: number;
  rotating?: boolean;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Mark size={markSize} rotating={rotating} />
      {withWordmark && <Wordmark size={Math.round(markSize * 0.42)} />}
    </div>
  );
}
