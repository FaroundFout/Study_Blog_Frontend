import dayjs from "dayjs";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, BookOpenText, FolderKanban, NotebookPen } from "lucide-react";

import type { ArchiveItem } from "@/types";

const typeMeta = {
  article: { label: "文章", code: "Article", Icon: BookOpenText },
  diary: { label: "日记", code: "Diary", Icon: NotebookPen },
  project: { label: "项目", code: "Project", Icon: FolderKanban }
} as const;

const entryVariants: Variants = {
  closed: { opacity: 0, y: -7, filter: "blur(2px)" },
  open: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

export function ArchiveEntry({ item, index }: { item: ArchiveItem; index: number }) {
  const meta = typeMeta[item.type];
  const date = dayjs(item.date);

  return (
    <motion.li className={`archive-ledger-entry archive-ledger-entry-${item.type}`} variants={entryVariants}>
      <a href={item.href} className="archive-ledger-link">
        <span className="archive-entry-type"><meta.Icon aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.75]" />{meta.label}</span>
        <time dateTime={item.date} className="archive-ledger-date">{date.format("MM / DD")}</time>
        <div className="archive-ledger-content">
          <h4>{item.title}</h4>
        </div>
        <span className="archive-ledger-open" aria-hidden="true">
          {meta.code} / {String(index).padStart(2, "0")}
          <ArrowUpRight className="h-4 w-4 stroke-[1.75]" />
        </span>
      </a>
    </motion.li>
  );
}
