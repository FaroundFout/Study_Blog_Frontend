"use client";

import { Copy, ExternalLink, ImagePlus, Upload } from "lucide-react";
import { useId, useState } from "react";

import { AdminMediaLibrary } from "@/components/admin/admin-media-library";
import {
  AdminModal,
  AdminNotice,
  adminInsetPanelClassName,
  adminFieldLabelClassName,
  adminPreviewBackdropClassName,
  looksLikeImage
} from "@/components/admin/admin-page-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UploadProgressBar,
  type UploadProgressState
} from "@/components/common/upload-progress-bar";
import { uploadAdminFile } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { UploadedFilePayload } from "@/types";

export function AdminMediaField({
  name,
  label,
  value,
  placeholder,
  helperText,
  accept = "image/*",
  onChange
}: {
  name?: string;
  label: string;
  value: string;
  placeholder: string;
  helperText?: string;
  accept?: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  const { token } = useAuthStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState | null>(null);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !token) {
      return;
    }

    setUploading(true);
    setNotice({ tone: "info", text: `正在上传 ${file.name}...` });
    setUploadProgress({
      fileName: file.name,
      progress: { loaded: 0, total: file.size, percent: 0 },
      status: "uploading"
    });

    try {
      const payload = await uploadAdminFile(token, file, {
        onProgress: (progress) => {
          setUploadProgress((current) => ({
            fileName: file.name,
            progress,
            status: current?.status === "retrying" ? "retrying" : "uploading"
          }));
        },
        onAuthRetry: () => {
          setNotice({ tone: "info", text: "会话已刷新，正在重新上传。" });
          setUploadProgress((current) => ({
            fileName: file.name,
            progress: current?.progress ?? { loaded: 0, total: file.size, percent: 0 },
            status: "retrying"
          }));
        }
      });
      onChange(payload.fileUrl);
      setUploadProgress((current) => current ? {
        ...current,
        progress: { ...current.progress, percent: 100 },
        status: "success"
      } : null);
      setNotice({ tone: "success", text: `${payload.originalName} 已回填到当前字段。` });
    } catch (error) {
      setUploadProgress((current) => current ? { ...current, status: "error" } : null);
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "上传失败，请稍后再试。"
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleCopy = async () => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setNotice({ tone: "success", text: "地址已复制到剪贴板。" });
    } catch {
      setNotice({ tone: "error", text: "复制失败，请手动复制。" });
    }
  };

  const handleSelect = (file: UploadedFilePayload) => {
    onChange(file.fileUrl);
    setPickerOpen(false);
    setNotice({ tone: "success", text: `${file.originalName} 已用于当前字段。` });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <label htmlFor={inputId} className={adminFieldLabelClassName}>{label}</label>
          {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={`inline-flex ${uploading ? "cursor-not-allowed opacity-65" : "cursor-pointer"}`}>
            <input type="file" accept={accept} className="hidden" onChange={handleUpload} disabled={uploading} />
            <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-background/76 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground">
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "上传中..." : "上传"}
            </span>
          </label>
          <Button type="button" size="sm" variant="ghost" onClick={() => setPickerOpen(true)}>
            <ImagePlus className="h-3.5 w-3.5" />
            媒体库
          </Button>
        </div>
      </div>

      <Input
        id={inputId}
        name={name ?? inputId}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />

      {uploadProgress ? <UploadProgressBar {...uploadProgress} /> : null}

      {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}

      {value ? (
        <div className="overflow-hidden rounded-[1.45rem] border border-border/65 bg-background/72">
          <div className={`flex h-44 items-center justify-center ${adminPreviewBackdropClassName}`}>
            {looksLikeImage(value) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt={label} className="h-full w-full object-cover" />
            ) : (
              <div
                className={`rounded-[1.35rem] px-4 py-3 text-sm text-muted-foreground shadow-sm dark:text-slate-300 dark:shadow-none ${adminInsetPanelClassName}`}
              >
                当前字段已填写文件地址
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-4 py-3">
            <Button type="button" size="sm" variant="secondary" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" />
              复制地址
            </Button>
            <a href={value} target="_blank" rel="noreferrer" className="inline-flex">
              <Button type="button" size="sm" variant="ghost">
                <ExternalLink className="h-3.5 w-3.5" />
                打开
              </Button>
            </a>
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
              清空
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-border/70 bg-background/55 px-4 py-8 text-center text-sm text-muted-foreground">
          还没有选择文件，可以直接上传，或者从媒体库挑选历史文件。
        </div>
      )}

      <AdminModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="从媒体库选择文件"
        description="这里会展示你已经上传过的文件，选择后会自动把地址回填到当前字段。"
        className="max-w-7xl"
      >
        <AdminMediaLibrary mode="picker" selectedUrl={value} onSelect={handleSelect} />
      </AdminModal>
    </div>
  );
}
