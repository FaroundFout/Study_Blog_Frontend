export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type ArticleStatus = "draft" | "published" | "private";
export type DiaryVisibility = "public" | "private";
export type ProjectStatus = "planning" | "ongoing" | "completed" | "active" | "archived" | "paused";

export interface PageResponse<T> {
  total: number;
  pageNum: number;
  pageSize: number;
  list: T[];
}

export interface SiteInfo {
  id: number;
  siteName: string;
  siteSubtitle: string;
  homeBrandLabel?: string;
  homeIntroText?: string;
  logo?: string;
  avatar?: string;
  githubUrl?: string;
  bilibiliUrl?: string;
  xiaohongshuUrl?: string;
  email?: string;
  aboutMeMd?: string;
  aboutPageJson?: string;
  announcement?: string;
}

export interface AboutFocusItem {
  title: string;
  note: string;
}

export interface AboutMilestone {
  date: string;
  text: string;
}

export interface AboutPageContent {
  profileSectionTitle: string;
  profileTitle: string;
  profileBio: string;
  location: string;
  timezone: string;
  status: string;
  noteTitle: string;
  focusTitle: string;
  timelineTitle: string;
  contactTitle: string;
  quote: string;
  contactNote: string;
  contactEmptyText: string;
  githubNote: string;
  bilibiliNote: string;
  xiaohongshuNote: string;
  focusItems: AboutFocusItem[];
  milestones: AboutMilestone[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sort?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage?: string;
  categoryId?: number;
  categoryName?: string;
  status?: ArticleStatus | string;
  isTop?: number;
  viewCount?: number;
  wordCount?: number;
  sort?: number;
  publishTime?: string;
  createdAt?: string;
  tags: Tag[];
}

export interface ArticleDetail extends Article {
  contentMd: string;
  contentHtml?: string;
  authorId?: number;
  updatedAt?: string;
}

export interface Diary {
  id: number;
  diaryDate: string;
  title: string;
  summary?: string;
  mood?: string;
  studyHours?: number;
  tagsText?: string;
  visibility?: DiaryVisibility | string;
  createdAt?: string;
}

export interface DiaryDetail extends Diary {
  contentMd: string;
  updatedAt?: string;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  summary: string;
  techStack?: string;
  githubUrl?: string;
  demoUrl?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus | string;
  sort?: number;
  isFeatured?: number;
  createdAt?: string;
}

export interface ProjectDetail extends Project {
  descriptionMd: string;
  updatedAt?: string;
}

export interface ResourceItem {
  id: number;
  collectionId: number;
  title: string;
  summary: string;
  linkUrl: string;
  coverImage?: string;
  sourceName?: string;
  tagsText?: string;
  sort?: number;
  createdAt?: string;
}

export interface ResourceCollection {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort?: number;
  itemCount?: number;
  createdAt?: string;
  items?: ResourceItem[];
}

export interface ArchiveRecord {
  archiveMonth: string;
  count: number;
}

export interface ArchiveItem {
  type: "article" | "diary" | "project";
  id: number;
  title: string;
  href: string;
  date: string;
  summary?: string;
}

export interface HomeData {
  siteInfo: SiteInfo;
  latestArticles: Article[];
  latestDiaries: Diary[];
  featuredProjects: Project[];
  resourceCollections: ResourceCollection[];
}

export interface HomeMusic {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  ossObjectKey: string;
  fileUrl: string;
  fileName: string;
  contentType?: string;
  fileSize: number;
  durationSeconds: number;
  playCount: number;
  likeCount: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleQuery {
  pageNum?: number;
  pageSize?: number;
  categoryId?: number;
  tagId?: number;
  keyword?: string;
  sort?: "latest" | "oldest" | "views";
}

export interface DiaryQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  month?: string;
}

export interface ProjectQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  featured?: boolean;
  status?: string;
}

export interface SearchResult {
  id: string;
  type: "article" | "diary";
  title: string;
  summary: string;
  href: string;
  date: string;
  tags: string[];
}

export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

export interface AdminUser {
  id: number;
  username: string;
  nickname: string;
  role: string;
  avatar?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginPayload {
  token: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  userInfo: AdminUser;
}

export interface AdminArticleQuery {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  categoryId?: number;
  status?: ArticleStatus;
}

export interface AdminArticleSavePayload {
  title: string;
  slug: string;
  summary?: string;
  coverImage?: string;
  contentMd: string;
  contentHtml?: string;
  categoryId?: number;
  status: ArticleStatus;
  isTop?: number;
  sort?: number;
  publishTime?: string | null;
  tagIds?: number[];
}

export interface AdminCategoryQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
}

export interface AdminCategorySavePayload {
  name: string;
  slug: string;
  sort?: number;
  description?: string;
}

export interface AdminTagQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
}

export interface AdminTagSavePayload {
  name: string;
  slug: string;
}

export interface AdminDiaryQuery {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  visibility?: DiaryVisibility;
  startDate?: string;
  endDate?: string;
}

export interface AdminDiarySavePayload {
  diaryDate: string;
  title: string;
  contentMd: string;
  mood?: string;
  studyHours?: number;
  tagsText?: string;
  visibility: DiaryVisibility;
}

export interface AdminProjectQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  status?: ProjectStatus;
  isFeatured?: number;
}

export interface AdminProjectSavePayload {
  name: string;
  slug: string;
  summary?: string;
  descriptionMd?: string;
  techStack?: string;
  githubUrl?: string;
  demoUrl?: string;
  coverImage?: string;
  startDate?: string | null;
  endDate?: string | null;
  status: ProjectStatus;
  sort?: number;
  isFeatured?: number;
}

export interface AdminResourceCollectionQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
}

export interface AdminResourceCollectionSavePayload {
  name: string;
  slug: string;
  description?: string;
  sort?: number;
}

export interface AdminResourceItemQuery {
  pageNum?: number;
  pageSize?: number;
  collectionId?: number;
  keyword?: string;
}

export interface AdminResourceItemSavePayload {
  collectionId: number;
  title: string;
  summary?: string;
  linkUrl: string;
  coverImage?: string;
  sourceName?: string;
  tagsText?: string;
  sort?: number;
}

export interface AdminSiteConfigUpdatePayload {
  siteName: string;
  siteSubtitle?: string;
  homeBrandLabel?: string;
  homeIntroText?: string;
  logo?: string;
  avatar?: string;
  githubUrl?: string;
  bilibiliUrl?: string;
  xiaohongshuUrl?: string;
  email?: string;
  aboutMeMd?: string;
  aboutPageJson?: string;
  announcement?: string;
}

export interface AdminHomeMusicUploadPayload {
  title: string;
  artist: string;
  audioFile: File;
  coverFile?: File;
  durationSeconds?: number;
  playCount?: number;
  likeCount?: number;
  status?: "draft" | "published" | "archived";
}

export interface UploadProgressSnapshot {
  loaded: number;
  total?: number;
  percent: number | null;
}

export type UploadProgressHandler = (progress: UploadProgressSnapshot) => void;

export interface AdminUploadRequestOptions {
  onProgress?: UploadProgressHandler;
  onAuthRetry?: () => void;
}

export interface AdminHomeMusicQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  status?: "draft" | "published" | "archived" | "";
}

export interface AdminUploadFileOptions extends AdminUploadRequestOptions {
  directory?: string;
}

export interface UploadedFileQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
}

export interface UploadedFilePayload {
  id: number;
  originalName: string;
  storedName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  contentType?: string;
  createdAt?: string;
}
