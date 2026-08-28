import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import GithubSlugger from "github-slugger";
import "dayjs/locale/zh-cn";
import { twMerge } from "tailwind-merge";

import type {
  ArchiveItem,
  Article,
  Diary,
  Project,
  SearchResult,
  TocHeading
} from "@/types";

dayjs.locale("zh-cn");

const fallbackProjectCovers = [
  "/images/project-garden.svg",
  "/images/project-lab.svg",
  "/images/project-note.svg",
  "/images/resource-atlas.svg",
  "/images/resource-tools.svg"
];

const fallbackArticleCovers = [
  "/images/article-pattern.svg",
  "/images/project-lab.svg",
  "/images/resource-atlas.svg",
  "/images/project-note.svg",
  "/images/diary-pattern.svg",
  "/images/resource-tools.svg"
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function stableIndex(seed: string, length: number) {
  const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return hash % length;
}

export function getProjectCoverImage(project: Project) {
  if (project.coverImage) {
    return project.coverImage;
  }

  const seed = `${project.id}-${project.slug || project.name}`;
  return fallbackProjectCovers[stableIndex(seed, fallbackProjectCovers.length)];
}

export function getArticleCoverImage(article: Article) {
  if (article.coverImage) {
    return article.coverImage;
  }

  const seed = `${article.id}-${article.slug || article.title}`;
  return fallbackArticleCovers[stableIndex(seed, fallbackArticleCovers.length)];
}

export function formatDate(value?: string, pattern = "YYYY 年 MM 月 DD 日") {
  if (!value) {
    return "未设置日期";
  }

  return dayjs(value).format(pattern);
}

export function formatMonth(value?: string) {
  if (!value) {
    return "未知月份";
  }

  return dayjs(value).format("YYYY 年 MM 月");
}

export function splitCommaText(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function excerpt(markdown?: string, max = 120) {
  if (!markdown) {
    return "";
  }

  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= max) {
    return plain;
  }

  return `${plain.slice(0, max).trim()}...`;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const result = searchParams.toString();
  return result ? `?${result}` : "";
}

export function extractHeadings(markdown: string): TocHeading[] {
  const slugger = new GithubSlugger();

  return markdown
    .split("\n")
    .map((line) => line.match(/^(#{2,3})\s+(.+)/))
    .filter(Boolean)
    .map((match) => {
      const level = match?.[1].length ?? 2;
      const text = match?.[2].trim() ?? "";

      return {
        level,
        text,
        id: slugger.slug(text)
      };
    });
}

export function sortArticles(
  items: Article[],
  sort: "latest" | "oldest" | "views" = "latest",
) {
  const cloned = [...items];

  switch (sort) {
    case "oldest":
      return cloned.sort(
        (a, b) =>
          dayjs(a.publishTime).valueOf() - dayjs(b.publishTime).valueOf(),
      );
    case "views":
      return cloned.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    case "latest":
    default:
      return cloned.sort(
        (a, b) =>
          dayjs(b.publishTime).valueOf() - dayjs(a.publishTime).valueOf(),
      );
  }
}

export function sortDiaries(items: Diary[]) {
  return [...items].sort(
    (a, b) => dayjs(b.diaryDate).valueOf() - dayjs(a.diaryDate).valueOf(),
  );
}

export function sortProjects(items: Project[]) {
  return [...items].sort((a, b) => {
    if ((b.isFeatured ?? 0) !== (a.isFeatured ?? 0)) {
      return (b.isFeatured ?? 0) - (a.isFeatured ?? 0);
    }

    return dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf();
  });
}

export function createArchiveItems(
  articles: Article[],
  diaries: Diary[],
  projects: Project[] = [],
): ArchiveItem[] {
  const articleItems: ArchiveItem[] = articles.map((article) => ({
    type: "article",
    id: article.id,
    title: article.title,
    href: `/articles/${article.slug}`,
    date: article.publishTime ?? article.createdAt ?? "",
    summary: article.summary
  }));

  const diaryItems: ArchiveItem[] = diaries.map((diary) => ({
    type: "diary",
    id: diary.id,
    title: diary.title,
    href: `/diaries/${diary.id}`,
    date: diary.diaryDate,
    summary: diary.summary
  }));

  const projectItems: ArchiveItem[] = projects.map((project) => ({
    type: "project",
    id: project.id,
    title: project.name,
    href: `/projects/${project.slug}`,
    date: project.startDate ?? project.createdAt ?? "",
    summary: project.summary
  }));

  return [...articleItems, ...diaryItems, ...projectItems]
    .filter((item) => Boolean(item.date))
    .sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
  );
}

export function groupByMonth(items: ArchiveItem[]) {
  return items.reduce<Record<string, ArchiveItem[]>>((acc, item) => {
    const key = dayjs(item.date).format("YYYY-MM");
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});
}

export function initialLetters(value: string) {
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function searchContent(keyword: string, articles: Article[], diaries: Diary[]) {
  const normalized = keyword.trim().toLowerCase();

  if (!normalized) {
    return [] satisfies SearchResult[];
  }

  const matchedArticles = articles
    .filter((article) => {
      const haystack = [
        article.title,
        article.summary,
        article.categoryName,
        ...article.tags.map((tag) => tag.name)
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    })
    .map<SearchResult>((article) => ({
      id: `article-${article.id}`,
      type: "article",
      title: article.title,
      summary: article.summary,
      href: `/articles/${article.slug}`,
      date: article.publishTime ?? article.createdAt ?? "",
      tags: article.tags.map((tag) => tag.name)
    }));

  const matchedDiaries = diaries
    .filter((diary) =>
      [diary.title, diary.summary, diary.tagsText, diary.mood]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    )
    .map<SearchResult>((diary) => ({
      id: `diary-${diary.id}`,
      type: "diary",
      title: diary.title,
      summary: diary.summary ?? "",
      href: `/diaries/${diary.id}`,
      date: diary.diaryDate,
      tags: splitCommaText(diary.tagsText)
    }));

  return [...matchedArticles, ...matchedDiaries].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
  );
}
