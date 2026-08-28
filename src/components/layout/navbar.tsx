"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Archive,
  ArrowUpRight,
  BookOpenText,
  FolderKanban,
  Info,
  LibraryBig,
  LockKeyhole,
  Menu,
  NotebookPen,
  Search,
  Sprout,
  X,
  type LucideIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { HOME_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SiteInfo } from "@/types";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/articles": BookOpenText,
  "/diaries": NotebookPen,
  "/projects": FolderKanban,
  "/resources": LibraryBig,
  "/archives": Archive,
  "/about": Info
};

const COMPACT_HEADER_ENTER_SCROLL_Y = 64;
const COMPACT_HEADER_EXIT_SCROLL_Y = 8;

export function Navbar({ siteInfo }: { siteInfo: SiteInfo }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brandLogoFailed, setBrandLogoFailed] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const isAdmin = pathname.startsWith("/admin");
  const isWriteStudio = pathname.startsWith("/write");
  const brandLogoSrc = siteInfo.logo || "";

  const isNavItemActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const onScroll = () => {
      setScrolled((current) => {
        const threshold = current
          ? COMPACT_HEADER_EXIT_SCROLL_Y
          : COMPACT_HEADER_ENTER_SCROLL_Y;

        return window.scrollY > threshold;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    setBrandLogoFailed(false);
  }, [brandLogoSrc]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((element) => !element.hasAttribute("hidden"));
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => menuButton?.focus());
    };
  }, [open]);

  if (isAdmin || isWriteStudio) return null;

  return (
    <>
      <header
        className={cn(
          "catalog-header sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "catalog-header--scrolled border-[color:var(--catalog-line)]"
            : "border-transparent"
        )}
      >
        <div
          className={cn(
            "catalog-header-inner mx-auto flex w-full max-w-[1568px] items-center justify-between gap-5 px-5 transition-[height] duration-300 md:px-7 xl:px-10",
            scrolled ? "h-[5.25rem]" : "h-[6.75rem]"
          )}
        >
          <Link
            href="/"
            aria-label="返回首页"
            className="group flex min-w-0 shrink-0 items-center gap-3.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--catalog-cobalt)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--catalog-paper)]"
          >
            <span className="catalog-brand-mark relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-[color:var(--catalog-ink)] bg-[var(--catalog-card)] text-[var(--catalog-ink)] transition-transform duration-300 group-hover:-rotate-2">
              {brandLogoSrc && !brandLogoFailed ? (
                <Image
                  src={brandLogoSrc}
                  alt={`${siteInfo.siteName || "Study Garden"} logo`}
                  fill
                  sizes="(max-width: 767px) 44px, 56px"
                  className="object-cover"
                  unoptimized
                  priority
                  onError={() => setBrandLogoFailed(true)}
                />
              ) : (
                <Sprout aria-hidden="true" className="h-8 w-8 stroke-[1.6]" />
              )}
            </span>
            <span className="catalog-brand-copy min-w-0">
              <span className="block truncate font-[var(--font-catalog-display)] text-[1.65rem] font-bold leading-none text-[var(--catalog-ink)]">
                {siteInfo.siteName || "我的学习日记"}
              </span>
              <span className="mt-1 block font-[var(--font-display)] text-[0.9rem] font-semibold text-[var(--catalog-ink)]">
                Study Garden
              </span>
            </span>
          </Link>

          <nav aria-label="主导航" className="hidden min-w-0 flex-1 items-stretch justify-center self-stretch lg:flex">
            {HOME_NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "catalog-nav-link group relative flex min-w-[4.9rem] items-center justify-center px-3 text-[0.86rem] font-medium tracking-[0.06em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--catalog-cobalt)] xl:min-w-[5.6rem] xl:px-4",
                    active ? "text-[var(--catalog-ink)]" : "text-[var(--catalog-ink-soft)]"
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-[3px] origin-left bg-[var(--catalog-cobalt)] transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/search"
              aria-label="站内搜索"
              title="站内搜索"
              className="catalog-search-trigger"
            >
              <Search aria-hidden="true" className="h-5 w-5 stroke-[1.8]" />
              <span>搜索</span>
            </Link>
            <Link
              href="/admin/login"
              aria-label="进入后台管理"
              title="后台管理"
              className="catalog-icon-button hidden sm:inline-flex"
            >
              <LockKeyhole aria-hidden="true" className="h-[1.05rem] w-[1.05rem] stroke-[1.8]" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="打开目录"
              aria-expanded={open}
              aria-controls="catalog-mobile-menu"
              className="catalog-icon-button catalog-menu-trigger lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="catalog-mobile-menu"
            className="fixed inset-0 z-[70] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <button
              type="button"
              aria-label="关闭目录"
              className="absolute inset-0 bg-[rgba(21,56,47,0.2)]"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="移动端主导航"
              className="absolute inset-y-0 right-0 flex w-[min(90vw,26rem)] flex-col border-l border-[color:var(--catalog-line-strong)] bg-[var(--catalog-paper)] shadow-[-24px_0_70px_rgba(51,43,31,0.2)]"
              initial={{ x: reduceMotion ? 0 : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: reduceMotion ? 0 : "100%" }}
              transition={{ type: "spring", stiffness: 310, damping: 32, duration: reduceMotion ? 0 : undefined }}
            >
              <div className="flex h-[5.5rem] items-center justify-between border-b border-[color:var(--catalog-line)] px-5">
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[var(--catalog-red)]">Index / 目录</p>
                  <p className="mt-1 text-xs text-[var(--catalog-ink-soft)]">六个入口，继续探索</p>
                </div>
                <button autoFocus type="button" aria-label="关闭目录" className="catalog-icon-button" onClick={() => setOpen(false)}>
                  <X aria-hidden="true" className="h-[1.15rem] w-[1.15rem] stroke-[1.8]" />
                </button>
              </div>

              <nav aria-label="移动端主导航" className="flex-1 overflow-y-auto px-5 py-7">
                <ol className="divide-y divide-[color:var(--catalog-line)] border-y border-[color:var(--catalog-line)]">
                  {HOME_NAV_ITEMS.map((item, index) => {
                    const active = isNavItemActive(item.href);
                    const Icon = NAV_ICONS[item.href];
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 py-[1.125rem] text-[var(--catalog-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--catalog-cobalt)]",
                            active && "text-[var(--catalog-cobalt)]"
                          )}
                        >
                          <span className="flex h-9 w-9 items-center justify-center border border-[color:var(--catalog-line)] bg-[var(--catalog-card)]">
                            <Icon aria-hidden="true" className="h-4 w-4 stroke-[1.7]" />
                          </span>
                          <span>
                            <span className="block text-[1rem] font-semibold tracking-[0.04em]">{item.label}</span>
                            <span className="mt-0.5 block font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--catalog-ink-soft)]">
                              Section {String(index + 1).padStart(2, "0")}
                            </span>
                          </span>
                          <ArrowUpRight aria-hidden="true" className="h-4 w-4 stroke-[1.6] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div className="grid gap-2 border-t border-[color:var(--catalog-line)] p-5">
                <Link href="/search" className="catalog-search-link">
                  <Search aria-hidden="true" className="h-4 w-4 stroke-[1.8]" />
                  <span>搜索站内内容</span>
                  <span className="ml-auto font-mono text-[0.58rem] uppercase tracking-[0.14em]">Search</span>
                </Link>
                <Link href="/admin/login" className="catalog-search-link">
                  <LockKeyhole aria-hidden="true" className="h-4 w-4 stroke-[1.8]" />
                  <span>进入后台管理</span>
                  <span className="ml-auto font-mono text-[0.58rem] uppercase tracking-[0.14em]">Admin</span>
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
