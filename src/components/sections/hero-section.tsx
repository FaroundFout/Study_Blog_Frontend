"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Mail, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Article, SiteInfo } from "@/types";

interface HeroSectionProps {
  siteInfo: SiteInfo;
  featuredArticle: Article;
  counts: {
    articles: number;
    diaries: number;
    projects: number;
  };
}

export function HeroSection({ siteInfo, featuredArticle, counts }: HeroSectionProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            personal study blog
          </p>
          <div className="max-w-3xl space-y-4">
            <h1 className="text-[2.6rem] font-semibold leading-[1.08] text-foreground md:text-[4rem]">
              认真记录学习的人，
              <br />
              往往也会认真整理自己的站点。
            </h1>
            <p className="max-w-2xl text-sm leading-8 text-muted-foreground md:text-[15px]">
              {siteInfo.announcement}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/bloggers">
              <Button>看看友链墙</Button>
            </Link>
            <Link href="/articles">
              <Button variant="secondary">阅读文章</Button>
            </Link>
            <Link href="/search">
              <Button variant="outline">
                <Search className="h-4 w-4" />
                搜索内容
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
      >
        <Card className="grid gap-4 p-5 md:grid-cols-[1fr_1fr]">
          <div className="rounded-[1.45rem] border border-border/70 bg-accent/70 p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              站点状态
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  文章
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{counts.articles}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  日记
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{counts.diaries}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  项目
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{counts.projects}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-[13px] text-muted-foreground">
              {siteInfo.githubUrl ? (
                <a href={siteInfo.githubUrl} target="_blank" rel="noreferrer" className="subtle-link">
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              ) : null}
              {siteInfo.email ? (
                <a href={`mailto:${siteInfo.email}`} className="subtle-link">
                  <Mail className="h-3.5 w-3.5" />
                  邮箱
                </a>
              ) : null}
            </div>
          </div>

          <Link href={`/articles/${featuredArticle.slug}`} className="group">
            <div className="flex h-full flex-col justify-between rounded-[1.45rem] border border-border/70 bg-card/98 p-5">
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  推荐阅读
                </p>
                <h2 className="text-xl font-semibold leading-8 text-foreground">
                  {featuredArticle.title}
                </h2>
                <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {featuredArticle.summary}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between text-[13px] text-muted-foreground">
                <span>{formatDate(featuredArticle.publishTime, "YYYY.MM.DD")}</span>
                <span className="inline-flex items-center gap-1.5 group-hover:text-foreground">
                  去阅读
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </Card>
      </motion.div>
    </section>
  );
}
