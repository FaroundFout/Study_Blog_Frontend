import { DiaryCard } from "@/components/cards/diary-card";
import type { DiaryMonthSummary } from "@/components/diaries/diary-month-navigator";
import type { Diary } from "@/types";

interface DiaryMonthSectionProps {
  month: DiaryMonthSummary;
  diaries: Diary[];
}

export function DiaryMonthSection({ month, diaries }: DiaryMonthSectionProps) {
  return (
    <section id={month.anchor} className="diary-month-section" aria-labelledby={`${month.anchor}-title`}>
      <header className="diary-month-heading">
        <div className="diary-month-title-block">
          <p className="diary-month-kicker">Monthly register</p>
          <h2 id={`${month.anchor}-title`} className="diary-month-title">
            {month.label}
          </h2>
        </div>
        <div className="diary-month-rule" aria-hidden="true" />
        <dl className="diary-month-summary">
          <div>
            <dt>记录</dt>
            <dd>{String(month.count).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>学习</dt>
            <dd>{month.hours.toFixed(1)}h</dd>
          </div>
        </dl>
      </header>

      <div className="diary-date-grid">
        {diaries.map((diary, index) => (
          <DiaryCard key={diary.id} diary={diary} index={index + 1} />
        ))}
      </div>
    </section>
  );
}
