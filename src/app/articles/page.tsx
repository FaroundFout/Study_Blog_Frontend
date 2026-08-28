import type { Metadata } from "next";

import { ArticleFilterSystem } from "@/components/articles/article-filter-system";
import { ArticleCard } from "@/components/cards/article-card";
import {
  ArticleCatalogNavigation,
  ArticleCatalogTabPanel,
  CatalogResultsRegion
} from "@/components/common/catalog-navigation-transition";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { CatalogPage } from "@/components/sections/catalog-page";
import { DEFAULT_LIST_PAGE_SIZE } from "@/lib/constants";
import { getArticles, getCategories, getTags } from "@/lib/api";
import { buildQueryString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "文章"
};

const ARTICLE_RESULTS_ID = "article-catalog-results";

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

  const activeCategoryValue = categoryId ? `category-${categoryId}` : "all";
  const categoryTabs = [
    {
      value: "all",
      href: `/articles${buildQueryString({ ...query, page: 1, categoryId: undefined })}`
    },
    ...categories.map((category) => ({
      value: `category-${category.id}`,
      href: `/articles${buildQueryString({ ...query, page: 1, categoryId: category.id })}`
    }))
  ];
  const contentKey = JSON.stringify([
    "articles",
    page,
    categoryId ?? "all",
    tagId ?? "all",
    searchParams.keyword ?? "",
    sort
  ]);

  return (
    <ArticleCatalogNavigation
      contentKey={contentKey}
      resultsId={ARTICLE_RESULTS_ID}
      activeValue={activeCategoryValue}
      tabs={categoryTabs}
    >
      <CatalogPage
        index="01"
        eyebrow="Article Index"
        title="文章"
        description="记录学习、思考与创造。在知识的花园里，一起慢慢长大。"
        controls={
          <ArticleFilterSystem
            categories={categories}
            tags={tags}
            categoryId={categoryId}
            tagId={tagId}
            keyword={searchParams.keyword}
            sort={sort}
            resultCount={articlePage.total}
            query={query}
          />
        }
      >
        <ArticleCatalogTabPanel>
          <CatalogResultsRegion
            id={ARTICLE_RESULTS_ID}
            label="文章列表"
            variant="articles"
          >
            {articlePage.list.length ? (
              <div className="article-index-grid">
                {articlePage.list.map((article, index) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={index + 1}
                    featured={index === 0 && Boolean(article.isTop)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                variant="catalog"
                title="当前筛选下还没有文章"
                description="可以换个关键词、分类或标签试试，或者先从首页推荐的内容开始浏览。"
                actionHref="/articles"
                actionLabel="清空筛选"
              />
            )}
          </CatalogResultsRegion>

          {articlePage.list.length ? (
            <Pagination
              page={page}
              pageSize={articlePage.pageSize}
              total={articlePage.total}
              pathname="/articles"
              query={query}
              alwaysVisible
              itemLabel="篇文章"
              ariaLabel="文章分页"
            />
          ) : null}
        </ArticleCatalogTabPanel>
      </CatalogPage>
    </ArticleCatalogNavigation>
  );
}
