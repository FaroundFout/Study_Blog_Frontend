import Link from "next/link";

import { buildQueryString, cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategoryId?: number;
  query: Record<string, string | undefined>;
}

export function CategoryFilter({
  categories,
  activeCategoryId,
  query
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Link
        href={`/articles${buildQueryString({ ...query, page: 1, categoryId: undefined })}`}
        className={cn(
          "page-chip rounded-full border px-3.5 py-2.5 transition-all",
          !activeCategoryId
            ? "border-primary/20 bg-primary/[0.08] text-primary shadow-[0_10px_20px_-18px_rgba(95,119,166,0.65)]"
            : "border-border/70 bg-background/70 text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        全部分类
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/articles${buildQueryString({
            ...query,
            page: 1,
            categoryId: category.id
          })}`}
          className={cn(
            "page-chip rounded-full border px-3.5 py-2.5 transition-all",
            activeCategoryId === category.id
              ? "border-primary/20 bg-primary/[0.08] text-primary shadow-[0_10px_20px_-18px_rgba(95,119,166,0.65)]"
              : "border-border/70 bg-background/70 text-muted-foreground hover:border-border hover:text-foreground",
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
