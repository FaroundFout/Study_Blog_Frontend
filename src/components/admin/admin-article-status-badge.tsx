"use client";

import { cn } from "@/lib/utils";

export function AdminArticleStatusBadge({
  status,
  className
}: {
  status?: string;
  className?: string;
}) {
  const normalized =
    status === "published" || status === "private" ? status : "draft";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        normalized === "published" &&
          "border-[#62d4cb]/40 bg-[#62d4cb]/12 text-[#22958d] dark:border-[#2dd4bf]/20 dark:bg-[#0d2d33]/84 dark:text-[#98efe6]",
        normalized === "private" &&
          "border-slate-200/80 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300",
        normalized === "draft" &&
          "border-[#d8c9a6]/55 bg-[#fff7df] text-[#9a7d42] dark:border-[#e7b95d]/24 dark:bg-[#332612]/88 dark:text-[#f4dea6]",
        className,
      )}
    >
      {normalized === "published"
        ? "已发布"
        : normalized === "private"
          ? "私密"
          : "草稿"}
    </span>
  );
}
