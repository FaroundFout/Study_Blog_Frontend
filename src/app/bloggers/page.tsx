import type { Metadata } from "next";

import { BloggerCard } from "@/components/cards/blogger-card";
import { PageHero } from "@/components/sections/page-hero";
import { Card } from "@/components/ui/card";
import { getFriendLinks } from "@/lib/api";

export const metadata: Metadata = {
  title: "友链"
};

export default async function BloggersPage() {
  const bloggers = await getFriendLinks();

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Blog Roll"
        title="友链 / 博主页"
        description="这里放的是我愿意长期拜访的个人站点。风格各不相同，但都带着一种认真维护自己空间的气质。"
      />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="page-panel p-5 md:p-6">
          <div className="max-w-3xl space-y-2.5">
            <p className="page-section-kicker">Exchange</p>
            <h2 className="page-section-title">欢迎交换友链</h2>
            <p className="page-section-description">
              如果你也在持续写博客、做个人站，或者认真整理自己的学习空间，只要内容稳定、风格真诚，我都很乐意交换链接。
            </p>
          </div>
        </Card>

        <Card className="page-panel p-5 md:p-6">
          <div className="space-y-3">
            <p className="page-section-kicker">Guideline</p>
            <div className="page-note-copy space-y-2">
              <p>1. 站点可以稳定访问。</p>
              <p>2. 有自己的内容，也愿意长期维护。</p>
              <p>3. 简介尽量简洁，方便在卡片中呈现。</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {bloggers.map((blogger) => (
          <BloggerCard key={blogger.id} blogger={blogger} />
        ))}
      </section>
    </div>
  );
}
