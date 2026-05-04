import type { Article, ArticleDetail } from "@/types";

import { pickTags } from "@/lib/mock/site";

export const mockArticleDetails: ArticleDetail[] = [
  {
    id: 1,
    title: "把学习博客做成数字花园：从首页结构开始",
    slug: "build-a-learning-garden-homepage",
    summary:
      "记录我如何把个人站首页拆成 Hero、置顶文章、学习日记、项目和资源入口，目标是让读者一眼看懂这个站点在做什么。",
    coverImage: "/images/article-pattern.svg",
    categoryId: 1,
    categoryName: "前端工程",
    status: "published",
    isTop: 1,
    viewCount: 1728,
    wordCount: 2860,
    sort: 100,
    publishTime: "2026-04-12T10:30:00",
    createdAt: "2026-04-12T09:40:00",
    updatedAt: "2026-04-12T18:40:00",
    authorId: 1,
    tags: pickTags([1, 2, 3, 8]),
    contentMd: `
## 为什么首页值得认真做

对学习型博客来说，首页不是传统意义上的“门面”，更像是一个阅读入口分发器。它要同时回答三个问题：

1. 你在学什么
2. 你最近在更新什么
3. 我应该从哪里开始读

## 我给首页拆出的四层结构

### 1. 个人介绍层

先用一个有情绪但不过度装饰的 Hero 区，交代身份、主题、社交链接和当前关注点。

### 2. 重点内容层

放一篇置顶文章，不是因为它最新，而是因为它最适合第一次访问的人理解这个站。

### 3. 日常更新层

把最近文章、学习日记、项目推荐拆成三个并列模块，保持信息密度均衡。

### 4. 导航延展层

资源、友链、归档和搜索属于更深一点的入口，应该放在滚动后半段自然出现。

## 一个我在意的小细节

卡片 hover 不必太夸张，真正让页面高级的是间距、层级和轻微的节奏感。

\`\`\`tsx
export function isFirstVisitFriendly(hasHero: boolean, hasPinnedPost: boolean) {
  return hasHero && hasPinnedPost;
}
\`\`\`

## 结语

首页写得认真，会让整个站点像一个已经开始生长的空间，而不是还没整理好的素材堆。
    `.trim(),
    contentHtml: ""
  },
  {
    id: 2,
    title: "Next.js 前端和 Spring Boot 后端联调时，我最先确认的 5 件事",
    slug: "nextjs-spring-boot-integration-checklist",
    summary:
      "联调阶段最怕前后端都以为自己没问题。这篇整理了我每次都会先确认的接口契约、分页结构和错误处理方式。",
    coverImage: "/images/project-lab.svg",
    categoryId: 2,
    categoryName: "联调手记",
    status: "published",
    isTop: 0,
    viewCount: 1314,
    wordCount: 2480,
    sort: 90,
    publishTime: "2026-04-10T14:10:00",
    createdAt: "2026-04-10T10:00:00",
    updatedAt: "2026-04-11T08:10:00",
    authorId: 1,
    tags: pickTags([1, 4, 6]),
    contentMd: `
## 契约比实现更先需要稳定

如果后端返回结构每天都在改，前端页面质量再高也只是短暂的。

## 我会先确认这些字段

### 返回包裹结构

统一是否为 \`code / message / data\`。

### 分页结构

是否固定为 \`total / pageNum / pageSize / list\`。

### 详情页主键

文章是否既支持 \`id\` 又支持 \`slug\`。

### 时间字段

所有时间字段是否统一为 ISO 字符串，便于前端格式化。

### 错误语义

404、401、500 的 message 是否足够前端展示。

## 为什么我要保留 mock 数据

mock 不是权宜之计，它是保证前端页面在接口尚未稳定时仍能推进设计和交互的缓冲层。
    `.trim(),
    contentHtml: ""
  },
  {
    id: 3,
    title: "让 Markdown 长文更好读：我调过的排版细节",
    slug: "comfortable-markdown-reading-layout",
    summary:
      "长文页如果只有字体变大、行高变高，其实还不够。我记录了一套更适合技术博客的阅读排版基线。",
    coverImage: "/images/resource-atlas.svg",
    categoryId: 1,
    categoryName: "前端工程",
    status: "published",
    isTop: 0,
    viewCount: 986,
    wordCount: 2210,
    sort: 80,
    publishTime: "2026-04-07T19:00:00",
    createdAt: "2026-04-07T18:10:00",
    updatedAt: "2026-04-07T22:00:00",
    authorId: 1,
    tags: pickTags([3, 5, 6]),
    contentMd: `
## 正文排版不是单独的样式问题

它需要同时照顾目录、段落、代码块、引用和图片。

## 我会固定的几个参数

### 阅读宽度

长文正文控制在 70ch 到 78ch 之间，既能稳住视线，也不会让代码块太窄。

### 标题节奏

H2 和 H3 的层级差异要明显，但不能像文档站那样太生硬。

### 代码块

背景、边框、圆角和内边距必须一起调，否则看起来像临时塞进去的控件。

### 图片

图片应该有足够留白，不要紧贴上下文。

## 一个经验

真正让人想继续读下去的，不是“设计感”，而是读起来不累。
    `.trim(),
    contentHtml: ""
  },
  {
    id: 4,
    title: "小型后台或占位登录，为什么 Zustand 足够了",
    slug: "zustand-for-lightweight-admin-entry",
    summary:
      "如果只是做简单登录态、token 存储和当前用户信息展示，用 Zustand 会比重状态管理更轻也更稳。",
    coverImage: "/images/project-note.svg",
    categoryId: 1,
    categoryName: "前端工程",
    status: "published",
    isTop: 0,
    viewCount: 744,
    wordCount: 1650,
    sort: 70,
    publishTime: "2026-04-05T12:40:00",
    createdAt: "2026-04-05T11:10:00",
    updatedAt: "2026-04-05T20:00:00",
    authorId: 1,
    tags: pickTags([2, 7]),
    contentMd: `
## 为什么这里不需要复杂状态管理

登录占位页需要处理的其实只有三类状态：

- token
- 当前管理员信息
- 是否已完成客户端恢复

## 我会怎么做

把持久化逻辑包进 store action，而不是把整站状态都挂进去。

## 什么时候要升级方案

当你开始有权限矩阵、菜单配置、编辑器草稿、批量操作等场景时，再考虑更复杂的分层。
    `.trim(),
    contentHtml: ""
  },
  {
    id: 5,
    title: "用日记驱动学习，而不是等学完再写总结",
    slug: "diary-driven-learning-system",
    summary:
      "我越来越相信，学习日记不是附属品，它本身就是让学习连续发生的关键工具。",
    coverImage: "/images/diary-pattern.svg",
    categoryId: 3,
    categoryName: "学习方法",
    status: "published",
    isTop: 0,
    viewCount: 1112,
    wordCount: 1890,
    sort: 60,
    publishTime: "2026-04-02T21:15:00",
    createdAt: "2026-04-02T20:20:00",
    updatedAt: "2026-04-02T22:00:00",
    authorId: 1,
    tags: pickTags([5, 8]),
    contentMd: `
## 总结为什么总是写不出来

因为总结天然要求“完整”，而日记允许你只记录今天推进了一点点。

## 日记最适合写什么

- 今天解决了哪个小问题
- 哪个知识点还没吃透
- 明天打算接着看哪里

## 它带来的变化

学习不再是“有没有完成”，而是“今天有没有留下痕迹”。
    `.trim(),
    contentHtml: ""
  },
  {
    id: 6,
    title: "给学习型站点补上搜索入口后，信息结构立刻清晰了",
    slug: "search-entry-improves-information-architecture",
    summary:
      "站内搜索并不只是一个功能按钮，它会反向逼你整理分类、标签和摘要写法。",
    coverImage: "/images/resource-tools.svg",
    categoryId: 2,
    categoryName: "联调手记",
    status: "published",
    isTop: 0,
    viewCount: 688,
    wordCount: 1730,
    sort: 50,
    publishTime: "2026-03-29T09:30:00",
    createdAt: "2026-03-29T08:50:00",
    updatedAt: "2026-03-29T12:00:00",
    authorId: 1,
    tags: pickTags([1, 6, 8]),
    contentMd: `
## 搜索会暴露站点里最混乱的地方

如果标题模糊、摘要无信息量、标签滥用，搜索结果会非常难看。

## 所以我先改的是内容描述

每篇文章至少要能在列表和搜索里独立成立。

## 一个结论

搜索不是页面末尾才加的补丁，而是信息组织能力的试金石。
    `.trim(),
    contentHtml: ""
  }
];

export const mockArticles: Article[] = mockArticleDetails.map(
  (article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    coverImage: article.coverImage,
    categoryId: article.categoryId,
    categoryName: article.categoryName,
    status: article.status,
    isTop: article.isTop,
    viewCount: article.viewCount,
    wordCount: article.wordCount,
    sort: article.sort,
    publishTime: article.publishTime,
    createdAt: article.createdAt,
    tags: article.tags
  }),
);
