import { RotateCcw } from "lucide-react";
import Link from "next/link";

import { CategoryFilter } from "@/components/common/category-filter";
import { SearchBar } from "@/components/common/search-bar";
import { TagList } from "@/components/common/tag-list";
import { ARTICLE_SORT_OPTIONS } from "@/lib/constants";
import { buildQueryString } from "@/lib/utils";
import type { Category, Tag as TagType } from "@/types";

interface ArticleFilterSystemProps {
  categories: Category[];
  tags: TagType[];
  categoryId?: number;
  tagId?: number;
  keyword?: string;
  sort: (typeof ARTICLE_SORT_OPTIONS)[number]["value"];
  resultCount: number;
  query: Record<string, string | undefined>;
}

export function ArticleFilterSystem({
  categories,
  tags,
  categoryId,
  tagId,
  keyword,
  sort,
  resultCount,
  query
}: ArticleFilterSystemProps) {
  const activeCategory = categories.find((category) => category.id === categoryId);
  const activeTag = tags.find((tagItem) => tagItem.id === tagId);
  const hasFilter = Boolean(keyword || categoryId || tagId || sort !== "latest");

  return (
    <div className="article-filter-system">
      <div className="article-filter-search">
        <SearchBar
          action="/articles"
          placeholder="搜索文章标题、内容或标签…"
          defaultValue={keyword}
          hiddenFields={{ categoryId, tagId, sort }}
          showButton={false}
        />
      </div>

      <div className="article-filter-categories">
        <CategoryFilter categories={categories} query={query} allLabel="全部" />
      </div>

      <div className="article-filter-tags">
        <span className="article-filter-row-label">标签</span>
        <div className="article-filter-tag-options">
          <Link
            href={`/articles${buildQueryString({ ...query, page: 1, tagId: undefined })}`}
            className={`catalog-tag-chip page-chip ${!tagId ? "catalog-tag-chip-active" : ""}`}
            aria-current={!tagId ? "page" : undefined}
          >
            全部
          </Link>
          <TagList
            tags={tags}
            activeSlug={activeTag?.slug}
            showHash={false}
            hrefBuilder={(tagItem) =>
              `/articles${buildQueryString({
                ...query,
                page: 1,
                tagId: typeof tagItem === "string" ? undefined : tagItem.id
              })}`
            }
          />
        </div>
      </div>

      <div className="article-filter-sort">
        <span className="article-filter-row-label">排序</span>
        <div className="article-filter-sort-options" aria-label="文章排序方式">
          {ARTICLE_SORT_OPTIONS.map((option) => {
            const isActive = sort === option.value;
            return (
              <Link
                key={option.value}
                href={`/articles${buildQueryString({ ...query, sort: option.value, page: 1 })}`}
                className={`article-filter-sort-option ${isActive ? "article-filter-sort-option-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {option.value === "latest" ? "最新" : option.value === "oldest" ? "最早" : "最多阅读"}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="article-filter-status" aria-live="polite">
        <p>
          <span className="article-filter-result-count">{String(resultCount).padStart(2, "0")}</span>
          <span>篇文章</span>
          {keyword ? <span className="article-filter-active-token">关键词：{keyword}</span> : null}
          {activeCategory ? <span className="article-filter-active-token">分类：{activeCategory.name}</span> : null}
          {activeTag ? <span className="article-filter-active-token">标签：#{activeTag.name}</span> : null}
        </p>
        {hasFilter ? (
          <Link href="/articles" className="article-filter-reset">
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.75]" />
            清除筛选
          </Link>
        ) : (
          <span className="article-filter-default">全部馆藏</span>
        )}
      </div>
    </div>
  );
}
