import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";

import { MOOD_LABELS } from "@/lib/constants";
import { splitCommaText } from "@/lib/utils";
import type { Diary } from "@/types";

dayjs.locale("zh-cn");

export function DiaryCard({ diary, index }: { diary: Diary; index: number }) {
  const date = dayjs(diary.diaryDate);
  const day = date.format("DD");
  const weekday = date.format("ddd");
  const fullDate = date.format("YYYY.MM.DD");
  const moodLabel = diary.mood ? MOOD_LABELS[diary.mood] || diary.mood : "未记录";
  const tags = splitCommaText(diary.tagsText).slice(0, 3);

  return (
    <article className="diary-date-card diary-index-card">
      <Link
        href={`/diaries/${diary.id}`}
        className="diary-date-link group"
        aria-label={`阅读 ${fullDate} 的学习日记：${diary.title}`}
      >
        <span className="diary-card-punch" aria-hidden="true" />
        <header className="diary-card-register">
          <time dateTime={diary.diaryDate} className="diary-card-date">
            <span>{day}</span>
            <small>{date.format("MM/DD")}<br />{weekday}</small>
          </time>
          <span className="diary-mood-stamp">{moodLabel}</span>
          <span className="diary-card-duration"><small>学习时长</small><strong>{diary.studyHours ?? 0}h</strong></span>
        </header>

        <div className="diary-date-content">
          <div className="diary-date-copy">
            <h3>{diary.title}</h3>
            {diary.summary ? <p>{diary.summary}</p> : null}
          </div>

          {tags.length ? (
            <ul className="diary-date-tags" aria-label="日记标签">
              {tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          ) : null}

          <footer className="diary-date-footer">
            <span>
              <Clock3 aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
              {date.format("YYYY / MM")}
            </span>
            <span className="diary-date-read" aria-hidden="true">
              #{String(index).padStart(3, "0")}
              <ArrowUpRight className="h-4 w-4 stroke-[1.75] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </footer>
        </div>
      </Link>
    </article>
  );
}
