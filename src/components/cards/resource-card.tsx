import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { splitCommaText } from "@/lib/utils";
import type { ResourceCollection, ResourceItem } from "@/types";

export function ResourceCard({
  collection,
  item
}: {
  collection?: ResourceCollection;
  item?: ResourceItem;
}) {
  if (collection) {
    return (
      <Link href={`/resources#${collection.slug}`} className="group block">
        <Card className="page-card-shell p-0">
          <div className="page-card-body">
            <p className="page-card-kicker">Resource Group</p>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2.5">
                <h3 className="page-card-title transition-colors group-hover:text-primary">
                  {collection.name}
                </h3>
                <p className="page-card-summary line-clamp-3">{collection.description}</p>
              </div>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
          <div className="page-card-divider page-card-meta mx-5 mb-5 flex items-center justify-between md:mx-6 md:mb-6">
            <span>{collection.itemCount ?? collection.items?.length ?? 0} 个条目</span>
            <Badge variant="secondary">资源分组</Badge>
          </div>
        </Card>
      </Link>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <a href={item.linkUrl} target="_blank" rel="noreferrer" className="group block">
      <Card className="page-card-shell p-0">
        <div className="page-card-body">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2.5">
              <p className="page-card-kicker">{item.sourceName || "External Link"}</p>
              <h3 className="page-card-title transition-colors group-hover:text-primary">
                {item.title}
              </h3>
              <p className="page-card-summary line-clamp-3">{item.summary}</p>
            </div>
            <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap gap-2">
            {splitCommaText(item.tagsText)
              .slice(0, 3)
              .map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
          </div>
        </div>
        <p className="page-card-divider page-card-meta mx-5 mb-5 md:mx-6 md:mb-6">
          来源：{item.sourceName || "外部链接"}
        </p>
      </Card>
    </a>
  );
}
