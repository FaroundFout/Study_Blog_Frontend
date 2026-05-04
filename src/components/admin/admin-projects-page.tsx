"use client";

import Link from "next/link";
import { ExternalLink, FilePenLine, RefreshCw, Star, Trash2 } from "lucide-react";
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
import { deleteAdminProject, getAdminProjects } from "@/lib/api";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { PageResponse, Project } from "@/types";

function normalizeProjectStatus(status?: string) {
  if (status === "planning" || status === "ongoing" || status === "completed") {
    return status;
  }

  if (status === "active") {
    return "ongoing";
  }

  if (status === "archived") {
    return "completed";
  }

  return "planning";
}

function projectTone(status?: string) {
  const normalized = normalizeProjectStatus(status);
  if (normalized === "completed") {
    return "sky";
  }
  if (normalized === "planning") {
    return "amber";
  }
  return "mint";
}

export function AdminProjectsPage() {
  const { token, hydrated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    keywordInput: "",
    keyword: "",
    status: "",
    featured: ""
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<Project> | null>(null);
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

    getAdminProjects(token, {
      pageNum: page,
      pageSize: 10,
      keyword: filters.keyword || undefined,
      status:
        filters.status === "planning" ||
        filters.status === "ongoing" ||
        filters.status === "completed"
          ? filters.status
          : undefined,
      isFeatured: filters.featured === "1" ? 1 : undefined
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
            text: error instanceof Error ? error.message : "加载项目列表失败。"
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
  }, [filters.featured, filters.keyword, filters.status, hydrated, page, refreshKey, token]);

  const stats = useMemo(() => {
    const featuredCount =
      pageData?.list.filter((item) => item.isFeatured === 1).length ?? 0;
    const completedCount =
      pageData?.list.filter((item) => normalizeProjectStatus(item.status) === "completed")
        .length ?? 0;

    return [
      { label: "当前页项目", value: pageData?.list.length ?? 0, accent: "mint" as const },
      { label: "推荐项目", value: featuredCount, accent: "amber" as const },
      { label: "已完成", value: completedCount, accent: "sky" as const },
      { label: "当前分页", value: `${page} / ${totalPages}`, accent: "rose" as const }
    ];
  }, [page, pageData?.list, totalPages]);

  const handleDelete = async (project: Project) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`确认删除项目 ${project.name} 吗？`);
    if (!confirmed) {
      return;
    }

    setDeletingId(project.id);

    try {
      await deleteAdminProject(token, project.id);
      setNotice({ tone: "success", text: `${project.name} 已删除。` });
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
              项目页适合维护封面、简介、技术栈和状态，让前台展示更完整。
            </p>
            <AdminMetricStrip items={stats} />
          </div>
          <Link href="/admin/projects/new" className="inline-flex">
            <Button>
              <FilePenLine className="h-4 w-4" />
              新建项目
            </Button>
          </Link>
        </div>

        <form
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_170px_auto_auto]"
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
            placeholder="搜索项目名、摘要或技术栈"
          />
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
            className={adminSelectClassName}
          >
            <option value="">全部状态</option>
            <option value="planning">规划中</option>
            <option value="ongoing">进行中</option>
            <option value="completed">已完成</option>
          </select>
          <select
            value={filters.featured}
            onChange={(event) =>
              setFilters((current) => ({ ...current, featured: event.target.value }))
            }
            className={adminSelectClassName}
          >
            <option value="">全部推荐状态</option>
            <option value="1">仅推荐项目</option>
          </select>
          <Button type="submit" variant="secondary">
            筛选
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setPage(1);
              setFilters({
                keywordInput: "",
                keyword: "",
                status: "",
                featured: ""
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
            {pageData.list.map((project) => (
              <Card key={project.id} className="space-y-5 p-5 md:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStateBadge
                        label={PROJECT_STATUS_LABELS[normalizeProjectStatus(project.status)]}
                        tone={projectTone(project.status)}
                      />
                      {project.isFeatured === 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#e7d3ab]/45 bg-[#fff7df] px-2.5 py-1 text-[11px] text-[#9a7d42] dark:border-[#e7b95d]/24 dark:bg-[#332612]/88 dark:text-[#f4dea6]">
                          <Star className="h-3.5 w-3.5" />
                          推荐
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xl font-semibold tracking-tight text-foreground">
                        {project.name}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                        {project.summary || "这条项目记录还没有填写摘要。"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Slug：{project.slug}</span>
                      <span>开始：{formatDate(project.startDate, "YYYY/MM/DD")}</span>
                      <span>结束：{project.endDate ? formatDate(project.endDate, "YYYY/MM/DD") : "进行中"}</span>
                    </div>

                    {project.techStack ? (
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.split(/[，,]/).map((item) => (
                          <span
                            key={`${project.id}-${item}`}
                            className="inline-flex rounded-full bg-accent/78 px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            {item.trim()}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.slug ? (
                      <Link href={`/projects/${project.slug}`} target="_blank" className="inline-flex">
                        <Button variant="secondary">
                          <ExternalLink className="h-4 w-4" />
                          预览前台
                        </Button>
                      </Link>
                    ) : null}
                    <Link href={`/admin/projects/${project.id}`} className="inline-flex">
                      <Button>编辑</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className={adminDangerGhostButtonClassName}
                      onClick={() => handleDelete(project)}
                      disabled={deletingId === project.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === project.id ? "删除中..." : "删除"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              第 {page} / {totalPages} 页，共 {pageData.total} 个项目
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
          title="还没有符合条件的项目"
          description="你可以先创建一个项目，或清空筛选条件看看其它内容。"
          actionHref="/admin/projects/new"
          actionLabel="新建项目"
        />
      )}
    </div>
  );
}
