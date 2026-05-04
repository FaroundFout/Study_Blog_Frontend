import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { TagList } from "@/components/common/tag-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDiaryById } from "@/lib/api";
import { MOOD_LABELS } from "@/lib/constants";
import { formatDate, splitCommaText } from "@/lib/utils";

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
    title: diary ? diary.title : "学习日记不存在",
    description: diary?.summary
  };
}

export default async function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const diary = await getDiaryById(Number(params.id));

  if (!diary) {
    notFound();
  }

  return (
    <div className="detail-shell mx-auto max-w-4xl">
      <Card className="page-panel overflow-hidden">
        <div className="space-y-6 p-6 md:p-8">
          <Link href="/diaries" className="detail-backlink">
            <ArrowLeft className="h-4 w-4" />
            返回学习日记
          </Link>
          <div className="grid gap-6 md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <p className="detail-kicker">
                {formatDate(diary.diaryDate, "YYYY 年 MM 月 DD 日 dddd")}
              </p>
              <h1 className="detail-title">{diary.title}</h1>
              <p className="detail-summary">{diary.summary}</p>
              <TagList tags={splitCommaText(diary.tagsText)} />
            </div>
            <div className="page-note-panel">
              <p className="page-note-title">今日状态</p>
              <div className="page-note-copy mt-4 space-y-3">
                <p className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {MOOD_LABELS[diary.mood ?? ""] ?? diary.mood ?? "平稳"}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  学习时长 {diary.studyHours ?? 0} h
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="page-panel p-6 md:p-9">
        <MarkdownRenderer content={diary.contentMd} />
      </Card>

      <Link href="/diaries">
        <Button variant="secondary" className="page-button-text">
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </Button>
      </Link>
    </div>
  );
}
