import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CalendarRange,
  ChevronRight,
  Flag,
  FolderArchive,
  Home,
  Layers3
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { ReaderProgress } from "@/components/reader/reader-progress";
import type { TocHeading } from "@/types";

import styles from "./project-case-study.module.css";

export interface ProjectCaseStudyAction {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

export interface ProjectCaseStudyNavigationItem {
  label: string;
  href: string;
}

interface ProjectCaseStudyProps {
  recordNumber: string;
  title: string;
  summary?: string;
  status: string;
  statusHref: string;
  timeline?: string;
  techStack: string[];
  actions?: ProjectCaseStudyAction[];
  coverImage?: string;
  coverAlt?: string;
  content: string;
  headings: TocHeading[];
  previous?: ProjectCaseStudyNavigationItem | null;
  next?: ProjectCaseStudyNavigationItem | null;
}

export function ProjectCaseStudy({
  recordNumber,
  title,
  summary,
  status,
  statusHref,
  timeline,
  techStack,
  actions = [],
  coverImage,
  coverAlt,
  content,
  headings,
  previous,
  next
}: ProjectCaseStudyProps) {
  const facts = [
    { label: "Status", value: status, icon: Flag },
    timeline ? { label: "Timeline", value: timeline, icon: CalendarRange } : null,
    techStack.length
      ? { label: "Stack", value: `${techStack.length} 项技术`, icon: Layers3 }
      : null
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div
      className={styles.caseStudy}
      data-immersive-reader
      data-reader-kind="project"
    >
      <ReaderProgress />

      <header className={styles.hero}>
        <div className={styles.register}>
          <span>Study Garden / Project dossier</span>
          <span>03 — {recordNumber}</span>
        </div>

        <nav className={styles.breadcrumbs} aria-label="面包屑">
          <Link href="/" aria-label="返回首页">
            <Home aria-hidden="true" />
            首页
          </Link>
          <span>
            <ChevronRight aria-hidden="true" />
            <Link href="/projects">项目</Link>
          </span>
          <span>
            <ChevronRight aria-hidden="true" />
            <Link href={statusHref}>{status}</Link>
          </span>
        </nav>

        <div className={`${styles.heroLayout} ${coverImage ? styles.heroWithCover : styles.heroWithoutCover}`}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <FolderArchive aria-hidden="true" />
              Project record
              <span>{status}</span>
            </p>
            <h1>{title}</h1>
            {summary ? <p className={styles.summary}>{summary}</p> : null}

            {actions.length ? (
              <div className={styles.actions} aria-label="项目入口">
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={`${action.href}-${action.label}`}
                      href={action.href}
                      target={action.external ? "_blank" : undefined}
                      rel={action.external ? "noreferrer" : undefined}
                    >
                      <Icon aria-hidden="true" />
                      <span>{action.label}</span>
                      {action.external ? <ArrowUpRight aria-hidden="true" /> : null}
                    </a>
                  );
                })}
              </div>
            ) : null}

            {facts.length ? (
              <dl className={styles.facts} aria-label="项目概览">
                {facts.map((fact) => {
                  const Icon = fact.icon;
                  return (
                    <div key={fact.label}>
                      <dt>
                        <Icon aria-hidden="true" />
                        <span>{fact.label}</span>
                      </dt>
                      <dd>{fact.value}</dd>
                    </div>
                  );
                })}
              </dl>
            ) : null}

            {techStack.length ? (
              <ul className={styles.techStack} aria-label="项目技术栈">
                {techStack.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {coverImage ? (
            <figure className={styles.cover}>
              <div className={styles.coverRegister}>
                <span>Evidence / 01</span>
                <span>{recordNumber}</span>
              </div>
              <div className={styles.coverMedia}>
                <Image
                  src={coverImage}
                  alt={coverAlt || ""}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1023px) calc(100vw - 2rem), 31vw"
                />
              </div>
              <figcaption>项目成果图 / Project evidence</figcaption>
            </figure>
          ) : null}
        </div>
      </header>

      <section className={styles.readingStage} aria-label="项目正文">
        <div className={styles.readingGrid}>
          <aside className={styles.indexRail} aria-label="项目阅读索引">
            <Link href="/projects" className={styles.backLink}>
              <ArrowLeft aria-hidden="true" />
              返回项目索引
            </Link>

            {headings.length ? (
              <section className={styles.railSection}>
                <p className={styles.railLabel}>
                  <BookOpenText aria-hidden="true" />
                  Case index
                </p>
                <ProjectToc headings={headings} />
              </section>
            ) : null}
          </aside>

          <article className={styles.manuscript}>
            <div className={styles.manuscriptRegister}>
              <span>Case file / 项目正文</span>
              <span>{recordNumber}</span>
            </div>

            {headings.length ? (
              <details className={styles.mobileIndex}>
                <summary>
                  <BookOpenText aria-hidden="true" />
                  阅读目录
                </summary>
                <ProjectToc headings={headings} />
              </details>
            ) : null}

            <section className={styles.content} data-reader-body aria-label="正文">
              <MarkdownRenderer content={content} className={styles.prose} />
            </section>

            <ProjectNavigation previous={previous} next={next} />
          </article>
        </div>
      </section>
    </div>
  );
}

function ProjectToc({ headings }: { headings: TocHeading[] }) {
  return (
    <nav className={styles.toc} aria-label="页面目录">
      {headings.map((heading, index) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={heading.level === 3 ? styles.tocNested : undefined}
          data-reader-toc-link={heading.id}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          {heading.text}
        </a>
      ))}
    </nav>
  );
}

function ProjectNavigation({
  previous,
  next
}: {
  previous?: ProjectCaseStudyNavigationItem | null;
  next?: ProjectCaseStudyNavigationItem | null;
}) {
  return (
    <nav className={styles.bottomNavigation} aria-label="前后项目导航">
      {previous ? (
        <Link href={previous.href} className={styles.previousLink}>
          <span><ArrowLeft aria-hidden="true" />上一个项目</span>
          <strong>{previous.label}</strong>
        </Link>
      ) : (
        <div className={`${styles.previousLink} ${styles.disabledLink}`}>
          <span><ArrowLeft aria-hidden="true" />上一个项目</span>
          <strong>已经抵达起点</strong>
        </div>
      )}
      {next ? (
        <Link href={next.href} className={styles.nextLink}>
          <span>下一个项目<ArrowRight aria-hidden="true" /></span>
          <strong>{next.label}</strong>
        </Link>
      ) : (
        <div className={`${styles.nextLink} ${styles.disabledLink}`}>
          <span>下一个项目<ArrowRight aria-hidden="true" /></span>
          <strong>已经抵达末尾</strong>
        </div>
      )}
    </nav>
  );
}
