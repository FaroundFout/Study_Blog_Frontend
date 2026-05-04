import dayjs from "dayjs";

import {
  CONTENT_FETCH_SIZE,
  DEFAULT_LIST_PAGE_SIZE,
  PROJECT_STATUS_LABELS
} from "@/lib/constants";
import {
  mockArticleDetails,
  mockArticles,
  mockCategories,
  mockDiaries,
  mockDiaryDetails,
  mockFriendLinks,
  mockHomeData,
  mockHomeMusic,
  mockProjects,
  mockProjectDetails,
  mockResourceCollections,
  mockSiteInfo,
  mockTags,
  paginate
} from "@/lib/mock-data";
import { authorizedAdminRequest, normalizeAdminAccessToken } from "@/lib/admin-auth";
import { request, requestWithFallback } from "@/lib/request";
import { excerpt, searchContent, sortArticles, sortDiaries, sortProjects } from "@/lib/utils";
import type {
  AdminCategoryQuery,
  AdminCategorySavePayload,
  ChangePasswordRequest,
  AdminDiaryQuery,
  AdminDiarySavePayload,
  AdminFriendLinkQuery,
  AdminFriendLinkSavePayload,
  AdminHomeMusicUploadPayload,
  AdminHomeMusicQuery,
  AdminProjectQuery,
  AdminProjectSavePayload,
  AdminResourceCollectionQuery,
  AdminResourceCollectionSavePayload,
  AdminResourceItemQuery,
  AdminResourceItemSavePayload,
  AdminSiteConfigUpdatePayload,
  AdminTagQuery,
  AdminTagSavePayload,
  AdminUploadFileOptions,
  AdminUser,
  AdminArticleQuery,
  AdminArticleSavePayload,
  Article,
  ArticleDetail,
  ArticleQuery,
  Category,
  Diary,
  DiaryDetail,
  DiaryQuery,
  FriendLink,
  HomeData,
  HomeMusic,
  LoginPayload,
  LoginRequest,
  PageResponse,
  Project,
  ProjectDetail,
  ProjectQuery,
  ResourceCollection,
  ResourceItem,
  SearchResult,
  SiteInfo,
  Tag,
  UploadedFilePayload,
  UploadedFileQuery
} from "@/types";

