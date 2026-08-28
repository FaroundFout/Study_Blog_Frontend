"use client";

import {
  ArrowUpRight,
  BookMarked,
  Clapperboard,
  Clock3,
  Code2,
  Gamepad2,
  Github,
  GripVertical,
  Leaf,
  Mail,
  MapPin,
  MessageSquareText
} from "lucide-react";
import { Reorder, useDragControls, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { parseAboutPageContent } from "@/lib/about-page-content";
import type { SiteInfo } from "@/types";

import styles from "./about-narrative.module.css";

const focusIcons = [Leaf, Code2, MessageSquareText, Gamepad2];

const defaultCardOrder = ["dossier", "note", "focus", "timeline", "contact"] as const;
const cardOrderStorageKey = "study-garden:about-card-order:v1";

type AboutCardId = (typeof defaultCardOrder)[number];

interface AboutNarrativeProps {
  siteInfo: SiteInfo;
}

interface SortableAboutCardProps {
  cardId: AboutCardId;
  shouldReduceMotion: boolean;
  onKeyboardMove: (cardId: AboutCardId, key: string) => void;
  children: (handle: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  }) => ReactNode;
}

interface DragHandleButtonProps {
  label: string;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

function isPublicWebUrl(value?: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidCardOrder(value: unknown): value is AboutCardId[] {
  if (!Array.isArray(value) || value.length !== defaultCardOrder.length) return false;
  const uniqueValues = new Set(value);
  return uniqueValues.size === defaultCardOrder.length
    && value.every((item) => typeof item === "string" && defaultCardOrder.includes(item as AboutCardId));
}

function DragHandleButton({ label, onKeyDown }: DragHandleButtonProps) {
  return (
    <button
      type="button"
      className={styles.dragHandleButton}
      aria-label={`拖动“${label}”卡片；也可使用方向键调整顺序`}
      title={`拖动“${label}”卡片调整顺序`}
      onKeyDown={onKeyDown}
    >
      <GripVertical aria-hidden="true" />
    </button>
  );
}

function SortableAboutCard({
  cardId,
  shouldReduceMotion,
  onKeyboardMove,
  children
}: SortableAboutCardProps) {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragControls.start(event);
  }, [dragControls]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    onKeyboardMove(cardId, event.key);
  }, [cardId, onKeyboardMove]);

  return (
    <Reorder.Item
      as="div"
      value={cardId}
      className={`${styles.reorderItem}${isDragging ? ` ${styles.isDragging}` : ""}`}
      data-about-card={cardId}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.08}
      transition={shouldReduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 420, damping: 36, mass: 0.78 }}
      whileDrag={shouldReduceMotion ? undefined : { scale: 1.012 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      aria-roledescription="可排序卡片"
    >
      {children({ onPointerDown: handlePointerDown, onKeyDown: handleKeyDown })}
    </Reorder.Item>
  );
}

