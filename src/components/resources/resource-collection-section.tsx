import { LibraryBig } from "lucide-react";
import type { ReactNode } from "react";

import { ResourceCard } from "@/components/cards/resource-card";
import type { ResourceCollection } from "@/types";

interface ResourceCollectionSectionProps {
  collection: ResourceCollection;
  index: number;
  focused?: boolean;
  footer?: ReactNode;
}

export function ResourceCollectionSection({
  collection,
  index,
  focused = false,
  footer
}: ResourceCollectionSectionProps) {
  const itemCount = collection.items?.length ?? collection.itemCount ?? 0;
  const shelfTones = ["green", "brass", "red"] as const;
  const shelfTone = shelfTones[(index - 1) % shelfTones.length];

  return (
    <section
      id={collection.slug}
      className={`resource-shelf resource-shelf-${shelfTone}${focused ? " resource-shelf-focused" : ""}`}
      aria-labelledby={`${collection.slug}-title`}
    >
      <div className={`resource-shelf-tab resource-shelf-tab-${shelfTone}`} aria-hidden="true">
        <LibraryBig className="resource-shelf-tab-icon" strokeWidth={1.35} />
      </div>
      <header className="resource-shelf-heading">
        <div className="resource-shelf-copy">
          <h2 id={`${collection.slug}-title`}>{collection.name}</h2>
          <span>Resource collection</span>
          <p>{collection.description}</p>
        </div>
        <div className="resource-shelf-rule" aria-hidden="true" />
        <dl className="resource-shelf-count">
          <dt>SG—RC—{String(index).padStart(3, "0")}</dt>
          <dd>{String(itemCount).padStart(2, "0")}</dd>
        </dl>
      </header>

      {collection.items?.length ? (
        <div className="resource-entry-grid">
          {collection.items.map((item, itemIndex) => (
            <ResourceCard
              key={item.id}
              item={item}
              collectionIndex={index}
              index={itemIndex + 1}
            />
          ))}
        </div>
      ) : (
        <p className="resource-shelf-empty">该分类正在整理，新的资料条目将从这里加入。</p>
      )}

      {footer ? <footer className="resource-shelf-navigation">{footer}</footer> : null}
    </section>
  );
}
