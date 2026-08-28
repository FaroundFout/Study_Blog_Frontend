"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";

import { LoadingSkeleton } from "@/components/common/loading-skeleton";

type CatalogTransitionPhase = "idle" | "exiting" | "loading" | "entering";
type CatalogSkeletonVariant = "articles" | "diaries" | "projects";

interface CatalogNavigationIntent {
  href: string;
  kind: "tab" | "pagination";
  page?: number;
  tabValue?: string;
  focusResults?: boolean;
}

interface CatalogNavigationContextValue {
  contentKey: string;
  phase: CatalogTransitionPhase;
  pendingHref?: string;
  pendingPage?: number;
  pendingTabValue?: string;
  showSkeleton: boolean;
  isPending: boolean;
  startNavigation: (intent: CatalogNavigationIntent) => boolean;
}

const EXIT_DURATION_MS = 160;
const ENTER_DURATION_MS = 220;
const SKELETON_DELAY_MS = 150;
const SKELETON_MINIMUM_MS = 180;
const NAVIGATION_TIMEOUT_MS = 10_000;
const STICKY_HEADER_OFFSET_PX = 96;

const CatalogNavigationContext = createContext<CatalogNavigationContextValue | null>(null);
const ArticleTabValueContext = createContext("all");

function clearTimer(timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function focusResultsRegion(resultsId: string) {
  window.requestAnimationFrame(() => {
    document.getElementById(resultsId)?.focus({ preventScroll: true });
  });
}

export function CatalogNavigation({
  contentKey,
  resultsId,
  children
}: {
  contentKey: string;
  resultsId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<CatalogTransitionPhase>("idle");
  const [pendingIntent, setPendingIntent] = useState<CatalogNavigationIntent | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const contentKeyRef = useRef(contentKey);
  const pendingIntentRef = useRef<CatalogNavigationIntent | null>(null);
  const skeletonShownAtRef = useRef<number | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skeletonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearNavigationTimers = useCallback(() => {
    clearTimer(exitTimerRef);
    clearTimer(skeletonTimerRef);
    clearTimer(settleTimerRef);
    clearTimer(enterTimerRef);
    clearTimer(timeoutTimerRef);
  }, []);

  const finishEntering = useCallback((intent: CatalogNavigationIntent | null) => {
    setShowSkeleton(false);
    skeletonShownAtRef.current = null;
    setPhase("entering");
    setPendingIntent(null);
    pendingIntentRef.current = null;

    if (intent?.focusResults) {
      focusResultsRegion(resultsId);
    }

    enterTimerRef.current = setTimeout(
      () => setPhase("idle"),
      prefersReducedMotion ? 0 : ENTER_DURATION_MS,
    );
  }, [prefersReducedMotion, resultsId]);

  const recoverNavigation = useCallback(() => {
    const intent = pendingIntentRef.current;
    clearNavigationTimers();
    finishEntering(intent);
  }, [clearNavigationTimers, finishEntering]);

  const startNavigation = useCallback((intent: CatalogNavigationIntent) => {
    if (pendingIntentRef.current) {
      return false;
    }

    pendingIntentRef.current = intent;
    setPendingIntent(intent);
    setShowSkeleton(false);
    skeletonShownAtRef.current = null;
    setPhase("exiting");

    const commitNavigation = () => {
      if (intent.kind === "pagination") {
        const results = document.getElementById(resultsId);
        if (results) {
          const top = Math.max(
            0,
            results.getBoundingClientRect().top + window.scrollY - STICKY_HEADER_OFFSET_PX,
          );
          window.scrollTo({
            top,
            behavior: prefersReducedMotion ? "auto" : "smooth"
          });
        }
      }

      setPhase("loading");

      try {
        router.push(intent.href, { scroll: false });
      } catch {
        recoverNavigation();
        return;
      }

      skeletonTimerRef.current = setTimeout(() => {
        skeletonShownAtRef.current = performance.now();
        setShowSkeleton(true);
      }, SKELETON_DELAY_MS);

      timeoutTimerRef.current = setTimeout(recoverNavigation, NAVIGATION_TIMEOUT_MS);
    };

    if (prefersReducedMotion) {
      commitNavigation();
    } else {
      exitTimerRef.current = setTimeout(commitNavigation, EXIT_DURATION_MS);
    }

    return true;
  }, [prefersReducedMotion, recoverNavigation, resultsId, router]);

  useEffect(() => {
    if (contentKeyRef.current === contentKey) {
      return;
    }

    contentKeyRef.current = contentKey;
    const intent = pendingIntentRef.current;
    clearTimer(exitTimerRef);
    clearTimer(skeletonTimerRef);
    clearTimer(timeoutTimerRef);

    const shownAt = skeletonShownAtRef.current;
    const remainingSkeletonTime = shownAt === null
      ? 0
      : Math.max(0, SKELETON_MINIMUM_MS - (performance.now() - shownAt));

    settleTimerRef.current = setTimeout(
      () => finishEntering(intent),
      prefersReducedMotion ? 0 : remainingSkeletonTime,
    );
  }, [contentKey, finishEntering, prefersReducedMotion]);

  useEffect(() => () => clearNavigationTimers(), [clearNavigationTimers]);

  const value = useMemo<CatalogNavigationContextValue>(() => ({
    contentKey,
    phase,
    pendingHref: pendingIntent?.href,
    pendingPage: pendingIntent?.page,
    pendingTabValue: pendingIntent?.tabValue,
    showSkeleton,
    isPending: Boolean(pendingIntent),
    startNavigation
  }), [contentKey, pendingIntent, phase, showSkeleton, startNavigation]);

  return (
    <CatalogNavigationContext.Provider value={value}>
      {children}
    </CatalogNavigationContext.Provider>
  );
}

export function useCatalogNavigationOptional() {
  return useContext(CatalogNavigationContext);
}

export function useCatalogNavigation() {
  const context = useCatalogNavigationOptional();

  if (!context) {
    throw new Error("Catalog navigation components must be rendered inside CatalogNavigation.");
  }

  return context;
}

export interface ArticleCatalogTabItem {
  value: string;
  href: string;
}

function ArticleCatalogTabsRoot({
  activeValue,
  tabs,
  children
}: {
  activeValue: string;
  tabs: ArticleCatalogTabItem[];
  children: ReactNode;
}) {
  const navigation = useCatalogNavigation();
  const effectiveValue = navigation.pendingTabValue ?? activeValue;
  const hrefByValue = useMemo(
    () => new Map(tabs.map((tab) => [tab.value, tab.href])),
    [tabs],
  );

  const handleValueChange = (nextValue: string) => {
    if (nextValue === effectiveValue || navigation.isPending) {
      return;
    }

    const href = hrefByValue.get(nextValue);
    if (!href) {
      return;
    }

    navigation.startNavigation({
      href,
      kind: "tab",
      tabValue: nextValue
    });
  };

  return (
    <ArticleTabValueContext.Provider value={effectiveValue}>
      <Tabs.Root
        value={effectiveValue}
        onValueChange={handleValueChange}
        activationMode="manual"
        orientation="horizontal"
      >
        {children}
      </Tabs.Root>
    </ArticleTabValueContext.Provider>
  );
}

export function ArticleCatalogNavigation({
  contentKey,
  resultsId,
  activeValue,
  tabs,
  children
}: {
  contentKey: string;
  resultsId: string;
  activeValue: string;
  tabs: ArticleCatalogTabItem[];
  children: ReactNode;
}) {
  return (
    <CatalogNavigation contentKey={contentKey} resultsId={resultsId}>
      <ArticleCatalogTabsRoot activeValue={activeValue} tabs={tabs}>
        {children}
      </ArticleCatalogTabsRoot>
    </CatalogNavigation>
  );
}

export function useArticleCatalogTabValue() {
  return useContext(ArticleTabValueContext);
}

export function ArticleCatalogTabPanel({ children }: { children: ReactNode }) {
  const value = useArticleCatalogTabValue();

  return (
    <Tabs.Content value={value} forceMount className="article-category-tab-panel">
      {children}
    </Tabs.Content>
  );
}

function ArticleResultsSkeleton() {
  return (
    <div className="article-index-grid catalog-results-skeleton-grid" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="catalog-results-skeleton-card">
          <LoadingSkeleton className="h-4 w-20 rounded-none" />
          <LoadingSkeleton className="mt-8 h-8 w-4/5 rounded-none" />
          <LoadingSkeleton className="mt-3 h-5 w-full rounded-none" />
          <LoadingSkeleton className="mt-2 h-5 w-3/4 rounded-none" />
          <LoadingSkeleton className="mt-8 h-4 w-32 rounded-none" />
        </div>
      ))}
    </div>
  );
}

