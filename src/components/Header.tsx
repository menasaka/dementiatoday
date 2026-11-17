import Link from "next/link";
import type { SiteSettings } from "@/lib/content";
import { Wordmark } from "./Brand";
import { MobileMenu } from "./MobileMenu";

export function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** The 24/7 Alzheimer's Association Helpline (US). Free, for anyone affected by dementia. */
export const HELPLINE = { label: "800-272-3900", tel: "+18002723900" };

/** Thin bar above the header: where to get help today, any hour. */
export function CrisisBar() {
  return (
    <div className="bg-night text-[14px] text-mist">
      <div className="container-site flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 py-1.5 text-center sm:justify-between">
        <p className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-ice" aria-hidden="true" />
          <span className="hidden sm:inline">
            Questions about memory loss or caregiving? Free 24/7 Helpline:{" "}
            <a href={`tel:${HELPLINE.tel}`} className="numeric font-semibold text-white underline decoration-ice/50 underline-offset-2 hover:decoration-ice">
              {HELPLINE.label}
            </a>
          </span>
          <a href="#help" className="text-white sm:hidden">
            24/7 dementia helpline <span className="numeric font-semibold text-ice">{HELPLINE.label}</span>
          </a>
        </p>
        <a href="#help" className="group hidden items-center gap-1.5 text-mist hover:text-white sm:inline-flex">
          Someone missing or in danger? <span className="font-semibold text-ice">Call 911</span> <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}

const navLink = "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[15.5px] font-medium whitespace-nowrap text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink";

export function Header({ settings }: { settings: SiteSettings }) {
  return (
    <>
      <CrisisBar />
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        {/* Tier 1: brand, search, help */}
        <div className="container-site flex h-[72px] items-center justify-between gap-6 lg:h-[84px]">
          <Link href="/" aria-label={`${settings.siteName} home`} className="shrink-0">
            <Wordmark name={settings.siteName} priority />
          </Link>

          <form action="/search/" role="search" className="relative hidden max-w-[440px] flex-1 lg:block">
            <label htmlFor="header-q" className="sr-only">
              Search articles
            </label>
            <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
              <SearchIcon size={17} />
            </span>
            <input
              id="header-q"
              name="q"
              type="search"
              placeholder="Search symptoms, types, care, research…"
              className="h-11 w-full rounded-full border border-line bg-paper pr-4 pl-11 text-[14.5px] text-ink outline-none placeholder:text-muted focus:border-ink"
            />
          </form>

          <div className="flex items-center gap-2">
            <Link href="/search/" aria-label="Search articles" className="flex size-10 items-center justify-center rounded-full border border-line text-ink-2 hover:border-ink-3 lg:hidden">
              <SearchIcon size={17} />
            </Link>
            <Link
              href="/#signs"
              className="hidden items-center gap-2 rounded-full bg-dawn px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-night sm:flex"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              10 warning signs
            </Link>
            <MobileMenu nav={settings.nav} />
          </div>
        </div>

        {/* Tier 2: main navigation */}
        <nav aria-label="Main" className="hidden border-t border-line lg:block">
          <ul className="container-site flex h-[52px] items-center gap-1">
            {settings.nav.map((item) => (
              <li key={item.label} className="group relative">
                {item.href ? (
                  <Link href={item.href} className={navLink}>
                    {item.label}
                    {item.children?.length ? <Chevron /> : null}
                  </Link>
                ) : (
                  <button type="button" className={navLink}>
                    {item.label}
                    <Chevron />
                  </button>
                )}
                {item.children?.length ? (
                  <div className="invisible absolute top-full left-0 z-50 translate-y-1 pt-2 opacity-0 transition-all duration-200 ease-out-soft group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="w-[320px] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_-12px_rgba(60,45,20,0.22)]">
                      <p className="kicker border-b border-line px-5 pt-4 pb-3">{item.label}</p>
                      <ul className="p-2">
                        {item.children.map((c) =>
                          c.href ? (
                            <li key={c.label}>
                              <Link href={c.href} className="group/item flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] text-ink-2 hover:bg-paper hover:text-ink">
                                {c.label}
                                <Arrow className="text-dawn opacity-0 transition-all duration-300 group-hover/item:translate-x-0.5 group-hover/item:opacity-100" />
                              </Link>
                            </li>
                          ) : null,
                        )}
                      </ul>
                      {item.href && (
                        <Link href={item.href} className="flex items-center justify-between bg-paper px-5 py-3 text-[13.5px] font-semibold text-ink hover:text-dawn">
                          All {item.label.toLowerCase()} <Arrow />
                        </Link>
                      )}
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" className="opacity-50 transition-transform duration-300 group-hover:rotate-180">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
