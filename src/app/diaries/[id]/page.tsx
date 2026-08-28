import type { Metadata } from "next";
import { CalendarDays, Clock3, Gauge, NotebookPen } from "lucide-react";
import { notFound } from "next/navigation";

import { ArchiveDossier } from "@/components/reader/archive-dossier";
import { getDiaryById, getDiaryNavigation } from "@/lib/api";
import { MOOD_LABELS } from "@/lib/constants";
import { extractHeadings, formatDate, splitCommaText } from "@/lib/utils";

interface DiaryDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params
}: DiaryDetailPageProps): Promise<Metadata> {
  const diary = await getDiaryById(Number(params.id));

  return {
    title: diary?.title || "学习日记不存在",
    description: diary?.summary
  };
}

export default async function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const diaryId = Number(params.id);
  const diary = await getDiaryById(diaryId);

  if (!diary) {
    notFound();
  }

  const navigation = await getDiaryNavigation(diaryId);
  const mood = MOOD_LABELS[diary.mood ?? ""] ?? diary.mood ?? "平稳";
  const tags = splitCommaText(diary.tagsText);
  const month = formatDate(diary.diaryDate, "YYYY 年 MM 月");

  return (
    <ArchiveDossier
      kind="diary"
      sectionNumber="02"
      recordNumber={`D-${String(diary.id).padStart(3, "0")}`}
      dossierLabel="Diary dossier"
      kickerLabel="Diary record"
      kickerValue={formatDate(diary.diaryDate, "dddd")}
      kickerIcon={NotebookPen}
      title={diary.title}
      summary={diary.summary}
      backHref="/diaries"
      backLabel="返回学习日记"
      breadcrumbs={[
        { label: "学习日记", href: "/diaries" },
        { label: month, href: `/diaries?month=${formatDate(diary.diaryDate, "YYYY-MM")}` }
      ]}
      indexLabel="Diary index"
      contentLabel="Diary file / 学习日记正文"
      facts={[
        { label: "Date", value: formatDate(diary.diaryDate, "YYYY.MM.DD"), icon: CalendarDays },
        { label: "Mood", value: mood, icon: Gauge },
        { label: "Study time", value: `${diary.studyHours ?? 0} h`, icon: Clock3 }
      ]}
      tags={tags.map((tag) => ({ label: tag }))}
      content={diary.contentMd}
      headings={extractHeadings(diary.contentMd)}
      previous={navigation.prev ? { label: navigation.prev.title, href: `/diaries/${navigation.prev.id}` } : null}
      next={navigation.next ? { label: navigation.next.title, href: `/diaries/${navigation.next.id}` } : null}
      previousLabel="上一篇日记"
      nextLabel="下一篇日记"
    />
  );
}
