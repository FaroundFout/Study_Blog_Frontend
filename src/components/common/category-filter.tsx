"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useId, useRef, type MouseEvent } from "react";

import {
  useArticleCatalogTabValue,
  useCatalogNavigation
} from "@/components/common/catalog-navigation-transition";
import { buildQueryString } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  query: Record<string, string | undefined>;
  allLabel?: string;
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey;
}

function CategoryTab({
  value,
  href,
  label,
  isActive
}: {
  value: string;
  href: string;
  label: string;
  isActive: boolean;
}) {
  const navigation = useCatalogNavigation();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const linkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!isActive || !linkRef.current) {
      return;
    }

    const link = linkRef.current;
    const viewport = link.closest<HTMLElement>(".article-category-tabs-viewport");
    if (!viewport) {
      return;
    }

    const linkRect = link.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    if (linkRect.left < viewportRect.left || linkRect.right > viewportRect.right) {
      link.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest"
      });
    }
  }, [isActive, prefersReducedMotion]);

  return (
    <Tabs.Trigger value={value} asChild>
      <Link
        ref={linkRef}
        href={href}
        aria-current={isActive ? "page" : undefined}
        aria-disabled={navigation.isPending || undefined}
        className="article-category-tab"
        onMouseDown={(event) => {
          if (event.button === 0) {
            event.preventDefault();
          }
        }}
        onClick={(event) => {
          if (isModifiedClick(event)) {
            return;
          }

          event.preventDefault();
          event.currentTarget.focus();

          if (isActive || navigation.isPending) {
            return;
          }

          navigation.startNavigation({
            href,
            kind: "tab",
            tabValue: value
          });
        }}
      >
        <span className="article-category-tab-label">{label}</span>
        {isActive ? (
          <motion.span
            layoutId="article-category-tab-indicator"
            className="article-category-tab-indicator"
            transition={prefersReducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 470, damping: 38, mass: 0.62 }}
            aria-hidden="true"
          />
        ) : null}
      </Link>
    </Tabs.Trigger>
  );
}

export function CategoryFilter({
  categories,
  query,
  allLabel = "全部分类"
}: CategoryFilterProps) {
  const effectiveValue = useArticleCatalogTabValue();
  const layoutGroupId = useId();
  const tabs = [
    {
      value: "all",
      href: `/articles${buildQueryString({ ...query, page: 1, categoryId: undefined })}`,
      label: allLabel
    },
    ...categories.map((category) => ({
      value: `category-${category.id}`,
      href: `/articles${buildQueryString({
        ...query,
        page: 1,
        categoryId: category.id
      })}`,
      label: category.name
    }))
  ];

  return (
    <div className="article-category-tabs-viewport">
      <LayoutGroup id={layoutGroupId}>
        <Tabs.List className="article-category-tabs-list" aria-label="按文章分类筛选">
          {tabs.map((tab) => (
            <CategoryTab
              key={tab.value}
              {...tab}
              isActive={effectiveValue === tab.value}
            />
          ))}
        </Tabs.List>
      </LayoutGroup>
    </div>
  );
}
