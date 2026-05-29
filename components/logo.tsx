import { cn } from "@/lib/format";

/// Versus capsule mark - vertical pill split horizontally into two halves:
/// periwinkle/machine on top, coral/human on the bottom, with an ochre stake
/// dot at the meeting line. One bold silhouette that rhymes with the
/// duality colors of the palette. Subtle bounce when `animated`.
export function Mark({
  size = 44,
  animated = true,
  className,
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const id = `ta-mark-${size}`;
  return (
    <span
      className={cn("ta-mark inline-block leading-none", animated && "spinning", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        className="ta-mark-disc"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        style={{ overflow: "visible", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${id}-top`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9396F0" />
            <stop offset="100%" stopColor="#5C5FCE" />
          </linearGradient>
          <linearGradient id={`${id}-bot`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F09A8C" />
            <stop offset="100%" stopColor="#C56353" />
          </linearGradient>
          <radialGradient id={`${id}-hl`} cx="32%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.50" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.10" />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <rect x="20" y="6" width="24" height="52" rx="12" ry="12" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-clip)`}>
          <rect x="20" y="6" width="24" height="26" fill={`url(#${id}-top)`} />
          <rect x="20" y="32" width="24" height="26" fill={`url(#${id}-bot)`} />
          <rect x="20" y="6" width="24" height="52" fill={`url(#${id}-hl)`} />
          <line x1="20" y1="32" x2="44" y2="32" stroke="#1A1F2E" strokeWidth="1.2" opacity="0.55" />
        </g>
        <rect x="20" y="6" width="24" height="52" rx="12" ry="12" fill="none" stroke="#1A1F2E" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="4" fill="#E8A452" stroke="#1A1F2E" strokeWidth="1.2" />
      </svg>
    </span>
  );
}

export function Wordmark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-baseline gap-1.5 font-semibold leading-none tracking-tight", className)}
      style={{ fontSize: size, letterSpacing: "-0.04em", color: "var(--vs-ink)" }}
    >
      <span>turing</span>
      <span
        className="rounded-full"
        style={{
          width: Math.max(4, size * 0.20),
          height: Math.max(4, size * 0.20),
          background: "var(--vs-ochre)",
          alignSelf: "center",
        }}
      />
      <span>arena</span>
    </span>
  );
}

/// Default home-link lockup: capsule mark + lowercase wordmark.
export function LockUp({
  markSize = 44,
  animated = true,
  className,
}: {
  markSize?: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Mark size={markSize} animated={animated} />
      <Wordmark size={Math.round(markSize * 0.42)} />
    </div>
  );
}
