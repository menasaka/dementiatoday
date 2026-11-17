"use client";

import { useEffect, useState } from "react";

type Item = { id: string; text: string };

/** Table of contents; the section being read is highlighted. */
export function OnThisPage({ items, title = "On this page" }: { items: Item[]; title?: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav aria-label={title}>
      <h2 className="text-[11.5px] font-semibold tracking-[0.14em] text-muted uppercase">{title}</h2>
      <ol className="mt-3 border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1.5 pl-3 text-[14px] leading-snug transition-colors ${
                active === item.id ? "border-dawn font-medium text-dawn" : "border-transparent text-ink-3 hover:border-line-2 hover:text-ink"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
