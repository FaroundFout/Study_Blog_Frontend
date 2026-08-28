import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  ChevronRight,
  FileText,
  FolderKanban,
  Home,
  NotebookPen
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import type { TocHeading } from "@/types";

import styles from "./immersive-reader.module.css";
import { ReaderProgress } from "./reader-progress";

export type ReaderKind = "article" | "diary" | "project";

export interface ReaderBreadcrumb {
  label: string;
  href: string;
}

export interface ReaderMetaItem {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
}

export interface ReaderTag {
  label: string;
  href?: string;
}

export interface ReaderAction {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

export interface ReaderNavigationItem {
  label: string;
  href: string;
}

interface ImmersiveReaderProps {
  kind: ReaderKind;
  recordNumber: string;
  eyebrow: string;
  title: string;
  summary?: string;
  backHref: string;
  backLabel: string;
  breadcrumbs: ReaderBreadcrumb[];
  meta: ReaderMetaItem[];
  tags?: ReaderTag[];
  actions?: ReaderAction[];
  coverImage?: string;
  coverAlt?: string;
  visualPrimary: string;
  visualSecondary: string;
  content: string;
  headings: TocHeading[];
  previous?: ReaderNavigationItem | null;
  next?: ReaderNavigationItem | null;
}

const kindLabels: Record<ReaderKind, { label: string; index: string; icon: LucideIcon }> = {
  article: { label: "Article record", index: "01", icon: BookOpenText },
  diary: { label: "Diary record", index: "02", icon: NotebookPen },
  project: { label: "Project record", index: "03", icon: FolderKanban }
};

export function ImmersiveReader({
  kind,
  recordNumber,
  eyebrow,
  title,
  summary,
  backHref,
  backLabel,
  breadcrumbs,
  meta,
  tags = [],
  actions = [],
  coverImage,
  coverAlt,
  visualPrimary,
  visualSecondary,
  content,
  headings,
  previous,
  next
}: ImmersiveReaderProps) {
  const kindInfo = kindLabels[kind];
  const KindIcon = kindInfo.icon;

  return (
    <div
      className={`${styles.reader} ${styles[kind]}`}
      data-immersive-reader
      data-reader-kind={kind}
    >
      <ReaderProgress />

      <header className={styles.hero}>
        <div className={styles.heroRegister}>
          <span>Study Garden / Reading Room</span>
          <span>{kindInfo.index} — {recordNumber}</span>
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

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <span>{kindInfo.label}</span>
              <span>{eyebrow}</span>
            </p>
            <h1>{title}</h1>
            {summary ? <p className={styles.summary}>{summary}</p> : null}

            <dl className={styles.metaGrid} aria-label="内容信息">
              {meta.map((item) => {
                const Icon = item.icon;
                const value = (
                  <>
                    <Icon aria-hidden="true" />
                    <span>
                      <small>{item.label}</small>
                      <strong>{item.value}</strong>
                    </span>
                  </>
                );

                return (
                  <div key={`${item.label}-${item.value}`}>
                    {item.href ? <Link href={item.href}>{value}</Link> : value}
                  </div>
                );
              })}
            </dl>

            {tags.length ? (
              <div className={styles.tags} aria-label="内容标签">
                {tags.map((tag) => tag.href ? (
                  <Link key={`${tag.href}-${tag.label}`} href={tag.href}>#{tag.label}</Link>
                ) : (
                  <span key={tag.label}>#{tag.label}</span>
                ))}
              </div>
            ) : null}

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
                      {action.label}
                      {action.external ? <ArrowUpRight aria-hidden="true" /> : null}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          <aside className={styles.cover} aria-label={`${kindInfo.label} 封面`}>
            <div className={styles.coverRegister}>
              <span>SG—{kindInfo.index}</span>
              <KindIcon aria-hidden="true" />
              <span>{recordNumber}</span>
            </div>
            <div className={styles.coverMedia}>
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={coverAlt || ""}
                  fill
                  sizes="(max-width: 767px) 88vw, 34vw"
                  className={styles.coverImage}
                  unoptimized
                  priority
                />
              ) : null}
              <span className={styles.coverGrid} aria-hidden="true" />
              <div className={styles.coverType}>
                <strong>{visualPrimary}</strong>
                <span>{visualSecondary}</span>
              </div>
            </div>
            <p>{kindInfo.label} / Personal knowledge archive</p>
          </aside>
        </div>
      </header>

