import { cn } from "@/lib/format";

/// Single-purpose skeleton block. Uses the shimmer animation defined in
/// globals.css. Sized via Tailwind utilities; rounded by default.
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("skeleton", className)} style={style} aria-hidden />;
}

/// A polished page-shell skeleton used as Suspense fallback for route
/// transitions. Renders the nav-height spacer + a soft hero placeholder
/// so the layout doesn't jump when the real content arrives.
export function PageShellSkeleton({ title }: { title?: string }) {
  return (
    <main className="flex-1 mx-auto max-w-[1240px] px-8 py-12">
      <div className="mb-10">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-12 w-72 mb-4" style={{ borderRadius: 10 }} />
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </div>
      {title && <div className="sr-only">Loading {title}</div>}
      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-paper p-5">
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-12 w-12" style={{ borderRadius: 14 }} />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1.5" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-6" />
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="text-right">
                  <Skeleton className="h-4 w-24 mb-1.5 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
                <Skeleton className="h-12 w-12" style={{ borderRadius: 14 }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <Skeleton className="h-10 w-full" style={{ borderRadius: 10 }} />
              <Skeleton className="h-10 w-full" style={{ borderRadius: 10 }} />
            </div>
            <div className="mt-5 pt-4 border-t border-line flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

/// Compact skeleton for detail pages (Duel detail, Agent detail).
export function DetailShellSkeleton() {
  return (
    <main className="flex-1 mx-auto max-w-[1240px] px-8 py-10">
      <Skeleton className="h-3 w-20 mb-4" />
      <div className="flex items-baseline gap-3 mb-6">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-14 w-[36rem] max-w-full mb-10" style={{ borderRadius: 10 }} />
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="surface-paper p-6">
            <Skeleton className="h-24 w-full" style={{ borderRadius: 14 }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" style={{ borderRadius: 16 }} />
            ))}
          </div>
        </div>
        <Skeleton className="h-[420px] w-full" style={{ borderRadius: 16 }} />
      </div>
    </main>
  );
}
