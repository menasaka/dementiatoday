import Link from "next/link";
import { Cover } from "@/components/Cover";

export default function NotFound() {
  return (
    <div className="container-site grid items-center gap-12 pt-16 md:pt-24 lg:grid-cols-2">
      <div>
        <p className="kicker mb-3">Page not found</p>
        <h1 className="display text-[48px] leading-[1] md:text-[68px]">This page has moved, or never was.</h1>
        <p className="mt-6 max-w-[48ch] font-serif text-[19px] leading-relaxed text-body">The article you were looking for may have a new address. Search the archive, or start again from the front page.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/search/" className="rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper hover:bg-ink-2">
            Search articles
          </Link>
          <Link href="/" className="rounded-full border border-line-2 px-6 py-3.5 text-[15px] font-medium text-ink hover:border-ink">
            Go to the homepage
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-[28px]">
        <Cover seed="not-found-7" category="alzheimers-disease" className="aspect-[4/3] w-full" />
      </div>
    </div>
  );
}
