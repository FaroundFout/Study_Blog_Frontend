import { ArrowRight, LibraryBig, Lightbulb, Mail, Route, type LucideIcon } from "lucide-react";
import Link from "next/link";

import type { ResourceCollection } from "@/types";

interface ResourceLibraryIndexProps {
  collections: ResourceCollection[];
}

export function ResourceLibraryIndex({ collections }: ResourceLibraryIndexProps) {
  const icons: LucideIcon[] = [LibraryBig, Route, Lightbulb];
  const tones = ["green", "brass", "red"] as const;

  return (
    <aside className="resource-library-index" aria-label="资源合集索引">
      <h2>资源合集 <span>Collections</span></h2>
      <nav className="resource-catalog-links" aria-label="资源分类导航">
        {collections.map((collection, index) => {
          const Icon = icons[index % icons.length];
          const tone = tones[index % tones.length];
          return (
            <a
              key={collection.id}
              href={`#${collection.slug}`}
              className={`resource-catalog-link resource-catalog-link-${tone}${index === 0 ? " resource-catalog-link-active" : ""}`}
            >
              <Icon aria-hidden="true" className="h-8 w-8 stroke-[1.45]" />
              <span>
                <strong>{collection.name}</strong>
                <small>{String(collection.items?.length ?? collection.itemCount ?? 0).padStart(2, "0")} entries</small>
                <em>SG—RC—{String(index + 1).padStart(3, "0")}</em>
              </span>
              <ArrowRight aria-hidden="true" className="resource-catalog-arrow h-4 w-4 stroke-[1.6]" />
              <span className="resource-catalog-edge" aria-hidden="true" />
            </a>
          );
        })}
      </nav>
      <Link href="/about#contact-register" className="resource-recommendation">
        <Mail aria-hidden="true" className="h-5 w-5 stroke-[1.6]" />
        <span>如果你有优质资源推荐，欢迎与我联系。</span>
        <ArrowRight aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
      </Link>
    </aside>
  );
}
