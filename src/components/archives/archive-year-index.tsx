import { BookOpenText, ChevronRight, FolderKanban, NotebookPen } from "lucide-react";

import type { ArchiveYearGroup } from "@/components/archives/archive-ledger";

interface ArchiveYearIndexProps {
  years: ArchiveYearGroup[];
}

export function ArchiveYearIndex({ years }: ArchiveYearIndexProps) {
  const totals = years.reduce(
    (summary, year) => ({
      total: summary.total + year.items.length,
      article: summary.article + year.counts.article,
      diary: summary.diary + year.counts.diary,
      project: summary.project + year.counts.project
    }),
    { total: 0, article: 0, diary: 0, project: 0 }
  );

  return (
    <aside className="archive-year-index" aria-label="归档年份索引">
      <h2>Archive shelf</h2>
      <nav className="archive-year-links">
        {years.map((year, index) => (
          <a key={year.year} href={`#${year.anchor}`} className={index === 0 ? "archive-year-link-active" : undefined}>
            <strong>{year.year}</strong>
            <span>{String(year.items.length).padStart(2, "0")} 条记录</span>
            <ChevronRight aria-hidden="true" className="h-5 w-5 stroke-[1.6]" />
          </a>
        ))}
      </nav>
      <div className="archive-index-perforation" aria-hidden="true" />
      <p>{String(totals.total).padStart(3, "0")} total records</p>
    </aside>
  );
}

export function ArchiveSummary({ years }: ArchiveYearIndexProps) {
  const totals = years.reduce(
    (summary, year) => ({
      total: summary.total + year.items.length,
      article: summary.article + year.counts.article,
      diary: summary.diary + year.counts.diary,
      project: summary.project + year.counts.project
    }),
    { total: 0, article: 0, diary: 0, project: 0 }
  );

  return (
    <aside className="archive-summary" aria-label="归档概览">
      <header><h2>归档概览</h2><span>Summary</span></header>
      <dl>
        <div><dt><BookOpenText aria-hidden="true" />文章</dt><dd>{totals.article}</dd></div>
        <div><dt><NotebookPen aria-hidden="true" />日记</dt><dd>{totals.diary}</dd></div>
        <div><dt><FolderKanban aria-hidden="true" />项目</dt><dd>{totals.project}</dd></div>
        <div><dt>合计记录</dt><dd>{totals.total}</dd></div>
      </dl>
      <p>Keep learning<br />Keep growing</p>
    </aside>
  );
}
