import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "soft-panel transition-all duration-300",
        className,
      )}
      {...props}
    />
  );
}
