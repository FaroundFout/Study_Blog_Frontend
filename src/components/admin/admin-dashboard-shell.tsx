"use client";

import {
  BookCopy,
  ExternalLink,
  FileImage,
  FilePenLine,
  FolderTree,
  Home,
  KeyRound,
  Layers3,
  Library,
  Link2,
  LogOut,
  Menu,
  Music4,
  NotebookPen,
  ShieldCheck,
  Sprout,
  Tag,
  Wrench,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useMemo, useState, useTransition } from "react";

import { adminDangerGhostButtonClassName } from "@/components/admin/admin-page-kit";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/api";
import { ADMIN_AUTH_CHANGED_EVENT } from "@/lib/auth-storage";
import { confirmUnsavedChanges } from "@/lib/unsaved-changes";
import { cn, initialLetters } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { SiteInfo } from "@/types";

import styles from "./admin-dashboard-shell.module.css";

const adminNavGroups = [
  {
    title: "内容",
    items: [
      { code: "01", href: "/admin/articles", label: "文章", description: "筛选、编辑与发布", icon: BookCopy },
      { code: "02", href: "/admin/diaries", label: "学习日记", description: "记录日常学习轨迹", icon: NotebookPen },
      { code: "03", href: "/admin/projects", label: "项目", description: "维护项目档案", icon: Layers3 }
    ]
  },
  {
    title: "结构",
    items: [
      { code: "04", href: "/admin/resource-collections", label: "资源分组", description: "整理资源地图", icon: Library },
      { code: "05", href: "/admin/resource-items", label: "资源项", description: "维护资源链接", icon: Link2 },
      { code: "06", href: "/admin/categories", label: "分类", description: "建立栏目结构", icon: FolderTree },
      { code: "07", href: "/admin/tags", label: "标签", description: "维护主题索引", icon: Tag }
    ]
  },
  {
    title: "站点",
    items: [
      { code: "08", href: "/admin/media", label: "媒体库", description: "上传与复用文件", icon: FileImage },
      { code: "09", href: "/admin/home-music", label: "首页音乐", description: "维护播放器内容", icon: Music4 },
      { code: "10", href: "/admin/site", label: "站点配置", description: "统一公开页信息", icon: Wrench },
      { code: "11", href: "/admin/account-security", label: "账号安全", description: "管理登录密码", icon: KeyRound }
    ]
  }
] as const;

