"use client";

import { adminToneBadgeClassNames, type AdminAccentTone } from "@/components/admin/admin-page-kit";
import { cn } from "@/lib/utils";

export type AdminStateTone = AdminAccentTone;

export function AdminStateBadge({
  label,
  tone = "slate",
  className
}: {
  label: string;
  tone?: AdminStateTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        adminToneBadgeClassNames[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
