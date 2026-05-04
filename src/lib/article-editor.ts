export const WRITE_ARTICLE_ROUTE = "/write";

export function buildWriteArticlePath(articleId?: number | string | null) {
  if (articleId === undefined || articleId === null || articleId === "") {
    return WRITE_ARTICLE_ROUTE;
  }

  return `${WRITE_ARTICLE_ROUTE}/${articleId}`;
}

export function buildAdminLoginPath(redirectTarget: string, reason?: string) {
  const params = new URLSearchParams();
  params.set("redirect", redirectTarget);

  if (reason) {
    params.set("reason", reason);
  }

  return `/admin/login?${params.toString()}`;
}
