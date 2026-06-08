import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Hash,
  Home,
  Search
} from "lucide-react";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { getArticleBySlug, getArticleNavigation } from "@/lib/api";
import { extractHeadings, formatDate } from "@/lib/utils";
import type { Article, ArticleDetail, TocHeading } from "@/types";

interface ArticleDetailPageProps {
  params: {
    slug: string;
  };
}

type ArticleNavigation = Awaited<ReturnType<typeof getArticleNavigation>>;

export async function generateMetadata({
  params
}: ArticleDetailPageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "文章不存在"
    };
  }

  return {
    title: article.title,
    description: article.summary
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const [navigation] = await Promise.all([getArticleNavigation(params.slug)]);
  const readerArticle = prepareArticleForReader(article);
  const headings = extractHeadings(readerArticle.contentMd);

  return (
    <div className="article-reader-bleed">
      <div className="article-reader-shell">
        <div className="article-reader-grid">
          <ArticleLeftRail article={article} navigation={navigation} />

          <article className="article-reader-main">
            <ArticleHeader article={article} summary={readerArticle.summary} />
            <ArticleMobileContext article={article} navigation={navigation} />
            <ArticleMobileToc headings={headings} />
            <ArticleBody content={readerArticle.contentMd} />
            <ArticleBottomNavigation navigation={navigation} />
          </article>

          <ArticleRightRail headings={headings} navigation={navigation} />
        </div>
      </div>
    </div>
  );
}

function prepareArticleForReader(article: ArticleDetail) {
  const lead = parseArticleLead(article.contentMd, article.title);

  return {
    contentMd: lead.contentMd,
    summary: lead.summary || article.summary
  };
}

function parseArticleLead(content: string, title: string) {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  let index = nextContentLine(lines, 0);
  let summary = "";

  const firstHeading = lines[index]?.match(/^#\s+(.+?)\s*$/);
  if (firstHeading && sameText(firstHeading[1], title)) {
    index = nextContentLine(lines, index + 1);
  }

  const metadataStart = index;
  let sawMetadata = false;
  let inQuoteMetadata = false;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const isQuoteLine = trimmed.startsWith(">");
    const cleanLine = cleanLeadLine(trimmed);

    if (isLeadMetadataLine(cleanLine)) {
      sawMetadata = true;
      inQuoteMetadata = inQuoteMetadata || isQuoteLine;
      summary = summary || extractSummaryFromLeadLine(cleanLine);
      index += 1;
      continue;
    }

    if (sawMetadata && inQuoteMetadata && isQuoteLine) {
      if (summary && !isLeadMetadataLine(cleanLine)) {
        summary = `${summary} ${cleanInlineMarkdown(cleanLine)}`.trim();
      }
      index += 1;
      continue;
    }

    break;
  }

  if (!sawMetadata) {
    index = metadataStart;
  }

  index = nextContentLine(lines, index);

  if (sawMetadata && /^(-{3,}|\*{3,}|_{3,})$/.test(lines[index]?.trim() ?? "")) {
    index = nextContentLine(lines, index + 1);
  }

  return {
    contentMd: lines.slice(index).join("\n").trimStart(),
    summary: summary.replace(/\s+/g, " ").trim()
  };
}

function nextContentLine(lines: string[], fromIndex: number) {
  let index = fromIndex;

  while (index < lines.length && !lines[index].trim()) {
    index += 1;
  }

  return index;
}

function sameText(value: string, target: string) {
  return normalizeLeadText(value) === normalizeLeadText(target);
}

