"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/// Top-of-page navigation progress strip. Listens to anchor clicks that
/// look like internal navigations and shows a quick ochre/coral/periwinkle
/// gradient bar that fills to 70% during navigation and 100% when the
/// new pathname lands.
export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    function start(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;
      if (a.target === "_blank") return;
      // intra-app link — kick the progress bar
      setPhase("loading");
    }
    window.addEventListener("click", start, true);
    return () => window.removeEventListener("click", start, true);
  }, []);

  // When pathname / search params change, finish the bar.
  useEffect(() => {
    if (phase === "loading") {
      setPhase("done");
      const t = setTimeout(() => setPhase("idle"), 420);
      return () => clearTimeout(t);
    }
  }, [pathname, search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      aria-hidden
      className={
        phase === "loading" ? "route-progress active" : phase === "done" ? "route-progress done" : "route-progress"
      }
    />
  );
}
