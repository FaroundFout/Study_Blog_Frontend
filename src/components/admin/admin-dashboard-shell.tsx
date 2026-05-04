"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Music4,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Tag,
  Wrench
} from "lucide-react";
import { useEffect, useMemo, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminDangerGhostButtonClassName } from "@/components/admin/admin-page-kit";
import { logoutAdmin } from "@/lib/api";
import { ADMIN_AUTH_CHANGED_EVENT } from "@/lib/auth-storage";
import { cn, initialLetters } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const adminNavGroups = [
  {
    title: "内容管理",
    items: [
      {
        href: "/admin/articles",
        label: "文章",
        description: "筛选、编辑、发布和维护站点文章",
        icon: BookCopy
      },
      {
        href: "/admin/diaries",
        label: "学习日记",
        description: "记录每日学习内容、情绪和投入时长",
        icon: NotebookPen
      },
      {
        href: "/admin/projects",
        label: "项目",
        description: "维护项目简介、封面、链接和状态",
        icon: Layers3
      }
    ]
  },
  {
    title: "结构整理",
    items: [
      {
        href: "/admin/resource-collections",
        label: "资源分组",
        description: "整理资源地图的分组结构与排序",
        icon: Library
      },
      {
        href: "/admin/resource-items",
        label: "资源项",
        description: "录入单条链接、来源、封面和标签",
        icon: Link2
      },
      {
        href: "/admin/categories",
        label: "分类",
        description: "维护文章分类的命名、说明和排序",
        icon: FolderTree
      },
      {
        href: "/admin/tags",
        label: "标签",
        description: "维护标签系统，支撑文章和项目检索",
        icon: Tag
      }
    ]
  },
  {
    title: "站点运营",
    items: [
      {
        href: "/admin/friend-links",
        label: "友链",
        description: "管理站点友链信息、审核状态和排序",
        icon: Link2
      },
      {
        href: "/admin/media",
        label: "媒体库",
        description: "上传文件、复制地址并在表单里复用",
        icon: FileImage
      },
      {
        href: "/admin/home-music",
        label: "首页音乐",
        description: "上传、预览并维护首页播放器使用的歌曲与封面资源。",
        icon: Music4
      },
      {
        href: "/admin/site",
        label: "站点配置",
        description: "维护站点标题、副标题、公告和头像等",
        icon: Wrench
      },
      {
        href: "/admin/account-security",
        label: "账号安全",
        description: "更新当前管理员密码，并在成功后重新建立安全登录会话",
        icon: KeyRound
      }
    ]
  }
] as const;

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getAdminPageMeta(pathname: string) {
  if (pathname === "/admin/articles/new") {
    return {
      eyebrow: "article composer",
      title: "写新文章",
      description: "保持和前台一致的明亮卡片质感，同时把写作、预览、分类、标签和封面编辑收进一块工作区。",
      action: { href: "/admin/articles", label: "返回文章列表" }
    };
  }

  if (/^\/admin\/articles\/\d+$/.test(pathname)) {
    return {
      eyebrow: "article editor",
      title: "编辑文章",
      description: "继续打磨旧文章，或快速修正文案、封面、发布时间和文章状态。",
      action: { href: "/admin/articles", label: "返回文章列表" }
    };
  }

  if (pathname === "/admin/diaries" || pathname.startsWith("/admin/diaries/")) {
    return {
      eyebrow: "study diary",
      title: "学习日记管理",
      description: "把每天的学习记录、情绪与时长整理成可回看、可筛选、可持续积累的时间线。",
      action: { href: "/admin/diaries/new", label: "写一篇日记" }
    };
  }

  if (pathname === "/admin/projects" || pathname.startsWith("/admin/projects/")) {
    return {
      eyebrow: "project deck",
      title: "项目管理",
      description: "维护项目卡片、封面、技术栈和状态，让前台项目页保持完整而清爽。",
      action: { href: "/admin/projects/new", label: "新建项目" }
    };
  }

  if (
    pathname === "/admin/resource-collections" ||
    pathname.startsWith("/admin/resource-collections/")
  ) {
    return {
      eyebrow: "resource atlas",
      title: "资源分组管理",
      description: "整理资源地图的分组结构与排序，让外部链接不再只是松散收藏。",
      action: { href: "/admin/resource-collections/new", label: "新建分组" }
    };
  }

  if (pathname === "/admin/resource-items" || pathname.startsWith("/admin/resource-items/")) {
    return {
      eyebrow: "resource items",
      title: "资源项管理",
      description: "维护单条资源的标题、来源、封面、标签和分组归属，支撑资源页的完整展示。",
      action: { href: "/admin/resource-items/new", label: "新建资源项" }
    };
  }

  if (pathname === "/admin/categories") {
    return {
      eyebrow: "taxonomy",
      title: "分类管理",
      description: "为文章内容建立稳定的栏目结构，方便筛选、导航和后续扩展。",
      action: { href: "/write", label: "去写文章" }
    };
  }

  if (pathname === "/admin/tags") {
    return {
      eyebrow: "taxonomy",
      title: "标签管理",
      description: "维护更细粒度的主题标签，帮助文章、项目和资源形成更清晰的连接。",
      action: { href: "/write", label: "去写文章" }
    };
  }

  if (pathname === "/admin/friend-links" || pathname.startsWith("/admin/friend-links/")) {
    return {
      eyebrow: "friend links",
      title: "友链管理",
      description: "在审核、排序和展示之间保持整洁，确保友链页看起来像同一个花园的一部分。",
      action: { href: "/admin/friend-links/new", label: "新增友链" }
    };
  }

  if (pathname === "/admin/media") {
    return {
      eyebrow: "media desk",
      title: "媒体库",
      description: "文件上传、复制 URL 与表单复用都集中在这里处理，避免每个页面各自维护一套上传逻辑。",
      action: undefined
    };
  }

  if (pathname === "/admin/home-music") {
    return {
      eyebrow: "home player",
      title: "首页音乐",
      description: "集中管理首页播放器使用的歌曲、封面图片与播放资源，保持前台展示内容清晰可控。",
      action: undefined
    };
  }

  if (pathname === "/admin/site") {
    return {
      eyebrow: "site setup",
      title: "站点配置",
      description: "维护站点名称、副标题、公告、头像、Logo 与关于页文案，让公开页信息保持统一。",
      action: undefined
    };
  }

  if (pathname === "/admin/account-security") {
    return {
      eyebrow: "account security",
      title: "账号安全",
      description: "集中管理当前管理员账号的密码更新与登录安全，改密成功后会立即让当前会话重新登录。",
      action: undefined
    };
  }

  return {
    eyebrow: "content desk",
    title: "文章管理",
    description: "像整理工作台一样管理内容，把草稿、已发布和后续更新都放进同一套后台节奏里。",
    action: { href: "/write", label: "写新文章" }
  };
}

function AdminShellSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="animate-pulse p-6 md:p-7">
        <div className="h-4 w-28 rounded-full bg-accent/90" />
        <div className="mt-4 h-10 w-60 rounded-full bg-accent/90" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-accent/70" />
      </Card>
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="animate-pulse p-5">
          <div className="h-24 rounded-[1.5rem] bg-accent/85" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 rounded-[1.2rem] bg-accent/75" />
            ))}
          </div>
        </Card>
        <Card className="animate-pulse p-6">
          <div className="h-44 rounded-[1.5rem] bg-accent/80" />
        </Card>
      </div>
    </div>
  );
}

export function AdminDashboardShell({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, hydrated, restore, clearAuth } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    restore();

    const handleAuthChanged = () => restore();
    window.addEventListener(ADMIN_AUTH_CHANGED_EVENT, handleAuthChanged);

    return () => {
      window.removeEventListener(ADMIN_AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [restore]);

  useEffect(() => {
    if (!hydrated || token) {
      return;
    }

    router.replace("/admin/login");
  }, [hydrated, router, token]);

  const pageMeta = useMemo(() => getAdminPageMeta(pathname), [pathname]);

  const handleLogout = () => {
    if (!token) {
      clearAuth();
      router.replace("/admin/login?reason=logged-out");
      return;
    }

    startTransition(async () => {
      try {
        await logoutAdmin(token);
      } finally {
        clearAuth();
        router.replace("/admin/login?reason=logged-out");
      }
    });
  };

  if (!hydrated || !token) {
    return <AdminShellSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(246,244,236,0.86))] p-6 md:p-7 dark:border-white/8 dark:bg-[linear-gradient(135deg,rgba(13,21,37,0.96),rgba(16,25,40,0.93))] dark:shadow-[0_32px_68px_-38px_rgba(2,6,23,0.9)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/65 bg-background/70 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-muted-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-[#4dcfc4]" />
              {pageMeta.eyebrow}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-[2.8rem]">
                {pageMeta.title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                {pageMeta.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="inline-flex">
              <Button variant="secondary">
                <Home className="h-4 w-4" />
                返回前台
              </Button>
            </Link>
            {pageMeta.action ? (
              <Link href={pageMeta.action.href} className="inline-flex">
                <Button>
                  <FilePenLine className="h-4 w-4" />
                  {pageMeta.action.label}
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <Card className="space-y-5 p-4 md:p-5 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(10,18,33,0.97),rgba(12,21,36,0.94))] dark:shadow-[0_30px_64px_-38px_rgba(2,6,23,0.9)]">
            <div className="rounded-[1.7rem] border border-border/65 bg-background/78 p-4 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(16,25,41,0.86),rgba(13,20,35,0.76))]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[#f3efbb] text-sm font-semibold text-[#4f676d] shadow-[0_16px_28px_-24px_rgba(74,99,101,0.58)] dark:bg-[linear-gradient(135deg,rgba(236,225,177,0.96),rgba(111,215,204,0.7))] dark:text-[#0f1f2d] dark:shadow-[0_18px_32px_-26px_rgba(2,6,23,0.85)]">
                  {initialLetters(user?.nickname || user?.username || "admin")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user?.nickname || user?.username || "管理员"}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#4dcfc4]" />
                    <span>{user?.role || "ADMIN"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">后台已登录</Badge>
                <Badge variant="outline">JWT 鉴权</Badge>
              </div>
            </div>

            <div className="space-y-4">
              {adminNavGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                  <p className="px-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    {group.title}
                  </p>
                  <nav className="space-y-2">
                    {group.items.map((item) => {
                      const active = isNavItemActive(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-start gap-3 rounded-[1.4rem] border border-transparent px-4 py-3 transition-all duration-300",
                            active
                              ? "bg-white/80 text-foreground shadow-[0_18px_32px_-28px_rgba(67,116,117,0.48)] dark:border-[#4dcfc4]/16 dark:bg-[linear-gradient(135deg,rgba(28,43,66,0.94),rgba(16,25,40,0.94))] dark:text-slate-100 dark:shadow-[0_26px_44px_-34px_rgba(2,6,23,0.86)]"
                              : "text-muted-foreground hover:bg-background/70 hover:text-foreground dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-100",
                          )}
                        >
                          <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 opacity-80">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a href="/articles" target="_blank" rel="noreferrer" className="inline-flex">
                <Button variant="ghost" className="w-full justify-between rounded-[1rem] px-4">
                  查看公开文章页
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between rounded-[1rem] px-4",
                  adminDangerGhostButtonClassName,
                )}
                onClick={handleLogout}
                disabled={isPending}
              >
                退出登录
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </aside>

        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  );
}