function normalizeLeadText(value: string) {
  return value
    .replace(/[`*_~#[\]()]/g, "")
    .replace(/[:"'“”‘’：，,。.!！?？、\-\s]/g, "")
    .toLowerCase();
}

function isLeadMetadataLine(line: string) {
  return /^(分类|标签|摘要)\s*[：:]/.test(cleanInlineMarkdown(line));
}

function extractSummaryFromLeadLine(line: string) {
  const match = cleanInlineMarkdown(line).match(/^摘要\s*[：:]\s*(.+)$/);
  return match?.[1]?.trim() ?? "";
}

function cleanLeadLine(line: string) {
  return line
    .replace(/^>\s?/, "")
    .replace(/^["“”'‘’]+/, "")
    .replace(/["“”'‘’]+$/, "")
    .trim();
}

function cleanInlineMarkdown(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function ArticleLeftRail({
  article,
  navigation
}: {
  article: ArticleDetail;
  navigation: ArticleNavigation;
}) {
  return (
    <aside className="article-reader-rail article-reader-left-rail" aria-label="文章上下文">
      <div className="article-reader-rail-section">
        <Link href="/articles" className="article-reader-backlink">
          <ArrowLeft className="h-4 w-4" />
          文章索引
        </Link>
      </div>

      <div className="article-reader-rail-section">
        <p className="article-reader-rail-label">Current Field</p>
        <Link
          href={article.categoryId ? `/articles?categoryId=${article.categoryId}` : "/articles"}
          className="article-reader-active-line"
        >
          <BookOpen className="h-4 w-4" />
          <span>{article.categoryName || "未分类"}</span>
        </Link>
      </div>

      <nav className="article-reader-rail-section" aria-label="附近文章">
        <p className="article-reader-rail-label">Nearby Notes</p>
        <RailArticleLink label="上一篇" article={navigation.prev} />
        <div className="article-reader-current-note">
          <FileText className="h-4 w-4" />
          <span>{article.title}</span>
        </div>
        <RailArticleLink label="下一篇" article={navigation.next} />
      </nav>

      {article.tags.length ? (
        <div className="article-reader-rail-section">
          <p className="article-reader-rail-label">Tags</p>
          <div className="article-reader-rail-tags">
            {article.tags.slice(0, 8).map((tag) => (
              <Link key={tag.id} href={`/articles?tagId=${tag.id}`} className="article-reader-mini-tag">
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="article-reader-rail-section">
        <Link href="/search" className="article-reader-search-link">
          <Search className="h-4 w-4" />
          搜索更多内容
        </Link>
      </div>
    </aside>
  );
}

function ArticleHeader({ article, summary }: { article: ArticleDetail; summary: string }) {
  return (
    <header className="article-reader-header">
      <nav className="article-reader-breadcrumbs" aria-label="面包屑">
        <Link href="/" aria-label="返回首页">
          <Home className="h-3.5 w-3.5" />
          首页
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href="/articles">文章</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href={article.categoryId ? `/articles?categoryId=${article.categoryId}` : "/articles"}>
          {article.categoryName || "未分类"}
        </Link>
      </nav>

      <div className="article-reader-title-block">
        <p className="article-reader-kicker">
          <span>Article</span>
          <span>{article.categoryName || "Unsorted"}</span>
        </p>
        <h1 className="article-reader-title">{article.title}</h1>
      </div>

      <div className="article-reader-meta" aria-label="文章信息">
        <span>
          <CalendarDays className="h-4 w-4" />
          {formatDate(article.publishTime)}
        </span>
        <span>
          <Eye className="h-4 w-4" />
          {article.viewCount ?? 0} 次阅读
        </span>
        <span>
          <Clock3 className="h-4 w-4" />
          {article.wordCount ?? 0} 字
        </span>
      </div>

      {article.tags.length ? (
        <div className="article-reader-tags" aria-label="文章标签">
          {article.tags.map((tag) => (
            <Link key={tag.id} href={`/articles?tagId=${tag.id}`} className="article-reader-tag">
              <Hash className="h-3.5 w-3.5" />
              {tag.name}
            </Link>
          ))}
        </div>
      ) : null}

      {summary ? (
        <section className="article-reader-summary" aria-label="文章摘要">
          <div className="article-reader-summary-label">
            <BookOpen className="h-4 w-4" />
            摘要
          </div>
          <p>{summary}</p>
        </section>
      ) : null}
    </header>
  );
}

function ArticleMobileContext({
  article,
  navigation
}: {
  article: ArticleDetail;
  navigation: ArticleNavigation;
}) {
  return (
    <aside className="article-reader-mobile-context" aria-label="移动端文章上下文">
      <div>
        <p className="article-reader-mobile-label">当前分类</p>
        <Link href={article.categoryId ? `/articles?categoryId=${article.categoryId}` : "/articles"}>
          {article.categoryName || "未分类"}
        </Link>
      </div>
      <div>
        <p className="article-reader-mobile-label">快速跳转</p>
        <div className="article-reader-mobile-links">
          {navigation.prev ? <Link href={`/articles/${navigation.prev.slug}`}>上一篇</Link> : null}
          {navigation.next ? <Link href={`/articles/${navigation.next.slug}`}>下一篇</Link> : null}
          <Link href="/search">搜索</Link>
        </div>
      </div>
    </aside>
  );
}

function ArticleMobileToc({ headings }: { headings: TocHeading[] }) {
  return (
    <details className="article-reader-mobile-toc">
      <summary>
        <BookOpen className="h-4 w-4" />
        页面目录
      </summary>
      <TocList headings={headings} emptyText="这篇文章还没有目录节点。" />
    </details>
  );
}

function ArticleBody({ content }: { content: string }) {
  return (
    <section className="article-reader-content" aria-label="文章正文">
      <MarkdownRenderer content={content} className="article-reader-prose" />
    </section>
  );
}

function ArticleRightRail({
  headings,
  navigation
}: {
  headings: TocHeading[];
  navigation: ArticleNavigation;
}) {
  return (
    <aside className="article-reader-rail article-reader-right-rail" aria-label="页面目录">
      <div className="article-reader-rail-section">
        <div className="article-reader-rail-heading">
          <BookOpen className="h-4 w-4" />
          <span>On this page</span>
        </div>
        <TocList headings={headings} emptyText="这篇文章还没有目录节点。" />
      </div>

      <nav className="article-reader-rail-section" aria-label="文章前后导航">
        <p className="article-reader-rail-label">Backlinks</p>
        <RailArticleLink label="上一篇" article={navigation.prev} />
        <RailArticleLink label="下一篇" article={navigation.next} />
      </nav>
    </aside>
  );
}

function ArticleBottomNavigation({ navigation }: { navigation: ArticleNavigation }) {
  return (
    <nav className="article-reader-bottom-nav" aria-label="文章前后导航">
      <BottomArticleLink direction="prev" label="上一篇" article={navigation.prev} />
      <BottomArticleLink direction="next" label="下一篇" article={navigation.next} />
    </nav>
  );
}

function TocList({ headings, emptyText }: { headings: TocHeading[]; emptyText: string }) {
  if (!headings.length) {
    return <p className="article-reader-empty">{emptyText}</p>;
  }

  return (
    <nav className="article-reader-toc-list" aria-label="目录链接">
      {headings.map((heading, index) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={[
            "article-reader-toc-link",
            heading.level === 3 ? "article-reader-toc-link-nested" : "",
            index === 0 ? "article-reader-toc-link-active" : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}

function RailArticleLink({ label, article }: { label: string; article: Article | null }) {
  if (!article) {
    return (
      <div className="article-reader-rail-link article-reader-rail-link-muted">
        <span className="article-reader-rail-link-label">{label}</span>
        <span>{label === "上一篇" ? "暂无上一篇" : "暂无下一篇"}</span>
      </div>
    );
  }

  return (
    <Link href={`/articles/${article.slug}`} className="article-reader-rail-link">
      <span className="article-reader-rail-link-label">{label}</span>
      <span>{article.title}</span>
    </Link>
  );
}

function BottomArticleLink({
  direction,
  label,
  article
}: {
  direction: "prev" | "next";
  label: string;
  article: Article | null;
}) {
  if (!article) {
    return (
      <div className={`article-reader-bottom-link article-reader-bottom-link-${direction} is-disabled`}>
        <span>{label}</span>
        <strong>{direction === "prev" ? "已经是第一篇了" : "已经是最后一篇了"}</strong>
      </div>
    );
  }

  return (
    <Link href={`/articles/${article.slug}`} className={`article-reader-bottom-link article-reader-bottom-link-${direction}`}>
      <span>{label}</span>
      <strong>{article.title}</strong>
      {direction === "prev" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
    </Link>
  );
}
