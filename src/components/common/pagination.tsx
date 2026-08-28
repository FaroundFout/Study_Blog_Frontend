"use client";

import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId, type MouseEvent } from "react";

import { useCatalogNavigationOptional } from "@/components/common/catalog-navigation-transition";
import { buildQueryString } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pathname: string;
  query: Record<string, string | number | undefined>;
  alwaysVisible?: boolean;
  itemLabel?: string;
  ariaLabel?: string;
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey;
}

export function Pagination({
  page,
  pageSize,
  total,
  pathname,
  query,
  alwaysVisible = false,
  itemLabel = "条内容",
  ariaLabel = "内容分页"
}: PaginationProps) {
  const navigation = useCatalogNavigationOptional();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const layoutGroupId = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const effectivePage = navigation?.pendingPage ?? page;
  const isAnimated = Boolean(navigation);

  if (!alwaysVisible && totalPages <= 1) {
    return null;
  }

  const createHref = (nextPage: number) =>
    `${pathname}${buildQueryString({ ...query, page: nextPage })}`;

  const handlePageClick = (event: MouseEvent<HTMLAnchorElement>, nextPage: number) => {
    if (isModifiedClick(event) || !navigation) {
      return;
    }

    event.preventDefault();
    if (nextPage === page || navigation.isPending) {
      return;
    }

    navigation.startNavigation({
      href: createHref(nextPage),
      kind: "pagination",
      page: nextPage,
      focusResults: event.detail === 0
    });
  };

  const activeBlock = isAnimated ? (
    <motion.span
      layoutId="catalog-pagination-active-block"
      className="catalog-pagination-active-block"
      transition={prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 460, damping: 38, mass: 0.64 }}
      aria-hidden="true"
    />
  ) : null;

  const pageItems: Array<number | "ellipsis-start" | "ellipsis-end"> = [];

  if (totalPages <= 7) {
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      pageItems.push(pageNumber);
    }
  } else if (page <= 4) {
    pageItems.push(1, 2, 3, 4, 5, "ellipsis-end", totalPages);
  } else if (page >= totalPages - 3) {
    pageItems.push(1, "ellipsis-start");
    for (let pageNumber = totalPages - 4; pageNumber <= totalPages; pageNumber += 1) {
      pageItems.push(pageNumber);
    }
  } else {
    pageItems.push(1, "ellipsis-start", page - 1, page, page + 1, "ellipsis-end", totalPages);
  }

  return (
    <nav
      className={`catalog-pagination ${isAnimated ? "catalog-pagination-animated" : ""}`}
      aria-label={ariaLabel}
      data-pending={navigation?.isPending || undefined}
    >
      <LayoutGroup id={layoutGroupId}>
        <div className="catalog-pagination-controls">
        {page <= 1 ? (
          <span className="catalog-pagination-direction catalog-pagination-disabled" aria-disabled="true">
            <ChevronLeft aria-hidden="true" />
            上一页
          </span>
        ) : (
          <Link
            href={createHref(page - 1)}
            className="catalog-pagination-direction"
            aria-disabled={navigation?.isPending || undefined}
            onClick={(event) => handlePageClick(event, page - 1)}
          >
            <ChevronLeft aria-hidden="true" />
            上一页
          </Link>
        )}

        <div className="catalog-pagination-pages">
          {pageItems.map((item) =>
            typeof item === "number" ? (
              item === page ? (
                <span
                  key={item}
                  className={`catalog-pagination-page ${effectivePage === item ? "catalog-pagination-page-active" : ""}`}
                  aria-current={effectivePage === item ? "page" : undefined}
                >
                  {effectivePage === item ? activeBlock : null}
                  <span className="catalog-pagination-page-label">{item}</span>
                </span>
              ) : (
                <Link
                  key={item}
                  href={createHref(item)}
                  className={`catalog-pagination-page ${effectivePage === item ? "catalog-pagination-page-active" : ""}`}
                  aria-label={`第 ${item} 页`}
                  aria-current={effectivePage === item ? "page" : undefined}
                  aria-disabled={navigation?.isPending || undefined}
                  onClick={(event) => handlePageClick(event, item)}
                >
                  {effectivePage === item ? activeBlock : null}
                  <span className="catalog-pagination-page-label">{item}</span>
                </Link>
              )
            ) : (
              <span key={item} className="catalog-pagination-ellipsis" aria-hidden="true">…</span>
            ),
          )}
        </div>

        {page >= totalPages ? (
          <span className="catalog-pagination-direction catalog-pagination-disabled" aria-disabled="true">
            下一页
            <ChevronRight aria-hidden="true" />
          </span>
        ) : (
          <Link
            href={createHref(page + 1)}
            className="catalog-pagination-direction"
            aria-disabled={navigation?.isPending || undefined}
            onClick={(event) => handlePageClick(event, page + 1)}
          >
            下一页
            <ChevronRight aria-hidden="true" />
          </Link>
        )}
        </div>
      </LayoutGroup>

      <p className="catalog-pagination-summary">
        共 {total} {itemLabel}
      </p>
    </nav>
  );
}
