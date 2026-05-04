import type { Metadata } from "next";
import {
  BrainCircuit,
  Code2,
  Compass,
  Heart,
  Sparkles,
  Waypoints
} from "lucide-react";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { PageHero } from "@/components/sections/page-hero";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSiteInfo } from "@/lib/api";

export const metadata: Metadata = {
  title: "关于"
};

const heroMetrics = [
  {
    label: "Writing Rhythm",
    value: "随缘更新",
    description: "随着我的心情更新，不强求频率，但希望能保持内容的持续积累。"
  },
  {
    label: "Build Direction",
    value: "内容型博客",
    description: "更关注阅读体验、结构秩序和个人表达，而不是功能堆叠。"
  },
  {
    label: "Current Focus",
    value: "前后端协作",
    description: "在设计感与工程细节之间找到一个耐看、可维护的平衡。"
  }
];

const profileSections = [
  {
    title: "简介",
    icon: Sparkles,
    items: [
      "网站的契机源于计网的一次作业，从购买云服务器，到购买域名，再到配置DNS，一步步搭建了这个站点",
      "我对这个网站感到欣喜又沮丧，欣喜的是它像一个我亲手创造出来的孩子，沮丧的是我无法完全理解它"
    ]
  },
  {
    title: "技术方向",
    icon: Code2,
    items: [
      "Java 后端开发、Spring Boot 与接口协作",
      "数据库结构、后台配置与个人知识组织",
      "最重要的是： Codex, ChatGPT and prompt engineering"
    ]
  },
  {
    title: "个人兴趣",
    icon: Heart,
    items: [
      "空洞骑士、Counter Strike等游戏",
      "闲着没事干就喜欢构建自己的小网站",
      "想学前端，想自己搭建一套完美的网页"
    ]
  }
];

const focusAreas = [
  {
    title: "站点体验",
    description: "让公开页面既有阅读感，也保留一点克制、柔和的个人气质。",
    icon: Compass
  },
  {
    title: "工程协作",
    description: "持续打磨前后端接口、后台配置和页面实现之间的协作效率。",
    icon: Waypoints
  },
  {
    title: "知识沉淀",
    description: "把学习过程拆成可以复盘、可以迭代、也更适合分享的内容单元。",
    icon: BrainCircuit
  }
];

const timeline = [
  {
    year: "2024",
    title: "开始认真整理学习记录",
    text: "把原本分散的笔记慢慢收拢，尝试用更稳定的方式记录每天学到的东西。"
  },
  {
    year: "2025",
    title: "把项目与写作放到同一空间",
    text: "不再把文章、日记和项目拆开看，而是开始搭建一条彼此能呼应的内容脉络。"
  },
  {
    year: "2026",
    title: "搭建自己的学习博客",
    text: "开始真正把前台展示、后台配置和长期表达连接起来，希望它能一直慢慢长大。"
  }
];

const aboutCardClassName =
  "page-panel rounded-2xl border border-border/70 bg-card/84 shadow-[0_22px_45px_-34px_rgba(62,73,96,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_52px_-34px_rgba(62,73,96,0.4)]";

