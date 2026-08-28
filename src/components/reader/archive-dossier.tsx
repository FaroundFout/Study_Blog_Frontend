import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  ChevronRight,
  Home
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { ReaderProgress } from "@/components/reader/reader-progress";
import type { TocHeading } from "@/types";

import styles from "@/components/projects/project-case-study.module.css";

export interface ArchiveDossierBreadcrumb {
  label: string;
  href: string;
}

export interface ArchiveDossierFact {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
}

export interface ArchiveDossierAction {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

export interface ArchiveDossierTag {
  label: string;
  href?: string;
}

export interface ArchiveDossierNavigationItem {
  label: string;
  href: string;
}

interface ArchiveDossierProps {
  kind: "article" | "diary" | "resource";
  sectionNumber: string;
  recordNumber: string;
  dossierLabel: string;
  breadcrumbs: ArchiveDossierBreadcrumb[];
  kickerLabel: string;
  kickerValue: string;
  kickerIcon: LucideIcon;
  title: string;
  summary?: string;
  facts: ArchiveDossierFact[];
  tags?: ArchiveDossierTag[];
  actions?: ArchiveDossierAction[];
  coverImage?: string;
  coverAlt?: string;
  coverCaption?: string;
  content: string;
  contentLabel: string;
  headings: TocHeading[];
  backHref: string;
  backLabel: string;
  indexLabel: string;
  previous?: ArchiveDossierNavigationItem | null;
  next?: ArchiveDossierNavigationItem | null;
  previousLabel: string;
  nextLabel: string;
}

export function ArchiveDossier({
  kind,
  sectionNumber,
  recordNumber,
  dossierLabel,
  breadcrumbs,
  kickerLabel,
  kickerValue,
  kickerIcon: KickerIcon,
  title,
  summary,
  facts,
  tags = [],
  actions = [],
  coverImage,
  coverAlt,
  coverCaption,
  content,
  contentLabel,
  headings,
  backHref,
  backLabel,
  indexLabel,
  previous,
  next,
  previousLabel,
  nextLabel
}: ArchiveDossierProps) {
  return (
    <div
      className={styles.caseStudy}
      data-immersive-reader
      data-reader-kind={kind}
    >
      <ReaderProgress />

      <header className={styles.hero}>
        <div className={styles.register}>
          <span>Study Garden / {dossierLabel}</span>
          <span>{sectionNumber} — {recordNumber}</span>
        </div>

        <nav className={styles.breadcrumbs} aria-label="面包屑">
          <Link href="/" aria-label="返回首页">
            <Home aria-hidden="true" />
            首页
          </Link>
          {breadcrumbs.map((item) => (
            <span key={`${item.href}-${item.label}`}>
              <ChevronRight aria-hidden="true" />
              <Link href={item.href}>{item.label}</Link>
            </span>
          ))}
        </nav>

        <div className={`${styles.heroLayout} ${coverImage ? styles.heroWithCover : styles.heroWithoutCover}`}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <KickerIcon aria-hidden="true" />
              {kickerLabel}
              <span>{kickerValue}</span>
            </p>
            <h1 className={styles.dossierTitle}>{title}</h1>
            {summary ? <p className={styles.summary}>{summary}</p> : null}

            {actions.length ? (
              <div className={styles.actions} aria-label="详情页操作">
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
              <dl className={styles.facts} aria-label="内容概览">
                {facts.map((fact) => {
                  const Icon = fact.icon;
                  return (
                    <div key={`${fact.label}-${fact.value}`}>
                      <dt>
                        <Icon aria-hidden="true" />
                        <span>{fact.label}</span>
                      </dt>
                      <dd>{fact.href ? <Link href={fact.href}>{fact.value}</Link> : fact.value}</dd>
                    </div>
                  );
                })}
              </dl>
            ) : null}

            {tags.length ? (
              <ul className={styles.techStack} aria-label="内容标签">
                {tags.map((tag) => (
                  <li key={`${tag.href || "tag"}-${tag.label}`}>
                    {tag.href ? <Link href={tag.href}>{tag.label}</Link> : tag.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {coverImage ? (
            <figure className={styles.cover}>
              <div className={styles.coverRegister}>
                <span>Archive / 01</span>
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
              <figcaption>{coverCaption || "档案封面 / Archive cover"}</figcaption>
            </figure>
          ) : null}
        </div>
      </header>

      <section className={styles.readingStage} aria-label={contentLabel}>
        <div className={styles.readingGrid}>
          <aside className={styles.indexRail} aria-label={indexLabel}>
            <Link href={backHref} className={styles.backLink}>
              <ArrowLeft aria-hidden="true" />
              {backLabel}
            </Link>

            {headings.length ? (
              <section className={styles.railSection}>
                <p className={styles.railLabel}>
                  <BookOpenText aria-hidden="true" />
                  {indexLabel}
                </p>
                <ArchiveToc headings={headings} />
              </section>
            ) : null}
          </aside>

          <article className={styles.manuscript}>
            <div className={styles.manuscriptRegister}>
              <span>{contentLabel}</span>
              <span>{recordNumber}</span>
            </div>

            {headings.length ? (
              <details className={styles.mobileIndex}>
                <summary>
                  <BookOpenText aria-hidden="true" />
                  阅读目录
                </summary>
                <ArchiveToc headings={headings} />
              </details>
            ) : null}

            <section className={styles.content} data-reader-body aria-label="正文">
              <MarkdownRenderer content={content} className={styles.prose} />
            </section>

            <ArchiveNavigation
              previous={previous}
              next={next}
              previousLabel={previousLabel}
              nextLabel={nextLabel}
            />
          </article>
        </div>
      </section>
    </div>
  );
}

function ArchiveToc({ headings }: { headings: TocHeading[] }) {
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

function ArchiveNavigation({
  previous,
  next,
  previousLabel,
  nextLabel
}: {
  previous?: ArchiveDossierNavigationItem | null;
  next?: ArchiveDossierNavigationItem | null;
  previousLabel: string;
  nextLabel: string;
}) {
  return (
    <nav className={styles.bottomNavigation} aria-label="前后内容导航">
      {previous ? (
        <Link href={previous.href} className={styles.previousLink}>
          <span><ArrowLeft aria-hidden="true" />{previousLabel}</span>
          <strong>{previous.label}</strong>
        </Link>
      ) : (
        <div className={`${styles.previousLink} ${styles.disabledLink}`}>
          <span><ArrowLeft aria-hidden="true" />{previousLabel}</span>
          <strong>已经抵达起点</strong>
        </div>
      )}
      {next ? (
        <Link href={next.href} className={styles.nextLink}>
          <span>{nextLabel}<ArrowRight aria-hidden="true" /></span>
          <strong>{next.label}</strong>
        </Link>
      ) : (
        <div className={`${styles.nextLink} ${styles.disabledLink}`}>
          <span>{nextLabel}<ArrowRight aria-hidden="true" /></span>
          <strong>已经抵达末尾</strong>
        </div>
      )}
    </nav>
  );
}
