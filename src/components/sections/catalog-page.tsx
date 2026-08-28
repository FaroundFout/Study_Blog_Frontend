import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PageHero } from "./page-hero";

interface CatalogPageProps {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  mobileShowControls?: boolean;
  controls?: ReactNode;
  controlsLabel?: string;
  controlsMeta?: string;
  children: ReactNode;
  className?: string;
}

export function CatalogPage({
  index,
  eyebrow,
  title,
  description,
  mobileShowControls = true,
  controls,
  controlsLabel = "栏目检索与筛选",
  controlsMeta = "Filter / Search",
  children,
  className
}: CatalogPageProps) {
  return (
    <div className={cn("page-shell", className, `catalog-page-${index}`)}>
      <div className={cn("catalog-intro-stage", controls && "catalog-intro-stage--with-controls")}>
        <PageHero index={index} eyebrow={eyebrow} title={title} description={description} />

        {controls ? (
          <section className={cn("catalog-control-panel", !mobileShowControls && "catalog-control-panel--mobile-collapsed")} aria-label={controlsLabel}>
            <div className="catalog-control-heading" aria-hidden="true">
              <span>Catalog controls</span>
              <span>{controlsMeta}</span>
            </div>
            <div className="catalog-control-content">{controls}</div>
          </section>
        ) : null}
      </div>

      <div className="catalog-page-body">{children}</div>
    </div>
  );
}

export function CatalogGrid({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("catalog-card-grid", className)}>{children}</div>;
}
