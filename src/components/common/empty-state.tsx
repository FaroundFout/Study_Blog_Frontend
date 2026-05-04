import Link from "next/link";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: EmptyStateProps) {
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
