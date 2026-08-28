import dayjs from "dayjs";

import type { ArchiveItem } from "@/types";

export interface ArchiveMonthGroup {
  key: string;
  label: string;
  shortLabel: string;
  items: ArchiveItem[];
  counts: Record<ArchiveItem["type"], number>;
}

export interface ArchiveYearGroup {
  year: string;
  anchor: string;
  months: ArchiveMonthGroup[];
  items: ArchiveItem[];
  counts: Record<ArchiveItem["type"], number>;
}

const emptyCounts = (): Record<ArchiveItem["type"], number> => ({
  article: 0,
  diary: 0,
  project: 0
});

function countByType(items: ArchiveItem[]) {
  return items.reduce((counts, item) => {
    counts[item.type] += 1;
    return counts;
  }, emptyCounts());
}

export function buildArchiveLedger(items: ArchiveItem[]): ArchiveYearGroup[] {
  const years = items.reduce<Record<string, ArchiveItem[]>>((groups, item) => {
    const year = dayjs(item.date).format("YYYY");
    groups[year] = [...(groups[year] ?? []), item];
    return groups;
  }, {});

  return Object.entries(years)
    .sort(([leftYear], [rightYear]) => rightYear.localeCompare(leftYear))
    .map(([year, yearItems]) => {
    const months = yearItems.reduce<Record<string, ArchiveItem[]>>((groups, item) => {
      const key = dayjs(item.date).format("YYYY-MM");
      groups[key] = [...(groups[key] ?? []), item];
      return groups;
    }, {});

    return {
      year,
      anchor: `year-${year}`,
      items: yearItems,
      counts: countByType(yearItems),
      months: Object.entries(months)
        .sort(([leftMonth], [rightMonth]) => rightMonth.localeCompare(leftMonth))
        .map(([key, monthItems]) => ({
        key,
        label: dayjs(`${key}-01`).format("M 月"),
        shortLabel: dayjs(`${key}-01`).format("MM"),
        items: monthItems,
        counts: countByType(monthItems)
        }))
    };
    });
}
