import Link from "next/link";
import type { PostList } from "@/lib/content";
import { GridCard, Media, Meta } from "./Cards";
import { Cover } from "./Cover";
import { Pagination } from "./Pagination";

type Crumb = { label: string; href: string };

export function Archive({
  kicker,
  title,
  description,
  crumbs = [],
  list,
  base,
  page,
  coverSeed,
  children,
}: {
  kicker?: string;
  title: string;
  description?: string | null;
  crumbs?: Crumb[];
  list: PostList;
  base: string;
  page: number;
  /** Category slug for the header art; omit for no art. */
  coverSeed?: string;
  children?: React.ReactNode;
}) {
  const [first, ...rest] = list.items;
  const feature = page === 1 && first;
  const grid = feature ? rest : list.items;

  return (
    <>
      <section className="border-b border-line">
        <div className={`container-site grid items-center gap-10 py-12 md:py-16 ${coverSeed ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
              {crumbs.slice(0, -1).map((c) => (
                <span key={c.href} className="flex items-center gap-2">
                  <span aria-hidden="true">/</span>
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                </span>
              ))}
            </nav>
            {kicker && <p className="kicker mb-3">{kicker}</p>}
            <h1 className="display text-[44px] leading-[1] sm:text-[60px] lg:text-[72px]">{title}</h1>
            {description && page === 1 && <p className="mt-6 max-w-[58ch] font-serif text-[19px] leading-relaxed text-body">{description}</p>}
            <p className="mt-6 flex items-center gap-3 text-[14px] text-muted">
              <span className="font-semibold text-ink">{list.total.toLocaleString("en-US")} articles</span>
              {page > 1 && (
                <>
                  <span aria-hidden="true" className="size-[3px] rounded-full bg-line-2" />
                  <span>
                    Page {page} of {list.pages}
                  </span>
                </>
              )}
            </p>
            {children}
          </div>
          {coverSeed && (
            <div className="hidden overflow-hidden rounded-[28px] lg:block">
              <Cover seed={`header-${coverSeed}`} category={coverSeed} className="aspect-[4/3] w-full" />
            </div>
          )}
        </div>
      </section>

      <section className="container-site pt-14">
        {list.items.length === 0 ? (
          <p className="text-body">Articles appear here once they are imported into Sanity.</p>
        ) : (
          <>
            {feature && (
              <article className="group relative mb-16 grid items-center gap-8 border-b border-line pb-16 md:grid-cols-2 md:gap-12">
                <div className="overflow-hidden rounded-[24px]">
                  <Media post={first} className="aspect-[3/2] w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]" sizes="(min-width: 768px) 50vw, 100vw" priority />
                </div>
                <div className="flex flex-col gap-3">
                  <p className="kicker">Most recent</p>
                  <h2 className="display text-[30px] leading-[1.08] sm:text-[40px]">
                    <Link href={first.path} className="link-sweep after:absolute after:inset-0 group-hover:[background-size:100%_1px]">
                      {first.title}
                    </Link>
                  </h2>
                  {first.excerpt && <p className="line-clamp-4 font-serif text-[18px] leading-relaxed text-body">{first.excerpt}</p>}
                  <Meta post={first} className="mt-1" />
                </div>
              </article>
            )}
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((p) => (
                <GridCard key={p._id} post={p} />
              ))}
            </div>
          </>
        )}
        <Pagination base={base} current={page} total={list.pages} />
      </section>
    </>
  );
}
