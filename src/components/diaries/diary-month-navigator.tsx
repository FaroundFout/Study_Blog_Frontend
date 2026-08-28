import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";

export interface DiaryMonthSummary {
  key: string;
  label: string;
  anchor: string;
  count: number;
  hours: number;
}

interface DiaryMonthNavigatorProps {
  total: number;
  pageHours: number;
  months: DiaryMonthSummary[];
}

export function DiaryMonthNavigator({ total, pageHours, months }: DiaryMonthNavigatorProps) {
  const firstMonth = months[0]?.key ? dayjs(`${months[0].key}-01`) : dayjs();
  const monthSlots = Array.from({ length: 6 }, (_, index) => {
    const date = firstMonth.subtract(index, "month");
    const key = date.format("YYYY-MM");
    return {
      key,
      year: date.format("YYYY"),
      month: date.format("MM"),
      match: months.find((item) => item.key === key)
    };
  });

  return (
    <aside className="diary-month-rail" aria-label="学习日记月份索引">
      <div className="diary-month-rail-all">
        <CalendarDays aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
        <span>全部</span>
      </div>
      <nav aria-label="跳转到月份分组">
        {monthSlots.map((slot) => slot.match ? (
          <a key={slot.key} href={`#${slot.match.anchor}`} className="diary-month-rail-active">
            <span>{slot.year}</span>
            <strong>{slot.month}</strong>
          </a>
        ) : (
          <span key={slot.key} aria-disabled="true">
            <span>{slot.year}</span>
            <strong>{slot.month}</strong>
          </span>
        ))}
      </nav>
      <p><strong>{String(total).padStart(2, "0")}</strong> 条记录</p>
      <p><strong>{pageHours.toFixed(1)}</strong> 小时</p>
    </aside>
  );
}
