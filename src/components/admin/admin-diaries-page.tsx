"use client";

import Link from "next/link";
import { CalendarDays, Clock3, FilePenLine, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AdminMetricStrip,
  AdminNotice,
  AdminPageSkeleton,
  adminDangerGhostButtonClassName,
  adminSelectClassName
} from "@/components/admin/admin-page-kit";
import { AdminStateBadge } from "@/components/admin/admin-state-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteAdminDiary, getAdminDiaries } from "@/lib/api";
import { DIARY_VISIBILITY_LABELS } from "@/lib/constants";
import { formatDate, splitCommaText } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { Diary, PageResponse } from "@/types";

function visibilityTone(visibility?: string) {
  return visibility === "private" ? "slate" : "mint";
}

export function AdminDiariesPage() {
  const { token, hydrated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    titleInput: "",
    title: "",
    visibility: "",
    startDate: "",
    endDate: ""
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<Diary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const totalPages = Math.max(
    1,
    Math.ceil((pageData?.total ?? 0) / Math.max(1, pageData?.pageSize ?? 10)),
  );

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAdminDiaries(token, {
      pageNum: page,
      pageSize: 10,
      title: filters.title || undefined,
      visibility:
        filters.visibility === "public" || filters.visibility === "private"
          ? filters.visibility
          : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    })
      .then((payload) => {
        if (!cancelled) {
          setPageData(payload);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载日记列表失败。"
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
  }, [filters.endDate, filters.startDate, filters.title, filters.visibility, hydrated, page, refreshKey, token]);

  const stats = useMemo(() => {
    const publicCount =
      pageData?.list.filter((item) => item.visibility !== "private").length ?? 0;
    const privateCount =
      pageData?.list.filter((item) => item.visibility === "private").length ?? 0;
    const totalHours = (
      pageData?.list.reduce((sum, item) => sum + (item.studyHours ?? 0), 0) ?? 0
    ).toFixed(1);

    return [
      { label: "当前页日记", value: pageData?.list.length ?? 0, accent: "mint" as const },
      { label: "公开条数", value: publicCount, accent: "sky" as const },
      { label: "私密条数", value: privateCount, accent: "amber" as const },
      { label: "学习时长", value: `${totalHours} h`, accent: "rose" as const }
    ];
  }, [pageData?.list]);

  const handleDelete = async (diary: Diary) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`确认删除《${diary.title}》吗？`);
    if (!confirmed) {
      return;
    }

    setDeletingId(diary.id);

    try {
      await deleteAdminDiary(token, diary.id);
      setNotice({ tone: "success", text: `${diary.title} 已删除。` });
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "删除失败，请稍后再试。"
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              这里管理的是后台日记内容，支持按标题、可见性和日期范围筛选。
            </p>
            <AdminMetricStrip items={stats} />
          </div>
          <Link href="/admin/diaries/new" className="inline-flex">
            <Button>
              <FilePenLine className="h-4 w-4" />
              写新日记
            </Button>
          </Link>
        </div>

        <form
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_170px_170px_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setFilters((current) => ({ ...current, title: current.titleInput.trim() }));
          }}
        >
          <Input
            value={filters.titleInput}
            onChange={(event) =>
              setFilters((current) => ({ ...current, titleInput: event.target.value }))
            }
            placeholder="搜索标题或标签"
          />
          <select
            value={filters.visibility}
            onChange={(event) =>
              setFilters((current) => ({ ...current, visibility: event.target.value }))
            }
            className={adminSelectClassName}
          >
            <option value="">全部可见性</option>
            <option value="public">公开</option>
            <option value="private">私密</option>
          </select>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(event) =>
              setFilters((current) => ({ ...current, startDate: event.target.value }))
            }
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(event) =>
              setFilters((current) => ({ ...current, endDate: event.target.value }))
            }
          />
          <Button type="submit" variant="secondary">
            筛选
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setPage(1);
              setFilters({
                titleInput: "",
                title: "",
                visibility: "",
                startDate: "",
                endDate: ""
              });
            }}
          >
            清空
          </Button>
        </form>

        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}
      </Card>

      {pageData?.list.length ? (
        <>
          <div className="space-y-4">
            {pageData.list.map((diary) => (
              <Card key={diary.id} className="space-y-4 p-5 md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStateBadge
                        label={DIARY_VISIBILITY_LABELS[diary.visibility ?? "public"] || "公开"}
                        tone={visibilityTone(diary.visibility)}
                      />
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(diary.diaryDate, "YYYY/MM/DD")}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300">
                        <Clock3 className="h-3.5 w-3.5" />
                        {diary.studyHours ?? 0} h
                      </span>
                    </div>

                    <div>
                      <p className="text-xl font-semibold tracking-tight text-foreground">
                        {diary.title}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                        {diary.summary || "这篇日记的摘要会由正文自动提炼或在前台展示时生成。"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {splitCommaText(diary.tagsText).length ? (
                        splitCommaText(diary.tagsText).map((tag) => (
                          <span
                            key={`${diary.id}-${tag}`}
                            className="inline-flex rounded-full bg-accent/78 px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">暂未填写标签</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/diaries/${diary.id}`} className="inline-flex">
                      <Button>编辑</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className={adminDangerGhostButtonClassName}
                      onClick={() => handleDelete(diary)}
                      disabled={deletingId === diary.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === diary.id ? "删除中..." : "删除"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              第 {page} / {totalPages} 页，共 {pageData.total} 条日记
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRefreshKey((current) => current + 1)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                刷新
              </Button>
            </div>
          </Card>
        </>
      ) : (
        <EmptyState
          title="还没有符合条件的日记"
          description="可以先写一篇新的学习日记，或清空筛选条件看看历史记录。"
          actionHref="/admin/diaries/new"
          actionLabel="去写日记"
        />
      )}
    </div>
  );
}
