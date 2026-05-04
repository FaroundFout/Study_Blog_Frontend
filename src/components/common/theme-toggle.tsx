"use client";

import { MoonStar, SunMedium } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps
  extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "title"> {
  iconClassName?: string;
}

export function ThemeToggle({ className, iconClassName, title }: ThemeToggleProps) {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <Button
        size="icon"
        variant="secondary"
        aria-label="切换主题"
        title={title}
        className={className}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      size="icon"
      variant="secondary"
      aria-label="切换主题"
      title={title}
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <SunMedium className={cn("h-4 w-4", iconClassName)} />
      ) : (
        <MoonStar className={cn("h-4 w-4", iconClassName)} />
      )}
    </Button>
  );
}
