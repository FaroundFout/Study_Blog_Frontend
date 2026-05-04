import type { ResourceCollection } from "@/types";

import { mockNow } from "@/lib/mock/site";

export const mockResourceCollections: ResourceCollection[] = [
  {
    id: 1,
    name: "官方文档",
    slug: "official-docs",
    description: "适合打基础、查 API 和做权威确认。",
    sort: 100,
    itemCount: 3,
    createdAt: mockNow,
    items: [
      {
        id: 101,
        collectionId: 1,
        title: "Next.js Documentation",
        summary: "App Router、Data Fetching、部署与 SEO 的第一手资料。",
        linkUrl: "https://nextjs.org/docs",
        sourceName: "Vercel",
        tagsText: "Next.js, 文档",
        coverImage: "/images/resource-atlas.svg",
        sort: 100,
        createdAt: mockNow
      },
      {
        id: 102,
        collectionId: 1,
        title: "Tailwind CSS Docs",
        summary: "组件样式、主题变量和排版插件常用查阅入口。",
        linkUrl: "https://tailwindcss.com/docs",
        sourceName: "Tailwind Labs",
        tagsText: "Tailwind CSS, 文档",
        coverImage: "/images/resource-tools.svg",
        sort: 90,
        createdAt: mockNow
      },
      {
        id: 103,
        collectionId: 1,
        title: "Spring Boot Reference",
        summary: "后端接口、配置和部署相关的权威参考。",
        linkUrl: "https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/",
        sourceName: "Spring",
        tagsText: "Spring Boot, 文档",
        coverImage: "/images/project-lab.svg",
        sort: 80,
        createdAt: mockNow
      }
    ]
  },
  {
    id: 2,
    name: "课程与教程",
    slug: "courses-and-guides",
    description: "更适合系统性入门和跟练。",
    sort: 90,
    itemCount: 3,
    createdAt: mockNow,
    items: [
      {
        id: 201,
        collectionId: 2,
        title: "TypeScript Handbook",
        summary: "适合补齐类型系统的整体理解。",
        linkUrl: "https://www.typescriptlang.org/docs/",
        sourceName: "TypeScript",
        tagsText: "TypeScript, 基础",
        coverImage: "/images/project-note.svg",
        sort: 100,
        createdAt: mockNow
      },
      {
        id: 202,
        collectionId: 2,
        title: "MDN Web Docs",
        summary: "查浏览器、CSS、JavaScript 基础问题非常高效。",
        linkUrl: "https://developer.mozilla.org/",
        sourceName: "MDN",
        tagsText: "Web, 基础",
        coverImage: "/images/resource-tools.svg",
        sort: 90,
        createdAt: mockNow
      },
      {
        id: 203,
        collectionId: 2,
        title: "Frontend Masters",
        summary: "适合用专题课程补一个领域的深度。",
        linkUrl: "https://frontendmasters.com/",
        sourceName: "Frontend Masters",
        tagsText: "前端, 课程",
        coverImage: "/images/article-pattern.svg",
        sort: 80,
        createdAt: mockNow
      }
    ]
  },
  {
    id: 3,
    name: "生产力工具",
    slug: "productivity-tools",
    description: "帮助写作、整理知识和调试体验的实用工具。",
    sort: 80,
    itemCount: 3,
    createdAt: mockNow,
    items: [
      {
        id: 301,
        collectionId: 3,
        title: "Excalidraw",
        summary: "整理结构、画流程图和快速思考特别顺手。",
        linkUrl: "https://excalidraw.com/",
        sourceName: "Excalidraw",
        tagsText: "图示, 思考工具",
        coverImage: "/images/project-garden.svg",
        sort: 100,
        createdAt: mockNow
      },
      {
        id: 302,
        collectionId: 3,
        title: "Raycast",
        summary: "本地命令、剪贴板和链接跳转都很高效。",
        linkUrl: "https://www.raycast.com/",
        sourceName: "Raycast",
        tagsText: "效率工具",
        coverImage: "/images/project-lab.svg",
        sort: 90,
        createdAt: mockNow
      },
      {
        id: 303,
        collectionId: 3,
        title: "Figma",
        summary: "轻量做页面结构稿和交互草图非常合适。",
        linkUrl: "https://www.figma.com/",
        sourceName: "Figma",
        tagsText: "设计工具",
        coverImage: "/images/resource-atlas.svg",
        sort: 80,
        createdAt: mockNow
      }
    ]
  }
];
