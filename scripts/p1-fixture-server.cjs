// Isolated, loopback-only UI fixture. Never connects to the real backend or writes to disk.
// Run with: node scripts/p1-fixture-server.cjs
// Start the normal frontend with NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:18081.
const http = require("node:http");
const user = { id: 1, username: "ui-fixture", nickname: "UI Fixture", role: "ADMIN" };
let site = {
  id: 1, siteName: "Study Garden · UI 验证", siteSubtitle: "仅用于本地 P1 回归",
  homeBrandLabel: "Fixture", homeIntroText: "本地隔离测试，不修改真实站点。",
  logo: "/images/avatar-main.svg", avatar: "/images/avatar-main.svg",
  email: "fixture@example.test", githubUrl: "", bilibiliUrl: "", xiaohongshuUrl: "",
  announcement: "", aboutMeMd: "## 测试说明\n\n本地临时数据。"
};
const files = [1, 2].map((id) => ({
  id, originalName: `fixture-${id}.svg`, fileUrl: `/images/avatar-${id === 1 ? "main" : "side"}.svg`,
  fileSize: 1280, contentType: "image/svg+xml", createdAt: "2026-08-27T10:00:00"
}));
// Reuse an existing asset for both entries; selection remains distinguishable by the query.
files[1].fileUrl = "/images/avatar-main.svg?fixture=2";
let article = { id: 100, title: "P1 测试文章", slug: "p1-fixture", contentMd: "# 仅本地\n\n测试正文。", status: "draft", tags: [], categoryId: null, summary: "", coverImage: "", isTop: 0, sort: 0, publishTime: null };
const counts = { siteSaves: 0, articleSaves: 0, logouts: 0 };
const page = (list) => ({ list, total: list.length, pageNum: 1, pageSize: 20, pages: 1 });
http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) {
    res.writeHead(403).end(); return;
  }
  res.setHeader("Access-Control-Allow-Origin", origin || "http://127.0.0.1:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }
  const route = new URL(req.url, "http://127.0.0.1:18081").pathname;
  const send = (data, status = 200, message = "success") => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ code: status, message, data }));
  };
  let raw = "";
  for await (const chunk of req) raw += chunk;
  let body;
  try { body = raw ? JSON.parse(raw) : {}; } catch { send(null, 400); return; }
  if (route === "/__fixture/status") return send(counts);
  if (route === "/api/admin/auth/login") return send({ token: "local-fixture-only", tokenType: "Bearer", userInfo: user });
  if (route === "/api/admin/auth/me") return send(user);
  if (route === "/api/admin/auth/logout") { counts.logouts++; return send(null); }
  if (route === "/api/public/site-info") return send(site);
  if (route === "/api/admin/site-config") {
    if (req.method === "PUT") {
      if (body.siteName === "FAIL_FIXTURE") return send(null, 500, "本地模拟保存失败，请重试。");
      await new Promise(resolve => setTimeout(resolve, 600));
      site = { ...site, ...body }; counts.siteSaves++;
    }
    return send(site);
  }
  if (route === "/api/admin/upload/files") return send(page(files));
  if (/^\/api\/admin\/upload\/files\/\d+$/.test(route)) return send(files.find(file => route.endsWith(`/${file.id}`)) || null);
  if (route === "/api/admin/categories" || route === "/api/admin/tags") return send(page([]));
  if (route === "/api/admin/articles" && req.method === "GET") return send(page([article]));
  if (route === "/api/admin/articles" && req.method === "POST") {
    article = { ...article, ...body }; counts.articleSaves++; return send(100);
  }
  if (route === "/api/admin/articles/100") {
    if (req.method === "PUT") {
      if (body.title === "FAIL_FIXTURE") return send(null, 500, "本地模拟文章保存失败。");
      await new Promise(resolve => setTimeout(resolve, 600));
      article = { ...article, ...body }; counts.articleSaves++;
    }
    return send(article);
  }
  send(null, 404, `Fixture does not implement ${route}`);
}).listen(18081, "127.0.0.1", () => console.log("P1 fixture API on http://127.0.0.1:18081; all writes are memory-only."));
