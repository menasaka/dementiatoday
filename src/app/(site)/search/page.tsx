import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RowCard } from "@/components/Cards";
import { SearchIcon } from "@/components/Header";
import type { PostCard } from "@/lib/content";
import { client } from "@/sanity/lib/client";
import { searchQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true }, alternates: { canonical: "/search/" } };

const SUGGESTIONS = ["Salt", "White coat", "Stress", "Pregnancy", "Kidney", "Medication"];

/** "brain stimulation" -> ["brain*", "stimulation*"] for GROQ `match`. */
const toTerms = (q: string) =>
  q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 6)
    .map((w) => `${w}*`);

function SearchForm({ q = "" }: { q?: string }) {
  return (
    <form action="/search/" role="search" className="relative">
      <label htmlFor="q" className="sr-only">
        Search articles
      </label>
      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-muted">
        <SearchIcon size={20} />
      </span>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Search 1,300+ articles"
        autoComplete="off"
        className="h-16 w-full rounded-full border border-line-2 bg-white pr-32 pl-14 text-[17px] text-ink shadow-[0_8px_30px_-12px_rgba(10,21,40,0.15)] outline-none placeholder:text-muted focus:border-ink"
      />
      <button type="submit" className="absolute top-2 right-2 bottom-2 rounded-full bg-ink px-6 text-[15px] font-medium text-paper hover:bg-ink-2">
        Search
      </button>
    </form>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 100) ?? "";
  const terms = toTerms(q);
  const results = terms.length && client ? await client.fetch<PostCard[]>(searchQuery, { q: terms }) : [];

  return (
    <>
      <SearchForm q={q} />
      {!q && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[13px] text-muted">Try</span>
          {SUGGESTIONS.map((s) => (
            <Link
              key={s}
              href={`/search/?q=${encodeURIComponent(s)}`}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] text-ink-2 transition-colors hover:border-dawn hover:text-dawn"
            >
              {s}
            </Link>
          ))}
        </div>
      )}
      {q && (
        <p className="mt-10 border-b border-ink pb-3 text-[14px] text-muted" aria-live="polite">
          {results.length ? (
            <>
              <span className="font-semibold text-ink">
                {results.length}
                {results.length === 30 ? "+" : ""} results
              </span>{" "}
              for “{q}”
            </>
          ) : (
            <>No articles found for “{q}”. Try a broader word.</>
          )}
        </p>
      )}
      <div className="divide-y divide-line">
        {results.map((p) => (
          <RowCard key={p._id} post={p} showExcerpt />
        ))}
      </div>
    </>
  );
}

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <div className="container-read pt-16 md:pt-24">
      <p className="kicker mb-3">Search</p>
      <h1 className="display mb-10 text-[44px] leading-[1] md:text-[60px]">What are you looking for?</h1>
      <Suspense fallback={<div className="h-16 rounded-full border border-line-2 bg-white" />}>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
