import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { SearchBar } from "@/components/common/search-bar";
import { PageHero } from "@/components/sections/page-hero";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-8">
      <PageHero
        eyebrow="Search"
        title="站内搜索"
        description="搜索文章与学习日记。第一版先聚焦文字内容检索，后续再慢慢扩展到资源、项目和标签联动。"
      />

      <section className="rounded-[1.55rem] border border-border/65 bg-card/85 p-5 shadow-[0_18px_36px_-34px_rgba(58,67,92,0.24)] md:p-6">
        <SearchBar
          action="/search"
          placeholder="输入关键词试试，比如：Next.js、联调、学习日记"
          defaultValue={query}
          inputName="q"
        />
      </section>

      {query ? (
        results.length ? (
          <div className="space-y-4">
            {results.map((result) => (
              <Link key={result.id} href={result.href} className="block">
                <Card className="p-5 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-30px_rgba(58,67,92,0.28)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{result.type === "article" ? "文章" : "日记"}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(result.date, "YYYY.MM.DD")}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-foreground">{result.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{result.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="没有找到匹配内容"
            description="试试更短的关键词，或者搜索标题、标签和你记得的主题词。"
            actionHref="/articles"
            actionLabel="浏览文章"
          />
        )
      ) : (
        <EmptyState
          title="输入一个关键词开始搜索"
          description="比如：Next.js、Spring Boot、学习系统、资源整理。"
          actionHref="/"
          actionLabel="回首页"
        />
      )}
    </div>
  );
}
