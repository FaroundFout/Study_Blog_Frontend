import Skeleton, { type SkeletonProps } from "react-loading-skeleton";

import { cn } from "@/lib/utils";

export function LoadingSkeleton({
  className,
  containerClassName,
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      {...props}
      className={cn("block", className)}
      containerClassName={cn("block leading-none", containerClassName)}
    />
  );
}
