# Study Garden Frontend

一个基于 `Next.js 14 + TypeScript + App Router + Tailwind CSS` 的个人学习博客前端项目，适合与当前仓库中的 Spring Boot 后端进行前后端分离联调。

## 技术栈

- Next.js 14+
- TypeScript
- App Router
- Tailwind CSS
- shadcn 风格基础 UI 组件
- lucide-react
- fetch 请求封装
- Zustand
- dayjs
- react-markdown
- next-themes
- framer-motion

## 本地启动

```bash
cd frontend
npm install
npm run dev
```

默认前端地址：

- `http://localhost:3000`

默认后端地址：

- `http://localhost:8080`

生产预览：

```bash
npm run build
npm start
```

## 环境变量

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

可配置项：

- `NEXT_PUBLIC_API_BASE_URL`：后端服务地址
- `NEXT_PUBLIC_SITE_URL`：前端站点地址
- `NEXT_PUBLIC_ENABLE_MOCK`：接口失败时是否回退 mock 数据

## 已实现页面

- `/` 首页
- `/articles` 文章列表
- `/articles/[slug]` 文章详情
- `/diaries` 学习日记列表
- `/diaries/[id]` 学习日记详情
- `/projects` 项目列表
- `/projects/[slug]` 项目详情
- `/resources` 资源页
- `/archives` 归档页
- `/bloggers` 友链页
- `/about` 关于页
- `/search` 搜索页
- `/admin/login` 后台登录占位页

## 数据策略

项目默认保留两条数据通道：

1. 优先请求真实后端接口
2. 接口失败时回退到本地 mock 数据

这样可以保证：

- 后端未启动时页面依然可运行
- UI 开发与后端联调可以并行推进
- 后续切换真实数据时不需要重写页面结构

## 当前环境兼容说明

当前仓库额外包含了针对 `Windows + Node ia32` 环境的兼容脚本：

- `scripts/prepare-ia32-swc.cjs`
- `scripts/next-build-wasm.cjs`
- `scripts/next-wasm.cjs`

它们会在安装依赖时移除不稳定的原生 SWC 可选包，并优先使用 wasm 兼容链路，以确保当前机器上也能正常执行 `npm run dev` 与 `npm run build`。

## API 对接说明

前端公共数据请求封装在：

- `src/lib/request.ts`
- `src/lib/api.ts`

主要已对接的接口前缀：

- `/api/public/**`
- `/api/admin/auth/**`

当前第一页版本里，文章排序、日记搜索等少量能力仍带有前端兜底逻辑；若后端后续补齐对应查询参数，直接在 `src/lib/api.ts` 中扩展即可。

## 项目结构

```text
frontend/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   └── types/
├── package.json
├── tailwind.config.ts
└── README.md
```

## 后续建议

- 增加后台管理 Layout 和内容 CRUD
- 接入 Markdown 编辑器和上传接口
- 增加评论、阅读统计、RSS、SEO 增强
- 用真实搜索接口替换当前前端聚合搜索
