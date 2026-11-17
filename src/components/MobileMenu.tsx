"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/lib/content";

export function MobileMenu({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-paper-2"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Main" className="absolute inset-x-0 top-full z-50 h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-paper px-4 pt-2 pb-24 sm:px-6">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.label} className="border-b border-line py-4">
                {item.href ? (
                  <Link href={item.href} className="display block text-[28px] leading-tight">
                    {item.label}
                  </Link>
                ) : (
                  <span className="display block text-[28px] leading-tight">{item.label}</span>
                )}
                {item.children?.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {item.children.map((c) =>
                      c.href ? (
                        <li key={c.label}>
                          <Link href={c.href} className="inline-block rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] text-ink-2">
                            {c.label}
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl bg-night p-5 text-mist">
            <p className="text-[17px] text-white">Free 24/7 dementia helpline</p>
            <p className="mt-1 text-[15px]">
              Alzheimer’s Association (US):{" "}
              <a href="tel:+18002723900" className="numeric font-semibold text-ice">
                800-272-3900
              </a>
              . If someone is missing or in danger,{" "}
              <a href="tel:911" className="font-semibold text-ice">
                call 911
              </a>
              .
            </p>
          </div>
        </nav>
      )}
    </div>
  );
}
