import type { Metadata } from "next";

import { buildArchiveLedger } from "@/components/archives/archive-ledger";
import { ArchiveSummary, ArchiveYearIndex } from "@/components/archives/archive-year-index";
import { ArchiveYearSection } from "@/components/archives/archive-year-section";
import { EmptyState } from "@/components/common/empty-state";
import { CatalogPage } from "@/components/sections/catalog-page";
import { getAllArticles, getAllDiaries, getAllProjects } from "@/lib/api";
import { createArchiveItems } from "@/lib/utils";

export const metadata: Metadata = {
  title: "归档"
};

export default async function ArchivesPage() {
  const [articles, diaries, projects] = await Promise.all([
    getAllArticles(),
    getAllDiaries(),
    getAllProjects()
  ]);
  const years = buildArchiveLedger(createArchiveItems(articles, diaries, projects));

  return (
    <CatalogPage
      index="05"
      eyebrow="Archive Shelf"
      title="归档"
      description="按年份与月份回顾文章与学习日记。记录成长的每一步，沉淀可复用的知识与思考。"
      mobileShowControls={false}
    >
      {years.length ? (
        <div className="archive-catalog-layout">
          <ArchiveYearIndex years={years} />
          <div className="archive-year-stack">
            {years.map((year) => (
              <ArchiveYearSection key={year.year} year={year} />
            ))}
          </div>
          <ArchiveSummary years={years} />
        </div>
      ) : (
        <EmptyState
          title="归档总册还没有记录"
          description="文章、学习日记或项目公开后，会按照真实日期汇入这里。"
          actionHref="/articles"
          actionLabel="查看文章"
        />
      )}
    </CatalogPage>
  );
}
