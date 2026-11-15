import { PageSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-10">
      <PageSkeleton />
    </div>
  );
}
