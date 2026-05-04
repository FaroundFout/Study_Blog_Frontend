import Image from "next/image";
import { ArrowUpRight, Globe2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { initialLetters } from "@/lib/utils";
import type { FriendLink } from "@/types";

function domainLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function BloggerCard({ blogger }: { blogger: FriendLink }) {
  return (
    <a href={blogger.siteUrl} target="_blank" rel="noreferrer" className="group block">
      <Card className="page-card-shell">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(245,242,237,0.96))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,197,224,0.24),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(231,217,206,0.28),transparent_34%)]" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {blogger.avatar ? (
              <Image
                src={blogger.avatar}
                alt={blogger.siteName}
                width={92}
                height={92}
                className="h-24 w-24 rounded-[1.6rem] border border-white/80 object-cover shadow-[0_18px_30px_-24px_rgba(60,71,103,0.5)]"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-[1.8rem] border border-white/80 bg-white/88 text-[1.6rem] font-semibold text-foreground shadow-[0_18px_30px_-24px_rgba(60,71,103,0.5)]">
                {initialLetters(blogger.siteName)}
              </div>
            )}
          </div>
        </div>

        <div className="page-card-body">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <h3 className="page-card-title truncate">{blogger.siteName}</h3>
              <p className="page-card-meta inline-flex max-w-full items-center gap-1.5 truncate group-hover:text-foreground">
                <Globe2 className="h-3.5 w-3.5 shrink-0" />
                {domainLabel(blogger.siteUrl)}
              </p>
            </div>
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>

          <p className="page-card-summary line-clamp-3">{blogger.description}</p>
        </div>
      </Card>
    </a>
  );
}
