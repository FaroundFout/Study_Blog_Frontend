"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Rss } from "lucide-react";

import { FOOTER_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SiteInfo } from "@/types";

export function Footer({ siteInfo }: { siteInfo: SiteInfo }) {
  const pathname = usePathname();
  const isArticleReader = pathname.startsWith("/articles/");

  if (pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/write")) {
    return null;
  }

  return (
    <footer
      className={cn(
        "mt-20 border-t border-border/70 bg-transparent",
        isArticleReader && "article-reader-footer",
      )}
    >
      <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-7">
        <div className="space-y-3">
          <h2 className="page-section-title text-[1.06rem] md:text-[1.12rem]">
            {siteInfo.siteName}
          </h2>
          <p className="max-w-xl text-[0.95rem] leading-8 text-[hsl(var(--page-text-body))]">
            {siteInfo.siteSubtitle}
          </p>
          <p className="page-support-text">
            Copyright © 2026 Study Garden. 这是一个持续生长中的个人学习空间。
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {FOOTER_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="page-button-text hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="page-support-text flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <Rss className="h-4 w-4" />
              RSS 占位
            </span>
            {siteInfo.githubUrl ? (
              <a
                href={siteInfo.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
