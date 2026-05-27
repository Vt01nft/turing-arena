export function fmtPct(n: number, digits = 2): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function fmtUsd(n: number, digits = 0): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  });
}

export function fmtAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function fmtCountdown(endsAt: number): string {
  const now = Date.now() / 1000;
  const sec = Math.max(0, endsAt - now);
  if (sec === 0) return "ended";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/// Human-friendly duration string from hours.
///   0.5 -> "30m",  1 -> "1h",  4 -> "4h",  24 -> "1d",  168 -> "7d"
export function fmtDuration(hours: number): string {
  if (hours < 1) {
    const m = Math.round(hours * 60);
    return `${m}m`;
  }
  if (hours < 24) return `${hours}h`;
  const days = Math.round((hours / 24) * 10) / 10;
  return `${Number.isInteger(days) ? days : days.toFixed(1)}d`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
