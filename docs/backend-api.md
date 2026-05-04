# Study Blog 后端接口文档（供前端对接）

本文档面向前端开发，说明当前后端已经提供的接口、通用返回结构、关键枚举，以及各页面推荐使用的接口组合。

适用范围：

- 公开站点页面
- 后台管理页面
- 登录鉴权
- 文件上传 / 文件删除 / 媒体库列表

## 1. 基础约定

### 1.1 服务地址

- 本地开发：`http://localhost:8080`

### 1.2 统一返回结构

所有接口都返回统一结构：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

字段说明：

- `code`：业务码，`200` 表示成功
- `message`：提示信息
- `data`：业务数据，可能是对象、数组、分页结构或 `null`

### 1.3 分页返回结构

分页接口的 `data` 结构如下：

```json
{
  "total": 100,
  "pageNum": 1,
  "pageSize": 10,
  "list": []
}
```

分页公共参数：

- `pageNum`：页码，默认 `1`
- `pageSize`：每页条数，默认 `10`，最大 `100`

### 1.4 鉴权方式

后台接口统一使用：

```http
Authorization: Bearer {token}
```

说明：

- 先调用 `POST /api/admin/auth/login`
- 登录成功后，从返回值里拿 `token`
- 前端请求后台接口时自行拼接 `Bearer `

## 2. 关键枚举

### 2.1 文章状态 `article.status`

- `draft`：草稿
- `published`：已发布
- `private`：私密

### 2.2 日记可见性 `study_diary.visibility`

- `public`：公开
- `private`：私密

### 2.3 项目状态 `project_info.status`

- `planning`：规划中
- `ongoing`：进行中
- `completed`：已完成

### 2.4 友链状态 `friend_link.status`

- `pending`：待审核
- `approved`：已通过
- `rejected`：已拒绝

### 2.5 用户角色 `sys_user.role`

- `ADMIN`

## 3. 页面与接口映射建议

### 3.1 公开站点

- 首页：`GET /api/public/home`
- 站点信息：`GET /api/public/site-info`
- 文章列表：`GET /api/public/articles`
- 文章搜索：`GET /api/public/articles/search`
- 文章详情：`GET /api/public/articles/slug/{slug}` 或 `GET /api/public/articles/{id}`
- 文章归档：`GET /api/public/articles/archive`
- 分类列表：`GET /api/public/categories`
- 分类文章页：`GET /api/public/categories/{id}/articles`
- 标签列表：`GET /api/public/tags`
- 标签文章页：`GET /api/public/tags/{id}/articles`
- 日记列表：`GET /api/public/diaries`
- 日记详情：`GET /api/public/diaries/{id}`
- 日记归档：`GET /api/public/diaries/archive`
- 项目列表：`GET /api/public/projects`
- 项目详情：`GET /api/public/projects/slug/{slug}` 或 `GET /api/public/projects/{id}`
- 资源页：`GET /api/public/resources`
- 分组资源详情：`GET /api/public/resources/{collectionId}/items`
- 友链页：`GET /api/public/friend-links`

### 3.2 后台管理

- 登录页：`POST /api/admin/auth/login`
- 当前管理员信息：`GET /api/admin/auth/me`
- 文章管理：`/api/admin/articles`
- 分类管理：`/api/admin/categories`
- 标签管理：`/api/admin/tags`
- 学习日记管理：`/api/admin/diaries`
- 项目管理：`/api/admin/projects`
- 资源分组管理：`/api/admin/resource-collections`
- 资源项管理：`/api/admin/resource-items`
- 友链管理：`/api/admin/friend-links`
- 站点配置：`GET/PUT /api/admin/site-config`
- 文件上传：`POST /api/admin/upload`
- 文件列表：`GET /api/admin/upload/files`
- 文件详情：`GET /api/admin/upload/files/{id}`
- 文件删除：`DELETE /api/admin/upload/{id}`

### 3.3 媒体库页面建议

如果前端要做一个后台“媒体库 / 文件管理”页面，当前最小接口组合已经够用：

