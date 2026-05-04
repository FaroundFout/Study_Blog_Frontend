"use client";

import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const adminSelectClassName =
  "flex h-11 w-full rounded-[1.15rem] border border-border/70 bg-card/85 px-4 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

export const adminFieldLabelClassName =
  "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground";

export type AdminAccentTone = "mint" | "amber" | "rose" | "sky" | "slate";

export const adminToneSurfaceClassNames: Record<AdminAccentTone, string> = {
  mint:
    "border-[#62d4cb]/25 bg-[#f2fcfa] dark:border-[#2dd4bf]/18 dark:bg-[linear-gradient(180deg,rgba(12,43,50,0.92),rgba(9,27,35,0.84))]",
  amber:
    "border-[#e7d3ab]/45 bg-[#fffaee] dark:border-[#e7b95d]/18 dark:bg-[linear-gradient(180deg,rgba(58,45,20,0.8),rgba(34,25,12,0.88))]",
  sky:
    "border-sky-200/65 bg-sky-50/75 dark:border-sky-400/16 dark:bg-[linear-gradient(180deg,rgba(18,45,72,0.82),rgba(10,24,42,0.88))]",
  rose:
    "border-rose-200/65 bg-rose-50/75 dark:border-rose-400/14 dark:bg-[linear-gradient(180deg,rgba(63,36,48,0.78),rgba(30,17,24,0.9))]",
  slate: "border-border/65 bg-background/70 dark:border-white/8 dark:bg-white/[0.04]"
};

export const adminToneBadgeClassNames: Record<AdminAccentTone, string> = {
  mint:
    "border-[#62d4cb]/45 bg-[#eefaf7] text-[#247c76] dark:border-[#2dd4bf]/22 dark:bg-[#0d2d33]/84 dark:text-[#98efe6]",
  amber:
    "border-[#e3cb8d]/55 bg-[#fff7df] text-[#9a7d42] dark:border-[#e7b95d]/24 dark:bg-[#332612]/88 dark:text-[#f4dea6]",
  rose:
    "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-400/20 dark:bg-rose-500/12 dark:text-rose-200",
  sky:
    "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-400/20 dark:bg-sky-500/12 dark:text-sky-200",
  slate:
    "border-border/70 bg-background/75 text-muted-foreground dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300"
};

export const adminDangerGhostButtonClassName =
  "text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-300 dark:hover:bg-rose-500/12 dark:hover:text-rose-200";

export const adminPreviewBackdropClassName =
  "bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(242,247,244,0.9))] dark:bg-[linear-gradient(135deg,rgba(13,21,37,0.96),rgba(9,16,29,0.95))]";

export const adminPreviewSurfaceClassName =
  `border border-border/65 dark:border-white/10 ${adminPreviewBackdropClassName}`;

export const adminInsetPanelClassName =
  "border border-border/60 bg-white/72 dark:border-white/8 dark:bg-white/[0.05]";

export const adminMediaPlaceholderClassName =
  "bg-[linear-gradient(135deg,rgba(243,239,187,0.88),rgba(207,246,237,0.9))] dark:bg-[linear-gradient(135deg,rgba(24,46,58,0.98),rgba(13,28,41,0.96))]";

export const adminAvatarTileClassName =
  "bg-[#f3efbb] text-[#4f676d] dark:bg-[linear-gradient(135deg,rgba(86,84,31,0.62),rgba(20,41,49,0.96))] dark:text-[#ddf7f0]";

export const adminMintIconSurfaceClassName =
  "border border-[#62d4cb]/25 bg-[#edf8f6] text-[#2b8c81] dark:border-[#2dd4bf]/18 dark:bg-[#0d2d33]/84 dark:text-[#82e6dd]";

export function AdminPageSkeleton({
  sections = 3
}: {
  sections?: number;
}) {
  return (
    <div className="space-y-6">
      <Card className="animate-pulse p-6">
        <div className="h-4 w-28 rounded-full bg-accent/85" />
        <div className="mt-4 h-10 w-64 rounded-full bg-accent/85" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-accent/65" />
      </Card>
      {Array.from({ length: sections }).map((_, index) => (
        <Card key={index} className="animate-pulse p-6">
          <div className="h-10 rounded-[1.2rem] bg-accent/80" />
          <div className="mt-4 h-24 rounded-[1.5rem] bg-accent/65" />
        </Card>
      ))}
    </div>
  );
}

export function AdminNotice({
  tone = "info",
  children,
  className
}: {
  tone?: "info" | "success" | "error";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border px-4 py-3 text-sm leading-6",
        tone === "success" && adminToneBadgeClassNames.mint,
        tone === "error" && adminToneBadgeClassNames.rose,
        tone === "info" && adminToneBadgeClassNames.slate,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminMetricStrip({
  items
}: {
  items: Array<{
    label: string;
    value: string | number;
    accent?: "mint" | "amber" | "sky" | "rose";
  }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-[1.4rem] border px-4 py-4 shadow-[0_16px_30px_-28px_rgba(64,86,109,0.36)] dark:shadow-[0_18px_36px_-30px_rgba(2,6,23,0.72)]",
            adminToneSurfaceClassNames[item.accent ?? "slate"],
          )}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminKeyValueList({
  items,
  className
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start justify-between gap-4 rounded-[1.2rem] border border-border/60 bg-background/72 px-4 py-3"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {item.label}
          </span>
          <span className="max-w-[60%] text-right text-sm text-foreground">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AdminModal({
  open,
  onClose,
  title,
  description,
  className,
  children,
  footer
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(33,40,53,0.28)] px-4 py-6 backdrop-blur-sm md:py-8">
      <div className="flex min-h-full items-start justify-center md:items-center">
        <button
          type="button"
          aria-label="Close modal"
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
        <div
          className={cn(
            "relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,247,242,0.95))] shadow-[0_40px_80px_-48px_rgba(49,70,75,0.42)]",
            "max-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-4rem)]",
            "dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,20,35,0.96),rgba(14,23,38,0.94))] dark:shadow-[0_40px_84px_-44px_rgba(2,6,23,0.9)]",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/60 px-6 py-5 md:px-7">
            <div className="space-y-1">
              <p className="text-xl font-semibold tracking-tight text-foreground">{title}</p>
              {description ? (
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/78 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-7">{children}</div>
          {footer ? (
            <div className="border-t border-border/60 px-6 py-4 md:px-7">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AdminInlineLoader({
  label = "加载中..."
}: {
  label?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function formatFileSize(bytes?: number) {
  if (!bytes) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function looksLikeImage(value?: string, contentType?: string) {
  if (contentType?.startsWith("image/")) {
    return true;
  }

  if (!value) {
    return false;
  }

  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(value);
}
