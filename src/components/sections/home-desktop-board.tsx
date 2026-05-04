"use client";

import dayjs, { type Dayjs } from "dayjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookText,
  ChevronLeft,
  ChevronRight,
  Globe2,
  PanelsTopLeft,
  PenLine,
  Sparkles,
  Star,
  UserCircle2
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { HomeMusicPlayer } from "@/components/sections/home-music-player";
import { cn } from "@/lib/utils";
import type { Article, HomeMusic, Project, ResourceCollection, SiteInfo } from "@/types";

interface HomeDesktopBoardProps {
  siteInfo: SiteInfo;
  latestArticle: Article;
  featuredProject?: Project;
  resourceCollection?: ResourceCollection;
  currentMusic?: HomeMusic | null;
  initialNowIso: string;
  displayName?: string;
}

const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];

const HOME_COLLAGE_IMAGE_URL =
  "https://myblogbucket.oss-cn-hongkong.aliyuncs.com/blog/site/home/IMG_20260217_151245.jpg";

const socialChipThemes: Record<
  string,
  {
    glyph: string;
    eyebrow: string;
    accent: string;
  }
> = {
  github: {
    glyph: "GH",
    eyebrow: "Code",
    accent: "#8c96ff"
  },
  bilibili: {
    glyph: "BL",
    eyebrow: "Video",
    accent: "#de8dad"
  },
  xiaohongshu: {
    glyph: "红",
    eyebrow: "Notes",
    accent: "#ef8b93"
  },
  email: {
    glyph: "@",
    eyebrow: "Mail",
    accent: "#58cabe"
  }
};

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getGreeting(hour: number) {
  if (hour < 6) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function buildMonthCells(now: Dayjs) {
  const start = now.startOf("month");
  const daysInMonth = now.daysInMonth();
  const offset = (start.day() + 6) % 7;
  const cells: Array<number | null> = [];

  for (let index = 0; index < offset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push(null);
  }

  return cells;
}

function formatPrimaryTime(now: Dayjs, use24Hour: boolean) {
  return now.format(use24Hour ? "HH:mm" : "hh:mm");
}

function DesktopWidget({
  className,
  motionClassName,
  children
}: {
  className?: string;
  motionClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative", motionClassName)}>
      <motion.section
        whileHover={{
          y: -6,
          scale: 1.015,
          transition: { duration: 0.16, delay: 0, ease: [0.22, 1, 0.36, 1] }
        }}
        whileTap={{
          scale: 1.01,
          transition: { duration: 0.08, delay: 0, ease: [0.22, 1, 0.36, 1] }
        }}
        className={cn(
          "frost-panel group relative overflow-hidden rounded-[2rem] transition-shadow duration-300 hover:z-10 hover:shadow-[0_26px_44px_-30px_rgba(89,111,112,0.36)] dark:hover:shadow-[0_28px_46px_-28px_rgba(2,6,23,0.74)]",
          className,
        )}
      >
        {children}
      </motion.section>
    </div>
  );
}

function SocialChip({
  floatId,
  href,
  label,
  accent,
  dark,
  motionClassName
}: {
  floatId: string;
  href?: string;
  label: string;
  accent?: string;
  dark?: boolean;
  motionClassName?: string;
}) {
  const theme = socialChipThemes[floatId] ?? {
    glyph: label.slice(0, 1).toUpperCase(),
    eyebrow: "Link",
    accent: accent || "#76ddd3"
  };
  const resolvedAccent = accent || theme.accent;
  const isGithub = floatId === "github";

  const cardStyle: CSSProperties = {
    borderColor: dark ? (isGithub ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.16)") : withAlpha(resolvedAccent, 0.15),
    boxShadow: dark
      ? `0 20px 36px -28px rgba(2, 6, 23, 0.82), inset 0 1px 0 rgba(255,255,255,${isGithub ? 0.11 : 0.07})`
      : "0 18px 34px -28px rgba(91, 111, 112, 0.22), inset 0 1px 0 rgba(255,255,255,0.82)"
  };
  const circleStyle: CSSProperties = {
    background: `radial-gradient(circle at 34% 30%, ${withAlpha(resolvedAccent, dark ? 0.18 : 0.16)}, ${withAlpha(resolvedAccent, dark ? 0.1 : 0.1)} 48%, transparent 72%)`,
    borderColor: withAlpha(resolvedAccent, dark ? 0.14 : 0.12)
  };
  const topHighlightStyle: CSSProperties = {
    background: isGithub
      ? `linear-gradient(90deg, transparent 6%, rgba(255,255,255,0.34) 27%, ${withAlpha(resolvedAccent, 0.24)} 52%, rgba(255,255,255,0.16) 74%, transparent 96%)`
      : `linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.22) 28%, ${withAlpha(resolvedAccent, dark ? 0.2 : 0.18)} 52%, rgba(255,255,255,0.12) 74%, transparent 94%)`
  };
  const badgeStyle: CSSProperties = {
    backgroundColor: dark ? withAlpha(resolvedAccent, 0.16) : withAlpha(resolvedAccent, 0.1),
    borderColor: withAlpha(resolvedAccent, dark ? 0.24 : 0.2),
    color: dark ? "#f8fafc" : resolvedAccent
  };

  const className = cn(
    "group/social relative inline-flex h-[5.15rem] w-full min-w-0 overflow-hidden rounded-[1.35rem] border px-3 py-2.5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-24px_rgba(89,111,112,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fe3da]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:hover:shadow-[0_28px_46px_-22px_rgba(2,6,23,0.86)] md:px-3.5",
    dark
      ? "bg-[linear-gradient(180deg,rgba(25,28,37,0.96),rgba(15,18,27,0.94))] text-white dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(7,12,24,0.94))] dark:text-slate-100"
      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.76))] text-[#5b6f75] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.8))] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(17,24,39,0.88),rgba(15,23,42,0.84))] dark:text-slate-100 dark:hover:bg-[linear-gradient(180deg,rgba(21,31,49,0.92),rgba(18,27,45,0.88))]",
  );
  const content = (
    <span className="relative flex h-full w-full flex-col justify-between">
      <span
        className="pointer-events-none absolute inset-x-3 top-0 h-px opacity-80 transition-opacity duration-300 group-hover/social:opacity-100"
        style={topHighlightStyle}
      />
      <span
        className="pointer-events-none absolute -right-3 -top-6 h-16 w-16 rounded-full border transition-opacity duration-300 group-hover/social:opacity-100"
        style={circleStyle}
      />
      <span className="relative flex items-start justify-between gap-2">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-[0.95rem] border text-[0.68rem] font-semibold tracking-[0.05em] transition-transform duration-300 group-hover/social:scale-[0.96]"
          style={badgeStyle}
        >
          {theme.glyph}
        </span>
        <span
          className={cn(
            "pt-1 text-[0.52rem] font-semibold uppercase tracking-[0.14em]",
            dark ? "text-white/55" : "text-[#99a9ad] dark:text-slate-400/90",
          )}
        >
          {theme.eyebrow}
        </span>
      </span>
      <span className="relative flex items-end justify-between gap-2.5">
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate text-[0.84rem] font-semibold tracking-[-0.01em]",
              dark ? "text-white" : "text-[#405a61] dark:text-slate-50",
            )}
          >
            {label}
          </span>
        </span>
        <ArrowUpRight
          className={cn(
            "mb-0.5 h-3.5 w-3.5 shrink-0 transition-all duration-300 group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5",
            dark ? "text-white/34 group-hover/social:text-white/72" : "text-[#8da2a7] group-hover/social:text-[#5fced0] dark:text-slate-500 dark:group-hover/social:text-[#76ddd3]",
          )}
        />
      </span>
    </span>
  );

  if (!href) {
    return (
      <div className={motionClassName}>
        <motion.div
          style={cardStyle}
          whileHover={{ scale: 1.02 }}
          className={className}
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={motionClassName}>
      <motion.a
        style={cardStyle}
        whileHover={{ scale: 1.02 }}
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {content}
      </motion.a>
    </div>
  );
}