function filterArticles(query: ArticleQuery = {}) {
  const keyword = query.keyword?.trim().toLowerCase();
  let items = [...mockArticles];

  if (query.categoryId) {
    items = items.filter((item) => item.categoryId === query.categoryId);
  }

  if (query.tagId) {
    items = items.filter((item) => item.tags.some((tag) => tag.id === query.tagId));
  }

  if (keyword) {
    items = items.filter((item) =>
      [
        item.title,
        item.summary,
        item.categoryName,
        ...item.tags.map((tag) => tag.name)
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }

  return sortArticles(items, query.sort);
}

function filterDiaries(query: DiaryQuery = {}) {
  const keyword = query.keyword?.trim().toLowerCase();
  let items = [...mockDiaries];

  if (query.month) {
    items = items.filter((item) => dayjs(item.diaryDate).format("YYYY-MM") === query.month);
  }

  if (keyword) {
    items = items.filter((item) =>
      [item.title, item.summary, item.tagsText, item.mood]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }

  return sortDiaries(items);
}

function filterProjects(query: ProjectQuery = {}) {
  const keyword = query.keyword?.trim().toLowerCase();
  let items = [...mockProjects];

  if (query.featured) {
    items = items.filter((item) => item.isFeatured === 1);
  }

  if (query.status) {
    items = items.filter((item) => item.status === query.status);
  }

  if (keyword) {
    items = items.filter((item) =>
      [item.name, item.summary, item.techStack, PROJECT_STATUS_LABELS[item.status ?? ""]]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }

  return sortProjects(items);
}

export async function getSiteInfo(): Promise<SiteInfo> {
  return requestWithFallback<SiteInfo>("/api/public/site-info", mockSiteInfo, {
    revalidate: 300
  });
}

export async function getHomeData(): Promise<HomeData> {
  return requestWithFallback<HomeData>("/api/public/home", mockHomeData, {
    revalidate: 120
  });
}

export async function getCurrentHomeMusic(): Promise<HomeMusic | null> {
  return requestWithFallback<HomeMusic | null>("/api/public/home/music/current", mockHomeMusic, {
    revalidate: 60
  });
}

export async function incrementHomeMusicPlayCount(id: number) {
  return request<HomeMusic>(`/api/public/home/music/${id}/play`, {
    method: "POST",
    revalidate: 0
  });
}

export async function incrementHomeMusicLikeCount(id: number) {
  return request<HomeMusic>(`/api/public/home/music/${id}/like`, {
    method: "POST",
    revalidate: 0
  });
}

export async function getCategories(): Promise<Category[]> {
  return requestWithFallback<Category[]>("/api/public/categories", mockCategories, {
    revalidate: 300
  });
}

export async function getTags(): Promise<Tag[]> {
  return requestWithFallback<Tag[]>("/api/public/tags", mockTags, {
    revalidate: 300
  });
}

export async function getArticles(
  query: ArticleQuery = {},
): Promise<PageResponse<Article>> {
  const fallback = paginate(
    filterArticles(query),
    query.pageNum ?? 1,
    query.pageSize ?? DEFAULT_LIST_PAGE_SIZE,
  );

  const remote = await requestWithFallback<PageResponse<Article>>(
    "/api/public/articles",
    fallback,
    {
      params: {
        pageNum: query.pageNum ?? 1,
        pageSize: query.pageSize ?? DEFAULT_LIST_PAGE_SIZE,
        categoryId: query.categoryId,
        tagId: query.tagId,
        keyword: query.keyword
      },
      revalidate: 60
    },
  );

  return query.sort
    ? {
        ...remote,
        list: sortArticles(remote.list, query.sort)
      }
    : remote;
}

export async function getAllArticles(): Promise<Article[]> {
  const remote = await requestWithFallback<PageResponse<Article>>(
    "/api/public/articles",
    paginate(sortArticles(mockArticles), 1, CONTENT_FETCH_SIZE),
    {
      params: { pageNum: 1, pageSize: CONTENT_FETCH_SIZE },
      revalidate: 60
    },
  );

  return sortArticles(remote.list);
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const fallback = mockArticleDetails.find((item) => item.slug === slug) ?? null;

  return requestWithFallback<ArticleDetail | null>(
    `/api/public/articles/slug/${slug}`,
    fallback,
    { revalidate: 60 },
  );
}

export async function getArticleById(id: number): Promise<ArticleDetail | null> {
  const fallback = mockArticleDetails.find((item) => item.id === id) ?? null;

  return requestWithFallback<ArticleDetail | null>(
    `/api/public/articles/${id}`,
    fallback,
    { revalidate: 60 },
  );
}

export async function getArticleNavigation(slug: string) {
  const articles = sortArticles(await getAllArticles());
  const currentIndex = articles.findIndex((item) => item.slug === slug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? articles[currentIndex - 1] : null,
    next: currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null
  };
}

export async function getDiaries(
  query: DiaryQuery = {},
): Promise<PageResponse<Diary>> {
  const fallback = paginate(
    filterDiaries(query),
    query.pageNum ?? 1,
    query.pageSize ?? DEFAULT_LIST_PAGE_SIZE,
  );

  return requestWithFallback<PageResponse<Diary>>("/api/public/diaries", fallback, {
    params: {
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? DEFAULT_LIST_PAGE_SIZE
    },
    revalidate: 60
  });
}

export async function getAllDiaries() {
  const remote = await requestWithFallback<PageResponse<Diary>>(
    "/api/public/diaries",
    paginate(sortDiaries(mockDiaries), 1, CONTENT_FETCH_SIZE),
    {
      params: { pageNum: 1, pageSize: CONTENT_FETCH_SIZE },
      revalidate: 60
    },
  );

  return sortDiaries(remote.list);
}

export async function getDiaryById(id: number): Promise<DiaryDetail | null> {
  const fallback = mockDiaryDetails.find((item) => item.id === id) ?? null;

  return requestWithFallback<DiaryDetail | null>(`/api/public/diaries/${id}`, fallback, {
    revalidate: 60
  });
}

export async function getProjects(
  query: ProjectQuery = {},
): Promise<PageResponse<Project>> {
  const fallback = paginate(
    filterProjects(query),
    query.pageNum ?? 1,
    query.pageSize ?? DEFAULT_LIST_PAGE_SIZE,
  );

  return requestWithFallback<PageResponse<Project>>("/api/public/projects", fallback, {
    params: {
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? DEFAULT_LIST_PAGE_SIZE,
      isFeatured: query.featured ? 1 : undefined
    },
    revalidate: 60
  });
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const fallback = mockProjectDetails.find((item) => item.slug === slug) ?? null;

  return requestWithFallback<ProjectDetail | null>(
    `/api/public/projects/slug/${slug}`,
    fallback,
    { revalidate: 60 },
  );
}

export async function getProjectById(id: number): Promise<ProjectDetail | null> {
  const fallback = mockProjectDetails.find((item) => item.id === id) ?? null;

  return requestWithFallback<ProjectDetail | null>(
    `/api/public/projects/${id}`,
    fallback,
    { revalidate: 60 },
  );
}

export async function getResources(): Promise<ResourceCollection[]> {
  return requestWithFallback<ResourceCollection[]>(
    "/api/public/resources",
    mockResourceCollections,
    { revalidate: 120 },
  );
}

export async function getResourceItems(collectionId: number): Promise<ResourceItem[]> {
  const collection = mockResourceCollections.find((item) => item.id === collectionId);
  const fallback = collection?.items ?? [];

  return requestWithFallback<ResourceItem[]>(
    `/api/public/resources/${collectionId}/items`,
    fallback,
    { revalidate: 120 },
  );
}

export async function getFriendLinks(): Promise<FriendLink[]> {
  return requestWithFallback<FriendLink[]>("/api/public/friend-links", mockFriendLinks, {
    revalidate: 120
  });
}

export async function searchSite(keyword: string): Promise<SearchResult[]> {
  const [articles, diaries] = await Promise.all([getAllArticles(), getAllDiaries()]);
  return searchContent(keyword, articles, diaries);
}

export async function loginAdmin(payload: LoginRequest): Promise<LoginPayload> {
  return request<LoginPayload>("/api/admin/auth/login", {
    method: "POST",
    body: payload,
    credentials: "include",
    revalidate: 0
  });
}

export async function getCurrentAdmin(token: string): Promise<AdminUser> {
  return authorizedAdminRequest<AdminUser>("/api/admin/auth/me", token);
}

export async function logoutAdmin(token: string) {
  await request<void>("/api/admin/auth/logout", {
    method: "POST",
    headers: {
      Authorization: normalizeAdminAccessToken(token)
    },
    credentials: "include",
    revalidate: 0
  });
}

export async function changeAdminPassword(token: string, payload: ChangePasswordRequest) {
  return adminRequest<void>(token, "/api/admin/auth/change-password", {
    method: "POST",
    body: payload,
    credentials: "include"
  });
}

function adminRequest<T>(
  token: string,
  path: string,
  options: Parameters<typeof authorizedAdminRequest<T>>[2] = {}
) {
  return authorizedAdminRequest<T>(path, token, {
    ...options,
    revalidate: options.revalidate ?? 0
  });
}

function adminListParams(
  pageNum: number,
  pageSize: number,
  extra?: Record<string, string | number | undefined | null>
) {
  return {
    pageNum,
    pageSize,
    ...extra
  };
}

export async function getAdminArticles(
  token: string,
  query: AdminArticleQuery = {},
): Promise<PageResponse<Article>> {
  return adminRequest<PageResponse<Article>>(token, "/api/admin/articles", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 10, {
      title: query.title,
      categoryId: query.categoryId,
      status: query.status
    })
  });
}

export async function getAdminArticleById(token: string, id: number): Promise<ArticleDetail | null> {
  return adminRequest<ArticleDetail | null>(token, `/api/admin/articles/${id}`);
}

export async function createAdminArticle(token: string, payload: AdminArticleSavePayload) {
  return adminRequest<number>(token, "/api/admin/articles", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminArticle(
  token: string,
  id: number,
  payload: AdminArticleSavePayload,
) {
  return adminRequest<void>(token, `/api/admin/articles/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminArticle(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/articles/${id}`, {
    method: "DELETE"
  });
}

export async function getAdminCategories(token: string): Promise<Category[]> {
  const remote = await adminRequest<PageResponse<Category>>(token, "/api/admin/categories", {
    params: adminListParams(1, 100)
  });

  return remote.list;
}

export async function getAdminCategoriesPage(
  token: string,
  query: AdminCategoryQuery = {},
): Promise<PageResponse<Category>> {
  return adminRequest<PageResponse<Category>>(token, "/api/admin/categories", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 10, {
      keyword: query.keyword
    })
  });
}

export async function getAdminCategoryById(token: string, id: number): Promise<Category | null> {
  return adminRequest<Category | null>(token, `/api/admin/categories/${id}`);
}

export async function createAdminCategory(token: string, payload: AdminCategorySavePayload) {
  return adminRequest<number>(token, "/api/admin/categories", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminCategory(
  token: string,
  id: number,
  payload: AdminCategorySavePayload,
) {
  return adminRequest<void>(token, `/api/admin/categories/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminCategory(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/categories/${id}`, {
    method: "DELETE"
  });
}

export async function getAdminTags(token: string): Promise<Tag[]> {
  const remote = await adminRequest<PageResponse<Tag>>(token, "/api/admin/tags", {
    params: adminListParams(1, 100)
  });

  return remote.list;
}

export async function getAdminTagsPage(
  token: string,
  query: AdminTagQuery = {},
): Promise<PageResponse<Tag>> {
  return adminRequest<PageResponse<Tag>>(token, "/api/admin/tags", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 10, {
      keyword: query.keyword
    })
  });
}

export async function getAdminTagById(token: string, id: number): Promise<Tag | null> {
  return adminRequest<Tag | null>(token, `/api/admin/tags/${id}`);
}

export async function createAdminTag(token: string, payload: AdminTagSavePayload) {
  return adminRequest<number>(token, "/api/admin/tags", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminTag(token: string, id: number, payload: AdminTagSavePayload) {
  return adminRequest<void>(token, `/api/admin/tags/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminTag(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/tags/${id}`, {
    method: "DELETE"
  });
}

export async function getAdminDiaries(
  token: string,
  query: AdminDiaryQuery = {},
): Promise<PageResponse<Diary>> {
  return adminRequest<PageResponse<Diary>>(token, "/api/admin/diaries", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 10, {
      title: query.title,
      visibility: query.visibility,
      startDate: query.startDate,
      endDate: query.endDate
    })
  });
}

export async function getAdminDiaryById(token: string, id: number): Promise<DiaryDetail | null> {
  return adminRequest<DiaryDetail | null>(token, `/api/admin/diaries/${id}`);
}

export async function createAdminDiary(token: string, payload: AdminDiarySavePayload) {
  return adminRequest<number>(token, "/api/admin/diaries", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminDiary(
  token: string,
  id: number,
  payload: AdminDiarySavePayload,
) {
  return adminRequest<void>(token, `/api/admin/diaries/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminDiary(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/diaries/${id}`, {
    method: "DELETE"
  });
}

export async function getAdminProjects(
  token: string,
  query: AdminProjectQuery = {},
): Promise<PageResponse<Project>> {
  return adminRequest<PageResponse<Project>>(token, "/api/admin/projects", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 10, {
      keyword: query.keyword,
      status: query.status,
      isFeatured: query.isFeatured
    })
  });
}

export async function getAdminProjectById(token: string, id: number): Promise<ProjectDetail | null> {
  return adminRequest<ProjectDetail | null>(token, `/api/admin/projects/${id}`);
}

export async function createAdminProject(token: string, payload: AdminProjectSavePayload) {
  return adminRequest<number>(token, "/api/admin/projects", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminProject(
  token: string,
  id: number,
  payload: AdminProjectSavePayload,
) {
  return adminRequest<void>(token, `/api/admin/projects/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminProject(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/projects/${id}`, {
    method: "DELETE"
  });
}

export async function getAdminResourceCollections(
  token: string,
  query: AdminResourceCollectionQuery = {},
): Promise<PageResponse<ResourceCollection>> {
  return adminRequest<PageResponse<ResourceCollection>>(token, "/api/admin/resource-collections", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 10, {
      keyword: query.keyword
    })
  });
}

export async function getAdminResourceCollectionById(
  token: string,
  id: number,
): Promise<ResourceCollection | null> {
  return adminRequest<ResourceCollection | null>(token, `/api/admin/resource-collections/${id}`);
}

export async function createAdminResourceCollection(
  token: string,
  payload: AdminResourceCollectionSavePayload,
) {
  return adminRequest<number>(token, "/api/admin/resource-collections", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminResourceCollection(
  token: string,
  id: number,
  payload: AdminResourceCollectionSavePayload,
) {
  return adminRequest<void>(token, `/api/admin/resource-collections/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminResourceCollection(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/resource-collections/${id}`, {
    method: "DELETE"
  });
}

export async function getAdminResourceItems(
  token: string,
  query: AdminResourceItemQuery = {},
): Promise<PageResponse<ResourceItem>> {
  return adminRequest<PageResponse<ResourceItem>>(token, "/api/admin/resource-items", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 10, {
      collectionId: query.collectionId,
      keyword: query.keyword
    })
  });
}

export async function getAdminResourceItemById(
  token: string,
  id: number,
): Promise<ResourceItem | null> {
  return adminRequest<ResourceItem | null>(token, `/api/admin/resource-items/${id}`);
}

export async function createAdminResourceItem(
  token: string,
  payload: AdminResourceItemSavePayload,
) {
  return adminRequest<number>(token, "/api/admin/resource-items", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminResourceItem(
  token: string,
  id: number,
  payload: AdminResourceItemSavePayload,
) {
  return adminRequest<void>(token, `/api/admin/resource-items/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminResourceItem(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/resource-items/${id}`, {
    method: "DELETE"
  });
}

export async function getAdminFriendLinks(
  token: string,
  query: AdminFriendLinkQuery = {},
): Promise<PageResponse<FriendLink>> {
  return adminRequest<PageResponse<FriendLink>>(token, "/api/admin/friend-links", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 10, {
      keyword: query.keyword,
      status: query.status
    })
  });
}

export async function getAdminFriendLinkById(token: string, id: number): Promise<FriendLink | null> {
  return adminRequest<FriendLink | null>(token, `/api/admin/friend-links/${id}`);
}

export async function createAdminFriendLink(
  token: string,
  payload: AdminFriendLinkSavePayload,
) {
  return adminRequest<number>(token, "/api/admin/friend-links", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminFriendLink(
  token: string,
  id: number,
  payload: AdminFriendLinkSavePayload,
) {
  return adminRequest<void>(token, `/api/admin/friend-links/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminFriendLink(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/friend-links/${id}`, {
    method: "DELETE"
  });
}

export async function getAdminSiteConfig(token: string): Promise<SiteInfo> {
  return adminRequest<SiteInfo>(token, "/api/admin/site-config");
}

export async function updateAdminSiteConfig(
  token: string,
  payload: AdminSiteConfigUpdatePayload,
) {
  return adminRequest<void>(token, "/api/admin/site-config", {
    method: "PUT",
    body: payload,
  });
}

export async function uploadAdminHomeMusic(
  token: string,
  payload: AdminHomeMusicUploadPayload,
) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("artist", payload.artist);
  formData.append("audioFile", payload.audioFile);

  if (payload.coverFile) {
    formData.append("coverFile", payload.coverFile);
  }
  if (typeof payload.durationSeconds === "number") {
    formData.append("durationSeconds", String(payload.durationSeconds));
  }
  if (typeof payload.playCount === "number") {
    formData.append("playCount", String(payload.playCount));
  }
  if (typeof payload.likeCount === "number") {
    formData.append("likeCount", String(payload.likeCount));
  }
  if (payload.status) {
    formData.append("status", payload.status);
  }

  return adminRequest<HomeMusic>(token, "/api/admin/home/music", {
    method: "POST",
    body: formData,
  });
}

export async function getAdminHomeMusicPage(
  token: string,
  query: AdminHomeMusicQuery = {},
): Promise<PageResponse<HomeMusic>> {
  return adminRequest<PageResponse<HomeMusic>>(token, "/api/admin/home/music", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 8, {
      keyword: query.keyword,
      status: query.status || undefined
    })
  });
}

export async function getAdminHomeMusicById(token: string, id: number): Promise<HomeMusic | null> {
  return adminRequest<HomeMusic | null>(token, `/api/admin/home/music/${id}`);
}

export async function deleteAdminHomeMusic(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/home/music/${id}`, {
    method: "DELETE"
  });
}

export async function uploadAdminFile(
  token: string,
  file: File,
  options: AdminUploadFileOptions = {},
) {
  const formData = new FormData();
  formData.append("file", file);
  if (options.directory) {
    formData.append("directory", options.directory);
  }

  return adminRequest<UploadedFilePayload>(token, "/api/admin/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getAdminUploadedFiles(
  token: string,
  query: UploadedFileQuery = {},
): Promise<PageResponse<UploadedFilePayload>> {
  return adminRequest<PageResponse<UploadedFilePayload>>(token, "/api/admin/upload/files", {
    params: adminListParams(query.pageNum ?? 1, query.pageSize ?? 12, {
      keyword: query.keyword
    })
  });
}

export async function getAdminUploadedFileById(
  token: string,
  id: number,
): Promise<UploadedFilePayload | null> {
  return adminRequest<UploadedFilePayload | null>(token, `/api/admin/upload/files/${id}`);
}

export async function deleteAdminUploadedFile(token: string, id: number) {
  return adminRequest<void>(token, `/api/admin/upload/${id}`, {
    method: "DELETE"
  });
}

export function getFeaturedArticle() {
  return sortArticles(mockArticles).find((item) => item.isTop === 1) ?? mockArticles[0];
}

export function getDiaryPreviewText(diary: Diary | DiaryDetail) {
  return diary.summary || excerpt("contentMd" in diary ? diary.contentMd : "", 100);
}
