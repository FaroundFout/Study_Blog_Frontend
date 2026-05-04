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
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteAdminResourceItem, getAdminResourceCollections, getAdminResourceItems } from "@/lib/api";
import { splitCommaText } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { PageResponse, ResourceCollection, ResourceItem } from "@/types";

export function AdminResourceItemsPage() {
  const { token, hydrated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [collections, setCollections] = useState<ResourceCollection[]>([]);
  const [filters, setFilters] = useState({
    keywordInput: "",
    keyword: "",
    collectionId: ""
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<ResourceItem> | null>(null);
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

    Promise.all([
      getAdminResourceItems(token, {
        pageNum: page,
        pageSize: 10,
        keyword: filters.keyword || undefined,
        collectionId: filters.collectionId ? Number(filters.collectionId) : undefined
      }),
      getAdminResourceCollections(token, { pageNum: 1, pageSize: 100 })
    ])
      .then(([itemsPayload, collectionsPayload]) => {
        if (!cancelled) {
          setPageData(itemsPayload);
          setCollections(collectionsPayload.list);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNotice({
            tone: "error",
            text: error instanceof Error ? error.message : "加载资源项失败。"
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
  }, [filters.collectionId, filters.keyword, hydrated, page, refreshKey, token]);

  const stats = useMemo(() => {
    const sources = new Set(pageData?.list.map((item) => item.sourceName).filter(Boolean));

    return [
      { label: "当前页资源项", value: pageData?.list.length ?? 0, accent: "mint" as const },
      { label: "全部资源项", value: pageData?.total ?? 0, accent: "amber" as const },
      { label: "来源数量", value: sources.size, accent: "sky" as const }
    ];
  }, [pageData?.list, pageData?.total]);

  const handleDelete = async (item: ResourceItem) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`确认删除资源项 ${item.title} 吗？`);
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    try {
      await deleteAdminResourceItem(token, item.id);
      setNotice({ tone: "success", text: `${item.title} 已删除。` });
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
              资源项用来承载具体链接、来源、封面和标签，适合逐条补齐你的资料收藏。
            </p>
            <AdminMetricStrip items={stats} />
          </div>
          <Link href="/admin/resource-items/new" className="inline-flex">
            <Button>
              <FilePenLine className="h-4 w-4" />
              新建资源项
            </Button>
          </Link>
        </div>

        <form
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_auto_auto]"
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
            placeholder="按标题、来源或标签搜索"
          />
          <select
            value={filters.collectionId}
            onChange={(event) =>
              setFilters((current) => ({ ...current, collectionId: event.target.value }))
            }
            className={adminSelectClassName}
          >
            <option value="">全部分组</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
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
                collectionId: ""
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
                    <div>
                      <p className="text-xl font-semibold tracking-tight text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                        {item.summary || "这条资源项还没有填写摘要。"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        分组：
                        {collections.find((collection) => collection.id === item.collectionId)?.name ||
                          item.collectionId}
                      </span>
                      <span>来源：{item.sourceName || "未填写"}</span>
                      <span>排序：{item.sort ?? 0}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {splitCommaText(item.tagsText).length ? (
                        splitCommaText(item.tagsText).map((tag) => (
                          <span
                            key={`${item.id}-${tag}`}
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
                    <a href={item.linkUrl} target="_blank" rel="noreferrer" className="inline-flex">
                      <Button variant="secondary">
                        <ExternalLink className="h-4 w-4" />
                        打开链接
                      </Button>
                    </a>
                    <Link href={`/admin/resource-items/${item.id}`} className="inline-flex">
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
              第 {page} / {totalPages} 页，共 {pageData.total} 个资源项
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
          title="还没有符合条件的资源项"
          description="你可以先补充一条资源项，或清空筛选条件查看其它内容。"
          actionHref="/admin/resource-items/new"
          actionLabel="新建资源项"
        />
      )}
    </div>
  );
}
