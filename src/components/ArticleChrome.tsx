"use client";

import { useEffect, useState } from "react";

/** Thin dawn-coloured bar showing how far through the article the reader is. */
export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const article = document.getElementById("article-body");
    if (!article) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = article.getBoundingClientRect();
        const total = r.height - window.innerHeight * 0.6;
        setP(Math.min(1, Math.max(0, -r.top / Math.max(total, 1))));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[3px]">
      <div className="h-full origin-left bg-gradient-to-r from-glow to-dawn-2" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="flex h-9 items-center gap-2 rounded-full border border-line px-3.5 text-[13px] font-medium text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
      aria-live="polite"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        {copied ? <path d="m5 12 5 5L20 7" /> : <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />}
      </svg>
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
