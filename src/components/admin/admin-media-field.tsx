"use client";

import { Copy, ExternalLink, ImagePlus, Upload } from "lucide-react";
import { useState } from "react";

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
import { uploadAdminFile } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { UploadedFilePayload } from "@/types";

export function AdminMediaField({
  label,
  value,
  placeholder,
  helperText,
  accept = "image/*",
  onChange
}: {
  label: string;
  value: string;
  placeholder: string;
  helperText?: string;
  accept?: string;
  onChange: (value: string) => void;
}) {
  const { token } = useAuthStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
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

    try {
      const payload = await uploadAdminFile(token, file);
      onChange(payload.fileUrl);
      setNotice({ tone: "success", text: `${payload.originalName} 已回填到当前字段。` });
    } catch (error) {
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
          <p className={adminFieldLabelClassName}>{label}</p>
          {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer">
            <input type="file" accept={accept} className="hidden" onChange={handleUpload} />
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />

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
