import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText, NotebookPen } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { SearchBar } from "@/components/common/search-bar";
import { CatalogPage } from "@/components/sections/catalog-page";
import { searchSite } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "搜索"
};

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() || "";
  const results = query ? await searchSite(query) : [];

  return (
    <CatalogPage
        index="S"
        eyebrow="Search"
        title="站内搜索"
        description="搜索文章与学习日记。第一版先聚焦文字内容检索，后续再慢慢扩展到资源、项目和标签联动。"
        controlsLabel="站内内容检索"
        controlsMeta="Query / Results"
        controls={
          <div className="search-catalog-controls">
            <div className="search-catalog-field">
              <p className="catalog-control-label">Keyword / 关键词</p>
              <SearchBar
                action="/search"
                placeholder="输入关键词试试，比如：Next.js、联调、学习日记"
                defaultValue={query}
                inputName="q"
                label="搜索文章与学习日记"
              />
            </div>
            <div className="search-catalog-status" aria-live="polite">
              <span>{query ? "Current query" : "Search scope"}</span>
              <strong>{query ? `“${query}”` : "文章 + 学习日记"}</strong>
              <small>{query ? `${String(results.length).padStart(2, "0")} 条结果` : "Title / Summary / Tag"}</small>
            </div>
          </div>
        }
      >
      {query ? (
        results.length ? (
          <section className="search-result-ledger" aria-labelledby="search-results-title">
            <header className="search-result-heading">
              <div>
                <span>Result ledger</span>
                <h2 id="search-results-title">检索结果</h2>
              </div>
              <p><strong>{String(results.length).padStart(2, "0")}</strong> records</p>
            </header>
            <ol className="search-result-list">
              {results.map((result, index) => {
                const isArticle = result.type === "article";
                const Icon = isArticle ? FileText : NotebookPen;

                return (
                  <li key={result.id}>
                    <Link href={result.href} className="search-result-row">
                      <span className="search-result-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="search-result-type" aria-hidden="true"><Icon /></span>
                      <span className="search-result-copy">
                        <span className="search-result-meta">
                          <b>{isArticle ? "文章" : "学习日记"}</b>
                          <time dateTime={result.date}>{formatDate(result.date, "YYYY.MM.DD")}</time>
                        </span>
                        <span className="search-result-title">{result.title}</span>
                        <span className="search-result-summary">{result.summary}</span>
                        {result.tags.length ? (
                          <span className="search-result-tags" aria-label="内容标签">
                            {result.tags.map((tag) => <i key={tag}>#{tag}</i>)}
                          </span>
                        ) : null}
                      </span>
                      <span className="search-result-action" aria-hidden="true">
                        <small>Open</small>
                        <ArrowUpRight />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : (
          <EmptyState
            variant="catalog"
            title="没有找到匹配内容"
            description="试试更短的关键词，或者搜索标题、标签和你记得的主题词。"
            actionHref="/articles"
            actionLabel="浏览文章"
          />
        )
      ) : (
        <EmptyState
          variant="catalog"
          title="输入一个关键词开始搜索"
          description="比如：Next.js、Spring Boot、学习系统、资源整理。"
          actionHref="/"
          actionLabel="回首页"
        />
      )}
    </CatalogPage>
  );
}
