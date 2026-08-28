"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Lightbulb,
  Mail,
  Route,
  type LucideIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from "react";

import { ResourceCollectionSection } from "@/components/resources/resource-collection-section";
import type { ResourceCollection } from "@/types";

interface ResourceAtlasExplorerProps {
  collections: ResourceCollection[];
}

const icons: LucideIcon[] = [BookOpenText, Route, Lightbulb];

function getCollectionCount(collection: ResourceCollection) {
  return collection.items?.length ?? collection.itemCount ?? 0;
}

function getHashSlug() {
  return decodeURIComponent(window.location.hash.replace(/^#/, ""));
}

export function ResourceAtlasExplorer({ collections }: ResourceAtlasExplorerProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeCollection = collections[activeIndex];
  const nextIndex = collections.length > 1 ? (activeIndex + 1) % collections.length : null;
  const nextCollection = nextIndex === null ? null : collections[nextIndex];
  const NextIcon = nextIndex === null ? BookOpenText : icons[nextIndex % icons.length];

  const collectionIndexBySlug = useMemo(
    () => new Map(collections.map((collection, index) => [collection.slug, index])),
    [collections],
  );

  const scrollPanelIntoPosition = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    panel.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }, [prefersReducedMotion]);

  const revealActiveTab = useCallback((index: number) => {
    if (!window.matchMedia("(max-width: 1023px)").matches) {
      return;
    }

    tabRefs.current[index]?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center"
    });
  }, [prefersReducedMotion]);

  const updateLocationHash = useCallback((slug: string) => {
    const url = new URL(window.location.href);
    url.hash = slug;
    window.history.replaceState(null, "", url);
  }, []);

  const activateCollection = useCallback((
    index: number,
    options?: { updateHash?: boolean; scroll?: boolean; direction?: 1 | -1 },
  ) => {
    if (!collections[index]) {
      return;
    }

    setDirection(options?.direction ?? (index >= activeIndex ? 1 : -1));
    setActiveIndex(index);

    if (options?.updateHash !== false) {
      updateLocationHash(collections[index].slug);
    }

    window.requestAnimationFrame(() => {
      revealActiveTab(index);
      if (options?.scroll !== false) {
        scrollPanelIntoPosition();
      }
    });
  }, [activeIndex, collections, revealActiveTab, scrollPanelIntoPosition, updateLocationHash]);

  useEffect(() => {
    if (!collections.length) {
      return;
    }

    const hashIndex = collectionIndexBySlug.get(getHashSlug());
    const initialIndex = hashIndex ?? 0;
    setActiveIndex(initialIndex);

    if (hashIndex === undefined) {
      updateLocationHash(collections[0].slug);
    } else {
      window.requestAnimationFrame(scrollPanelIntoPosition);
    }

    revealActiveTab(initialIndex);
  }, [collectionIndexBySlug, collections, revealActiveTab, scrollPanelIntoPosition, updateLocationHash]);

  useEffect(() => {
    const handleHashChange = () => {
      const index = collectionIndexBySlug.get(getHashSlug());
      if (index === undefined) {
        return;
      }

      setActiveIndex((currentIndex) => {
        setDirection(index >= currentIndex ? 1 : -1);
        return index;
      });
      window.requestAnimationFrame(() => {
        revealActiveTab(index);
        scrollPanelIntoPosition();
      });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [collectionIndexBySlug, revealActiveTab, scrollPanelIntoPosition]);

  if (!activeCollection) {
    return <p className="resource-atlas-empty">资源目录正在整理，稍后再来看看吧。</p>;
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let targetIndex: number | null = null;

    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      targetIndex = (index + 1) % collections.length;
    } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      targetIndex = (index - 1 + collections.length) % collections.length;
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = collections.length - 1;
    }

    if (targetIndex === null) {
      return;
    }

    event.preventDefault();
    tabRefs.current[targetIndex]?.focus();
    activateCollection(targetIndex);
  };

  return (
    <div className="resource-catalog-layout resource-atlas-explorer">
      <aside className="resource-library-index" aria-label="资源索引">
        <h2>资源索引 <span>Resource index</span></h2>

        <div className="resource-index-drawers" role="tablist" aria-label="资源分类">
          <span className="resource-index-spine" aria-hidden="true" />
          {collections.map((collection, index) => {
            const Icon = icons[index % icons.length];
            const isActive = index === activeIndex;

            return (
              <button
                key={collection.id}
                ref={(node) => { tabRefs.current[index] = node; }}
                id={`${collection.slug}-tab`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="resource-collection-panel"
                tabIndex={isActive ? 0 : -1}
                className={`resource-index-drawer${isActive ? " resource-index-drawer-active" : ""}`}
                onClick={() => activateCollection(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {isActive ? (
                  <motion.span
                    layoutId="resource-index-active-strip"
                    className="resource-index-active-strip"
                    transition={{ type: "spring", stiffness: 360, damping: 34 }}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="resource-index-node" aria-hidden="true" />
                <Icon aria-hidden="true" className="resource-index-icon" strokeWidth={1.45} />
                <span className="resource-index-copy">
                  <strong>{collection.name}</strong>
                  <small>{String(getCollectionCount(collection)).padStart(2, "0")} entries</small>
                  <em>SG—RC—{String(index + 1).padStart(3, "0")}</em>
                  <span className="resource-index-description">{collection.description}</span>
                </span>
                <span className="resource-index-handle" aria-hidden="true">
                  <Image
                    src="/images/resources/antique-brass-drawer-pull-v1.png"
                    alt=""
                    width={256}
                    height={576}
                    className="resource-index-handle-image"
                  />
                </span>
              </button>
            );
          })}
        </div>

        <Link href="/about#contact-register" className="resource-recommendation resource-index-contact">
          <Mail aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
          <span>推荐优质资源</span>
          <ArrowRight aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
        </Link>
      </aside>

      <div
        ref={panelRef}
        id="resource-collection-panel"
        role="tabpanel"
        aria-labelledby={`${activeCollection.slug}-tab`}
        className="resource-shelf-stack resource-focused-panel"
        aria-live="polite"
        tabIndex={-1}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeCollection.slug}
            className="resource-panel-motion"
            initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * -14 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <ResourceCollectionSection
              collection={activeCollection}
              index={activeIndex + 1}
              focused
              footer={nextCollection && nextIndex !== null ? (
                <button
                  type="button"
                  className="resource-next-collection"
                  onClick={() => activateCollection(nextIndex, { direction: 1 })}
                  aria-label={`切换到下一合集：${nextCollection.name}`}
                >
                  <span className="resource-next-label">下一类目预览 <ArrowRight aria-hidden="true" /></span>
                  <NextIcon aria-hidden="true" className="resource-next-icon" strokeWidth={1.5} />
                  <strong>{nextCollection.name}</strong>
                  <small>Resource collection</small>
                  <span className="resource-next-description">{nextCollection.description}</span>
                  <em>SG—RC—{String(nextIndex + 1).padStart(3, "0")}</em>
                </button>
              ) : null}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
