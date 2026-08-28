"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ChevronDown, CirclePlus } from "lucide-react";

import { ArchiveEntry } from "@/components/archives/archive-entry";
import type { ArchiveYearGroup } from "@/components/archives/archive-ledger";

const archiveEase = [0.22, 1, 0.36, 1] as const;

const contentVariants: Variants = {
  closed: {
    height: 0,
    opacity: 0,
    y: -8,
    transition: {
      height: { duration: 0.32, ease: archiveEase },
      opacity: { duration: 0.16, ease: "easeOut" },
      y: { duration: 0.22, ease: "easeOut" },
      staggerChildren: 0.025,
      staggerDirection: -1
    }
  },
  open: {
    height: "auto",
    opacity: 1,
    y: 0,
    transition: {
      height: { duration: 0.46, ease: archiveEase },
      opacity: { duration: 0.24, delay: 0.06, ease: "easeOut" },
      y: { duration: 0.34, ease: archiveEase },
      delayChildren: 0.1,
      staggerChildren: 0.055
    }
  }
};

export function ArchiveYearSection({ year }: { year: ArchiveYearGroup }) {
  const maxMonthItems = Math.max(...year.months.map((month) => month.items.length), 1);
  const prefersReducedMotion = useReducedMotion();
  const [openMonths, setOpenMonths] = useState<Set<string>>(
    () => new Set(year.months[0] ? [year.months[0].key] : [])
  );

  function toggleMonth(monthKey: string) {
    setOpenMonths((current) => {
      const next = new Set(current);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  }

  return (
    <section id={year.anchor} className="archive-year-section" aria-labelledby={`${year.anchor}-title`}>
      <header className="archive-year-heading sr-only">
        <div className="archive-year-title">
          <p>Annual volume</p>
          <h2 id={`${year.anchor}-title`}>{year.year}</h2>
        </div>
        <div className="archive-year-rule" aria-hidden="true" />
        <dl className="archive-year-summary">
          <div><dt>记录</dt><dd>{String(year.items.length).padStart(2, "0")}</dd></div>
          <div><dt>活跃月</dt><dd>{String(year.months.length).padStart(2, "0")}</dd></div>
        </dl>
      </header>

      <div className="archive-density-strip sr-only" aria-label={`${year.year} 年月份内容密度`}>
        {Array.from({ length: 12 }, (_, monthIndex) => {
          const monthNumber = String(monthIndex + 1).padStart(2, "0");
          const month = year.months.find((item) => item.shortLabel === monthNumber);
          const density = month ? Math.max(0.18, month.items.length / maxMonthItems) : 0.04;
          return (
            <span key={monthNumber} className={month ? "archive-density-active" : undefined}>
              <i style={{ transform: `scaleY(${density})` }} aria-hidden="true" />
              <small>{monthNumber}</small>
            </span>
          );
        })}
      </div>

      <div className="archive-month-stack">
        {year.months.map((month) => {
          const isOpen = openMonths.has(month.key);
          const contentId = `archive-month-content-${month.key}`;

          return (
            <section
              key={month.key}
              className="archive-month-section"
              data-state={isOpen ? "open" : "closed"}
              aria-labelledby={`month-${month.key}`}
            >
              <motion.button
                type="button"
                className="archive-month-marker"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleMonth(month.key)}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.992, y: 1 }}
                transition={{ duration: 0.12 }}
              >
                <motion.span
                  className="archive-month-chevron"
                  animate={{ rotate: isOpen ? 0 : -90 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: archiveEase }}
                  aria-hidden="true"
                >
                  <ChevronDown className="h-5 w-5 stroke-[1.8]" />
                </motion.span>
                <h3 id={`month-${month.key}`}>{month.label}</h3>
                <span className="archive-month-count">{String(month.items.length).padStart(2, "0")} 条记录</span>
                <motion.span
                  className="archive-month-toggle"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.34, ease: archiveEase }}
                  aria-hidden="true"
                >
                  <CirclePlus className="h-6 w-6 stroke-[1.5]" />
                </motion.span>
              </motion.button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key={contentId}
                    id={contentId}
                    className="archive-month-content"
                    initial={prefersReducedMotion ? false : "closed"}
                    animate={prefersReducedMotion ? undefined : "open"}
                    exit={prefersReducedMotion ? undefined : "closed"}
                    variants={contentVariants}
                  >
                    <ol className="archive-ledger-list">
                      {month.items.map((item, index) => (
                        <ArchiveEntry key={`${item.type}-${item.id}`} item={item} index={index + 1} />
                      ))}
                    </ol>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </section>
  );
}
