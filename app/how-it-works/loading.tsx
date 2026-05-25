import { Nav } from "@/components/nav";
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
        <Skeleton className="h-12 w-56 mb-4" style={{ borderRadius: 10 }} />
        <Skeleton className="h-4 w-96 max-w-full mb-14" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-5 mb-12">
            <Skeleton className="h-8 w-8 shrink-0" style={{ borderRadius: 8 }} />
            <div className="flex-1">
              <Skeleton className="h-5 w-48 mb-2" style={{ borderRadius: 6 }} />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