const topNavItems = [
  adminNavGroups[0].items[0],
  adminNavGroups[0].items[1],
  adminNavGroups[0].items[2],
  adminNavGroups[1].items[0],
  adminNavGroups[2].items[0],
  adminNavGroups[2].items[2]
] as const;

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getAdminPageMeta(pathname: string) {
  if (pathname === "/admin/articles/new") {
    return { index: "01", eyebrow: "ARTICLE COMPOSER", title: "写新文章", description: "在同一张编辑台上完成正文、预览、分类、标签、封面与发布状态。", action: { href: "/admin/articles", label: "返回文章目录" } };
  }

  if (/^\/admin\/articles\/\d+$/.test(pathname)) {
    return { index: "01", eyebrow: "ARTICLE EDITOR", title: "编辑文章", description: "修正文案、封面、发布时间和可见状态，并保持公开文章页同步。", action: { href: "/admin/articles", label: "返回文章目录" } };
  }

  if (pathname === "/admin/diaries" || pathname.startsWith("/admin/diaries/")) {
    return { index: "02", eyebrow: "STUDY DIARY", title: "学习日记管理", description: "把每日学习内容、心情与投入时长整理成可持续回看的时间线。", action: { href: "/admin/diaries/new", label: "写一篇日记" } };
  }

  if (pathname === "/admin/projects" || pathname.startsWith("/admin/projects/")) {
    return { index: "03", eyebrow: "PROJECT DECK", title: "项目管理", description: "维护项目档案、技术栈、链接与阶段，让前台项目目录始终完整。", action: { href: "/admin/projects/new", label: "新建项目" } };
  }

  if (pathname === "/admin/resource-collections" || pathname.startsWith("/admin/resource-collections/")) {
    return { index: "04", eyebrow: "RESOURCE ATLAS", title: "资源分组管理", description: "整理资源地图的分组、说明与排序，建立清晰的收藏结构。", action: { href: "/admin/resource-collections/new", label: "新建分组" } };
  }

  if (pathname === "/admin/resource-items" || pathname.startsWith("/admin/resource-items/")) {
    return { index: "05", eyebrow: "RESOURCE ITEMS", title: "资源项管理", description: "维护单条资源的标题、来源、封面、标签和分组归属。", action: { href: "/admin/resource-items/new", label: "新建资源项" } };
  }

  if (pathname === "/admin/categories") {
    return { index: "06", eyebrow: "TAXONOMY", title: "分类管理", description: "为文章建立稳定栏目，支撑公开页筛选、导航和后续扩展。", action: { href: "/write", label: "去写文章" } };
  }

  if (pathname === "/admin/tags") {
    return { index: "07", eyebrow: "TAXONOMY", title: "标签管理", description: "维护更细粒度的主题索引，让内容之间形成清晰连接。", action: { href: "/write", label: "去写文章" } };
  }

  if (pathname === "/admin/media") {
    return { index: "08", eyebrow: "MEDIA DESK", title: "媒体库", description: "集中完成文件上传、地址复制与表单复用，减少重复管理。", action: undefined };
  }

  if (pathname === "/admin/home-music") {
    return { index: "09", eyebrow: "HOME PLAYER", title: "首页音乐", description: "管理首页播放器的歌曲、封面与音频资源。", action: undefined };
  }

  if (pathname === "/admin/site") {
    return { index: "10", eyebrow: "SITE SETUP", title: "站点配置", description: "维护站点名称、副标题、公告、头像、Logo 与关于页文案。", action: undefined };
  }

  if (pathname === "/admin/account-security") {
    return { index: "11", eyebrow: "ACCOUNT SECURITY", title: "账号安全", description: "更新管理员密码并重新建立安全登录会话。", action: undefined };
  }

  return { index: "01", eyebrow: "CONTENT DESK", title: "文章目录", description: "像整理馆藏目录一样管理草稿、发布内容和后续更新。", action: { href: "/write", label: "新建文章" } };
}

