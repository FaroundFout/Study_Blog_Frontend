"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { HOME_NAV_ITEMS, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SiteInfo } from "@/types";

export function Navbar({ siteInfo }: { siteInfo: SiteInfo }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const isWriteStudio = pathname.startsWith("/write");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brandLogoFailed, setBrandLogoFailed] = useState(false);
  const brandLogoSrc = siteInfo.logo || "";
  const brandInitials =
    (siteInfo.siteName || "Study Garden")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item.slice(0, 1).toUpperCase())
      .join("") || "SG";
  const isNavItemActive = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const toolbarButtonClass =
    "h-11 w-11 rounded-full border border-white/70 bg-white/72 text-[#5d757d] shadow-[0_14px_28px_-22px_rgba(78,98,110,0.42)] backdrop-blur-md hover:-translate-y-0.5 hover:scale-[1.03] hover:border-[#cfe5e0] hover:bg-white/88 hover:text-[#314f58] hover:shadow-[0_18px_34px_-22px_rgba(78,98,110,0.48)] active:translate-y-0 active:scale-[0.97] active:shadow-[0_10px_20px_-18px_rgba(78,98,110,0.38)] dark:border-white/10 dark:bg-[#0f172a]/82 dark:text-slate-200 dark:shadow-[0_16px_30px_-22px_rgba(2,6,23,0.76)] dark:hover:border-[#28444a] dark:hover:bg-[#162033] dark:hover:text-white dark:hover:shadow-[0_22px_36px_-24px_rgba(2,6,23,0.84)] dark:active:shadow-[0_12px_22px_-18px_rgba(2,6,23,0.7)] md:h-12 md:w-12";
  const homeToolbarClass =
    "flex shrink-0 items-center gap-1.5 rounded-full border border-white/75 bg-white/42 p-1 shadow-[0_16px_30px_-24px_rgba(89,111,112,0.28)] backdrop-blur-xl dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,rgba(12,18,31,0.52),rgba(8,14,26,0.46))] dark:shadow-[0_18px_32px_-26px_rgba(2,6,23,0.78)]";
  const homeToolbarButtonClass =
    "h-11 w-11 rounded-full border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.14))] text-[#667d83] shadow-[0_10px_18px_-16px_rgba(88,108,112,0.18)] backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:scale-[1.03] hover:border-white/72 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(236,248,245,0.24))] hover:text-[#375860] hover:shadow-[0_14px_24px_-18px_rgba(88,108,112,0.24)] active:translate-y-0 active:scale-[0.98] active:bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(226,241,238,0.18))] active:shadow-[0_8px_14px_-14px_rgba(88,108,112,0.2)] dark:border-white/[0.05] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] dark:text-[rgba(226,232,240,0.68)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_10px_18px_-16px_rgba(2,6,23,0.72)] dark:hover:-translate-y-px dark:hover:scale-[1.03] dark:hover:border-white/[0.09] dark:hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(117,146,171,0.05))] dark:hover:text-[rgba(241,245,249,0.84)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_14px_22px_-18px_rgba(2,6,23,0.8)] dark:active:scale-[0.98] dark:active:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(96,120,144,0.04))] dark:active:shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_8px_14px_-14px_rgba(2,6,23,0.74)] md:h-[3.2rem] md:w-[3.2rem]";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    setBrandLogoFailed(false);
  }, [brandLogoSrc]);

  if (isAdmin || isWriteStudio) {
    return null;
  }

  if (isHome) {
    return (
      <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 rounded-full border border-white/80 bg-white/58 px-6 py-3.5 shadow-[0_16px_34px_-28px_rgba(89,111,112,0.35)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[rgba(9,16,30,0.78)] dark:shadow-[0_28px_52px_-34px_rgba(2,6,23,0.9)] md:gap-5">
          <Link href="/" className="min-w-0 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#f6efb0] text-base font-semibold text-[#456067] shadow-[0_16px_26px_-22px_rgba(89,111,112,0.45)]">
                {brandLogoSrc && !brandLogoFailed ? (
                  <Image
                    src={brandLogoSrc}
                    alt={`${siteInfo.siteName || "Study Garden"} logo`}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                    onError={() => setBrandLogoFailed(true)}
                  />
                ) : (
                  brandInitials
                )}
              </div>
              <div className="hidden sm:block">
                <p className="home-brand-text">{siteInfo.siteName || "Study Garden"}</p>
                <p className="home-card-meta mt-1">
                  {siteInfo.homeBrandLabel || siteInfo.siteSubtitle || "wwt home board"}
                </p>
              </div>
            </div>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center px-3 md:flex lg:px-6">
            <div className="flex items-center gap-4 lg:gap-6 xl:gap-8">
              {HOME_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "home-nav-text whitespace-nowrap transition-colors",
                    isNavItemActive(item.href)
                      ? "text-[#35565d] dark:text-slate-50"
                      : "text-[#6d858a] hover:text-[#35565d] dark:text-slate-300 dark:hover:text-slate-50",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className={homeToolbarClass}>
            <Link href="/search" className="hidden sm:inline-flex" title="搜索">
              <Button
                variant="secondary"
                size="icon"
                aria-label="搜索"
                className={homeToolbarButtonClass}
              >
                <Search className="h-[1.2rem] w-[1.2rem] stroke-[1.85] md:h-[1.35rem] md:w-[1.35rem]" />
              </Button>
            </Link>
            <ThemeToggle
              title="切换主题"
              className={homeToolbarButtonClass}
              iconClassName="h-[1.2rem] w-[1.2rem] stroke-[1.85] md:h-[1.35rem] md:w-[1.35rem]"
            />
            <Button
              variant="secondary"
              size="icon"
              className={cn("md:hidden", homeToolbarButtonClass)}
              aria-label="打开菜单"
              title="打开菜单"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? (
                <X className="h-[1.02rem] w-[1.02rem] stroke-[1.85]" />
              ) : (
                <Menu className="h-[1.02rem] w-[1.02rem] stroke-[1.85]" />
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto mt-3 max-w-[1280px] overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/68 p-3 shadow-[0_16px_34px_-28px_rgba(89,111,112,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1220]/84 dark:shadow-[0_24px_50px_-32px_rgba(2,6,23,0.86)] md:hidden"
            >
              <div className="flex flex-col gap-2">
                {HOME_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "home-nav-text rounded-[1rem] px-4 py-3 text-[0.95rem] transition-colors",
                      isNavItemActive(item.href)
                        ? "bg-white/60 text-[#35565d] dark:bg-white/5 dark:text-slate-50"
                        : "text-[#60797f] hover:bg-white/60 hover:text-[#35565d] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-50",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent transition-colors",
        scrolled ? "border-border/70 bg-background/88 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-5 py-4 md:px-7">
        <Link href="/" className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[1rem] border border-border/80 bg-card/95 text-sm font-semibold text-foreground shadow-[0_10px_24px_-22px_rgba(58,67,92,0.45)]">
              {brandLogoSrc && !brandLogoFailed ? (
                <Image
                  src={brandLogoSrc}
                  alt={`${siteInfo.siteName || "Study Garden"} logo`}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                  onError={() => setBrandLogoFailed(true)}
                />
              ) : (
                brandInitials
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{siteInfo.siteName || "Study Garden"}</p>
              <p className="text-xs text-muted-foreground">个人博客 / 学习记录</p>
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/56 p-1.5 shadow-[0_16px_34px_-26px_rgba(84,104,114,0.32)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1220]/72 dark:shadow-[0_20px_40px_-28px_rgba(2,6,23,0.82)] sm:flex">
            <Link href="/search" className="inline-flex" title="搜索">
              <Button variant="secondary" size="icon" aria-label="搜索" className={toolbarButtonClass}>
                <Search className="h-[1.05rem] w-[1.05rem] stroke-[1.9] md:h-[1.12rem] md:w-[1.12rem]" />
              </Button>
            </Link>
            <ThemeToggle
              title="切换主题"
              className={toolbarButtonClass}
              iconClassName="h-[1.05rem] w-[1.05rem] stroke-[1.9] md:h-[1.12rem] md:w-[1.12rem]"
            />
          </div>
          <ThemeToggle
            title="切换主题"
            className={cn("sm:hidden", toolbarButtonClass, "h-11 w-11 md:h-11 md:w-11")}
            iconClassName="h-[1.05rem] w-[1.05rem] stroke-[1.9]"
          />
          <Link href="/admin/login" className="hidden md:inline-flex">
            <Button variant="secondary">管理入口</Button>
          </Link>
          <Button
            variant="secondary"
            size="icon"
            className={cn("lg:hidden", toolbarButtonClass, "h-11 w-11 md:h-11 md:w-11")}
            aria-label="打开菜单"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <X className="h-[1.05rem] w-[1.05rem] stroke-[1.9]" />
            ) : (
              <Menu className="h-[1.05rem] w-[1.05rem] stroke-[1.9]" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/70 bg-background/94 lg:hidden"
          >
            <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-5 py-4 md:px-7">
              {NAV_ITEMS.map((item) => {
                const active = isNavItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-[1rem] px-4 py-3 text-sm transition-colors",
                      active
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