- 上传文件：`POST /api/admin/upload`
- 文件分页列表：`GET /api/admin/upload/files`
- 文件详情：`GET /api/admin/upload/files/{id}`
- 删除文件：`DELETE /api/admin/upload/{id}`

这个页面适合支持：

- 浏览历史上传文件
- 按关键字搜索文件
- 复制文件 URL
- 在文章 / 项目 / 站点配置表单中复用老图片
- 删除无用文件

## 4. 通用数据结构

### 4.1 登录返回 `LoginVO`

```json
{
  "token": "xxx",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "userInfo": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "role": "ADMIN",
    "avatar": ""
  }
}
```

### 4.2 上传文件返回 `UploadedFileVO`

```json
{
  "id": 1,
  "originalName": "cover.png",
  "storedName": "6a4f2b....png",
  "filePath": "blog/upload/2026/04/15/6a4f2b....png",
  "fileUrl": "https://myblogbucket.oss-cn-hongkong.aliyuncs.com/blog/upload/2026/04/15/6a4f2b....png",
  "fileSize": 102400,
  "contentType": "image/png",
  "createdAt": "2026-04-15T16:00:00"
}
```

字段说明：

- `filePath`
  - 本地模式：本地存储路径
  - OSS 模式：OSS Object Key
- `fileUrl`
  - 对外访问地址，前端展示图片时优先使用这个字段

### 4.3 首页聚合返回 `HomeVO`

```json
{
  "siteInfo": {},
  "latestArticles": [],
  "latestDiaries": [],
  "featuredProjects": [],
  "resourceCollections": [],
  "friendLinks": []
}
```

## 5. 鉴权接口

### 5.1 管理员登录

- 方法：`POST`
- 路径：`/api/admin/auth/login`
- 鉴权：否
- 请求体：