function AdminShellSkeleton() {
  return (
    <div className={styles.skeleton}>
      <LoadingSkeleton className="h-20 rounded-none" />
      <div className="grid min-h-[720px] grid-cols-1 gap-px lg:grid-cols-[19rem_minmax(0,1fr)]">
        <LoadingSkeleton className="h-full rounded-none" />
        <div className="space-y-5 p-6 lg:p-10">
          <LoadingSkeleton className="h-36 rounded-none" />
          <LoadingSkeleton className="h-60 rounded-none" />
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardShell({ children, siteInfo }: { children: React.ReactNode; siteInfo: SiteInfo }) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const { token, user, hydrated, restore, clearAuth } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandLogoFailed, setBrandLogoFailed] = useState(false);
  const brandLogoSrc = siteInfo.logo || "";

  useEffect(() => {
    restore();
    const handleAuthChanged = () => restore();
    window.addEventListener(ADMIN_AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => window.removeEventListener(ADMIN_AUTH_CHANGED_EVENT, handleAuthChanged);
  }, [restore]);

  useEffect(() => {
    if (hydrated && !token) replace("/admin/login");
  }, [hydrated, replace, token]);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => setBrandLogoFailed(false), [brandLogoSrc]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  const pageMeta = useMemo(() => getAdminPageMeta(pathname), [pathname]);

  const handleLogout = () => {
    if (!confirmUnsavedChanges()) return;
    if (!token) {
      clearAuth();
      replace("/admin/login?reason=logged-out");
      return;
    }

    startTransition(async () => {
      try { await logoutAdmin(token); }
      finally {
        clearAuth();
        replace("/admin/login?reason=logged-out");
      }
    });
  };

  if (!hydrated || !token) return <AdminShellSkeleton />;

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="返回 Study Garden 首页">
          <span className={styles.brandMark}>
            {brandLogoSrc && !brandLogoFailed ? (
              <Image src={brandLogoSrc} alt="" fill sizes="48px" className="object-cover" onError={() => setBrandLogoFailed(true)} />
            ) : <Sprout aria-hidden="true" />}
          </span>
          <span className={styles.brandCopy}>
            <strong>{siteInfo.siteName || "我的学习日记"}</strong>
            <small>STUDY GARDEN / ADMIN</small>
          </span>
        </Link>

        <nav className={styles.topNav} aria-label="后台快捷导航">
          {topNavItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn(styles.topNavItem, isNavItemActive(pathname, item.href) && styles.topNavItemActive)}>
              <span>{item.code}</span>{item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.topActions}>
          <a href="/" target="_blank" rel="noreferrer" className={styles.iconAction} aria-label="在新窗口查看前台"><ExternalLink aria-hidden="true" /></a>
          <button type="button" className={cn(styles.iconAction, styles.menuButton)} onClick={() => setMenuOpen(true)} aria-label="打开管理导航" aria-expanded={menuOpen}><Menu aria-hidden="true" /></button>
        </div>
      </header>

      <div className={styles.workspace}>
        {menuOpen ? <button type="button" className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-label="关闭管理导航" /> : null}
        <aside className={cn(styles.sidebar, menuOpen && styles.sidebarOpen)} aria-label="后台管理导航">
          <div className={styles.sidebarHeader}>
            <div><p>内容管理台</p><span>CATALOG 0001 — SG — 2026</span></div>
            <button type="button" className={styles.sidebarClose} onClick={() => setMenuOpen(false)} aria-label="关闭管理导航"><X aria-hidden="true" /></button>
          </div>

          <div className={styles.operator}>
            <span>{initialLetters(user?.nickname || user?.username || "admin")}</span>
            <div><strong>{user?.nickname || user?.username || "管理员"}</strong><small><ShieldCheck aria-hidden="true" /> {user?.role || "ADMIN"} / 已登录</small></div>
          </div>

          <div className={styles.navGroups}>
            {adminNavGroups.map((group) => (
              <section key={group.title} className={styles.navGroup}>
                <h2>{group.title}</h2>
                <nav>
                  {group.items.map((item) => {
                    const active = isNavItemActive(pathname, item.href);
                    return (
                      <Link key={item.href} href={item.href} className={cn(styles.sideNavItem, active && styles.sideNavItemActive)}>
                        <span className={styles.navCode}>{item.code}</span><item.icon aria-hidden="true" />
                        <span className={styles.navCopy}><strong>{item.label}</strong><small>{item.description}</small></span>
                      </Link>
                    );
                  })}
                </nav>
              </section>
            ))}
          </div>

          <div className={styles.sidebarFooter}>
            <Image src="/images/home/library-stamp.png" width={196} height={112} alt="Study Garden Library" className={styles.stamp} />
            <Button variant="ghost" className={cn(styles.logout, adminDangerGhostButtonClassName)} onClick={handleLogout} disabled={isPending}><LogOut aria-hidden="true" />{isPending ? "退出中" : "退出登录"}</Button>
            <p>STUDY GARDEN / ADMIN DESK / 2026</p>
          </div>
        </aside>

        <main className={styles.main}>
          <section className={styles.pageHeader}>
            <div className={styles.pageRegister}><p>{pageMeta.eyebrow}</p><span>{pageMeta.index} / 11</span></div>
            <div className={styles.pageTitleRow}>
              <div><h1>{pageMeta.title}</h1><p>{pageMeta.description}</p></div>
              <div className={styles.pageActions}>
                <Link href="/" className={styles.secondaryAction}><Home aria-hidden="true" />返回前台</Link>
                {pageMeta.action ? <Link href={pageMeta.action.href} className={styles.primaryAction}><FilePenLine aria-hidden="true" />{pageMeta.action.label}</Link> : null}
              </div>
            </div>
            <div className={styles.headerRule}><span>SG — ADMIN — {pageMeta.index.padStart(2, "0")}</span></div>
          </section>

          <div className={styles.content}>{children}</div>
        </main>
      </div>
    </div>
  );
}
