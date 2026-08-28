import { Clock3 } from "lucide-react";
import Link from "next/link";

import { formatDate } from "@/lib/utils";
import type { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  index: number;
  featured?: boolean;
}

export function ArticleCard({ article, index, featured = false }: ArticleCardProps) {
  const publishDate = formatDate(article.publishTime, "YYYY / MM / DD");
  const articleNumber = String(index).padStart(3, "0");
  const recordNumber = String(article.id).padStart(3, "0").slice(-3);

  return (
    <article className={featured ? "article-index-card article-index-card-featured" : "article-index-card"}>
      <Link
        href={`/articles/${article.slug}`}
        className="article-index-link group"
        aria-label={`阅读文章：${article.title}`}
      >
        <div className="article-index-cover">
          <div className="article-index-cover-wash" />
          <span className="article-index-number" aria-hidden="true">
            {articleNumber}
          </span>
          <span className="article-index-record-number" aria-hidden="true">#{recordNumber}</span>
          {article.isTop ? <span className="article-index-stamp">Pinned / 置顶</span> : null}
          <div className="article-index-cover-caption" aria-hidden="true">
            <span>{article.categoryName || "未分类"}</span>
            <span>{publishDate}</span>
          </div>
        </div>

        <div className="article-index-body">
          <div className="article-index-meta">
            <time dateTime={article.publishTime}>{publishDate}</time>
            <span>{article.categoryName || "未分类"}</span>
          </div>

          <div className="article-index-copy">
            <h2 className="article-index-title">{article.title}</h2>
            <p className="article-index-summary">{article.summary}</p>
          </div>

          <div className="article-index-footer">
            <div className="article-index-stats">
              <span title="预计阅读时间">
                <Clock3 aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.75]" />
                {Math.max(1, Math.ceil((article.wordCount ?? 0) / 500))} 分钟阅读
              </span>
            </div>
            {article.tags.length ? (
              <ul className="article-index-tags" aria-label="文章标签">
                {article.tags.slice(0, featured ? 4 : 3).map((tag) => (
                  <li key={tag.id || tag.slug}>{tag.name}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
