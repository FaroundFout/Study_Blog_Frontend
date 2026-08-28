import type { Metadata } from "next";
import { BookOpenText, CalendarDays, Eye, FileText } from "lucide-react";
import { notFound } from "next/navigation";

import { ArchiveDossier } from "@/components/reader/archive-dossier";
import { getArticleBySlug, getArticleNavigation } from "@/lib/api";
import { extractHeadings, formatDate } from "@/lib/utils";
import type { ArticleDetail } from "@/types";

interface ArticleDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params
}: ArticleDetailPageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  return {
    title: article?.title || "文章不存在",
    description: article?.summary
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const navigation = await getArticleNavigation(params.slug);
  const readerArticle = prepareArticleForReader(article);

  return (
    <ArchiveDossier
      kind="article"
      sectionNumber="01"
      recordNumber={`A-${String(article.id).padStart(3, "0")}`}
      dossierLabel="Article dossier"
      kickerLabel="Article record"
      kickerValue={article.categoryName || "未分类"}
      kickerIcon={BookOpenText}
      title={article.title}
      summary={readerArticle.summary}
      backHref="/articles"
      backLabel="返回文章索引"
      indexLabel="Article index"
      contentLabel="Manuscript / 文章正文"
      breadcrumbs={[
        { label: "文章", href: "/articles" },
        {
          label: article.categoryName || "未分类",
          href: article.categoryId ? `/articles?categoryId=${article.categoryId}` : "/articles"
        }
      ]}
      facts={[
        { label: "Published", value: formatDate(article.publishTime, "YYYY.MM.DD"), icon: CalendarDays },
        { label: "Views", value: `${article.viewCount ?? 0} 次阅读`, icon: Eye },
        { label: "Length", value: `${article.wordCount ?? 0} 字`, icon: FileText }
      ]}
      tags={article.tags.map((tag) => ({ label: tag.name, href: `/articles?tagId=${tag.id}` }))}
      content={readerArticle.contentMd}
      headings={extractHeadings(readerArticle.contentMd)}
      previous={navigation.prev ? { label: navigation.prev.title, href: `/articles/${navigation.prev.slug}` } : null}
      next={navigation.next ? { label: navigation.next.title, href: `/articles/${navigation.next.slug}` } : null}
      previousLabel="上一篇"
      nextLabel="下一篇"
    />
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
    const trimmed = lines[index].trim();

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

  if (!sawMetadata) index = metadataStart;
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
  while (index < lines.length && !lines[index].trim()) index += 1;
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
