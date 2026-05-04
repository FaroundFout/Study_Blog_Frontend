"use client";

import { Copy, ExternalLink, Loader2, Music4, RefreshCw, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AdminInlineLoader,
  AdminKeyValueList,
  AdminMetricStrip,
  AdminNotice,
  AdminPageSkeleton,
  adminDangerGhostButtonClassName,
  adminFieldLabelClassName,
  adminMediaPlaceholderClassName,
  adminPreviewSurfaceClassName,
  adminSelectClassName,
  formatFileSize
} from "@/components/admin/admin-page-kit";
import { AdminStateBadge } from "@/components/admin/admin-state-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteAdminHomeMusic,
  getAdminHomeMusicById,
  getAdminHomeMusicPage,
  uploadAdminHomeMusic
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { HomeMusic, PageResponse } from "@/types";

interface MusicUploadFormState {
  title: string;
  artist: string;
  status: "draft" | "published" | "archived";
  audioFile: File | null;
  coverFile: File | null;
  durationSeconds: number;
}

const emptyForm: MusicUploadFormState = {
  title: "",
  artist: "",
  status: "published",
  audioFile: null,
  coverFile: null,
  durationSeconds: 0
};

const MAX_AUDIO_FILE_SIZE_BYTES = 256 * 1024 * 1024;

