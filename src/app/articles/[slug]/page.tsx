import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, Eye, FolderKanban } from "lucide-react";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { TagList } from "@/components/common/tag-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getArticleBySlug, getArticleNavigation } from "@/lib/api";
import { extractHeadings, formatDate } from "@/lib/utils";

interface ArticleDetailPageProps {
  params: {
    slug: string;
  };
}

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
  const headings = extractHeadings(article.contentMd);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <article className="detail-shell">
        <Card className="page-panel overflow-hidden">
          <div className="space-y-6 p-6 md:p-8">
            <Link href="/articles" className="detail-backlink">
              <ArrowLeft className="h-4 w-4" />
              返回文章列表
            </Link>
            <div className="space-y-4">
              <p className="detail-kicker">{article.categoryName || "未分类"}</p>
              <h1 className="detail-title">{article.title}</h1>
              <p className="detail-summary max-w-3xl">{article.summary}</p>
            </div>
            <div className="detail-meta flex flex-wrap items-center gap-4 border-t border-border/60 pt-4">
              <span>{formatDate(article.publishTime)}</span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {article.viewCount ?? 0}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                {article.wordCount ?? 0} 字
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FolderKanban className="h-4 w-4" />
                {article.status}
              </span>
            </div>
            <TagList tags={article.tags} />
          </div>
        </Card>

        <Card className="page-panel p-6 md:p-9">
          <MarkdownRenderer content={article.contentMd} />
        </Card>

        <div className="space-y-7">
        <div className="grid gap-4 md:grid-cols-2">
          {navigation.prev ? (
            <Link href={`/articles/${navigation.prev.slug}`}>
              <Card className="page-panel h-full p-5">
                <p className="page-card-kicker">上一篇</p>
                <p className="page-card-title mt-2 text-[1rem]">{navigation.prev.title}</p>
              </Card>
            </Link>
          ) : (
            <Card className="page-panel p-5 opacity-60">
              <p className="page-card-kicker">上一篇</p>
              <p className="page-card-title mt-2 text-[1rem]">已经是第一篇了</p>
            </Card>
          )}
          {navigation.next ? (
            <Link href={`/articles/${navigation.next.slug}`}>
              <Card className="page-panel h-full p-5 text-right">
                <p className="page-card-kicker">下一篇</p>
                <p className="page-card-title mt-2 text-[1rem]">{navigation.next.title}</p>
              </Card>
            </Link>
          ) : (
            <Card className="page-panel p-5 text-right opacity-60">
              <p className="page-card-kicker">下一篇</p>
              <p className="page-card-title mt-2 text-[1rem]">已经是最后一篇了</p>
            </Card>
          )}
        </div>

        <Link href="/articles" className="inline-flex">
          <Button variant="secondary" className="page-button-text">
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Button>
        </Link>
        </div>
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-28 space-y-7">
          <Card className="page-panel p-5">
            <h2 className="page-section-title text-[1.12rem]">目录</h2>
            <nav className="mt-4 space-y-3">
              {headings.length ? (
                headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block text-[0.92rem] leading-7 text-muted-foreground transition-colors hover:text-foreground ${
                      heading.level === 3 ? "pl-4" : ""
                    }`}
                  >
                    {heading.text}
                  </a>
                ))
              ) : (
                <p className="page-note-copy">这篇文章还没有目录节点。</p>
              )}
            </nav>
          </Card>
          <Link href="/search" className="block">
            <Button variant="secondary" className="page-button-text w-full justify-between">
              去搜索更多内容
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </aside>
    </div>
  );
}
