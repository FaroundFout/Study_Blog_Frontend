import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary px-4 py-2.5 text-primary-foreground shadow-[0_10px_22px_-16px_rgba(63,73,99,0.5)] hover:-translate-y-0.5 dark:shadow-[0_18px_36px_-22px_rgba(8,15,31,0.7)]",
        secondary:
          "border border-border/80 bg-card/96 px-4 py-2.5 text-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-card dark:border-white/10 dark:bg-[#0f172a]/92 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-[#162033]",
        ghost:
          "px-3 py-2 text-muted-foreground hover:bg-accent/80 hover:text-foreground dark:hover:bg-white/5",
        outline:
          "border border-border/80 bg-transparent px-4 py-2.5 text-foreground hover:border-foreground/20 hover:bg-accent/60 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5"
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5 text-base",
        icon: "h-10 w-10 rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