function formatDuration(totalSeconds?: number) {
  if (!totalSeconds || totalSeconds <= 0) {
    return "00:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function toneForStatus(status?: string) {
  if (status === "published") {
    return "mint" as const;
  }
  if (status === "draft") {
    return "amber" as const;
  }
  return "slate" as const;
}

function labelForStatus(status?: string) {
  if (status === "published") {
    return "已发布";
  }
  if (status === "draft") {
    return "草稿";
  }
  if (status === "archived") {
    return "已归档";
  }
  return status || "未知状态";
}

export function AdminHomeMusicPage() {
  const { token, hydrated } = useAuthStore();
  const [form, setForm] = useState<MusicUploadFormState>(emptyForm);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    keywordInput: "",
    keyword: "",
    status: ""
  });
  const [pageData, setPageData] = useState<PageResponse<HomeMusic> | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<HomeMusic | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAdminHomeMusicPage(token, {
      pageNum: page,
      pageSize: 8,
      keyword: filters.keyword || undefined,
      status: (filters.status as "draft" | "published" | "archived" | "") || undefined
    })
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setPageData(payload);
        setSelectedId((current) => {
          if (payload.list.some((item) => item.id === current)) {
            return current;
          }
          return payload.list[0]?.id ?? null;
        });
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载首页音乐列表失败。"
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters.keyword, filters.status, hydrated, page, refreshKey, token]);

  useEffect(() => {
    if (!token || !selectedId) {
      setSelectedMusic(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);

    getAdminHomeMusicById(token, selectedId)
      .then((payload) => {
        if (!cancelled) {
          setSelectedMusic(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedMusic(pageData?.list.find((item) => item.id === selectedId) ?? null);
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
  }, [pageData?.list, selectedId, token]);

  useEffect(() => {
    if (!form.audioFile) {
      setForm((current) => ({ ...current, durationSeconds: 0 }));
      return;
    }

    const objectUrl = URL.createObjectURL(form.audioFile);
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = objectUrl;

    const handleLoadedMetadata = () => {
      setForm((current) => ({
        ...current,
        durationSeconds: Number.isFinite(audio.duration) ? Math.floor(audio.duration) : 0
      }));
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.audioFile]);

  const totalPages = Math.max(1, Math.ceil((pageData?.total ?? 0) / Math.max(1, pageData?.pageSize ?? 8)));
  const coverPreviewUrl = useMemo(
    () => (form.coverFile ? URL.createObjectURL(form.coverFile) : ""),
    [form.coverFile],
  );

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  const stats = useMemo(() => {
    const items = pageData?.list ?? [];
    return [
      { label: "当前页条目", value: items.length, accent: "mint" as const },
      {
        label: "已发布",
        value: items.filter((item) => item.status === "published").length,
        accent: "amber" as const
      },
      {
        label: "本页时长",
        value: formatDuration(items.reduce((sum, item) => sum + (item.durationSeconds ?? 0), 0)),
        accent: "sky" as const
      },
      { label: "分页", value: `${page} / ${totalPages}`, accent: "rose" as const }
    ];
  }, [page, pageData?.list, totalPages]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice({ tone: "success", text: "链接已复制到剪贴板。" });
    } catch {
      setNotice({ tone: "error", text: "复制链接失败。" });
    }
  };

  const handleAudioFileChange = (file: File | null, input: HTMLInputElement) => {
    if (!file) {
      setForm((current) => ({
        ...current,
        audioFile: null,
        durationSeconds: 0
      }));
      return;
    }

    if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
      input.value = "";
      setForm((current) => ({
        ...current,
        audioFile: null,
        durationSeconds: 0
      }));
      setNotice({
        tone: "error",
        text: `音频文件过大，请控制在 ${formatFileSize(MAX_AUDIO_FILE_SIZE_BYTES)} 以内。`
      });
      return;
    }

    setForm((current) => ({
      ...current,
      audioFile: file
    }));
    setNotice(null);
  };

  const handleUpload = async () => {
    if (!token) {
      return;
    }
    if (!form.title.trim() || !form.artist.trim() || !form.audioFile) {
      setNotice({ tone: "error", text: "歌曲标题、歌手和音频文件为必填项。" });
      return;
    }

    setUploading(true);
    setNotice({ tone: "info", text: "正在上传歌曲并同步元数据..." });

    try {
      const payload = await uploadAdminHomeMusic(token, {
        title: form.title.trim(),
        artist: form.artist.trim(),
        status: form.status,
        audioFile: form.audioFile,
        coverFile: form.coverFile ?? undefined,
        durationSeconds: form.durationSeconds
      });

      setForm(emptyForm);
      setSelectedId(payload.id);
      setSelectedMusic(payload);
      setPage(1);
      setRefreshKey((current) => current + 1);
      setNotice({ tone: "success", text: `《${payload.title}》上传成功。` });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "上传首页音乐失败。"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: HomeMusic) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`确定要从首页音乐库中删除《${item.title}》吗？`);
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    try {
      await deleteAdminHomeMusic(token, item.id);
      if (selectedId === item.id) {
        setSelectedId(null);
        setSelectedMusic(null);
      }
      setRefreshKey((current) => current + 1);
      setNotice({ tone: "success", text: `《${item.title}》已删除。` });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "删除歌曲失败。"
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!hydrated || !token || loading) {
    return <AdminPageSkeleton sections={3} />;
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm leading-7 text-muted-foreground">
              在这里维护首页播放器使用的歌曲、封面与播放资源，统一整理已上传内容并快速预览当前曲库。
            </p>
            <AdminMetricStrip items={stats} />
          </div>
          <Button variant="secondary" onClick={() => setRefreshKey((current) => current + 1)}>
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        </div>
        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <div className="space-y-6">
          <Card className="space-y-5 p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>歌曲标题</p>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="例如：靠近你"
                />
              </div>

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>歌手</p>
                <Input
                  value={form.artist}
                  onChange={(event) => setForm((current) => ({ ...current, artist: event.target.value }))}
                  placeholder="例如：卡朋特乐队"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_200px]">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>音频文件</p>
                <label className="flex min-h-[84px] cursor-pointer flex-col justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/72 px-4 py-4 transition-colors hover:border-primary/35 hover:bg-background/88">
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
                    className="hidden"
                    onChange={(event) =>
                      handleAudioFileChange(event.target.files?.[0] ?? null, event.target)
                    }
                  />
                  <span className="inline-flex items-start gap-2 text-sm font-medium text-foreground">
                    <Upload className="mt-0.5 h-4 w-4 shrink-0 text-[#4dcfc4]" />
                    <span className="break-all">{form.audioFile ? form.audioFile.name : "选择音频文件"}</span>
                  </span>
                  <span className="mt-2 text-xs leading-6 text-muted-foreground">
                    支持 mp3、wav、ogg、m4a、flac、aac，文件大小不超过 256 MB。
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>状态</p>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as MusicUploadFormState["status"]
                    }))
                  }
                  className={adminSelectClassName}
                >
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                  <option value="archived">已归档</option>
                </select>
                <div className="rounded-[1.2rem] border border-border/60 bg-background/72 px-4 py-3 text-sm text-muted-foreground">
                  时长：<span className="font-medium text-foreground">{formatDuration(form.durationSeconds)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-5 min-[1700px]:grid-cols-[240px_minmax(0,1fr)]">
              <div className="space-y-2">
                <p className={adminFieldLabelClassName}>封面文件</p>
                <label className="flex min-h-[84px] cursor-pointer flex-col justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/72 px-4 py-4 transition-colors hover:border-primary/35 hover:bg-background/88">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        coverFile: event.target.files?.[0] ?? null
                      }))
                    }
                  />
                  <span className="inline-flex items-start gap-2 text-sm font-medium text-foreground">
                    <Upload className="mt-0.5 h-4 w-4 shrink-0 text-[#4dcfc4]" />
                    <span className="break-all">{form.coverFile ? form.coverFile.name : "选择封面图片"}</span>
                  </span>
                  <span className="mt-2 text-xs leading-6 text-muted-foreground">
                    选填，建议为首页播放器卡片上传封面图。
                  </span>
                </label>
              </div>

              <div className="rounded-[1.6rem] border border-border/60 bg-background/70 p-4">
                <p className={adminFieldLabelClassName}>上传预览</p>
                <div className="mt-3 flex min-w-0 flex-col items-start gap-4">
                  <div
                    className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] ${adminMediaPlaceholderClassName}`}
                  >
                    {coverPreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverPreviewUrl} alt="封面预览" className="h-full w-full object-cover" />
                    ) : (
                      <Music4 className="h-7 w-7 text-[#4c666d] dark:text-[#b7ebe4]" />
                    )}
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="truncate text-base font-semibold text-foreground">
                      {form.title || "歌曲标题预览"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {form.artist || "歌手名预览"}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {form.audioFile
                        ? `${formatFileSize(form.audioFile.size)} · ${formatDuration(form.durationSeconds)}`
                        : "选择音频文件后，将在这里自动识别并显示元数据。"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "上传中..." : "上传首页音乐"}
              </Button>
            </div>
          </Card>

          <Card className="space-y-5 p-5 md:p-6">
            <form
              className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_auto_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                setPage(1);
                setFilters((current) => ({ ...current, keyword: current.keywordInput.trim() }));
              }}
            >
              <Input
                value={filters.keywordInput}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, keywordInput: event.target.value }))
                }
                placeholder="搜索标题、歌手或文件名"
              />
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, status: event.target.value }))
                }
                className={adminSelectClassName}
              >
                <option value="">全部状态</option>
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
                <option value="archived">已归档</option>
              </select>
              <Button type="submit" variant="secondary">筛选</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPage(1);
                  setFilters({ keywordInput: "", keyword: "", status: "" });
                }}
              >
                重置
              </Button>
            </form>

            {pageData?.list.length ? (
              <div className="space-y-4">
                {pageData.list.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer border border-border/60 bg-background/74 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-30px_rgba(67,116,117,0.35)]"
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] ${adminMediaPlaceholderClassName}`}
                        >
                          {item.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <Music4 className="h-6 w-6 text-[#4c666d] dark:text-[#b7ebe4]" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-foreground">{item.title}</p>
                            <AdminStateBadge label={labelForStatus(item.status)} tone={toneForStatus(item.status)} />
                          </div>
                          <p className="text-sm text-muted-foreground">{item.artist}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>{formatDuration(item.durationSeconds)}</span>
                            <span>{formatFileSize(item.fileSize)}</span>
                            <span>播放 {item.playCount}</span>
                            <span>点赞 {item.likeCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCopy(item.fileUrl);
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          复制链接
                        </Button>
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button type="button" variant="ghost" size="sm">
                            <ExternalLink className="h-3.5 w-3.5" />
                            打开
                          </Button>
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={adminDangerGhostButtonClassName}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(item);
                          }}
                          disabled={deletingId === item.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingId === item.id ? "删除中..." : "删除"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                <Card className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    第 {page} / {totalPages} 页，共 {pageData.total} 首歌曲
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
            ) : (
              <EmptyState
                title="还没有首页音乐"
                description="先在上方上传第一首歌曲，上传完成后它就会出现在这里供首页播放器使用。"
              />
            )}
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="space-y-5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">歌曲详情</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  从左侧列表中选择一首歌曲，即可在这里预览播放资源与相关元数据。
                </p>
              </div>
              {detailLoading ? <AdminInlineLoader label="正在加载详情..." /> : null}
            </div>

            {selectedMusic ? (
              <div className="space-y-5">
                <div className={`overflow-hidden rounded-[1.6rem] ${adminPreviewSurfaceClassName}`}>
                  <div className="relative flex h-56 items-center justify-center overflow-hidden">
                    {selectedMusic.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedMusic.coverUrl}
                        alt={selectedMusic.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#4c666d] dark:text-[#b7ebe4]">
                        <Music4 className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border/60 bg-white/58 px-4 py-4 dark:border-white/8 dark:bg-[#0b1625]/88">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{selectedMusic.title}</p>
                      <AdminStateBadge
                        label={labelForStatus(selectedMusic.status)}
                        tone={toneForStatus(selectedMusic.status)}
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground dark:text-slate-300">{selectedMusic.artist}</p>
                  </div>
                </div>

                <audio controls src={selectedMusic.fileUrl} className="w-full" preload="metadata" />

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => handleCopy(selectedMusic.fileUrl)}>
                    <Copy className="h-4 w-4" />
                    复制音频链接
                  </Button>
                  <a href={selectedMusic.fileUrl} target="_blank" rel="noreferrer" className="inline-flex">
                    <Button variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                      打开音频
                    </Button>
                  </a>
                </div>

                <AdminKeyValueList
                  items={[
                    { label: "状态", value: labelForStatus(selectedMusic.status) },
                    { label: "时长", value: formatDuration(selectedMusic.durationSeconds) },
                    { label: "文件大小", value: formatFileSize(selectedMusic.fileSize) },
                    { label: "播放次数", value: selectedMusic.playCount },
                    { label: "点赞次数", value: selectedMusic.likeCount },
                    { label: "文件名", value: selectedMusic.fileName },
                    { label: "上传时间", value: formatDate(selectedMusic.createdAt, "YYYY/MM/DD HH:mm") }
                  ]}
                />

                <div className="rounded-[1.25rem] border border-border/60 bg-background/72 px-4 py-3">
                  <p className={adminFieldLabelClassName}>OSS 对象键</p>
                  <p className="mt-2 break-all text-sm leading-6 text-muted-foreground">
                    {selectedMusic.ossObjectKey}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 px-4 py-12 text-center text-sm leading-7 text-muted-foreground">
                还没有选中歌曲。请从列表中选择一首，用于查看它的音频资源和元数据。
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
