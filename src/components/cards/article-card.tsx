import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, Eye } from "lucide-react";

import { TagList } from "@/components/common/tag-list";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <Card className="page-card-shell">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border/60 bg-accent/55">
          <Image
            src={article.coverImage || "/images/article-pattern.svg"}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 via-black/0 to-transparent" />
          {article.isTop ? (
            <Badge className="absolute left-4 top-4">置顶</Badge>
          ) : null}
        </div>

        <div className="page-card-body">
          <div className="page-card-meta flex items-center gap-2">
            <span>{article.categoryName || "未分类"}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(article.publishTime, "YYYY.MM.DD")}</span>
          </div>

          <div className="space-y-2.5">
            <h3 className="page-card-title line-clamp-2 transition-colors group-hover:text-primary">
              {article.title}
            </h3>
            <p className="page-card-summary line-clamp-3">{article.summary}</p>
          </div>

          <TagList tags={article.tags.slice(0, 3)} />

          <div className="page-card-divider page-card-meta flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {article.viewCount ?? 0}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {article.wordCount ?? 0} 字
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
