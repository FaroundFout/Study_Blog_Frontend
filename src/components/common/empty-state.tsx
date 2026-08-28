import Link from "next/link";
import { ArrowUpRight, BookDashed } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  variant?: "panel" | "catalog";
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  variant = "panel"
}: EmptyStateProps) {
  if (variant === "catalog") {
    return (
      <section className="catalog-empty-state" aria-label={title}>
        <span className="catalog-empty-index" aria-hidden="true">00</span>
        <BookDashed className="catalog-empty-icon" aria-hidden="true" />
        <div className="catalog-empty-copy">
          <p className="catalog-empty-kicker">No records / 暂无记录</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="catalog-empty-action">
            <span>{actionLabel}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <div className="page-panel border-dashed px-8 py-14 text-center">
      <div className="mx-auto max-w-2xl space-y-3">
        <p className="page-section-title">{title}</p>
        <p className="page-section-description">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-7 inline-flex">
          <Button variant="secondary" className="page-button-text">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
