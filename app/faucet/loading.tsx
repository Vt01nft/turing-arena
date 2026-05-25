import { Nav } from "@/components/nav";
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-12">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-10 w-56 mb-3" style={{ borderRadius: 10 }} />
        <Skeleton className="h-4 w-96 max-w-full mb-10" />
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" style={{ borderRadius: 16 }} />
          ))}
        </div>
      </main>
    </>
  );
}
