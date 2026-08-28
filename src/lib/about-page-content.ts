import type { AboutFocusItem, AboutMilestone, AboutPageContent } from "@/types";

export const DEFAULT_ABOUT_PAGE_CONTENT: AboutPageContent = {
  profileSectionTitle: "站长档案",
  profileTitle: "一个把学习、项目与\n写作慢慢织在一起的人",
  profileBio: "我相信，记录与输出是最好的复盘。把每天一点点的思考、实践与灵感，慢慢种在这里。",
  location: "中国 · 杭州",
  timezone: "UTC+8",
  status: "持续学习中 / Building",
  noteTitle: "关于本站的一些话",
  focusTitle: "最近关注",
  timelineTitle: "成长轨迹",
  contactTitle: "联系与交流",
  quote: "Keep learning\nKeep growing",
  contactNote: "真诚交流，互相成长。",
  contactEmptyText: "联系方式尚未在站点配置中公开。",
  githubNote: "项目、代码与开源",
  bilibiliNote: "学习分享与实况",
  xiaohongshuNote: "日常记录与灵感",
  focusItems: [
    { title: "后端工程化", note: "Spring Boot、模块化、可观测性与高可用实践" },
    { title: "前端学习", note: "TypeScript、React、现代化前端工程" },
    { title: "提示词工程", note: "Prompt 设计、上下文策略与工具链" },
    { title: "独立游戏开发", note: "玩法设计、交互原型与系统实现" }
  ],
  milestones: [
    { date: "2024.04", text: "创建「我的学习日记」，开始系统记录与输出" },
    { date: "2024.07", text: "发布第一个 Spring Boot 项目实践系列" },
    { date: "2024.10", text: "开始前端系统学习，实践 TypeScript 与 React" },
    { date: "2025.06", text: "启动独立游戏开发练习，完成第一个小原型" },
    { date: "2026.01", text: "搭建知识库与笔记体系，沉淀方法论与模板" }
  ]
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneDefaults(): AboutPageContent {
  return {
    ...DEFAULT_ABOUT_PAGE_CONTENT,
    focusItems: DEFAULT_ABOUT_PAGE_CONTENT.focusItems.map((item) => ({ ...item })),
    milestones: DEFAULT_ABOUT_PAGE_CONTENT.milestones.map((item) => ({ ...item }))
  };
}

function readString(source: Record<string, unknown>, key: keyof AboutPageContent, fallback: string) {
  return typeof source[key] === "string" ? source[key] as string : fallback;
}

function readFocusItems(value: unknown, fallback: AboutFocusItem[]) {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter(isRecord)
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      note: typeof item.note === "string" ? item.note : ""
    }));
}

function readMilestones(value: unknown, fallback: AboutMilestone[]) {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter(isRecord)
    .map((item) => ({
      date: typeof item.date === "string" ? item.date : "",
      text: typeof item.text === "string" ? item.text : ""
    }));
}

export function parseAboutPageContent(value?: string | null): AboutPageContent {
  const defaults = cloneDefaults();
  if (!value?.trim()) return defaults;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) return defaults;

    return {
      profileSectionTitle: readString(parsed, "profileSectionTitle", defaults.profileSectionTitle),
      profileTitle: readString(parsed, "profileTitle", defaults.profileTitle),
      profileBio: readString(parsed, "profileBio", defaults.profileBio),
      location: readString(parsed, "location", defaults.location),
      timezone: readString(parsed, "timezone", defaults.timezone),
      status: readString(parsed, "status", defaults.status),
      noteTitle: readString(parsed, "noteTitle", defaults.noteTitle),
      focusTitle: readString(parsed, "focusTitle", defaults.focusTitle),
      timelineTitle: readString(parsed, "timelineTitle", defaults.timelineTitle),
      contactTitle: readString(parsed, "contactTitle", defaults.contactTitle),
      quote: readString(parsed, "quote", defaults.quote),
      contactNote: readString(parsed, "contactNote", defaults.contactNote),
      contactEmptyText: readString(parsed, "contactEmptyText", defaults.contactEmptyText),
      githubNote: readString(parsed, "githubNote", defaults.githubNote),
      bilibiliNote: readString(parsed, "bilibiliNote", defaults.bilibiliNote),
      xiaohongshuNote: readString(parsed, "xiaohongshuNote", defaults.xiaohongshuNote),
      focusItems: readFocusItems(parsed.focusItems, defaults.focusItems),
      milestones: readMilestones(parsed.milestones, defaults.milestones)
    };
  } catch {
    return defaults;
  }
}

export function serializeAboutPageContent(value: AboutPageContent) {
  return JSON.stringify({
    ...value,
    focusItems: value.focusItems.map((item) => ({
      title: item.title.trim(),
      note: item.note.trim()
    })),
    milestones: value.milestones.map((item) => ({
      date: item.date.trim(),
      text: item.text.trim()
    }))
  });
}
