export function validateSiteConfigFields(form: {
  siteName: string;
  email: string;
  githubUrl: string;
  bilibiliUrl: string;
  xiaohongshuUrl: string;
}) {
  const errors: Record<string, string> = {};
  if (!form.siteName.trim()) errors.siteName = "请填写站点名称。";
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+$/.test(form.email.trim())) {
    errors.email = "请填写有效的邮箱，例如 hello@example.com。";
  }
  for (const field of ["githubUrl", "bilibiliUrl", "xiaohongshuUrl"] as const) {
    if (!form[field].trim()) continue;
    try {
      const url = new URL(form[field].trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Unsupported protocol");
    } catch {
      errors[field] = "请填写完整的 http:// 或 https:// 网址。";
    }
  }
  return errors;
}