export function HomeDesktopBoard({
  siteInfo,
  latestArticle,
  featuredProject,
  resourceCollection,
  currentMusic,
  initialNowIso,
  displayName = "wwt"
}: HomeDesktopBoardProps) {
  const [now, setNow] = useState(() => dayjs(initialNowIso));
  const [use24HourClock, setUse24HourClock] = useState(true);
  const [calendarView, setCalendarView] = useState(() => dayjs(initialNowIso).startOf("month"));
  const [calendarDirection, setCalendarDirection] = useState<1 | -1>(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(() => dayjs(initialNowIso).date());
  const [profileAvatarFailed, setProfileAvatarFailed] = useState(false);
  const profileAvatarSrc = siteInfo.avatar || "";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(dayjs()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setProfileAvatarFailed(false);
  }, [profileAvatarSrc]);

  const greeting = getGreeting(now.hour());
  const calendarCells = useMemo(() => buildMonthCells(calendarView), [calendarView]);
  const recommendedItem = resourceCollection?.items?.[0];
  const recommendedHref = recommendedItem?.linkUrl
    || (resourceCollection ? `/resources#${resourceCollection.slug}` : undefined)
    || (featuredProject ? `/projects/${featuredProject.slug}` : "/resources");
  const recommendedExternal = Boolean(recommendedItem?.linkUrl);
  const isCurrentMonthView = calendarView.isSame(now, "month");
  const primaryTime = formatPrimaryTime(now, use24HourClock);
  const timePeriodLabel = use24HourClock ? "24H" : now.format("A");
  const timeZoneLabel = "Asia/Shanghai · UTC+8";
  const calendarTitle = calendarView.format("YYYY年M月");
  const calendarSubtitle = isCurrentMonthView
    ? `${now.format("YYYY/M/D")} · 周${weekLabels[(now.day() + 6) % 7]}`
    : `${calendarView.daysInMonth()} days in view`;

  useEffect(() => {
    if (isCurrentMonthView) {
      setSelectedDay(now.date());
    }
  }, [isCurrentMonthView, now]);

  const navCards = [
    { href: "/articles", label: "近期文章", icon: BookText, active: true },
    { href: "/projects", label: "我的项目", icon: PanelsTopLeft },
    { href: "/about", label: "关于网站", icon: UserCircle2 },
    { href: "/resources", label: "推荐分享", icon: Star },
    { href: "/bloggers", label: "优秀博主", icon: Globe2 }
  ];

  const handleMonthChange = (direction: 1 | -1) => {
    setCalendarDirection(direction);
    setCalendarView((current) => current.add(direction, "month").startOf("month"));
  };

  const handleReturnToCurrentMonth = () => {
    setCalendarDirection(now.isAfter(calendarView, "month") ? 1 : -1);
    setCalendarView(now.startOf("month"));
    setSelectedDay(now.date());
  };

  return (
    <div className="font-ui relative isolate pb-14 pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[980px] overflow-hidden rounded-[3.5rem]">
        <div className="absolute left-[14%] top-[17rem] h-[20rem] w-[20rem] rounded-full bg-[#f4d84f]/26 blur-[104px] dark:bg-[#14b8a6]/7" />
        <div className="absolute right-[-1%] top-[8rem] h-[24rem] w-[24rem] rounded-full bg-[#f4d84f]/38 blur-[126px] dark:bg-[#f59e0b]/12" />
        <div className="absolute left-[-4%] bottom-[3rem] h-[24rem] w-[24rem] rounded-full bg-[#2fcfc2]/38 blur-[124px] dark:bg-[#2dd4bf]/14" />
        <div className="absolute left-[34%] bottom-[6rem] h-[16rem] w-[16rem] rounded-full bg-[#9fe7dc]/22 blur-[92px] dark:bg-[#34d399]/6" />
      </div>

      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,430px)_minmax(0,390px)] xl:items-start">
          <div className="space-y-6">
            <DesktopWidget className="p-7" motionClassName="float-gentle">
              <div className="flex items-start gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff2ad] text-lg font-semibold text-[#486068] shadow-[0_18px_30px_-26px_rgba(89,109,111,0.7)] transition-transform duration-300 group-hover:scale-[0.96] dark:bg-[#fde68a] dark:text-slate-900">
                  {profileAvatarSrc && !profileAvatarFailed ? (
                    <Image
                      src={profileAvatarSrc}
                      alt={`${siteInfo.siteName || displayName} avatar`}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                      onError={() => setProfileAvatarFailed(true)}
                    />
                  ) : (
                    displayName.toUpperCase().slice(0, 1)
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="home-brand-text truncate text-[2.2rem] md:text-[2.32rem]">
                      {displayName}
                    </h1>
                    <span className="home-card-meta font-medium tracking-[0.08em] text-[#60cbc4] dark:text-[#76ddd3]">
                      更新中
                    </span>
                  </div>
                  <p className="home-card-kicker">
                    {siteInfo.announcement || "General"}
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-2.5">
                {navCards.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 rounded-[1.5rem] px-4 py-4 transition-all duration-300 hover:scale-[1.03]",
                      item.active
                        ? "bg-white/80 text-[#39c8bf] shadow-[0_18px_34px_-28px_rgba(71,116,118,0.5)] dark:border dark:border-white/10 dark:bg-[#0f172a] dark:text-[#76ddd3] dark:shadow-[0_24px_40px_-28px_rgba(2,6,23,0.86)]"
                        : "text-[#778b93] hover:bg-white/56 hover:text-[#395b62] dark:text-slate-300/80 dark:hover:bg-white/5 dark:hover:text-slate-100",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="home-nav-text">{item.label}</span>
                  </Link>
                ))}
              </div>
            </DesktopWidget>

            <DesktopWidget className="min-h-[250px] p-6" motionClassName="float-gentle-delay">
              <Link
                href={`/articles/${latestArticle.slug}`}
                className="relative block h-full rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fe3da]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label={`阅读最新文章：${latestArticle.title}`}
              >
                <p className="home-card-kicker">最新文章</p>
                <ArrowUpRight className="absolute right-0 top-0 h-4 w-4 text-[#8da2a7] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#5fced0] dark:text-slate-500 dark:group-hover:text-[#76ddd3]" />
                <div className="mt-4 flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] bg-white/72 transition-transform duration-300 group-hover:scale-[0.96] dark:bg-[#0f172a]">
                    <Image
                      src={latestArticle.coverImage || "/images/article-pattern.svg"}
                      alt={latestArticle.title}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="home-card-title line-clamp-2 break-words transition-colors group-hover:text-[#2ea89d] dark:group-hover:text-[#76ddd3]">
                      {latestArticle.title}
                    </p>
                    <p className="home-card-body mt-2 line-clamp-3 break-words">
                      {latestArticle.summary}
                    </p>
                    <p className="home-card-meta home-number-text mt-3">
                      {dayjs(latestArticle.publishTime).format("YYYY/M/D")}
                    </p>
                  </div>
                </div>
              </Link>
            </DesktopWidget>
          </div>

          <div className="space-y-6">
            <DesktopWidget className="p-4" motionClassName="float-gentle-slow">
              <div className="relative h-[210px] overflow-hidden rounded-[1.7rem] bg-white/46 dark:bg-white/[0.03]">
                <Image
                  src={HOME_COLLAGE_IMAGE_URL}
                  alt={`${siteInfo.siteName} home collage`}
                  fill
                  priority
                  sizes="(min-width: 1280px) 430px, 100vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#fff6d9]/18 via-transparent to-white/12 dark:from-slate-950/28 dark:via-transparent dark:to-slate-950/10" />
              </div>
            </DesktopWidget>

            <DesktopWidget
              className="flex min-h-[382px] flex-col justify-center px-8 py-8 text-center md:px-9 md:py-9"
              motionClassName="float-gentle"
            >
              <p className="home-display-title text-balance">{greeting}</p>
              <p className="home-display-leading mx-auto mt-4 max-w-[11.4ch] text-balance">
                I&apos;m <span className="text-[#38c9c0] dark:text-[#76ddd3]">{displayName}</span>, nice to meet you!
              </p>
              <p className="home-card-body mx-auto mt-5 max-w-[22rem] text-balance break-words">
                {siteInfo.homeIntroText ||
                  "一个正在认真整理学习记录、项目想法和个人空间的人。首页会继续为后续的转场和点击动画预留结构。"}
              </p>
            </DesktopWidget>

            <div className="grid gap-6 pt-2 sm:grid-cols-[minmax(0,198px)_minmax(0,1fr)] sm:items-start">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <SocialChip
                  floatId="github"
                  href={siteInfo.githubUrl}
                  label="GitHub"
                  dark
                  motionClassName="float-gentle"
                />
                <SocialChip
                  floatId="bilibili"
                  href={siteInfo.bilibiliUrl}
                  label="Bilibili"
                  accent="#d86b99"
                  motionClassName="float-gentle-delay"
                />
                <SocialChip
                  floatId="xiaohongshu"
                  href={siteInfo.xiaohongshuUrl}
                  label="小红书"
                  accent="#dd6176"
                  motionClassName="float-gentle-slow"
                />
                <SocialChip
                  floatId="email"
                  href={siteInfo.email ? `mailto:${siteInfo.email}` : undefined}
                  label="邮箱"
                  accent="#46c0b8"
                  motionClassName="float-gentle"
                />
              </div>

              <DesktopWidget
                className="min-h-[196px] px-5 py-5 sm:px-5 sm:py-5 dark:border-white/12 dark:bg-[#111827]/92"
                motionClassName="float-gentle-delay"
              >
                {recommendedExternal ? (
                  <a
                    href={recommendedHref}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block h-full rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fe3da]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    aria-label={`打开随机推荐：${recommendedItem?.title || featuredProject?.name || "推荐资源"}`}
                  >
                    <p className="home-card-kicker text-[#67bdb7] dark:text-[#76ddd3]">随机推荐</p>
                    <ArrowUpRight className="absolute right-0 top-0 h-4 w-4 text-[#8da2a7] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#5fced0] dark:text-slate-500 dark:group-hover:text-[#76ddd3]" />
                    <div className="mt-4 flex gap-3.5">
                      <div className="flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center rounded-[1rem] bg-white/88 text-[#3dc9c1] shadow-[0_18px_30px_-24px_rgba(76,170,164,0.25)] transition-transform duration-300 group-hover:scale-[0.98] dark:bg-[#0f172a] dark:text-[#76ddd3] dark:shadow-[0_18px_30px_-24px_rgba(2,6,23,0.84)]">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <p className="home-card-title line-clamp-2 break-words text-[#2ea89d] dark:text-[#76ddd3]">
                          {recommendedItem?.title || featuredProject?.name || "学习空间组件整理"}
                        </p>
                        <p className="home-card-body line-clamp-2 break-words">
                          {recommendedItem?.summary ||
                            featuredProject?.summary ||
                            "先把视觉层级和桌面式信息块做稳，再把转场和点击反馈加进去。"}
                        </p>
                        <p className="home-card-meta line-clamp-1">个人学习博客后端 MVP</p>
                      </div>
                    </div>
                  </a>
                ) : (
                  <Link
                    href={recommendedHref}
                    className="relative block h-full rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fe3da]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    aria-label={`打开随机推荐：${recommendedItem?.title || featuredProject?.name || "推荐资源"}`}
                  >
                    <p className="home-card-kicker text-[#67bdb7] dark:text-[#76ddd3]">随机推荐</p>
                    <ArrowUpRight className="absolute right-0 top-0 h-4 w-4 text-[#8da2a7] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#5fced0] dark:text-slate-500 dark:group-hover:text-[#76ddd3]" />
                    <div className="mt-4 flex gap-3.5">
                      <div className="flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center rounded-[1rem] bg-white/88 text-[#3dc9c1] shadow-[0_18px_30px_-24px_rgba(76,170,164,0.25)] transition-transform duration-300 group-hover:scale-[0.98] dark:bg-[#0f172a] dark:text-[#76ddd3] dark:shadow-[0_18px_30px_-24px_rgba(2,6,23,0.84)]">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <p className="home-card-title line-clamp-2 break-words text-[#2ea89d] dark:text-[#76ddd3]">
                          {recommendedItem?.title || featuredProject?.name || "学习空间组件整理"}
                        </p>
                        <p className="home-card-body line-clamp-2 break-words">
                          {recommendedItem?.summary ||
                            featuredProject?.summary ||
                            "先把视觉层级和桌面式信息块做稳，再把转场和点击反馈加进去。"}
                        </p>
                        <p className="home-card-meta line-clamp-1">个人学习博客后端 MVP</p>
                      </div>
                    </div>
                  </Link>
                )}
              </DesktopWidget>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0 }}
              className="flex items-center justify-between gap-5 px-1"
            >
              <div className="float-gentle transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.03]">
                <Link
                  href="/write"
                  className="frost-chip home-button-text inline-flex h-[3.4rem] min-w-[150px] items-center justify-center gap-2 rounded-[1rem] bg-[#42d4c7]/95 px-5 text-white shadow-[0_16px_30px_-22px_rgba(61,191,183,0.72)] transition-all duration-300 hover:-translate-y-1 dark:border-[#2a6d6a] dark:bg-[#2ab9ae] dark:text-[#02131a] dark:shadow-[0_22px_40px_-22px_rgba(13,148,136,0.45)] dark:hover:bg-[#45d2c7]"
                >
                  <PenLine className="h-4 w-4" />
                  写文章
                </Link>
              </div>
              <div className="grid h-12 w-12 grid-cols-3 gap-1.5 opacity-45">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} className="h-1.5 w-1.5 rounded-full bg-[#cfd1d8] dark:bg-slate-500/80" />
                ))}
              </div>
            </motion.div>

            <DesktopWidget className="overflow-visible px-5 py-5 md:px-6 md:py-6" motionClassName="float-gentle-slow">
              <div className="home-widget-shell relative overflow-hidden rounded-[1.8rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.32))] px-5 py-5 shadow-[0_22px_48px_-34px_rgba(86,116,118,0.35)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(16,23,36,0.9),rgba(9,15,28,0.82))]">
                <span className="home-widget-overlay pointer-events-none absolute inset-0" />
                <span className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(94,224,210,0.26)_0%,rgba(94,224,210,0.08)_48%,transparent_76%)] dark:bg-[radial-gradient(circle,rgba(92,219,208,0.18)_0%,rgba(92,219,208,0.03)_54%,transparent_76%)]" />
                <span className="pointer-events-none absolute -left-8 bottom-2 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(249,220,126,0.22)_0%,rgba(249,220,126,0.04)_58%,transparent_76%)] blur-xl dark:bg-[radial-gradient(circle,rgba(241,196,89,0.12)_0%,rgba(241,196,89,0.02)_58%,transparent_76%)]" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="home-card-kicker text-[#78b6ba] dark:text-[#8cd9d0]">
                        Focus Clock
                      </p>
                      <p className="home-card-meta mt-1 text-[0.78rem]">
                        {now.format("YYYY/M/D")} · 周{weekLabels[(now.day() + 6) % 7]}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUse24HourClock((current) => !current)}
                      className="home-button-text rounded-full border border-white/80 bg-white/72 px-3.5 py-1.5 text-[0.76rem] text-[#54737a] shadow-[0_14px_24px_-22px_rgba(86,116,118,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#94e2d9]/80 hover:text-[#2f5d64] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-[#5fd0c8]/40 dark:hover:bg-white/10"
                      aria-label="切换 12 小时和 24 小时制"
                    >
                      {use24HourClock ? "24H" : "12H"}
                    </button>
                  </div>

                  <div className="mt-5">
                    <div className="min-w-0">
                      <motion.div
                        key={`${use24HourClock ? "24" : "12"}-${primaryTime}`}
                        initial={{ opacity: 0.6, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                        className="desktop-digits home-clock-digits whitespace-nowrap leading-[0.84] text-[4.55rem] font-semibold sm:text-[4.9rem] md:text-[5.2rem]"
                      >
                        {primaryTime}
                      </motion.div>
                      <div className="mt-3 flex flex-wrap items-center gap-2.5">
                        <motion.span
                          key={now.format("ss")}
                          initial={{ opacity: 0.45, y: 4, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                          className="home-clock-chip home-number-text"
                        >
                          {now.format("ss")}s
                        </motion.span>
                        <span className="home-clock-chip">{timePeriodLabel}</span>
                        <span className="home-card-meta text-[0.76rem] text-[#7c9096] dark:text-slate-400">
                          {timeZoneLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DesktopWidget>

            <DesktopWidget className="p-5 md:p-6" motionClassName="float-gentle-delay">
              <div className="home-widget-shell relative overflow-hidden rounded-[1.95rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0.3))] px-5 py-5 shadow-[0_24px_48px_-34px_rgba(86,116,118,0.35)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(16,23,36,0.9),rgba(10,15,27,0.84))]">
                <span className="home-widget-overlay pointer-events-none absolute inset-0" />
                <span className="pointer-events-none absolute inset-x-5 top-[5.5rem] h-px bg-[linear-gradient(90deg,transparent,rgba(129,160,166,0.4),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(108,130,151,0.28),transparent)]" />
                <span className="pointer-events-none absolute right-5 top-3 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(94,224,210,0.16)_0%,rgba(94,224,210,0.04)_54%,transparent_74%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(92,219,208,0.12)_0%,rgba(92,219,208,0.03)_54%,transparent_74%)]" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="home-card-kicker text-[#78b6ba] dark:text-[#8cd9d0]">
                        Calendar
                      </p>
                      <p className="home-calendar-title home-number-text mt-1">{calendarTitle}</p>
                      <p className="home-card-meta mt-1.5 text-[0.8rem]">{calendarSubtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isCurrentMonthView ? (
                        <button
                          type="button"
                          onClick={handleReturnToCurrentMonth}
                          className="home-button-text rounded-full border border-white/80 bg-white/68 px-3 py-1.5 text-[0.74rem] text-[#587179] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#94e2d9]/80 hover:text-[#2f5d64] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-[#5fd0c8]/40 dark:hover:bg-white/10"
                        >
                          今天
                        </button>
                      ) : null}
                      <div className="flex items-center gap-1 rounded-full border border-white/75 bg-white/64 p-1 shadow-[0_16px_28px_-24px_rgba(86,116,118,0.3)] dark:border-white/10 dark:bg-white/5">
                        <button
                          type="button"
                          onClick={() => handleMonthChange(-1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d7780] transition-all duration-300 hover:bg-white/80 hover:text-[#315a62] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                          aria-label="上个月"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMonthChange(1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d7780] transition-all duration-300 hover:bg-white/80 hover:text-[#315a62] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                          aria-label="下个月"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-7 gap-2 text-center">
                    {weekLabels.map((label, index) => (
                      <span
                        key={label}
                        className={cn(
                          "home-calendar-label rounded-full px-1 py-1 text-[0.92rem]",
                          index >= 5 ? "text-[#9ea88d] dark:text-[#bca87c]" : "",
                        )}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <motion.div
                    key={calendarView.format("YYYY-MM")}
                    initial={{ opacity: 0, x: calendarDirection > 0 ? 22 : -22 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-3 grid grid-cols-7 gap-2"
                  >
                    {calendarCells.map((day, index) => {
                      const weekIndex = index % 7;
                      const weekend = weekIndex >= 5;
                      const active = isCurrentMonthView && day === now.date();
                      const selected = day !== null && day === selectedDay;

                      if (day === null) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="flex h-12 items-center justify-center rounded-[1rem] border border-transparent bg-white/12 dark:bg-white/[0.02]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#d9ddde] opacity-45 dark:bg-slate-600/40" />
                          </div>
                        );
                      }

                      return (
                        <button
                          key={`${calendarView.format("YYYY-MM")}-${day}`}
                          type="button"
                          onClick={() => setSelectedDay(day)}
                          aria-label={`选择 ${calendarView.format("YYYY年M月")}${day} 日`}
                          className={cn(
                            "home-number-text group/day relative flex h-12 items-center justify-center rounded-[1rem] border text-[1rem] font-medium transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fe3da]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            weekend
                              ? "border-[#efe4cf] bg-[linear-gradient(180deg,rgba(255,248,235,0.82),rgba(255,252,246,0.62))] text-[#b39b77] hover:border-[#edd9b0] hover:text-[#94744c] dark:border-[#433825] dark:bg-[linear-gradient(180deg,rgba(42,35,24,0.28),rgba(18,22,35,0.12))] dark:text-[#ceb787] dark:hover:border-[#78603b]"
                              : "border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.54))] text-[#7f9197] hover:border-[#c9eae5] hover:text-[#47626a] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] dark:text-slate-300 dark:hover:border-[#335f61] dark:hover:text-white",
                            selected ? "shadow-[0_18px_30px_-24px_rgba(88,118,120,0.35)]" : "shadow-[0_12px_24px_-24px_rgba(88,118,120,0.2)]",
                            active
                              ? "border-transparent bg-[linear-gradient(135deg,#57ddd3,#35c4d9)] text-white shadow-[0_18px_30px_-16px_rgba(63,207,202,0.7)] dark:bg-[linear-gradient(135deg,#49d3c7,#2592c5)] dark:text-[#04131b]"
                              : "",
                            selected && !active
                              ? "border-[#9fe4da] bg-[linear-gradient(180deg,rgba(235,255,252,0.96),rgba(246,255,253,0.7))] text-[#2f6167] dark:border-[#2d7371] dark:bg-[linear-gradient(180deg,rgba(18,60,64,0.72),rgba(12,29,40,0.72))] dark:text-[#8ee1d7]"
                              : "",
                          )}
                        >
                          {active ? (
                            <span className="pointer-events-none absolute inset-[2px] rounded-[0.9rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />
                          ) : null}
                          <span className="relative z-[1]">{day}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </DesktopWidget>

            <DesktopWidget className="px-6 py-5" motionClassName="float-gentle">
              <HomeMusicPlayer music={currentMusic} />
            </DesktopWidget>
          </div>
        </div>
      </div>
    </div>
  );
}
