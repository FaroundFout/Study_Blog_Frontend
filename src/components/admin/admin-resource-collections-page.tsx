"use client";

import Link from "next/link";
import { FilePenLine, FolderTree, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AdminMetricStrip,
  AdminNotice,
  AdminPageSkeleton
} from "@/components/admin/admin-page-kit";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteAdminResourceCollection, getAdminResourceCollections } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { PageResponse, ResourceCollection } from "@/types";

export function AdminResourceCollectionsPage() {
  const { token, hydrated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<ResourceCollection> | null>(null);
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

    getAdminResourceCollections(token, {
      pageNum: page,
      pageSize: 10,
      keyword: keyword || undefined
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
            text: error instanceof Error ? error.message : "加载资源分组失败。"
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
  }, [hydrated, keyword, page, refreshKey, token]);

  const stats = useMemo(() => {
    const itemCount =
      pageData?.list.reduce((sum, item) => sum + (item.itemCount ?? item.items?.length ?? 0), 0) ??
      0;

    return [
      { label: "当前页分组", value: pageData?.list.length ?? 0, accent: "mint" as const },
      { label: "全部分组", value: pageData?.total ?? 0, accent: "amber" as const },
      { label: "资源项总数", value: itemCount, accent: "sky" as const }
    ];
  }, [pageData?.list, pageData?.total]);

  const handleDelete = async (collection: ResourceCollection) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`确认删除分组 ${collection.name} 吗？`);
    if (!confirmed) {
      return;
    }

    setDeletingId(collection.id);

    try {
      await deleteAdminResourceCollection(token, collection.id);
      setNotice({ tone: "success", text: `${collection.name} 已删除。` });
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
              分组决定资源页的一级结构，适合先把学习地图的框架搭好。
            </p>
            <AdminMetricStrip items={stats} />
          </div>
          <Link href="/admin/resource-collections/new" className="inline-flex">
            <Button>
              <FilePenLine className="h-4 w-4" />
              新建分组
            </Button>
          </Link>
        </div>

        <form
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setKeyword(keywordInput.trim());
          }}
        >
          <Input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="按分组名称、slug 或描述搜索"
          />
          <Button type="submit" variant="secondary">
            搜索
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setPage(1);
              setKeywordInput("");
              setKeyword("");
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
            {pageData.list.map((collection) => (
              <Card key={collection.id} className="space-y-4 p-5 md:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#62d4cb]/35 bg-[#eefaf7] px-2.5 py-1 text-[11px] text-[#247c76] dark:border-[#2dd4bf]/22 dark:bg-[#0d2d33]/84 dark:text-[#98efe6]">
                        <FolderTree className="h-3.5 w-3.5" />
                        资源分组
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground">
                        排序 {collection.sort ?? 0}
                      </span>
                    </div>

                    <div>
                      <p className="text-xl font-semibold tracking-tight text-foreground">
                        {collection.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">/{collection.slug}</p>
                    </div>

                    <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                      {collection.description || "这条资源分组还没有填写说明。"}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>资源数：{collection.itemCount ?? collection.items?.length ?? 0}</span>
                      <span>创建于：{formatDate(collection.createdAt, "YYYY/MM/DD HH:mm")}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/resource-collections/${collection.id}`} className="inline-flex">
                      <Button>编辑</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => handleDelete(collection)}
                      disabled={deletingId === collection.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === collection.id ? "删除中..." : "删除"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              第 {page} / {totalPages} 页，共 {pageData.total} 个分组
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
          title="还没有资源分组"
          description="先创建几个分组，后面资源页就能形成更稳定的结构。"
          actionHref="/admin/resource-collections/new"
          actionLabel="新建分组"
        />
      )}
    </div>
  );
}
