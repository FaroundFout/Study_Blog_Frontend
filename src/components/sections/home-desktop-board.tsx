import dayjs from "dayjs";
import {
  ArrowRight,
  BookMarked,
  BookOpenText,
  Boxes,
  CassetteTape,
  Compass,
  ExternalLink,
  FolderKanban,
  LibraryBig,
  LockKeyhole,
  NotebookPen,
  Route,
  Wrench,
  type LucideIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HomeMusicPlayer } from "@/components/sections/home-music-player";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { formatDate, splitCommaText } from "@/lib/utils";
import type {
  Article,
  Diary,
  HomeMusic,
  Project,
  ResourceCollection
} from "@/types";

import styles from "./home-desktop-board.module.css";

interface HomeDesktopBoardProps {
  featuredArticle?: Article;
  latestArticles: Article[];
  latestDiaries: Diary[];
  featuredProject?: Project;
  resourceCollections: ResourceCollection[];
  currentMusic?: HomeMusic | null;
}

const resourceIcons: LucideIcon[] = [BookOpenText, Route, Wrench, Boxes, Compass];

export function HomeDesktopBoard({
  featuredArticle,
  latestArticles,
  latestDiaries,
  featuredProject,
  resourceCollections,
  currentMusic
}: HomeDesktopBoardProps) {
  const currentYear = dayjs().year();
  const articleTags = featuredArticle?.tags.slice(0, 3).map((tag) => tag.name) ?? [];
  const projectStack = splitCommaText(featuredProject?.techStack);
  const projectStatus = featuredProject
    ? PROJECT_STATUS_LABELS[featuredProject.status ?? ""] ?? featuredProject.status ?? "未设置"
    : "等待记录";
  const secondaryArticles = latestArticles
    .filter((article) => article.id !== featuredArticle?.id)
    .slice(0, 5);

  return (
    <div className={styles.board} data-home-catalog>
      <div className={styles.canvas}>
        <section className={styles.intro} aria-labelledby="home-catalog-title">
          <div className={styles.introCopy}>
            <p className={styles.catalogNumber}>
              Catalog card<br />
              0001 — SG — {currentYear}
            </p>
            <h1 id="home-catalog-title">一些学习记录</h1>
            <p className={styles.introText}>
              记下学过的知识、做过的项目，以及遇到的问题和解决办法。
            </p>
          </div>

          <div className={styles.introMark} aria-hidden="true">
            <Image
              src="/images/home/library-stamp.png"
              alt=""
              width={360}
              height={360}
              sizes="220px"
              priority
            />
          </div>
        </section>

        <div className={styles.primaryGrid}>
          <FeaturedArticleCard article={featuredArticle} tags={articleTags} />
          <DiaryIndex diaries={latestDiaries.slice(0, 5)} />
          <CurrentProject project={featuredProject} status={projectStatus} stack={projectStack} />
        </div>

        <div className={styles.secondaryGrid}>
          <ResourceShelf collections={resourceCollections.slice(0, 5)} />
          <LatestArticleIndex articles={secondaryArticles.length ? secondaryArticles : latestArticles.slice(0, 5)} />
        </div>

        <section className={styles.musicBar} aria-label="首页音乐">
          <div className={styles.musicLabel}>
            <span className={styles.musicIcon}><CassetteTape aria-hidden="true" /></span>
            <p><strong>Music</strong><span>Garden radio</span></p>
          </div>
          <HomeMusicPlayer music={currentMusic} />
        </section>

        <footer className={styles.boardFooter}>
          <p>Study Garden / Personal knowledge library / {currentYear}</p>
          <nav aria-label="首页延伸入口">
            <Link href="/archives">浏览归档<ArrowRight aria-hidden="true" /></Link>
            <Link href="/about">关于这座花园<ArrowRight aria-hidden="true" /></Link>
            <Link href="/admin/login">管理入口<LockKeyhole aria-hidden="true" /></Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}

function FeaturedArticleCard({ article, tags }: { article?: Article; tags: string[] }) {
  return (
    <article className={`${styles.paperCard} ${styles.featuredCard}`}>
      <header className={styles.cardHeader}>
        <p><span>Featured</span> 精选文章</p>
        <span>Article card</span>
      </header>
      <Link href={article ? `/articles/${article.slug}` : "/articles"} className={styles.featuredBody}>
        <span className={styles.featuredIndex}>01</span>
        <div>
          <h2>{article?.title ?? "还没有公开文章"}</h2>
          <p>{article?.summary ?? "文章发布后，会出现在这里。"}</p>
        </div>
      </Link>
      <footer className={styles.featuredFooter}>
        <span>{article ? formatDate(article.publishTime, "YYYY / MM / DD") : "等待发布"}</span>
        <span>{tags.join(" · ") || article?.categoryName || "学习记录"}</span>
        <Link href={article ? `/articles/${article.slug}` : "/articles"}>{article ? "阅读文章" : "浏览文章"}<ArrowRight aria-hidden="true" /></Link>
      </footer>
    </article>
  );
}

function DiaryIndex({ diaries }: { diaries: Diary[] }) {
  return (
    <section className={`${styles.paperCard} ${styles.diaryCard}`} aria-labelledby="home-diary-title">
      <header className={styles.indexHeader}>
        <h2 id="home-diary-title"><NotebookPen aria-hidden="true" />学习日记</h2>
        <span>Diary index</span>
      </header>
      {diaries.length ? (
        <ol className={styles.diaryList}>
          {diaries.map((diary, index) => (
            <li key={diary.id}>
              <Link href={`/diaries/${diary.id}`}>
                <time dateTime={diary.diaryDate}>{formatDate(diary.diaryDate, "MM / DD")}</time>
                <span>{diary.title}</span>
                <small>#{String(diaries.length - index).padStart(3, "0")}</small>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.emptyState}>日记柜里暂时还没有公开记录。</p>
      )}
      <Link href="/diaries" className={styles.cardAction}>查看全部学习日记<ArrowRight aria-hidden="true" /></Link>
    </section>
  );
}

function CurrentProject({
  project,
  status,
  stack
}: {
  project?: Project;
  status: string;
  stack: string[];
}) {
  return (
    <section className={`${styles.paperCard} ${styles.projectCard}`} aria-labelledby="home-project-title">
      <header className={styles.projectHeader}>
        <p><span>Current project</span> 当前项目</p>
      </header>
      {project ? (
        <>
          <h2 id="home-project-title">{project.name}</h2>
          <dl className={styles.projectRegister}>
            <div><dt>编号</dt><dd>PRJ — {formatDate(project.startDate, "YYYY")} — {String(project.id).padStart(2, "0")}</dd></div>
            <div><dt>状态</dt><dd>{status}</dd></div>
            <div><dt>类型</dt><dd>{project.isFeatured ? "精选项目" : "项目记录"}</dd></div>
            <div><dt>技术</dt><dd>{stack.slice(0, 3).join(" / ") || "待补充"}</dd></div>
            <div><dt>启动日期</dt><dd>{formatDate(project.startDate, "YYYY / MM / DD")}</dd></div>
            <div><dt>预计归还</dt><dd>{project.endDate ? formatDate(project.endDate, "YYYY / MM / DD") : "进行中…"}</dd></div>
          </dl>
          <Link href={`/projects/${project.slug}`} className={styles.projectAction}>进入项目<ArrowRight aria-hidden="true" /></Link>
        </>
      ) : (
        <div className={styles.projectEmpty}>
          <FolderKanban aria-hidden="true" />
          <h2 id="home-project-title">项目柜等待新记录</h2>
          <Link href="/projects">查看项目索引<ArrowRight aria-hidden="true" /></Link>
        </div>
      )}
    </section>
  );
}

function ResourceShelf({ collections }: { collections: ResourceCollection[] }) {
  return (
    <section className={`${styles.paperCard} ${styles.resourceShelf}`} aria-labelledby="home-resources-title">
      <header className={styles.resourceIntro}>
        <BookMarked aria-hidden="true" />
        <p>Resource shelf</p>
        <h2 id="home-resources-title">资源书架</h2>
      </header>
      <div className={styles.resourceBody}>
        <p>精选学习资源集合，按主题整理，持续更新。</p>
        <div className={styles.resourceLinks}>
          {collections.length ? collections.map((collection, index) => {
            const Icon = resourceIcons[index % resourceIcons.length];
            return (
              <Link key={collection.id} href={`/resources#${collection.slug}`}>
                <Icon aria-hidden="true" />
                <span>{collection.name}</span>
                <small>{collection.itemCount ?? collection.items?.length ?? 0} entries</small>
              </Link>
            );
          }) : (
            <Link href="/resources">
              <LibraryBig aria-hidden="true" />
              <span>等待上架</span>
              <small>Open library</small>
            </Link>
          )}
          <Link href="/resources" className={styles.allResources}>
            <ExternalLink aria-hidden="true" />
            <span>进入书架</span>
            <small>Browse all</small>
          </Link>
        </div>
      </div>
    </section>
  );
}

function LatestArticleIndex({ articles }: { articles: Article[] }) {
  return (
    <section className={`${styles.paperCard} ${styles.latestCard}`} aria-labelledby="home-latest-title">
      <header className={styles.indexHeader}>
        <h2 id="home-latest-title"><BookOpenText aria-hidden="true" />最新文章</h2>
        <span>Latest</span>
      </header>
      {articles.length ? (
        <ol className={styles.latestList}>
          {articles.map((article) => (
            <li key={article.id}>
              <Link href={`/articles/${article.slug}`}>
                <span>{article.title}</span>
                <time dateTime={article.publishTime}>{formatDate(article.publishTime, "MM / DD")}</time>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.emptyState}>文章柜里暂时没有公开内容。</p>
      )}
      <Link href="/articles" className={styles.cardAction}>查看全部文章<ArrowRight aria-hidden="true" /></Link>
    </section>
  );
}
