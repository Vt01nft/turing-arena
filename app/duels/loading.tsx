import { Nav } from "@/components/nav";
import { PageShellSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <>
      <Nav />
      <PageShellSkeleton title="Duels" />
    </>
  );
}
