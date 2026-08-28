import type { Metadata } from "next";
import dayjs from "dayjs";

import {
  CatalogNavigation,
  CatalogResultsRegion
} from "@/components/common/catalog-navigation-transition";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { DiaryMonthNavigator, type DiaryMonthSummary } from "@/components/diaries/diary-month-navigator";
import { DiaryMonthSection } from "@/components/diaries/diary-month-section";
import { CatalogPage } from "@/components/sections/catalog-page";
import { getDiaries } from "@/lib/api";
import { DEFAULT_LIST_PAGE_SIZE } from "@/lib/constants";
import type { Diary } from "@/types";

export const metadata: Metadata = {
  title: "学习日记"
};

const DIARY_RESULTS_ID = "diary-catalog-results";

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

  const monthGroups = diaryPage.list.reduce<Record<string, Diary[]>>((groups, diary) => {
    const key = dayjs(diary.diaryDate).format("YYYY-MM");
    groups[key] = [...(groups[key] || []), diary];
    return groups;
  }, {});

  const months: DiaryMonthSummary[] = Object.entries(monthGroups).map(([key, diaries]) => ({
    key,
    label: dayjs(`${key}-01`).format("YYYY 年 M 月"),
    anchor: `month-${key}`,
    count: diaries.length,
    hours: diaries.reduce((total, diary) => total + (diary.studyHours || 0), 0)
  }));
  const pageHours = diaryPage.list.reduce((total, diary) => total + (diary.studyHours || 0), 0);
  const contentKey = JSON.stringify([
    "diaries",
    page,
    searchParams.keyword ?? ""
  ]);

  return (
    <CatalogNavigation contentKey={contentKey} resultsId={DIARY_RESULTS_ID}>
      <CatalogPage
        index="02"
        eyebrow="Diary Index"
        title="学习日记"
        description="记录每天的学习进展、思考与灵感，让成长有迹可循。"
        mobileShowControls={false}
        controlsLabel="搜索学习日记"
        controlsMeta="Search / Diary"
        controls={
          <SearchBar
            action="/diaries"
            placeholder="搜索学习日记关键词…"
            defaultValue={searchParams.keyword}
            showButton={false}
          />
        }
      >
        <CatalogResultsRegion
          id={DIARY_RESULTS_ID}
          label="学习日记列表"
          variant="diaries"
        >
          {diaryPage.list.length ? (
            <div className="diary-catalog-layout">
              <DiaryMonthNavigator total={diaryPage.total} pageHours={pageHours} months={months} />
              <div className="diary-month-stack">
                {months.map((month) => (
                  <DiaryMonthSection key={month.key} month={month} diaries={monthGroups[month.key]} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              variant="catalog"
              title="还没有公开的学习日记"
              description="新的学习记录发布后，会按照日期依次出现在这里。"
              actionHref="/articles"
              actionLabel="去看文章"
            />
          )}
        </CatalogResultsRegion>

        {diaryPage.list.length ? (
          <Pagination
            page={page}
            pageSize={diaryPage.pageSize}
            total={diaryPage.total}
            pathname="/diaries"
            query={{ keyword: searchParams.keyword }}
            alwaysVisible
            itemLabel="条记录"
            ariaLabel="学习日记分页"
          />
        ) : null}
      </CatalogPage>
    </CatalogNavigation>
  );
}
