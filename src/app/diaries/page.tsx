import type { Metadata } from "next";

import { DiaryCard } from "@/components/cards/diary-card";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { PageHero } from "@/components/sections/page-hero";
import { getDiaries } from "@/lib/api";
import { DEFAULT_LIST_PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "学习日记"
};

interface DiariesPageProps {
  searchParams: {
    page?: string;
    keyword?: string;
  };
}

export default async function DiariesPage({ searchParams }: DiariesPageProps) {
  const page = Number(searchParams.page || "1");
  const diaryPage = await getDiaries({
    pageNum: page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
    keyword: searchParams.keyword
  });

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Diary Flow"
        title="学习日记"
        description="更接近每天推进过程的记录。这里保留当天的问题、节奏、情绪，以及那些还没有完全想清楚的片段。"
      />

      <section className="page-panel p-5 md:p-6">
        <SearchBar
          action="/diaries"
          placeholder="搜索日记标题或关键词"
          defaultValue={searchParams.keyword}
        />
      </section>

      {diaryPage.list.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {diaryPage.list.map((diary) => (
              <DiaryCard key={diary.id} diary={diary} />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={diaryPage.pageSize}
            total={diaryPage.total}
            pathname="/diaries"
            query={{ keyword: searchParams.keyword }}
          />
        </>
      ) : (
        <EmptyState
          title="还没有匹配的学习日记"
          description="可以换个关键词试试，或者先去看看最近更新的文章。"
          actionHref="/articles"
          actionLabel="去看文章"
        />
      )}
    </div>
  );
}
