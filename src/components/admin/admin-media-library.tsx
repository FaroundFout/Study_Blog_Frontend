"use client";

import { Copy, ExternalLink, FileImage, Files, Loader2, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AdminInlineLoader,
  AdminKeyValueList,
  AdminMetricStrip,
  AdminNotice,
  AdminPageSkeleton,
  formatFileSize,
  looksLikeImage
} from "@/components/admin/admin-page-kit";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteAdminUploadedFile,
  getAdminUploadedFileById,
  getAdminUploadedFiles,
  uploadAdminFile
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { PageResponse, UploadedFilePayload } from "@/types";

interface AdminMediaLibraryProps {
  mode?: "page" | "picker";
  selectedUrl?: string;
  onSelect?: (file: UploadedFilePayload) => void;
}

function MediaCard({
  file,
  active,
  onClick,
  onCopy,
  onUse,
  selectionMode
}: {
  file: UploadedFilePayload;
  active: boolean;
  onClick: () => void;
  onCopy: () => void;
  onUse?: () => void;
  selectionMode: boolean;
}) {
  const isImage = looksLikeImage(file.fileUrl, file.contentType);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-full flex-col overflow-hidden rounded-[1.55rem] border text-left transition-all duration-300 ${
        active
          ? "border-[#62d4cb]/45 bg-white/92 shadow-[0_22px_36px_-30px_rgba(62,116,117,0.4)] dark:border-[#2dd4bf]/22 dark:bg-[#0d2d33]/84 dark:shadow-[0_22px_36px_-30px_rgba(2,6,23,0.76)]"
          : "border-border/65 bg-background/72 hover:-translate-y-0.5 hover:border-foreground/12 hover:shadow-[0_22px_36px_-32px_rgba(62,84,89,0.24)] dark:border-white/8 dark:bg-white/[0.04] dark:hover:border-white/16 dark:hover:shadow-[0_22px_36px_-30px_rgba(2,6,23,0.78)]"
      }`}
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden border-b border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(243,247,244,0.95))] dark:border-white/8 dark:bg-[linear-gradient(135deg,rgba(13,21,37,0.96),rgba(9,16,29,0.95))]">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.fileUrl} alt={file.originalName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white/85 text-[#66c8be] shadow-[0_18px_24px_-20px_rgba(80,120,115,0.4)] dark:bg-white/[0.06] dark:text-[#98efe6] dark:shadow-[0_18px_24px_-20px_rgba(2,6,23,0.78)]">
            <Files className="h-8 w-8" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full border border-white/65 bg-white/85 px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm dark:border-white/10 dark:bg-[#101827]/88 dark:text-slate-300">
          {isImage ? "Image" : "File"}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-1">
          <p className="line-clamp-1 text-sm font-semibold text-foreground">{file.originalName}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {file.contentType || "未知类型"}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(file.createdAt, "YYYY/MM/DD HH:mm")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-full"
              onClick={(event) => {
                event.stopPropagation();
                onCopy();
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              复制
            </Button>
            {selectionMode && onUse ? (
              <Button
                type="button"
                size="sm"
                className="rounded-full"
                onClick={(event) => {
                  event.stopPropagation();
                  onUse();
                }}
              >
                使用
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

export function AdminMediaLibrary({
  mode = "page",
  selectedUrl,
  onSelect
}: AdminMediaLibraryProps) {
  const { token, hydrated } = useAuthStore();
  const [filePage, setFilePage] = useState<PageResponse<UploadedFilePayload> | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<UploadedFilePayload | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const selectionMode = mode === "picker";
  const totalPages = Math.max(
    1,
    Math.ceil((filePage?.total ?? 0) / Math.max(1, filePage?.pageSize ?? 12)),
  );

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAdminUploadedFiles(token, {
      pageNum: page,
      pageSize: selectionMode ? 8 : 12,
      keyword: keyword || undefined
    })
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setFilePage(payload);
        setSelectedId((current) => {
          const matchedById = payload.list.some((item) => item.id === current);
          if (matchedById) {
            return current;
          }

          const matchedByUrl = selectedUrl
            ? payload.list.find((item) => item.fileUrl === selectedUrl)
            : null;
          return matchedByUrl?.id ?? payload.list[0]?.id ?? null;
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setNotice({
          tone: "error",
          text: error instanceof Error ? error.message : "加载媒体库失败。"
        });
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, keyword, page, refreshKey, selectedUrl, selectionMode, token]);

  useEffect(() => {
    if (!token || !selectedId) {
      setSelectedFile(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);

    getAdminUploadedFileById(token, selectedId)
      .then((payload) => {
        if (!cancelled) {
          setSelectedFile(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = filePage?.list.find((item) => item.id === selectedId) ?? null;
          setSelectedFile(fallback);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filePage?.list, selectedId, token]);

  const stats = useMemo(
    () => [
      { label: "当前页文件", value: filePage?.list.length ?? 0, accent: "mint" as const },
      { label: "全部文件", value: filePage?.total ?? 0, accent: "amber" as const },
      { label: "图片数量", value: filePage?.list.filter((item) => looksLikeImage(item.fileUrl, item.contentType)).length ?? 0, accent: "sky" as const },
      { label: "当前分页", value: `${page} / ${totalPages}`, accent: "rose" as const }
    ],
    [filePage?.list, filePage?.total, page, totalPages],
  );

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice({ tone: "success", text: "文件地址已复制到剪贴板。" });
    } catch {
      setNotice({ tone: "error", text: "复制失败，请手动复制地址。" });
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !token) {
      return;
    }

    setUploading(true);
    setNotice({ tone: "info", text: `正在上传 ${file.name}...` });

    try {
      const payload = await uploadAdminFile(token, file);
      setNotice({ tone: "success", text: `${payload.originalName} 上传完成。` });
      setSelectedId(payload.id);
      setSelectedFile(payload);
      setPage(1);
      setRefreshKey((current) => current + 1);
      if (selectionMode && onSelect) {
        onSelect(payload);
      }
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "文件上传失败。"
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (file: UploadedFilePayload) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`确认删除 ${file.originalName} 吗？这会移除已上传文件记录。`);
    if (!confirmed) {
      return;
    }

    setDeletingId(file.id);

    try {
      await deleteAdminUploadedFile(token, file.id);
      setNotice({ tone: "success", text: `${file.originalName} 已删除。` });
      if (selectedId === file.id) {
        setSelectedId(null);
        setSelectedFile(null);
      }
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "删除文件失败。"
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!hydrated || !token || loading) {
    return <AdminPageSkeleton sections={selectionMode ? 2 : 3} />;
  }

  return (
    <div className="space-y-6">
      <Card className={selectionMode ? "space-y-5 p-5" : "space-y-6 p-5 md:p-6"}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            {!selectionMode ? (
              <>
                <p className="text-xs uppercase tracking-[0.24em] text-primary/80">media desk</p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-[2.2rem]">
                  媒体库与上传中心
                </h2>
              </>
            ) : (
              <p className="text-base font-semibold text-foreground">选择已有文件</p>
            )}
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              上传成功后的文件会进入媒体库，你可以在文章封面、项目封面、站点 Logo 和头像等表单里重复复用它们。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer">
              <input type="file" className="hidden" onChange={handleUpload} />
              <span className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[0_10px_22px_-16px_rgba(63,73,99,0.5)] transition-transform hover:-translate-y-0.5">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "上传中..." : "上传文件"}
              </span>
            </label>
            <Button variant="secondary" onClick={() => setRefreshKey((current) => current + 1)}>
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          </div>
        </div>

        {!selectionMode ? <AdminMetricStrip items={stats} /> : null}

        <form
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setKeyword(keywordInput.trim());
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="按文件名、路径或类型搜索"
              className="pl-11"
            />
          </div>
          <Button type="submit" variant="secondary">
            搜索
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setKeywordInput("");
              setKeyword("");
              setPage(1);
            }}
          >
            清空
          </Button>
        </form>

        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      {filePage?.list.length ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className={`grid gap-4 ${selectionMode ? "md:grid-cols-2" : "md:grid-cols-2 2xl:grid-cols-3"}`}>
              {filePage.list.map((file) => (
                <MediaCard
                  key={file.id}
                  file={file}
                  active={selectedId === file.id}
                  onClick={() => setSelectedId(file.id)}
                  onCopy={() => handleCopy(file.fileUrl)}
                  onUse={onSelect ? () => onSelect(file) : undefined}
                  selectionMode={selectionMode}
                />
              ))}
            </div>

            <Card className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 页，共 {filePage.total} 个文件
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  上一页
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  下一页
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <Card className="space-y-5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">文件详情</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    选中文件后，可以直接复制地址、打开或用于表单字段。
                  </p>
                </div>
                {detailLoading ? <AdminInlineLoader label="读取详情..." /> : null}
              </div>

              {selectedFile ? (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[1.5rem] border border-border/65 bg-background/72">
                    <div className="flex h-52 items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(243,247,244,0.95))] dark:bg-[linear-gradient(135deg,rgba(13,21,37,0.96),rgba(9,16,29,0.95))]">
                      {looksLikeImage(selectedFile.fileUrl, selectedFile.contentType) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedFile.fileUrl}
                          alt={selectedFile.originalName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/90 text-[#66c8be] shadow-[0_20px_28px_-24px_rgba(80,120,115,0.42)] dark:bg-white/[0.06] dark:text-[#98efe6] dark:shadow-[0_20px_28px_-24px_rgba(2,6,23,0.78)]">
                          <FileImage className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border/60 px-4 py-3">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">
                        {selectedFile.originalName}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {selectedFile.fileUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => handleCopy(selectedFile.fileUrl)}>
                      <Copy className="h-4 w-4" />
                      复制地址
                    </Button>
                    <a href={selectedFile.fileUrl} target="_blank" rel="noreferrer" className="inline-flex">
                      <Button variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                        打开文件
                      </Button>
                    </a>
                    {onSelect ? (
                      <Button onClick={() => onSelect(selectedFile)}>用于当前字段</Button>
                    ) : null}
                  </div>

                  <AdminKeyValueList
                    items={[
                      { label: "文件类型", value: selectedFile.contentType || "未知" },
                      { label: "文件大小", value: formatFileSize(selectedFile.fileSize) },
                      { label: "存储名", value: selectedFile.storedName },
                      { label: "上传时间", value: formatDate(selectedFile.createdAt, "YYYY/MM/DD HH:mm") }
                    ]}
                  />

                  <Button
                    variant="ghost"
                    className="w-full justify-between rounded-[1rem] px-4 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    disabled={deletingId === selectedFile.id}
                    onClick={() => handleDelete(selectedFile)}
                  >
                    <span>{deletingId === selectedFile.id ? "删除中..." : "删除文件"}</span>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 px-4 py-12 text-center text-sm leading-7 text-muted-foreground">
                  先从左侧选中文件，这里会展示更完整的元信息和快捷操作。
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState
          title="媒体库还没有匹配结果"
          description="你可以先上传一个文件，或者清空搜索条件看看历史上传记录。"
        />
      )}
    </div>
  );
}
