import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buildQueryString, cn } from "@/lib/utils";
import type { Tag } from "@/types";

interface TagListProps {
  tags: Tag[] | string[];
  className?: string;
  hrefBuilder?: (tag: Tag | string) => string;
  activeSlug?: string;
}

export function TagList({
  tags,
  className,
  hrefBuilder,
  activeSlug
}: TagListProps) {
  if (!tags.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => {
        const item = typeof tag === "string" ? tag : tag.name;
        const slug = typeof tag === "string" ? tag : tag.slug;
        const href = hrefBuilder?.(tag);

        if (href) {
          return (
            <Link key={item} href={href}>
              <Badge
                variant={activeSlug === slug ? "default" : "secondary"}
                className="page-chip cursor-pointer hover:border-primary/30 hover:text-foreground"
              >
                #{item}
              </Badge>
            </Link>
          );
        }

        return (
          <Badge key={item} variant="secondary" className="page-chip">
            #{item}
          </Badge>
        );
      })}
    </div>
  );
}

export function createTagHref(tagId: number, currentQuery: Record<string, string | undefined>) {
  return `/articles${buildQueryString({
    ...currentQuery,
    page: 1,
    tagId
  })}`;
}
