"use client";

import * as Progress from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
import type { UploadProgressSnapshot } from "@/types";

export type UploadProgressStatus = "uploading" | "retrying" | "success" | "error";

export interface UploadProgressState {
  fileName: string;
  progress: UploadProgressSnapshot;
  status: UploadProgressStatus;
}

const statusLabels: Record<UploadProgressStatus, string> = {
  uploading: "正在上传",
  retrying: "会话已刷新，正在重新上传",
  success: "上传完成",
  error: "上传失败"
};

export function UploadProgressBar({
  fileName,
  progress,
  status = "uploading",
  className
}: {
  fileName: string;
  progress: UploadProgressSnapshot;
  status?: UploadProgressStatus;
  className?: string;
}) {
  const value = progress.percent;
  const valueText = value === null ? "大小未知" : `${Math.round(value)}%`;

  return (
    <div
      className={cn(
        "rounded-[1.1rem] border border-border/65 bg-background/72 px-3.5 py-3",
        status === "error" && "border-rose-300/70 bg-rose-50/70 dark:border-rose-400/20 dark:bg-rose-500/10",
        status === "success" && "border-emerald-300/60 bg-emerald-50/65 dark:border-emerald-400/20 dark:bg-emerald-500/10",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-xs" aria-live="polite">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{fileName}</p>
          <p className="mt-0.5 text-muted-foreground">{statusLabels[status]}</p>
        </div>
        <span className="shrink-0 font-mono font-semibold text-foreground">{valueText}</span>
      </div>
      <Progress.Root
        value={value}
        max={100}
        aria-label={`${fileName} ${statusLabels[status]}`}
        getValueLabel={() => `${statusLabels[status]}，${valueText}`}
        className="relative h-2.5 overflow-hidden rounded-full bg-accent"
      >
        <Progress.Indicator
          className={cn(
            "h-full rounded-full bg-primary transition-transform duration-200 ease-out",
            value === null && "w-2/5",
            status === "error" && "bg-rose-500",
          )}
          style={value === null ? undefined : { transform: `translateX(-${100 - value}%)` }}
        />
      </Progress.Root>
    </div>
  );
}