      <div className={styles.readingStage}>
        <div className={styles.readingGrid}>
          <aside className={`${styles.rail} ${styles.leftRail}`} aria-label="阅读上下文">
            <Link href={backHref} className={styles.backLink}>
              <ArrowLeft aria-hidden="true" />
              {backLabel}
            </Link>

            <section className={styles.railSection}>
              <p className={styles.railLabel}>Current record</p>
              <div className={styles.currentRecord}>
                <KindIcon aria-hidden="true" />
                <span>{title}</span>
              </div>
            </section>

            <section className={styles.railSection}>
              <p className={styles.railLabel}>Record details</p>
              <dl className={styles.railMeta}>
                {meta.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={`rail-${item.label}-${item.value}`}>
                      <dt><Icon aria-hidden="true" />{item.label}</dt>
                      <dd>{item.href ? <Link href={item.href}>{item.value}</Link> : item.value}</dd>
                    </div>
                  );
                })}
              </dl>
            </section>

            {tags.length ? (
              <section className={styles.railSection}>
                <p className={styles.railLabel}>Keywords</p>
                <div className={styles.railTags}>
                  {tags.map((tag) => tag.href ? (
                    <Link key={`rail-${tag.href}-${tag.label}`} href={tag.href}>#{tag.label}</Link>
                  ) : (
                    <span key={`rail-${tag.label}`}>#{tag.label}</span>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>

          <article className={styles.manuscript}>
            <div className={styles.manuscriptRegister}>
              <span>Manuscript / 正文</span>
              <span>{recordNumber}</span>
            </div>

            <details className={styles.mobileContext}>
              <summary>
                <FileText aria-hidden="true" />
                阅读信息与目录
              </summary>
              <div className={styles.mobileContextBody}>
                <dl>
                  {meta.map((item) => (
                    <div key={`mobile-${item.label}-${item.value}`}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <Toc headings={headings} />
              </div>
            </details>

            <section className={styles.content} data-reader-body aria-label="正文">
              <MarkdownRenderer content={content} className={styles.prose} />
            </section>

            <ReaderNavigation previous={previous} next={next} />
          </article>

          <aside className={`${styles.rail} ${styles.rightRail}`} aria-label="页面目录">
            <section className={styles.railSection}>
              <div className={styles.tocHeading}>
                <BookOpenText aria-hidden="true" />
                <span>On this page</span>
              </div>
              <Toc headings={headings} />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Toc({ headings }: { headings: TocHeading[] }) {
  if (!headings.length) {
    return <p className={styles.tocEmpty}>这篇记录暂时没有章节目录。</p>;
  }

  return (
    <nav className={styles.toc} aria-label="目录链接">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={heading.level === 3 ? styles.tocNested : undefined}
          data-reader-toc-link={heading.id}
        >
          <span>{String(headings.indexOf(heading) + 1).padStart(2, "0")}</span>
          {heading.text}
        </a>
      ))}
    </nav>
  );
}

function ReaderNavigation({
  previous,
  next
}: {
  previous?: ReaderNavigationItem | null;
  next?: ReaderNavigationItem | null;
}) {
  return (
    <nav className={styles.bottomNavigation} aria-label="前后内容导航">
      {previous ? (
        <Link href={previous.href} className={styles.previousLink}>
          <span><ArrowLeft aria-hidden="true" />上一篇</span>
          <strong>{previous.label}</strong>
        </Link>
      ) : (
        <div className={`${styles.previousLink} ${styles.disabledLink}`}>
          <span><ArrowLeft aria-hidden="true" />上一篇</span>
          <strong>已经抵达起点</strong>
        </div>
      )}
      {next ? (
        <Link href={next.href} className={styles.nextLink}>
          <span>下一篇<ArrowRight aria-hidden="true" /></span>
          <strong>{next.label}</strong>
        </Link>
      ) : (
        <div className={`${styles.nextLink} ${styles.disabledLink}`}>
          <span>下一篇<ArrowRight aria-hidden="true" /></span>
          <strong>已经抵达末尾</strong>
        </div>
      )}
    </nav>
  );
}