export function AboutNarrative({ siteInfo }: AboutNarrativeProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const aboutContent = useMemo(
    () => parseAboutPageContent(siteInfo.aboutPageJson),
    [siteInfo.aboutPageJson]
  );
  const cardLabels = useMemo<Record<AboutCardId, string>>(() => ({
    dossier: aboutContent.profileSectionTitle,
    note: aboutContent.noteTitle,
    focus: aboutContent.focusTitle,
    timeline: aboutContent.timelineTitle,
    contact: aboutContent.contactTitle
  }), [aboutContent]);
  const [cardOrder, setCardOrder] = useState<AboutCardId[]>([...defaultCardOrder]);
  const [hasRestoredOrder, setHasRestoredOrder] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(cardOrderStorageKey);
      if (storedValue) {
        const parsedValue: unknown = JSON.parse(storedValue);
        if (isValidCardOrder(parsedValue)) setCardOrder(parsedValue);
      }
    } catch {
      // Storage can be unavailable in private browsing or contain invalid JSON.
    } finally {
      setHasRestoredOrder(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredOrder) return;
    try {
      window.localStorage.setItem(cardOrderStorageKey, JSON.stringify(cardOrder));
    } catch {
      // Reordering remains available for the current page even if persistence fails.
    }
  }, [cardOrder, hasRestoredOrder]);

  const moveCardByKeyboard = useCallback((cardId: AboutCardId, key: string) => {
    setCardOrder((currentOrder) => {
      const currentIndex = currentOrder.indexOf(cardId);
      let nextIndex = currentIndex;

      if (key === "Home") nextIndex = 0;
      if (key === "End") nextIndex = currentOrder.length - 1;
      if (key === "ArrowLeft" || key === "ArrowUp") nextIndex = Math.max(0, currentIndex - 1);
      if (key === "ArrowRight" || key === "ArrowDown") nextIndex = Math.min(currentOrder.length - 1, currentIndex + 1);
      if (nextIndex === currentIndex) return currentOrder;

      const nextOrder = [...currentOrder];
      nextOrder.splice(currentIndex, 1);
      nextOrder.splice(nextIndex, 0, cardId);
      setAnnouncement(`${cardLabels[cardId]}已移动到第 ${nextIndex + 1} 位`);
      return nextOrder;
    });
  }, [cardLabels]);

  const avatar = siteInfo.avatar || siteInfo.logo || "/images/avatar-main.svg";
  const introduction = siteInfo.homeIntroText || siteInfo.announcement || siteInfo.siteSubtitle;
  const contacts = [
    isPublicWebUrl(siteInfo.githubUrl)
      ? { label: "GitHub", note: aboutContent.githubNote, href: siteInfo.githubUrl, Icon: Github, external: true }
      : null,
    isPublicWebUrl(siteInfo.bilibiliUrl)
      ? { label: "Bilibili", note: aboutContent.bilibiliNote, href: siteInfo.bilibiliUrl, Icon: Clapperboard, external: true }
      : null,
    isPublicWebUrl(siteInfo.xiaohongshuUrl)
      ? { label: "小红书", note: aboutContent.xiaohongshuNote, href: siteInfo.xiaohongshuUrl, Icon: BookMarked, external: true }
      : null,
    siteInfo.email
      ? { label: "Email", note: siteInfo.email, href: `mailto:${siteInfo.email}`, Icon: Mail, external: false }
      : null
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  const renderCard = (
    cardId: AboutCardId,
    handle: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => void;
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
    }
  ) => {
    if (cardId === "dossier") {
      return (
        <section className={styles.dossier} aria-labelledby="about-identity-title">
          <header className={`${styles.cardHeader} ${styles.dragHandleSurface}`} onPointerDown={handle.onPointerDown}>
            <span>Member dossier / {aboutContent.profileSectionTitle}</span>
            <span className={styles.dragHeaderEnd}>
              <span className={styles.cardHeaderMeta}>Card no. SG—2024—001</span>
              <DragHandleButton label={cardLabels.dossier} onKeyDown={handle.onKeyDown} />
            </span>
          </header>
          <div className={styles.dossierBody}>
            <div className={styles.portraitWrap}>
              <div className={styles.portraitTape} aria-hidden="true" />
              <Image src={avatar} alt={`${siteInfo.siteName} 头像`} fill sizes="(max-width: 767px) 78vw, 16rem" className={styles.portrait} priority />
            </div>
            <div className={styles.identityCopy}>
              <h2 id="about-identity-title">{aboutContent.profileTitle}</h2>
              <p>{introduction}</p>
              <p>{aboutContent.profileBio}</p>
            </div>
          </div>
          <dl className={styles.identityMeta} aria-label="站长信息">
            <div><dt><MapPin aria-hidden="true" />Location</dt><dd>{aboutContent.location}</dd></div>
            <div><dt><Clock3 aria-hidden="true" />Timezone</dt><dd>{aboutContent.timezone}</dd></div>
            <div><dt><Leaf aria-hidden="true" />Status</dt><dd>{aboutContent.status}</dd></div>
          </dl>
          <span className={styles.libraryStamp} aria-hidden="true">Study Garden<strong>Library</strong><small>Est. 2023</small></span>
        </section>
      );
    }

    if (cardId === "note") {
      return (
        <section className={styles.noteCard} aria-labelledby="about-note-title">
          <header className={`${styles.noteHeader} ${styles.dragHandleSurface}`} onPointerDown={handle.onPointerDown}>
            <h2 id="about-note-title">{aboutContent.noteTitle}</h2>
            <span className={styles.dragHeaderEnd}>
              <span className={styles.headerMeta}>Personal note</span>
              <DragHandleButton label={cardLabels.note} onKeyDown={handle.onKeyDown} />
            </span>
          </header>
          <div className={styles.noteBody}>
            <MarkdownRenderer content={siteInfo.aboutMeMd || introduction} />
          </div>
          <blockquote>{aboutContent.quote}</blockquote>
        </section>
      );
    }

    if (cardId === "focus") {
      return (
        <section className={styles.focusCard} aria-labelledby="about-focus-title">
          <header className={styles.dragHandleSurface} onPointerDown={handle.onPointerDown}>
            <h2 id="about-focus-title">{aboutContent.focusTitle}</h2>
            <span className={styles.dragHeaderEnd}>
              <span className={styles.headerMeta}>Current focus</span>
              <DragHandleButton label={cardLabels.focus} onKeyDown={handle.onKeyDown} />
            </span>
          </header>
          <ul>
            {aboutContent.focusItems.map(({ title, note }, index) => {
              const Icon = focusIcons[index % focusIcons.length];
              return <li key={`${title}-${index}`}><Icon aria-hidden="true" /><span><strong>{title}</strong><small>{note}</small></span></li>;
            })}
          </ul>
        </section>
      );
    }

    if (cardId === "timeline") {
      return (
        <section className={styles.timelineCard} aria-labelledby="about-timeline-title">
          <header className={styles.dragHandleSurface} onPointerDown={handle.onPointerDown}>
            <h2 id="about-timeline-title">{aboutContent.timelineTitle}</h2>
            <span className={styles.dragHeaderEnd}>
              <span className={styles.headerMeta}>{aboutContent.milestones.length ? `${aboutContent.milestones[0].date} — ${aboutContent.milestones.at(-1)?.date}` : "Timeline"}</span>
              <DragHandleButton label={cardLabels.timeline} onKeyDown={handle.onKeyDown} />
            </span>
          </header>
          <ol>
            {aboutContent.milestones.map(({ date, text }, index) => <li key={`${date}-${index}`}><time>{date}</time><span>{text}</span></li>)}
          </ol>
        </section>
      );
    }

    return (
      <section id="contact-register" className={styles.contactCard} aria-labelledby="about-contact-title">
        <header className={styles.dragHandleSurface} onPointerDown={handle.onPointerDown}>
          <h2 id="about-contact-title">{aboutContent.contactTitle}</h2>
          <span className={styles.dragHeaderEnd}>
            <span className={styles.headerMeta}>Contact index</span>
            <DragHandleButton label={cardLabels.contact} onKeyDown={handle.onKeyDown} />
          </span>
        </header>
        {contacts.length ? (
          <ul>
            {contacts.map(({ label, note, href, Icon, external }) => (
              <li key={label}>
                <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
                  <Icon aria-hidden="true" /><span><strong>{label}</strong><small>{note}</small></span><ArrowUpRight aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        ) : <p className={styles.contactEmpty}>{aboutContent.contactEmptyText}</p>}
        <div className={styles.contactNote}><span>Note</span><strong>{aboutContent.contactNote}</strong></div>
      </section>
    );
  };

  return (
    <div className={styles.narrative}>
      <Reorder.Group
        as="div"
        axis="xy"
        values={cardOrder}
        onReorder={setCardOrder}
        className={styles.reorderGrid}
        aria-label="可拖拽排序的关于页卡片"
      >
        {cardOrder.map((cardId) => (
          <SortableAboutCard
            key={cardId}
            cardId={cardId}
            shouldReduceMotion={shouldReduceMotion}
            onKeyboardMove={moveCardByKeyboard}
          >
            {(handle) => renderCard(cardId, handle)}
          </SortableAboutCard>
        ))}
      </Reorder.Group>
      <p className={styles.srOnly} aria-live="polite">{announcement}</p>
    </div>
  );
}
