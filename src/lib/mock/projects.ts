import type { Project, ProjectDetail } from "@/types";

export const mockProjectDetails: ProjectDetail[] = [
  {
    id: 1,
    name: "Study Garden Frontend",
    slug: "study-garden-frontend",
    summary:
      "一个面向学习博客、学习日记和项目展示的内容型前端站点，强调清爽留白、卡片布局和可持续扩展。",
    descriptionMd: `
## 项目定位

这是一个给“认真记录学习过程的人”准备的前台站点。

## 我想解决的问题

- 文章、日记、项目通常被拆在不同系统里
- 个人站首页常常只剩下自我介绍，没有内容入口
- 后端还没稳定时，前端很难推进页面质量

## 这个版本包含什么

- 首页内容编排
- 文章、日记、项目、资源、友链、归档、搜索页面
- Mock 数据与真实接口双通道
- 管理登录占位页
    `.trim(),
    techStack: "Next.js, TypeScript, Tailwind CSS, next-themes, framer-motion",
    githubUrl: "https://github.com/example/study-garden-frontend",
    demoUrl: "https://demo.study-garden.dev",
    coverImage: "/images/project-garden.svg",
    startDate: "2026-03-18",
    endDate: "",
    status: "active",
    sort: 100,
    isFeatured: 1,
    createdAt: "2026-03-18T10:00:00",
    updatedAt: "2026-04-14T09:00:00"
  },
  {
    id: 2,
    name: "API Contract Notes",
    slug: "api-contract-notes",
    summary:
      "一个把前后端接口契约、字段对照和联调状态整理成文档的辅助项目。",
    descriptionMd: `
## 核心思路

把后端 VO、DTO、Controller 和前端 TypeScript 类型放到同一个语境里整理。

## 适合谁

适合经常需要在联调时来回确认字段的人。
    `.trim(),
    techStack: "TypeScript, Markdown, Spring Boot, OpenAPI",
    githubUrl: "https://github.com/example/api-contract-notes",
    demoUrl: "",
    coverImage: "/images/project-lab.svg",
    startDate: "2026-02-20",
    endDate: "2026-03-28",
    status: "completed",
    sort: 90,
    isFeatured: 1,
    createdAt: "2026-02-20T09:00:00",
    updatedAt: "2026-03-28T18:00:00"
  },
  {
    id: 3,
    name: "Markdown Reading Kit",
    slug: "markdown-reading-kit",
    summary:
      "围绕长文排版、目录、代码块和图片节奏做的一套阅读体验实验。",
    descriptionMd: `
## 项目目标

让技术长文页面的阅读感更像一本整理过的笔记，而不是默认渲染结果。
    `.trim(),
    techStack: "React, Tailwind CSS, Markdown",
    githubUrl: "https://github.com/example/markdown-reading-kit",
    demoUrl: "",
    coverImage: "/images/project-note.svg",
    startDate: "2026-01-15",
    endDate: "2026-02-12",
    status: "completed",
    sort: 80,
    isFeatured: 0,
    createdAt: "2026-01-15T12:00:00",
    updatedAt: "2026-02-12T12:30:00"
  },
  {
    id: 4,
    name: "Resource Atlas",
    slug: "resource-atlas",
    summary:
      "用于整理课程、文档、文章和工具链接的轻量资源导航页原型。",
    descriptionMd: `
## 这个项目关注什么

不是收藏越多越好，而是让资源之间形成结构。
    `.trim(),
    techStack: "Next.js, TypeScript, Content Design",
    githubUrl: "https://github.com/example/resource-atlas",
    demoUrl: "",
    coverImage: "/images/resource-atlas.svg",
    startDate: "2025-12-08",
    endDate: "",
    status: "active",
    sort: 70,
    isFeatured: 1,
    createdAt: "2025-12-08T08:30:00",
    updatedAt: "2026-04-01T20:00:00"
  },
  {
    id: 5,
    name: "Search Entry Playground",
    slug: "search-entry-playground",
    summary: "围绕搜索入口、结果布局和空状态设计做的一组实验页面。",
    descriptionMd: `
## 项目说明

这个实验让我确认了一件事：搜索页的质量会反向影响整站的信息组织。
    `.trim(),
    techStack: "React, UX, Search",
    githubUrl: "https://github.com/example/search-entry-playground",
    demoUrl: "",
    coverImage: "/images/resource-tools.svg",
    startDate: "2025-11-21",
    endDate: "2025-12-05",
    status: "archived",
    sort: 60,
    isFeatured: 0,
    createdAt: "2025-11-21T09:00:00",
    updatedAt: "2025-12-05T16:00:00"
  }
];

export const mockProjects: Project[] = mockProjectDetails.map(
  (project) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    summary: project.summary,
    techStack: project.techStack,
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    coverImage: project.coverImage,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
    sort: project.sort,
    isFeatured: project.isFeatured,
    createdAt: project.createdAt
  }),
);
