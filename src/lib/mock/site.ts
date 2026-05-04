import type { AdminUser, Category, HomeData, SiteInfo, Tag } from "@/types";

export const mockNow = "2026-04-14T09:00:00";

export const mockSiteInfo: SiteInfo = {
  id: 1,
  siteName: "Study Garden",
  siteSubtitle: "把学习过程写成可回看、可检索、可复用的日常花园",
  homeBrandLabel: "wwt home board",
  homeIntroText:
    "一个正在认真整理学习记录、项目想法和个人空间的人。首页会继续为后续的转场和点击动画预留结构。",
  logo: "/images/avatar-main.svg",
  avatar: "/images/avatar-main.svg",
  githubUrl: "https://github.com/example/study-garden",
  bilibiliUrl: "https://space.bilibili.com/123456789",
  xiaohongshuUrl: "https://www.xiaohongshu.com/user/profile/demo",
  email: "hello@studygarden.dev",
  announcement:
    "这里记录前端工程、设计思考、联调经验和每天一点点稳定推进的学习节奏。",
  aboutMeMd: `
## 我是谁
我是一个把学习当成长线工程来做的人，喜欢把零散的知识整理成能复用的结构。

## 我现在在关注什么
- Next.js 与内容型站点设计
- Spring Boot 前后端联调
- 更轻、更稳、更好维护的个人知识系统

## 我希望这个站点能做到什么
不是炫技，而是把每天的学习成果变成一张能持续生长的地图。
  `.trim()
};

export const mockCategories: Category[] = [
  {
    id: 1,
    name: "前端工程",
    slug: "frontend-engineering",
    description: "Next.js、TypeScript、构建与组件设计",
    createdAt: mockNow,
    updatedAt: mockNow
  },
  {
    id: 2,
    name: "联调手记",
    slug: "integration-notes",
    description: "前后端契约、接口处理和上线前准备",
    createdAt: mockNow,
    updatedAt: mockNow
  },
  {
    id: 3,
    name: "学习方法",
    slug: "learning-methods",
    description: "笔记系统、知识组织和习惯设计",
    createdAt: mockNow,
    updatedAt: mockNow
  }
];

export const mockTags: Tag[] = [
  { id: 1, name: "Next.js", slug: "nextjs", createdAt: mockNow, updatedAt: mockNow },
  {
    id: 2,
    name: "TypeScript",
    slug: "typescript",
    createdAt: mockNow,
    updatedAt: mockNow
  },
  {
    id: 3,
    name: "Tailwind CSS",
    slug: "tailwind-css",
    createdAt: mockNow,
    updatedAt: mockNow
  },
  {
    id: 4,
    name: "Spring Boot",
    slug: "spring-boot",
    createdAt: mockNow,
    updatedAt: mockNow
  },
  { id: 5, name: "Markdown", slug: "markdown", createdAt: mockNow, updatedAt: mockNow },
  { id: 6, name: "SEO", slug: "seo", createdAt: mockNow, updatedAt: mockNow },
  { id: 7, name: "Zustand", slug: "zustand", createdAt: mockNow, updatedAt: mockNow },
  {
    id: 8,
    name: "学习系统",
    slug: "learning-system",
    createdAt: mockNow,
    updatedAt: mockNow
  }
];

export function pickTags(ids: number[]) {
  return mockTags.filter((tag) => ids.includes(tag.id));
}

export const mockAdminUser: AdminUser = {
  id: 1,
  username: "admin",
  nickname: "Garden Admin",
  role: "ADMIN",
  avatar: "/images/avatar-main.svg"
};

export function createHomeData(payload: Omit<HomeData, "siteInfo">): HomeData {
  return {
    siteInfo: mockSiteInfo,
    ...payload
  };
}