function DiaryResultsSkeleton() {
  return (
    <div className="diary-catalog-layout catalog-results-skeleton-layout" aria-hidden="true">
      <aside className="catalog-results-skeleton-rail">
        <LoadingSkeleton className="h-5 w-20 rounded-none" />
        {Array.from({ length: 5 }).map((_, index) => (
          <LoadingSkeleton key={index} className="mt-4 h-12 w-full rounded-none" />
        ))}
      </aside>
      <div className="diary-month-stack">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="catalog-results-skeleton-card catalog-results-skeleton-diary">
            <LoadingSkeleton className="h-5 w-36 rounded-none" />
            <LoadingSkeleton className="mt-7 h-7 w-3/4 rounded-none" />
            <LoadingSkeleton className="mt-3 h-4 w-full rounded-none" />
            <LoadingSkeleton className="mt-2 h-4 w-2/3 rounded-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectResultsSkeleton() {
  return (
    <div className="project-work-grid catalog-results-skeleton-grid" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="catalog-results-skeleton-card catalog-results-skeleton-project">
          <LoadingSkeleton className="h-4 w-24 rounded-none" />
          <LoadingSkeleton className="mt-10 h-9 w-3/4 rounded-none" />
          <LoadingSkeleton className="mt-4 h-5 w-full rounded-none" />
          <LoadingSkeleton className="mt-2 h-5 w-4/5 rounded-none" />
          <LoadingSkeleton className="mt-8 h-5 w-40 rounded-none" />
        </div>
      ))}
    </div>
  );
}

