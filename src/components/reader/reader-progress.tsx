"use client";

import { useEffect, useState } from "react";

import styles from "./immersive-reader.module.css";

export function ReaderProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reader = document.querySelector<HTMLElement>("[data-immersive-reader]");
    const body = reader?.querySelector<HTMLElement>("[data-reader-body]");

    if (!reader || !body) return;

    const headings = Array.from(body.querySelectorAll<HTMLElement>("h2[id], h3[id]"));
    const tocLinks = Array.from(reader.querySelectorAll<HTMLAnchorElement>("[data-reader-toc-link]"));

    const update = () => {
      const bodyTop = body.getBoundingClientRect().top + window.scrollY;
      const start = bodyTop - window.innerHeight * 0.22;
      const distance = Math.max(body.offsetHeight - window.innerHeight * 0.58, 1);
      const nextProgress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      setProgress(nextProgress);

      let activeId = headings[0]?.id ?? "";
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= window.innerHeight * 0.28) {
          activeId = heading.id;
        } else {
          break;
        }
      }

      tocLinks.forEach((link) => {
        if (link.dataset.readerTocLink === activeId && activeId) {
          link.dataset.active = "true";
          link.setAttribute("aria-current", "location");
        } else {
          delete link.dataset.active;
          link.removeAttribute("aria-current");
        }
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className={styles.progressTrack}
      role="progressbar"
      aria-label="阅读进度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
