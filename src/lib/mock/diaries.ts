import type { Diary, DiaryDetail } from "@/types";

export const mockDiaryDetails: DiaryDetail[] = [
  {
    id: 1,
    diaryDate: "2026-04-13",
    title: "把首页 Hero 区终于调顺眼了",
    summary: "今天主要在调首页第一屏的层级和按钮呼吸感。",
    mood: "focus",
    studyHours: 3.5,
    tagsText: "Next.js, Tailwind CSS, 视觉层级",
    visibility: "public",
    createdAt: "2026-04-13T22:10:00",
    updatedAt: "2026-04-13T22:40:00",
    contentMd: `
今天最有成就感的是把 Hero 区的密度降下来了。

## 做了什么

- 缩小了过重的背景装饰
- 把 CTA 按钮从三颗减成两颗
- 调整了标题、副标题和说明文字之间的呼吸感

## 还没完全满意

个人介绍卡的右侧信息还是有点紧，明天继续改。
    `.trim()
  },
  {
    id: 2,
    diaryDate: "2026-04-11",
    title: "把文章卡片和项目卡片的风格统一了一次",
    summary: "统一圆角、阴影和 hover 节奏后，页面终于像同一个站了。",
    mood: "calm",
    studyHours: 2.2,
    tagsText: "设计系统, 卡片布局",
    visibility: "public",
    createdAt: "2026-04-11T21:00:00",
    updatedAt: "2026-04-11T21:20:00",
    contentMd: `
今天主要处理视觉一致性。

## 关键发现

不是每张卡都要有不同造型，反而应该靠内容类型做差异，靠同一套基础样式建立统一感。
    `.trim()
  },
  {
    id: 3,
    diaryDate: "2026-04-09",
    title: "研究了一下后端分页结构，前端这边轻松多了",
    summary: "后端统一成 total/pageNum/pageSize/list 之后，分页组件终于不用写特殊判断。",
    mood: "excited",
    studyHours: 1.8,
    tagsText: "Spring Boot, 分页, API 契约",
    visibility: "public",
    createdAt: "2026-04-09T20:30:00",
    updatedAt: "2026-04-09T21:00:00",
    contentMd: `
联调顺利最大的原因，不是接口数量少，而是结构统一。

今天把文章、项目、日记的分页都跑通了，感觉后面会轻松很多。
    `.trim()
  },
  {
    id: 4,
    diaryDate: "2026-04-06",
    title: "第一次把搜索页做成了真正可用的入口",
    summary: "不只是一个输入框，而是能明确区分文章和日记结果。",
    mood: "curious",
    studyHours: 2.7,
    tagsText: "搜索, 信息架构",
    visibility: "public",
    createdAt: "2026-04-06T23:10:00",
    updatedAt: "2026-04-06T23:30:00",
    contentMd: `
做搜索时才意识到，摘要质量其实很重要。

如果摘要没有信息量，搜索结果就会显得很空。
    `.trim()
  },
  {
    id: 5,
    diaryDate: "2026-04-03",
    title: "补完了资源页分组，感觉像一张学习地图",
    summary: "资源页从列表升级成分组导航之后，终于有“收藏馆”那种感觉了。",
    mood: "focus",
    studyHours: 2.4,
    tagsText: "资源整理, 数字花园",
    visibility: "public",
    createdAt: "2026-04-03T22:00:00",
    updatedAt: "2026-04-03T22:20:00",
    contentMd: `
今天把资源收藏整理成了多个主题分组。

下一步想补一层“为什么推荐”。
    `.trim()
  }
];

export const mockDiaries: Diary[] = mockDiaryDetails.map(
  (diary) => ({
    id: diary.id,
    diaryDate: diary.diaryDate,
    title: diary.title,
    summary: diary.summary,
    mood: diary.mood,
    studyHours: diary.studyHours,
    tagsText: diary.tagsText,
    visibility: diary.visibility,
    createdAt: diary.createdAt
  }),
);
