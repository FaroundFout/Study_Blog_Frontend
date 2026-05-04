import type { Metadata } from "next";

import { PageHero } from "@/components/sections/page-hero";
import { Card } from "@/components/ui/card";
import { createArchiveItems, formatDate, formatMonth, groupByMonth } from "@/lib/utils";
import { getAllArticles, getAllDiaries } from "@/lib/api";

export const metadata: Metadata = {
  title: "归档"
};

export default async function ArchivesPage() {
  const [articles, diaries] = await Promise.all([getAllArticles(), getAllDiaries()]);
  const groups = groupByMonth(createArchiveItems(articles, diaries));

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Archive Shelf"
        title="归档"
        description="按年月回看文章和学习日记，适合查找某段时间里自己在关注什么，也能看到内容逐渐累积的轨迹。"
      />

      <div className="space-y-4">
        {Object.entries(groups).map(([month, items]) => (
          <details key={month} open className="group">
            <Card className="page-panel overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 md:px-6">
                <div className="space-y-1.5">
                  <h2 className="page-section-title text-[1.28rem] md:text-[1.4rem]">
                    {formatMonth(month)}
                  </h2>
                  <p className="page-support-text">{items.length} 条记录</p>
                </div>
                <span className="page-support-text text-base transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>
              <div className="space-y-3 border-t border-border/60 px-5 py-5 md:px-6">
                {items.map((item) => (
                  <a
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    className="flex flex-col gap-2 rounded-[1.3rem] border border-border/50 bg-background/40 px-4 py-4 transition-colors hover:bg-accent/60 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="page-card-kicker">
                        {item.type === "article" ? "文章" : "日记"}
                      </p>
                      <p className="page-card-title text-[1rem] md:text-[1.04rem]">{item.title}</p>
                    </div>
                    <p className="page-support-text">{formatDate(item.date)}</p>
                  </a>
                ))}
              </div>
            </Card>
          </details>
        ))}
      </div>
    </div>
  );
}
