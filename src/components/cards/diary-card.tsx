import Link from "next/link";
import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, splitCommaText } from "@/lib/utils";
import type { Diary } from "@/types";

export function DiaryCard({ diary }: { diary: Diary }) {
  return (
    <Link href={`/diaries/${diary.id}`} className="group block">
      <Card className="page-card-shell p-0">
        <div className="page-card-body">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2.5">
              <p className="page-card-kicker">{formatDate(diary.diaryDate, "YYYY.MM.DD")}</p>
              <h3 className="page-card-title transition-colors group-hover:text-primary">
                {diary.title}
              </h3>
            </div>
            {diary.mood ? <Badge variant="secondary">{diary.mood}</Badge> : null}
          </div>

          <p className="page-card-summary line-clamp-3">{diary.summary}</p>

          <div className="flex flex-wrap gap-2">
            {splitCommaText(diary.tagsText)
              .slice(0, 3)
              .map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
          </div>

          <div className="page-card-divider page-card-meta inline-flex items-center gap-2.5">
            <Clock3 className="h-3.5 w-3.5" />
            学习时长 {diary.studyHours ?? 0} h
          </div>
        </div>
      </Card>
    </Link>
  );
}