export default async function AboutPage() {
  const siteInfo = await getSiteInfo();

  return (
    <div className="page-shell">
      <div className="space-y-6">
        <PageHero
          eyebrow="About This Site"
          title="关于"
          description="这里更像一份持续更新的自我说明书。它记录我正在学什么、如何搭这座博客，以及我希望这片空间慢慢长成什么样子。"
        />

        <Card className={`${aboutCardClassName} overflow-hidden p-6 md:p-8`}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:items-end">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="page-section-kicker">Personal Overview</p>
                <h2 className="whitespace-nowrap text-[1.9rem] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground md:text-[2.5rem]">
                  一个把学习、项目与写作慢慢织在一起的人
                </h2>
                <p className="max-w-3xl text-[1rem] leading-8 text-[hsl(var(--foreground)/0.76)] md:text-[1.04rem]">
                  {"想把内容做得更耐读一些，也想把个人站点做得更像一个会长期呼吸的空间。"}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {heroMetrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/65 bg-white/58 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:bg-white/[0.03]"
                  >
                    <p className="page-card-kicker">{item.label}</p>
                    <p className="mt-3 text-[1.15rem] font-semibold tracking-[-0.02em] text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(247,250,247,0.5))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
              <p className="page-card-kicker">Site Note</p>
              <p className="mt-4 text-[1rem] leading-8 text-[hsl(var(--foreground)/0.75)]">
                这是一次尝试，一次实验，一次可行性验证
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Badge variant="secondary" className="page-chip">
                  简洁
                </Badge>
                <Badge variant="secondary" className="page-chip">
                  克制
                </Badge>
                <Badge variant="secondary" className="page-chip">
                  阅读型
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <Card className={`${aboutCardClassName} p-6 md:p-8`}>
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <p className="page-section-kicker">About Me</p>
                <h2 className="text-[1.55rem] font-semibold tracking-[-0.025em] text-foreground md:text-[1.9rem]">
                  现实生活中的我
                </h2>
                <p className="text-[0.98rem] leading-8 text-muted-foreground">
                  除了技术栈和经历，我更想保留做这个站点时的判断、兴趣和长期方向。
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {profileSections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <div
                      key={section.title}
                      className="rounded-2xl border border-border/65 bg-accent/52 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.48)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/82 text-[#5abeb9] shadow-[0_16px_26px_-22px_rgba(80,138,134,0.45)] dark:bg-white/8 dark:text-[#86ddd5]">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <p className="text-[1rem] font-semibold tracking-[-0.01em] text-foreground">
                          {section.title}
                        </p>
                      </div>

                      <div className="mt-4 space-y-3">
                        {section.items.map((item) => (
                          <p key={item} className="text-sm leading-7 text-[hsl(var(--foreground)/0.75)]">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className={`${aboutCardClassName} p-6 md:p-8`}>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="page-section-kicker">Long Form</p>
                <h2 className="text-[1.45rem] font-semibold tracking-[-0.025em] text-foreground md:text-[1.8rem]">
                  一些补充
                </h2>
                <p className="text-[0.98rem] leading-8 text-muted-foreground">
                  钱塘江上潮信来，今日方知我是我
                </p>
              </div>
              <div className="prose max-w-none 
                  prose-p:text-lg md:prose-p:text-xl
                  prose-p:leading-relaxed prose-p:tracking-wide

                  prose-h2:mb
                  prose-p:mt

                  rounded-2xl bg-white/56 p-5
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.46)]
                  dark:prose-invert dark:bg-white/[0.03] md:p-6">
                <MarkdownRenderer content={siteInfo.aboutMeMd || "暂无关于说明。"} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* <Card className={`${aboutCardClassName} p-5 md:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="page-section-kicker">Stack</p>
                <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.02em] text-foreground">
                  当前常用工具
                </h3>
              </div>
              <span className="inline-flex rounded-full border border-border/70 bg-white/72 px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground dark:bg-white/[0.03]">
                Toolkit
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {stacks.map((stack) => {
                const Icon = stack.icon;

                return (
                  <Badge
                    key={stack.label}
                    variant="secondary"
                    className="page-chip inline-flex items-center gap-2 rounded-full border border-border/65 bg-white/72 px-3.5 py-2 text-[0.82rem] text-foreground shadow-sm dark:bg-white/[0.04]"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#63c9c1] dark:text-[#86ddd5]" />
                    {stack.label}
                  </Badge>
                );
              })}
            </div>
          </Card> */}

          <Card className={`${aboutCardClassName} p-5 md:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="page-section-kicker">Focus</p>
                <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.02em] text-foreground">
                  最近更在意的事
                </h3>
              </div>
              <span className="inline-flex rounded-full border border-border/70 bg-[#e8fbf7] px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#51b7b0] dark:bg-[#123436] dark:text-[#87ddd6]">
                Ongoing
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {focusAreas.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border/65 bg-accent/56 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/84 text-[#5dc5bd] shadow-[0_14px_24px_-22px_rgba(80,138,134,0.5)] dark:bg-white/8 dark:text-[#86ddd5]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="space-y-1.5">
                        <p className="text-[0.98rem] font-semibold tracking-[-0.01em] text-foreground">
                          {item.title}
                        </p>
                        <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className={`${aboutCardClassName} p-5 md:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="page-section-kicker">Timeline</p>
                <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.02em] text-foreground">
                  这座站点的生长线
                </h3>
              </div>
              <span className="inline-flex rounded-full border border-border/70 bg-white/72 px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground dark:bg-white/[0.03]">
                2024-2026
              </span>
            </div>

            <div className="relative mt-5 space-y-5 pl-4">
              <span className="pointer-events-none absolute bottom-2 left-[0.62rem] top-2 w-px bg-[linear-gradient(180deg,rgba(93,196,187,0.55),rgba(93,196,187,0.1))]" />
              {timeline.map((item) => (
                <div key={item.year} className="relative pl-5">
                  <span className="absolute left-[-0.05rem] top-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#61cdc4] shadow-[0_0_0_4px_rgba(97,205,196,0.14)] dark:border-[#08121f]" />
                  <div className="rounded-2xl border border-border/65 bg-accent/56 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="page-card-kicker text-[#5dc5bd] dark:text-[#87ddd6]">{item.year}</p>
                      <Badge variant="secondary" className="page-chip px-2.5 py-1 text-[0.74rem]">
                        Milestone
                      </Badge>
                    </div>
                    <p className="mt-3 text-[0.98rem] font-semibold tracking-[-0.01em] text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