function CatalogResultsSkeleton({ variant }: { variant: CatalogSkeletonVariant }) {
  if (variant === "diaries") {
    return <DiaryResultsSkeleton />;
  }

  if (variant === "projects") {
    return <ProjectResultsSkeleton />;
  }

  return <ArticleResultsSkeleton />;
}

export function CatalogResultsRegion({
  id,
  label,
  variant,
  children
}: {
  id: string;
  label: string;
  variant: CatalogSkeletonVariant;
  children: ReactNode;
}) {
  const navigation = useCatalogNavigation();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const isWaiting = navigation.phase === "loading";
  const isTransitioning = navigation.phase !== "idle";

  useEffect(() => {
    const node = contentRef.current;
    if (!node || navigation.phase === "loading") {
      return;
    }

    const updateHeight = () => setMeasuredHeight(node.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [navigation.contentKey, navigation.phase]);

  const transitionStyle: CSSProperties | undefined = isTransitioning && measuredHeight > 0
    ? { minHeight: measuredHeight }
    : undefined;

  const visibleContent = isWaiting ? (
    <motion.div
      key={`loading-${navigation.contentKey}`}
      className="catalog-results-loading-stage"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: navigation.showSkeleton ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.12 }}
    >
      {navigation.showSkeleton ? <CatalogResultsSkeleton variant={variant} /> : null}
    </motion.div>
  ) : (
    <motion.div
      key={`content-${navigation.contentKey}`}
      ref={contentRef}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
      animate={navigation.phase === "exiting"
        ? { opacity: 0, y: -4 }
        : { opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
      transition={{
        duration: prefersReducedMotion
          ? 0
          : navigation.phase === "exiting"
            ? EXIT_DURATION_MS / 1000
            : ENTER_DURATION_MS / 1000,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <section
      id={id}
      className={`catalog-results-region ${isTransitioning ? "catalog-results-region-transitioning" : ""}`}
      style={transitionStyle}
      aria-label={label}
      aria-live="polite"
      aria-busy={navigation.phase === "exiting" || navigation.phase === "loading"}
      tabIndex={-1}
    >
      <AnimatePresence initial={false} mode="wait">
        {visibleContent}
      </AnimatePresence>
    </section>
  );
}
