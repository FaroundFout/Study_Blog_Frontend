"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, FilePenLine, FolderTree, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { revalidateArticlePublicContent } from "@/app/actions/revalidate-public-content";
import { AdminArticleStatusBadge } from "@/components/admin/admin-article-status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteAdminArticle, getAdminArticles, getAdminCategories } from "@/lib/api";
import { buildQueryString, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { Article, Category, PageResponse } from "@/types";

const selectClassName =
  "flex h-11 w-full rounded-[1.15rem] border border-border/70 bg-card/85 px-4 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

function ArticlesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="animate-pulse p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_180px_160px_auto]">
          <div className="h-11 rounded-full bg-accent/80" />
          <div className="h-11 rounded-full bg-accent/80" />
          <div className="h-11 rounded-full bg-accent/80" />
          <div className="h-11 rounded-full bg-accent/80" />
        </div>
      </Card>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse p-5 md:p-6">
            <div className="h-5 w-32 rounded-full bg-accent/75" />
            <div className="mt-4 h-8 w-3/4 rounded-full bg-accent/80" />
            <div className="mt-4 h-4 w-full rounded-full bg-accent/60" />
            <div className="mt-2 h-4 w-5/6 rounded-full bg-accent/55" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminArticlesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, hydrated } = useAuthStore();
  const [articlePage, setArticlePage] = useState<PageResponse<Article> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const page = Number(searchParams.get("page") || "1");
  const title = searchParams.get("title") || "";
  const categoryId = searchParams.get("categoryId")
    ? Number(searchParams.get("categoryId"))
    : undefined;
  const status = searchParams.get("status");
  const normalizedStatus =
    status === "draft" || status === "published" || status === "private" ? status : undefined;

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getAdminArticles(token, {
        pageNum: page,
        pageSize: 10,
        title: title || undefined,
        categoryId,
        status: normalizedStatus
      }),
      getAdminCategories(token)
    ])
      .then(([articles, categoryItems]) => {
        if (cancelled) {
          return;
        }

        setArticlePage(articles);
        setCategories(categoryItems);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setError(requestError instanceof Error ? requestError.message : "加载文章列表失败。");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, hydrated, normalizedStatus, page, refreshKey, title, token]);

  const query = useMemo(
    () => ({
      title: title || undefined,
      categoryId,
      status: normalizedStatus
    }),
    [categoryId, normalizedStatus, title],
  );

  const visiblePublished =
    articlePage?.list.filter((item) => item.status === "published").length ?? 0;
  const visiblePrivate =
    articlePage?.list.filter((item) => item.status === "private").length ?? 0;
  const visibleDraft =
    articlePage?.list.filter((item) => item.status === "draft" || !item.status).length ?? 0;

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextTitle = String(formData.get("title") || "").trim();
    const nextCategoryId = String(formData.get("categoryId") || "").trim();
    const nextStatus = String(formData.get("status") || "").trim();

    router.push(
      `/admin/articles${buildQueryString({
        page: 1,
        title: nextTitle || undefined,
        categoryId: nextCategoryId || undefined,
        status: nextStatus || undefined
      })}`,
    );
  };

  const handleDelete = async (article: Article) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`确认删除《${article.title}》吗？此操作无法撤销。`);

    if (!confirmed) {
      return;
    }

    setDeletingId(article.id);

    try {
      await deleteAdminArticle(token, article.id);
      try {
        await revalidateArticlePublicContent([article.slug]);
      } catch (revalidateError) {
        console.error("Failed to revalidate article pages after deletion.", revalidateError);
      }
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      window.alert(
        requestError instanceof Error ? requestError.message : "删除失败，请稍后再试。",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!hydrated || !token || loading) {
    return <ArticlesLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              当前共 {articlePage?.total ?? 0} 篇文章，本页显示 {articlePage?.list.length ?? 0} 篇。
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">本页已发布 {visiblePublished}</Badge>
              <Badge variant="outline">本页草稿 {visibleDraft}</Badge>
              <Badge variant="outline">本页私密 {visiblePrivate}</Badge>
              {normalizedStatus ? (
                <Badge>
                  筛选状态：
                  {normalizedStatus === "published"
                    ? "已发布"
                    : normalizedStatus === "private"
                      ? "私密"
                      : "草稿"}
                </Badge>
              ) : null}
            </div>
          </div>

          <Link href="/write" className="inline-flex">
            <Button>
              <FilePenLine className="h-4 w-4" />
              新建文章
            </Button>
          </Link>
        </div>

        <form
          key={`${title}-${categoryId ?? ""}-${normalizedStatus ?? ""}`}
          onSubmit={handleFilterSubmit}
          className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_180px_160px_auto]"
        >
          <input
            name="title"
            defaultValue={title}
            placeholder="搜索标题或 slug"
            className={selectClassName}
          />

          <select
            name="categoryId"
            defaultValue={categoryId ? String(categoryId) : ""}
            className={selectClassName}
          >
            <option value="">全部分类</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select name="status" defaultValue={normalizedStatus ?? ""} className={selectClassName}>
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="private">私密</option>
          </select>

          <div className="flex gap-2">
            <Button type="submit" variant="secondary" className="flex-1 rounded-[1rem]">
              筛选
            </Button>
            <Link href="/admin/articles" className="inline-flex flex-1">
              <Button type="button" variant="ghost" className="w-full rounded-[1rem]">
                清空
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {error ? (
        <Card className="space-y-4 p-6">
          <p className="text-base font-medium text-foreground">文章列表加载失败</p>
          <p className="text-sm leading-7 text-muted-foreground">{error}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setRefreshKey((current) => current + 1)}>
              <RefreshCw className="h-4 w-4" />
              重试
            </Button>
            <Link href="/write" className="inline-flex">
              <Button>先写一篇新文章</Button>
            </Link>
          </div>
        </Card>
      ) : articlePage?.list.length ? (
        <>
          <div className="space-y-4">
            {articlePage.list.map((article) => (
              <Card key={article.id} className="p-5 md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminArticleStatusBadge status={article.status} />
                      {article.isTop ? <Badge variant="secondary">置顶</Badge> : null}
                      {article.categoryName ? (
                        <Badge variant="outline">
                          <FolderTree className="mr-1 h-3.5 w-3.5" />
                          {article.categoryName}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Link href={`/write/${article.id}`} className="group inline-flex max-w-full">
                        <h2 className="truncate text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary md:text-[1.65rem]">
                          {article.title}
                        </h2>
                      </Link>
                      <p className="line-clamp-2 text-sm leading-7 text-muted-foreground md:text-[15px]">
                        {article.summary || "这篇文章还没有填写摘要。"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {article.tags.length ? (
                        article.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center rounded-full bg-accent/78 px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            #{tag.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">暂未设置标签</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span>Slug：{article.slug}</span>
                      <span>发布时间：{formatDate(article.publishTime || article.createdAt, "YYYY/MM/DD HH:mm")}</span>
                      <span>阅读：{article.viewCount ?? 0}</span>
                      <span>字数：{article.wordCount ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-[260px] lg:justify-end">
                    {article.status === "published" ? (
                      <Link href={`/articles/${article.slug}`} target="_blank" className="inline-flex">
                        <Button variant="secondary">
                          <Eye className="h-4 w-4" />
                          预览前台
                        </Button>
                      </Link>
                    ) : null}
                    <Link href={`/write/${article.id}`} className="inline-flex">
                      <Button>
                        <FilePenLine className="h-4 w-4" />
                        编辑
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => handleDelete(article)}
                      disabled={deletingId === article.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === article.id ? "删除中..." : "删除"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={articlePage.pageSize}
            total={articlePage.total}
            pathname="/admin/articles"
            query={query}
          />
        </>
      ) : (
        <EmptyState
          title="当前筛选下没有文章"
          description="你可以先创建一篇新文章，或者清空筛选条件看看其它内容。"
          actionHref="/write"
          actionLabel="去写文章"
        />
      )}
    </div>
  );
}
