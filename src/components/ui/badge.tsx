import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/12 bg-primary/6 text-primary",
        secondary: "border-border/80 bg-accent/85 text-muted-foreground",
        outline: "border-border/80 bg-transparent text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
