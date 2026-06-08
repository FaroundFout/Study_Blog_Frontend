export const DEFAULT_PAGE_SIZE = 6;
export const DEFAULT_LIST_PAGE_SIZE = 9;
export const CONTENT_FETCH_SIZE = 100;

export const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/articles", label: "文章" },
  { href: "/diaries", label: "学习日记" },
  { href: "/projects", label: "项目" },
  { href: "/resources", label: "资源" },
  { href: "/archives", label: "归档" },
  { href: "/about", label: "关于" }
] as const;

export const HOME_NAV_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/");

export const ARTICLE_SORT_OPTIONS = [
  { value: "latest", label: "最新优先" },
  { value: "oldest", label: "最早优先" },
  { value: "views", label: "阅读最多" }
] as const;

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  planning: "规划中",
  ongoing: "进行中",
  active: "进行中",
  completed: "已完成",
  archived: "归档中",
  paused: "暂停维护"
};

export const ARTICLE_STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
  private: "私密"
};

export const DIARY_VISIBILITY_LABELS: Record<string, string> = {
  public: "公开",
  private: "私密"
};

export const MOOD_LABELS: Record<string, string> = {
  focus: "专注",
  calm: "平稳",
  curious: "好奇",
  excited: "兴奋"
};

export const FOOTER_LINKS = [
  { href: "/admin/login", label: "管理入口" },
  { href: "/search", label: "站内搜索" },
  { href: "/resources", label: "资料导航" }
] as const;
