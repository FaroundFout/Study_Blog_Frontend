import type { Metadata } from "next";

import { ArticleCard } from "@/components/cards/article-card";
import { CategoryFilter } from "@/components/common/category-filter";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { TagList } from "@/components/common/tag-list";
import { PageHero } from "@/components/sections/page-hero";
import { ARTICLE_SORT_OPTIONS, DEFAULT_LIST_PAGE_SIZE } from "@/lib/constants";
import { getArticles, getCategories, getTags } from "@/lib/api";
import { buildQueryString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "文章"
};

interface ArticlesPageProps {
  searchParams: {
    page?: string;
    categoryId?: string;
    tagId?: string;
    keyword?: string;
    sort?: "latest" | "oldest" | "views";
  };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const page = Number(searchParams.page || "1");
  const categoryId = searchParams.categoryId ? Number(searchParams.categoryId) : undefined;
  const tagId = searchParams.tagId ? Number(searchParams.tagId) : undefined;
  const sort = searchParams.sort || "latest";

  const [categories, tags, articlePage] = await Promise.all([
    getCategories(),
    getTags(),
    getArticles({
      pageNum: page,
      pageSize: DEFAULT_LIST_PAGE_SIZE,
      categoryId,
      tagId,
      keyword: searchParams.keyword,
      sort
    })
  ]);

  const query = {
    keyword: searchParams.keyword,
    categoryId: searchParams.categoryId,
    tagId: searchParams.tagId,
    sort
  };

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Article Index"
        title="文章"
        description="这里保留更适合系统阅读的文章内容。节奏会更安静一点，让标题、摘要与正文都能自然落在同一套阅读秩序里。"
      />

      <section className="page-panel space-y-5 p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
          <SearchBar
            action="/articles"
            placeholder="搜索标题、摘要或标签"
            defaultValue={searchParams.keyword}
            hiddenFields={{
              categoryId: searchParams.categoryId,
              tagId: searchParams.tagId,
              sort
            }}
          />
          <div className="page-segmented-shell">
            <div className="page-segmented-track" role="tablist" aria-label="文章排序方式">
              {ARTICLE_SORT_OPTIONS.map((option) => {
                const isActive = sort === option.value;

                return (
                  <a
                    key={option.value}
                    href={`/articles${buildQueryString({ ...query, sort: option.value, page: 1 })}`}
                    className={`page-segmented-item ${isActive ? "page-segmented-item-active" : ""}`}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {option.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <CategoryFilter categories={categories} activeCategoryId={categoryId} query={query} />

        <TagList
          tags={tags}
          activeSlug={tags.find((tag) => tag.id === tagId)?.slug}
          hrefBuilder={(tag) =>
            `/articles${buildQueryString({
              ...query,
              page: 1,
              tagId: typeof tag === "string" ? undefined : tag.id
            })}`
          }
        />
      </section>

      {articlePage.list.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articlePage.list.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={articlePage.pageSize}
            total={articlePage.total}
            pathname="/articles"
            query={query}
          />
        </>
      ) : (
        <EmptyState
          title="当前筛选下还没有文章"
          description="可以换个关键词、分类或标签试试，或者先从首页推荐的内容开始浏览。"
          actionHref="/articles"
          actionLabel="清空筛选"
        />
      )}
    </div>
  );
}
