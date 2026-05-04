"use client";

import Link from "next/link";
import { ExternalLink, FilePenLine, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AdminMetricStrip,
  AdminNotice,
  AdminPageSkeleton,
  adminSelectClassName
} from "@/components/admin/admin-page-kit";
import { AdminStateBadge } from "@/components/admin/admin-state-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteAdminFriendLink, getAdminFriendLinks } from "@/lib/api";
import { FRIEND_LINK_STATUS_LABELS } from "@/lib/constants";
import { useAuthStore } from "@/store/auth-store";
import type { FriendLink, FriendLinkStatus, PageResponse } from "@/types";

function friendLinkTone(status?: string) {
  if (status === "approved") {
    return "mint";
  }
  if (status === "rejected") {
    return "rose";
  }
  return "amber";
}

export function AdminFriendLinksPage() {
  const { token, hydrated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    keywordInput: "",
    keyword: "",
    status: ""
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<FriendLink> | null>(null);
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

    getAdminFriendLinks(token, {
      pageNum: page,
      pageSize: 10,
      keyword: filters.keyword || undefined,
      status:
        filters.status === "pending" ||
        filters.status === "approved" ||
        filters.status === "rejected"
          ? (filters.status as FriendLinkStatus)
          : undefined
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
            text: error instanceof Error ? error.message : "加载友链列表失败。"
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

  const stats = useMemo(() => {
    const approvedCount =
      pageData?.list.filter((item) => item.status === "approved").length ?? 0;
    const pendingCount =
      pageData?.list.filter((item) => item.status === "pending").length ?? 0;

    return [
      { label: "当前页友链", value: pageData?.list.length ?? 0, accent: "mint" as const },
      { label: "已通过", value: approvedCount, accent: "sky" as const },
      { label: "待审核", value: pendingCount, accent: "amber" as const }
    ];
  }, [pageData?.list]);

  const handleDelete = async (item: FriendLink) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`确认删除友链 ${item.siteName} 吗？`);
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    try {
      await deleteAdminFriendLink(token, item.id);
      setNotice({ tone: "success", text: `${item.siteName} 已删除。` });
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
              这里管理友链站点、简介和审核状态，适合把展示和审核放在同一处处理。
            </p>
            <AdminMetricStrip items={stats} />
          </div>
          <Link href="/admin/friend-links/new" className="inline-flex">
            <Button>
              <FilePenLine className="h-4 w-4" />
              新增友链
            </Button>
          </Link>
        </div>

        <form
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto_auto]"
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
            placeholder="按站点名称、地址或描述搜索"
          />
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
            className={adminSelectClassName}
          >
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
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
                status: ""
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
            {pageData.list.map((item) => (
              <Card key={item.id} className="space-y-4 p-5 md:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStateBadge
                        label={FRIEND_LINK_STATUS_LABELS[item.status ?? "pending"] || "待审核"}
                        tone={friendLinkTone(item.status)}
                      />
                      <span className="inline-flex rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground">
                        排序 {item.sort ?? 0}
                      </span>
                    </div>

                    <div>
                      <p className="text-xl font-semibold tracking-tight text-foreground">
                        {item.siteName}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                        {item.description || "这条友链还没有填写站点简介。"}
                      </p>
                    </div>

                    <a
                      href={item.siteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {item.siteUrl}
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/friend-links/${item.id}`} className="inline-flex">
                      <Button>编辑</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === item.id ? "删除中..." : "删除"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              第 {page} / {totalPages} 页，共 {pageData.total} 条友链
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
          title="还没有符合条件的友链"
          description="你可以先新增一条友链，或清空筛选条件看看其它记录。"
          actionHref="/admin/friend-links/new"
          actionLabel="新增友链"
        />
      )}
    </div>
  );
}
