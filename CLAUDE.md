# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在本仓库中工作时提供项目指引。

## 项目简介

一个基于 **Next.js 14 App Router**（TypeScript + Tailwind CSS）的个人学习博客前端，名为 "Study Garden"（学习花园）。项目与 Spring Boot 后端（默认 `http://localhost:8080`）前后端分离协作，但通过内置 mock 数据回退机制，无需后端也能独立运行和开发前端页面。

已覆盖的页面：首页、文章列表/详情、学习日记列表/详情、项目列表/详情、资源导航、归档、友链、关于、站内搜索，以及一套完整的后台管理页面（文章/日记/项目/资源/分类/标签/友链/站点配置/音乐/媒体库的 CRUD）。

## 常用命令

```bash
npm run dev      # 启动开发服务器（自动清除 webpack 缓存，win32-ia32 下使用 WASM 运行时）
npm run build    # 生产构建（输出 standalone 模式）
npm start        # 启动生产服务器
npm run lint     # ESLint 检查（next/core-web-vitals + next/typescript）
```

目前尚无测试套件。

## 架构概览

### 数据请求策略

`src/lib/request.ts` 封装了 `fetch`，核心是两个函数：

- `request<T>(path, options)` — 发起请求，期望后端返回 `{ code: 200, data: T }` 格式的 JSON。非 200 的 code 或非 ok 的 HTTP 状态均抛出 `ApiError`。
- `requestWithFallback<T>(path, fallback, options)` — 在 `request` 基础上增加了回退逻辑：请求失败时，若 `NEXT_PUBLIC_ENABLE_MOCK` 为 `"true"`（默认），则静默返回预先准备好的 mock 数据。

`src/lib/api.ts` 中的所有公共 API 函数均使用 `requestWithFallback`，因此即使后端未启动，前端页面也能正常渲染，UI 开发与后端联调可以并行推进。

### 管理端认证

管理端 API 调用通过 `src/lib/admin-auth.ts` 中的 `authorizedAdminRequest()` 完成：

1. 从 Zustand store 或 localStorage 中读取 Bearer token，附加到请求头
2. 若收到 401 响应，自动调用 `/api/admin/auth/refresh` 刷新 token
3. 刷新成功后重放原始请求；刷新失败则清除登录态并重定向到登录页

认证状态管理：

- **Zustand store**（`src/store/auth-store.ts`）在 React 状态中持有 `token` + `user`
- **localStorage 持久化**（`src/lib/auth-storage.ts`）使登录态在页面刷新后仍然有效，并通过自定义 DOM 事件广播变更
- 管理端页面统一使用 `useRequireAdmin` hook 做路由守卫，未登录用户被重定向至 `/admin/login?reason=...&redirect=...`

### 内容类型与 mock 数据对应表

| 业务模块 | 公共 API 前缀 | 管理端 API 前缀 | Mock 数据文件 |
|---|---|---|---|
| 文章 | `/api/public/articles` | `/api/admin/articles` | `src/lib/mock/articles.ts` |
| 学习日记 | `/api/public/diaries` | `/api/admin/diaries` | `src/lib/mock/diaries.ts` |
| 项目 | `/api/public/projects` | `/api/admin/projects` | `src/lib/mock/projects.ts` |
| 资源导航 | `/api/public/resources` | `/api/admin/resource-collections`、`/api/admin/resource-items` | `src/lib/mock/resources.ts` |
| 友链 | `/api/public/friend-links` | `/api/admin/friend-links` | `src/lib/mock/friends.ts` |
| 分类/标签 | `/api/public/categories`、`/api/public/tags` | `/api/admin/categories`、`/api/admin/tags` | `src/lib/mock/site.ts` |
| 站点配置 | `/api/public/site-info` | `/api/admin/site-config` | `src/lib/mock/site.ts` |
| 首页音乐 | `/api/public/home/music` | `/api/admin/home/music` | `src/lib/mock/music.ts` |
| 文件上传 | — | `/api/admin/upload` | `src/lib/mock/uploads.ts` |

### 路由分组

- `src/app/` — 所有公开页面：首页、文章、日记、项目、资源、归档、友链、关于、搜索、写作
- `src/app/admin/(dashboard)/` — 后台管理 CRUD 页面，由 `useRequireAdmin` 守卫
- `src/app/admin/login/` — 登录页（不在 dashboard layout 下，无导航栏）

### 组件目录约定

- **`src/components/ui/`** — shadcn 风格的基础 UI 组件（button、card、badge、input、textarea），为手写实现，非 shadcn CLI 生成。合并 className 时使用 `cn()` 工具函数（来自 `src/lib/utils.ts`）。
- **`src/components/common/`** — 通用业务组件：分页、搜索栏、空状态、分类筛选、标签列表、主题切换、加载骨架屏
- **`src/components/cards/`** — 内容卡片组件：文章卡片、日记卡片、项目卡片、资源卡片、博主卡片
- **`src/components/sections/`** — 页面级区块：首页面板、Hero 区域、首页音乐播放器
- **`src/components/layout/`** — 全局布局：导航栏、页脚
- **`src/components/admin/`** — 管理端组件：仪表盘外壳、各类编辑器、状态徽章、媒体库等

### 核心工具函数

以下函数均位于 `src/lib/utils.ts`：

- `cn()` — `twMerge(clsx(...))` 的组合，用于条件化合并 Tailwind 类名
- `formatDate()`、`formatMonth()` — dayjs 日期格式化封装（默认 zh-cn 语言环境）
- `excerpt()` — 去除 Markdown 语法后截取指定长度的纯文本摘要
- `extractHeadings()` — 从 Markdown 中提取二级和三级标题，返回 `{ level, text, id }[]`，用于文章目录
- `sortArticles()`、`sortDiaries()`、`sortProjects()` — 按发布时间/是否精选/阅读量排序
- `createArchiveItems()` + `groupByMonth()` — 将文章和日记合并为归档条目并按月分组
- `searchContent()` — 客户端搜索（因后端搜索接口尚未对接，当前为前端聚合搜索）

### Windows ia32 兼容说明

本项目的开发环境为 Windows + Node.js ia32 架构。`scripts/` 目录下的脚本处理了 WASM 方式的 SWC 编译（替代不稳定的原生二进制包）：

- `npm run dev` 实际执行 `scripts/next-wasm.cjs`
- `npm run build` 实际执行 `scripts/next-build-wasm.cjs`
- `postinstall` 会执行 `scripts/prepare-ia32-swc.cjs` 移除不兼容的原生包

**不要**将这些命令替换为原生的 `next dev` / `next build`，否则在当前环境下会因原生 SWC 二进制不兼容而报错。

### 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | 后端 API 地址 |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | 前端站点地址 |
| `NEXT_PUBLIC_ENABLE_MOCK` | `true` | API 失败时是否回退 mock 数据 |

从 `.env.local.example` 复制为 `.env.local` 即可本地开发。

### 构建输出

`next.config.js` 配置了 `output: "standalone"`，生产构建会在 `.next/standalone/` 下生成自包含的 Node.js 服务器，可直接部署运行。
