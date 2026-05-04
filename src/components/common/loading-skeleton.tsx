import { cn } from "@/lib/utils";

export function LoadingSkeleton({
  className
}: {
  className?: string;
}) {
  return <div className={cn("animate-pulse rounded-[1.5rem] bg-accent/80", className)} />;
}