```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

- 返回：`Result<LoginVO>`

### 5.2 获取当前管理员

- 方法：`GET`
- 路径：`/api/admin/auth/me`
- 鉴权：是
- 返回：`Result<AdminUserVO>`

### 5.3 退出登录

- 方法：`POST`
- 路径：`/api/admin/auth/logout`
- 鉴权：是
- 返回：`Result<Void>`

说明：

- 后端会把当前 token 加入 Redis 黑名单

## 6. 文件管理接口

### 6.1 上传文件

- 方法：`POST`
- 路径：`/api/admin/upload`
- 鉴权：是
- Content-Type：`multipart/form-data`
- 表单字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| file | File | 是 | 要上传的文件 |

- 返回：`Result<UploadedFileVO>`

前端建议：

- 上传成功后，把 `data.fileUrl` 回填到文章封面、项目封面、站点 Logo、Markdown 图片地址等字段
- 如果用户后续放弃使用这张图，可调用删除接口

### 6.2 分页查询文件列表

- 方法：`GET`
- 路径：`/api/admin/upload/files`
- 鉴权：是
- 查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNum | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |
| keyword | string | 否 | 支持按原始文件名、存储文件名、`filePath`、`contentType` 搜索 |

- 返回：`Result<PageResult<UploadedFileVO>>`

### 6.3 获取文件详情

- 方法：`GET`
- 路径：`/api/admin/upload/files/{id}`
- 鉴权：是
- 返回：`Result<UploadedFileVO>`

### 6.4 删除文件

- 方法：`DELETE`
- 路径：`/api/admin/upload/{id}`
- 鉴权：是
- 返回：`Result<Void>`

删除语义：

- OSS / 本地磁盘：物理删除文件
- 数据库 `uploaded_file`：逻辑删除，`is_deleted = 1`

说明：

- OSS 上对象如果已经不存在，后端仍会继续完成数据库逻辑删除
- 访客访问图片本身不走后台接口，而是直接使用业务字段中的 `fileUrl`

## 7. 公开接口

### 7.1 首页

#### 获取首页聚合数据

- 方法：`GET`
- 路径：`/api/public/home`
- 鉴权：否
- 返回：`Result<HomeVO>`

### 7.2 站点信息

#### 获取站点信息

- 方法：`GET`
- 路径：`/api/public/site-info`
- 鉴权：否
- 返回：`Result<SiteInfoVO>`

### 7.3 文章

#### 文章列表

- 方法：`GET`
- 路径：`/api/public/articles`
- 查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNum | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |
| categoryId | number | 否 | 分类 ID |
| tagId | number | 否 | 标签 ID |
| keyword | string | 否 | 搜索关键字 |

- 返回：`Result<PageResult<ArticleListVO>>`

#### 搜索文章

- 方法：`GET`
- 路径：`/api/public/articles/search`
- 查询参数同上
- 返回：`Result<PageResult<ArticleListVO>>`

#### 获取文章归档

- 方法：`GET`
- 路径：`/api/public/articles/archive`
- 返回：`Result<List<ArchiveVO>>`

#### 通过 slug 获取文章详情

- 方法：`GET`
- 路径：`/api/public/articles/slug/{slug}`
- 返回：`Result<ArticleDetailVO>`

#### 通过 id 获取文章详情

- 方法：`GET`
- 路径：`/api/public/articles/{id}`
- 返回：`Result<ArticleDetailVO>`

### 7.4 分类与标签

#### 分类列表

- 方法：`GET`
- 路径：`/api/public/categories`
- 返回：`Result<List<CategoryVO>>`

#### 某分类下的文章

- 方法：`GET`
- 路径：`/api/public/categories/{id}/articles`
- 查询参数同文章列表
- 返回：`Result<PageResult<ArticleListVO>>`

#### 标签列表

- 方法：`GET`
- 路径：`/api/public/tags`
- 返回：`Result<List<TagVO>>`

#### 某标签下的文章

- 方法：`GET`
- 路径：`/api/public/tags/{id}/articles`
- 查询参数同文章列表
- 返回：`Result<PageResult<ArticleListVO>>`

### 7.5 学习日记

#### 日记列表

- 方法：`GET`
- 路径：`/api/public/diaries`
- 查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNum | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |

- 返回：`Result<PageResult<DiaryListVO>>`

#### 日记归档

- 方法：`GET`
- 路径：`/api/public/diaries/archive`
- 返回：`Result<List<ArchiveVO>>`

#### 日记详情

- 方法：`GET`
- 路径：`/api/public/diaries/{id}`
- 返回：`Result<DiaryDetailVO>`

### 7.6 项目

#### 项目列表

- 方法：`GET`
- 路径：`/api/public/projects`
- 查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNum | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |
| isFeatured | number | 否 | 是否仅返回推荐项目，`1` 表示是 |

- 返回：`Result<PageResult<ProjectVO>>`

#### 通过 slug 获取项目详情

- 方法：`GET`
- 路径：`/api/public/projects/slug/{slug}`
- 返回：`Result<ProjectDetailVO>`

#### 通过 id 获取项目详情

- 方法：`GET`
- 路径：`/api/public/projects/{id}`
- 返回：`Result<ProjectDetailVO>`

### 7.7 资源

#### 获取资源分组列表

- 方法：`GET`
- 路径：`/api/public/resources`
- 返回：`Result<List<ResourceCollectionVO>>`

说明：

- 当前公开接口默认会把每个分组下的 `items` 一并返回，适合直接渲染资源聚合页

#### 获取某分组下的资源项

- 方法：`GET`
- 路径：`/api/public/resources/{collectionId}/items`
- 返回：`Result<List<ResourceItemVO>>`

### 7.8 友链

#### 获取友链列表

- 方法：`GET`
- 路径：`/api/public/friend-links`
- 返回：`Result<List<FriendLinkVO>>`

## 8. 后台接口

### 8.1 文章管理

#### 列表查询

- 方法：`GET`
- 路径：`/api/admin/articles`
- 查询参数：`pageNum`、`pageSize`、`title`、`categoryId`、`status`
- 返回：`Result<PageResult<ArticleListVO>>`

#### 详情

- 方法：`GET`
- 路径：`/api/admin/articles/{id}`
- 返回：`Result<ArticleDetailVO>`

#### 新增 / 编辑请求体 `ArticleSaveRequest`

```json
{
  "title": "Spring Boot 学习周记",
  "slug": "spring-boot-weekly-note",
  "summary": "本周对 Spring Boot 自动配置做了系统学习",
  "coverImage": "https://...",
  "contentMd": "# 标题",
  "contentHtml": "",
  "categoryId": 1,
  "status": "published",
  "isTop": 0,
  "sort": 0,
  "publishTime": "2026-04-15T20:00:00",
  "tagIds": [1, 2, 3]
}
```

#### 新增 / 编辑 / 删除

- `POST /api/admin/articles`
- `PUT /api/admin/articles/{id}`
- `DELETE /api/admin/articles/{id}`

### 8.2 分类管理

- 列表：`GET /api/admin/categories`
- 详情：`GET /api/admin/categories/{id}`
- 新增：`POST /api/admin/categories`
- 编辑：`PUT /api/admin/categories/{id}`
- 删除：`DELETE /api/admin/categories/{id}`

请求体 `CategorySaveRequest`：

```json
{
  "name": "Java 后端",
  "slug": "java-backend",
  "sort": 1,
  "description": "Java、Spring、数据库相关内容"
}
```

### 8.3 标签管理

- 列表：`GET /api/admin/tags`
- 详情：`GET /api/admin/tags/{id}`
- 新增：`POST /api/admin/tags`
- 编辑：`PUT /api/admin/tags/{id}`
- 删除：`DELETE /api/admin/tags/{id}`

请求体 `TagSaveRequest`：

```json
{
  "name": "Spring Boot",
  "slug": "spring-boot"
}
```

### 8.4 学习日记管理

- 列表：`GET /api/admin/diaries`
- 详情：`GET /api/admin/diaries/{id}`
- 新增：`POST /api/admin/diaries`
- 编辑：`PUT /api/admin/diaries/{id}`
- 删除：`DELETE /api/admin/diaries/{id}`

请求体 `DiarySaveRequest`：

```json
{
  "diaryDate": "2026-04-15",
  "title": "今天学习了 Redis",
  "contentMd": "## 学习记录",
  "mood": "happy",
  "studyHours": 3.5,
  "tagsText": "redis,缓存",
  "visibility": "public"
}
```

### 8.5 项目管理

- 列表：`GET /api/admin/projects`
- 详情：`GET /api/admin/projects/{id}`
- 新增：`POST /api/admin/projects`
- 编辑：`PUT /api/admin/projects/{id}`
- 删除：`DELETE /api/admin/projects/{id}`

请求体 `ProjectSaveRequest`：

```json
{
  "name": "Study Blog",
  "slug": "study-blog",
  "summary": "个人学习日记与项目展示站",
  "descriptionMd": "# 项目说明",
  "techStack": "Spring Boot, MySQL, Redis, Next.js",
  "githubUrl": "https://github.com/...",
  "demoUrl": "https://...",
  "coverImage": "https://...",
  "startDate": "2026-04-01",
  "endDate": "2026-05-01",
  "status": "ongoing",
  "sort": 10,
  "isFeatured": 1
}
```

### 8.6 资源分组管理

- 列表：`GET /api/admin/resource-collections`
- 详情：`GET /api/admin/resource-collections/{id}`
- 新增：`POST /api/admin/resource-collections`
- 编辑：`PUT /api/admin/resource-collections/{id}`
- 删除：`DELETE /api/admin/resource-collections/{id}`

请求体 `ResourceCollectionSaveRequest`：

```json
{
  "name": "后端学习路线",
  "slug": "backend-roadmap",
  "description": "按主题整理的后端学习资源",
  "sort": 1
}
```

### 8.7 资源项管理

- 列表：`GET /api/admin/resource-items`
- 详情：`GET /api/admin/resource-items/{id}`
- 新增：`POST /api/admin/resource-items`
- 编辑：`PUT /api/admin/resource-items/{id}`
- 删除：`DELETE /api/admin/resource-items/{id}`

请求体 `ResourceItemSaveRequest`：

```json
{
  "collectionId": 1,
  "title": "Spring 官方文档",
  "summary": "Spring 生态官方入口",
  "linkUrl": "https://spring.io",
  "coverImage": "https://...",
  "sourceName": "Spring",
  "tagsText": "spring,official",
  "sort": 1
}
```

### 8.8 友链管理

- 列表：`GET /api/admin/friend-links`
- 详情：`GET /api/admin/friend-links/{id}`
- 新增：`POST /api/admin/friend-links`
- 编辑：`PUT /api/admin/friend-links/{id}`
- 删除：`DELETE /api/admin/friend-links/{id}`

请求体 `FriendLinkSaveRequest`：

```json
{
  "siteName": "示例站点",
  "siteUrl": "https://example.com",
  "avatar": "https://...",
  "description": "一个专注学习记录的博客",
  "status": "approved",
  "sort": 1
}
```

### 8.9 站点配置管理

- 获取：`GET /api/admin/site-config`
- 更新：`PUT /api/admin/site-config`

请求体 `SiteConfigUpdateRequest`：

```json
{
  "siteName": "My Study Blog",
  "siteSubtitle": "持续记录，持续学习",
  "logo": "https://...",
  "avatar": "https://...",
  "githubUrl": "https://github.com/...",
  "bilibiliUrl": "",
  "xiaohongshuUrl": "",
  "email": "me@example.com",
  "aboutMeMd": "# 关于我",
  "announcement": "欢迎来到我的学习博客"
}
```

## 9. 主要响应对象字段

### 9.1 ArticleListVO

- `id`
- `title`
- `slug`
- `summary`
- `coverImage`
- `categoryId`
- `categoryName`
- `status`
- `isTop`
- `viewCount`
- `wordCount`
- `sort`
- `publishTime`
- `createdAt`
- `tags: TagVO[]`

### 9.2 ArticleDetailVO

在 `ArticleListVO` 的基础上，额外包含：

- `contentMd`
- `contentHtml`
- `authorId`
- `updatedAt`

### 9.3 DiaryListVO / DiaryDetailVO

- `DiaryListVO`：适合列表卡片
- `DiaryDetailVO`：在列表字段基础上额外包含 `contentMd`、`updatedAt`

### 9.4 ProjectVO / ProjectDetailVO

- `ProjectVO`：适合列表卡片
- `ProjectDetailVO`：在列表字段基础上额外包含 `descriptionMd`、`updatedAt`

### 9.5 ResourceCollectionVO

- `id`
- `name`
- `slug`
- `description`
- `sort`
- `itemCount`
- `createdAt`
- `items: ResourceItemVO[]`

### 9.6 SiteInfoVO

- `id`
- `siteName`
- `siteSubtitle`
- `logo`
- `avatar`
- `githubUrl`
- `bilibiliUrl`
- `xiaohongshuUrl`
- `email`
- `aboutMeMd`
- `announcement`

## 10. 前端实现建议

### 10.1 公开页建议

- 首页只调一次 `/api/public/home`，避免拆多个请求
- 文章详情页优先用 `slug` 作为路由参数
- 分类页和标签页共用文章列表组件即可
- 资源页可直接消费 `/api/public/resources` 返回的分组嵌套数据

### 10.2 后台页建议

- 后台列表页全部复用统一分页表格组件
- 表单页统一复用上传组件，先调 `/api/admin/upload` 再回填 `fileUrl`
- 媒体库页直接用 `/api/admin/upload/files`
- 删除上传文件时，传上传返回的 `id`
- 登录后把 `token` 持久化到本地存储，请求拦截器统一加 `Authorization`

### 10.3 错误处理建议

- `401`：跳转登录页
- `400`：表单校验错误，直接提示 `message`
- `500`：统一 toast 提示“服务器异常，请稍后重试”

## 11. 当前接口缺口

当前已经足够支撑大多数页面。如果后面要做更完整的媒体库，下一步建议优先补：

- 批量删除接口
- 文件引用关系接口
- 文件用途字段（例如文章封面 / Markdown 图片 / 项目封面）
- 文件分组或标签能力
