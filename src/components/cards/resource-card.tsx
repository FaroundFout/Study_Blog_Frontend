import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { splitCommaText } from "@/lib/utils";
import type { ResourceItem } from "@/types";

interface ResourceCardProps {
  item: ResourceItem;
  collectionIndex: number;
  index: number;
}

function getHostname(linkUrl: string) {
  try {
    return new URL(linkUrl).hostname.replace(/^www\./, "");
  } catch {
    return "external-resource";
  }
}

export function ResourceCard({ item, collectionIndex, index }: ResourceCardProps) {
  const tags = splitCommaText(item.tagsText).slice(0, 2);
  const callNumber = `R${String(collectionIndex).padStart(2, "0")}.${String(index).padStart(2, "0")}`;
  const hostname = getHostname(item.linkUrl);

  return (
    <article className="resource-entry-card">
      <Link
        href={`/resources/${item.id}`}
        className="resource-entry-link group"
        aria-label={`查看资源详情：${item.title}`}
      >
        <div className="resource-entry-body">
          <div className="resource-entry-copy">
            <h3>{item.title}</h3>
            <span className="resource-entry-domain">{hostname} <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.6]" /></span>
            <p>{item.summary}</p>
          </div>

          {tags.length ? (
            <ul className="resource-entry-tags" aria-label="资源标签">
              {tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <footer className="resource-entry-footer"><span>{callNumber}</span><span>{item.sourceName || "External reference"}</span></footer>
      </Link>
    </article>
  );
}
