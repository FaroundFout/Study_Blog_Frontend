# Study Garden Frontend

`frontend` 是 Study Blog 的 Next.js 前端项目，负责公开站点、后台管理和内容编辑体验。它基于 `Next.js 14 + TypeScript + App Router + Tailwind CSS`，默认对接根目录的 Spring Boot 后端。

## 功能范围

- 公开站点：首页、文章、学习日记、项目、资源导航、归档、关于和搜索。
- 内容详情：文章、日记、项目详情页，支持 Markdown 渲染。
- 后台管理：登录、文章、分类、标签、日记、项目、资源分组、资源项、站点配置、媒体库、首页音乐和账号安全。
- 主题体验：亮色/深色模式，后台编辑器和 Markdown 输入区已适配深色模式。
- 封面兜底：文章和项目在 `coverImage` 为空时，会按 `id/slug` 稳定轮换内置默认封面。
- API 兜底：开发时可启用 mock fallback；生产环境建议关闭 mock 并正确配置后端地址或同源反代。

## 技术栈

- Next.js 14
- TypeScript
- App Router
- Tailwind CSS
- Zustand
- next-themes
- react-markdown
- framer-motion
- lucide-react
- dayjs

## 本地启动

```bash
cd frontend
npm install
npm run dev
```

默认地址：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:8080`

生产预览：

```bash
npm run build
npm start
```

当前仓库包含 `Windows + Node ia32` 兼容脚本，`npm run dev` 和 `npm run build` 会通过 wasm SWC 链路运行，以避开部分 Windows ia32 原生 SWC 包问题。

## 环境变量

复制示例文件：

```bash
cp .env.local.example .env.local
```

可配置项：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_MOCK=true
```

说明：

- `NEXT_PUBLIC_API_BASE_URL`：后端基础地址。浏览器端未配置时会默认请求当前页面同源地址；服务端渲染和构建兜底为 `http://localhost:8080`。
- `NEXT_PUBLIC_SITE_URL`：站点地址，用于生成站点相关链接或元信息。
- `NEXT_PUBLIC_ENABLE_MOCK`：是否在接口失败时回退到本地 mock 数据。生产环境建议设为 `false`，避免接口错误被 mock 掩盖。

线上如果前后端使用同一个域名，推荐 Nginx 把 `/api/` 代理到 Spring Boot，把其他路径代理到 Next.js。这样 `NEXT_PUBLIC_API_BASE_URL` 可以直接设为站点域名，或留空走同源请求。

## 页面清单

公开页面：

- `/`
- `/articles`
- `/articles/[slug]`
- `/diaries`
- `/diaries/[id]`
- `/projects`
- `/projects/[slug]`
- `/resources`
- `/archives`
- `/about`
- `/search`

后台页面：

- `/admin/login`
- `/admin`
- `/admin/articles`
- `/admin/articles/new`
- `/admin/articles/[id]`
- `/admin/diaries`
- `/admin/diaries/new`
- `/admin/diaries/[id]`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]`
- `/admin/resource-collections`
- `/admin/resource-items`
- `/admin/categories`
- `/admin/tags`
- `/admin/media`
- `/admin/home-music`
- `/admin/site`
- `/admin/account-security`

## API 对接

公共请求封装在：

- [src/lib/request.ts](src/lib/request.ts)
- [src/lib/api.ts](src/lib/api.ts)
- [src/lib/admin-auth.ts](src/lib/admin-auth.ts)

主要接口前缀：

- `/api/public/**`
- `/api/admin/**`
- `/api/admin/auth/**`

后台登录使用 access token + HttpOnly refresh cookie。前端只持有 access token，并在后台接口返回 `401` 时调用 `/api/admin/auth/refresh` 尝试刷新。

详细接口说明见 [docs/backend-api.md](docs/backend-api.md)。

## 部署

低 IO 部署流程见 [docs/frontend-low-io-deploy.md](docs/frontend-low-io-deploy.md)。推荐链路是：

1. 本地设置生产环境变量。
2. 本地执行 `npm ci && npm run build`。
3. 本地打包 `.next/standalone`、`.next/static` 和 `public`。
4. 服务器只上传压缩包、解压、重启 Node 进程。

线上常见问题：

- 登录报 `Failed to fetch` 或浏览器网络面板显示 `ERR_CONNECTION_REFUSED`：通常是前端仍在请求 `localhost:8080`，需要配置 `NEXT_PUBLIC_API_BASE_URL` 或 Nginx `/api/` 反向代理。
- 详情页显示“没有找到内容”：通常是后端不可达、生产环境开启了 mock fallback，或详情接口 slug 被重复编码。当前前端已对中文 slug 做路径编码处理。

## 项目结构

```text
frontend/
├── docs/
├── public/
├── scripts/
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
