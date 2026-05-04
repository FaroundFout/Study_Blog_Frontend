import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-40 w-full" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-72 w-full" />
        ))}
      </div>
    </div>
  );
}
