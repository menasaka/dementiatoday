import Link from "next/link";

/** WordPress-style pagination: page 1 at `base`, then `base` + page/N/. */
export const pageHref = (base: string, n: number) => (n <= 1 ? base : `${base}page/${n}/`);

function pageList(current: number, total: number): (number | "…")[] {
  const set = new Set([1, total, current - 1, current, current + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

const pill = "flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-[14px] font-medium transition-colors";

export function Pagination({ base, current, total }: { base: string; current: number; total: number }) {
  if (total <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-6">
      {current > 1 ? (
        <Link href={pageHref(base, current - 1)} rel="prev" className={`${pill} border border-line bg-white text-ink hover:border-ink`}>
          ← Newer
        </Link>
      ) : (
        <span />
      )}
      <ol className="order-last flex w-full flex-wrap items-center justify-center gap-1 sm:order-none sm:w-auto">
        {pageList(current, total).map((n, i) =>
          n === "…" ? (
            <li key={`gap-${i}`} className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={n}>
              {n === current ? (
                <span aria-current="page" className={`${pill} bg-ink text-paper`}>
                  {n}
                </span>
              ) : (
                <Link href={pageHref(base, n)} className={`${pill} text-ink-2 hover:bg-paper-2`}>
                  {n}
                </Link>
              )}
            </li>
          ),
        )}
      </ol>
      {current < total ? (
        <Link href={pageHref(base, current + 1)} rel="next" className={`${pill} bg-ink text-paper hover:bg-ink-2`}>
          Older →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
