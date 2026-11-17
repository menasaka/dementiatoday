import type { Metadata } from "next";
import Link from "next/link";
import { GridCard, RowCard } from "@/components/Cards";
import { Arrow } from "@/components/Header";
import { JsonLd } from "@/components/ArticleParts";
import { CareBand, Doors, Hero, NewsRail, StartHere, TypesAtlas } from "@/components/HomeSections";
import { WarningSigns } from "@/components/WarningSigns";
import { collectionSchema } from "@/lib/schema";
import { getPostList, getSettings, metaDescription, type CategoryRef, type PostCard } from "@/lib/content";
import { sanityFetch } from "@/sanity/lib/fetch";
import { categoryCountsWithTitleQuery, homeSectionQuery } from "@/sanity/lib/queries";
import { defineQuery } from "next-sanity";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { absolute: s.homeTitle },
    description: metaDescription(s.description),
    alternates: { canonical: "/" },
    openGraph: s.ogImage ? { images: [s.ogImage] } : undefined,
  };
}

/** Evergreen reference pages from the WordPress site, shown as "Essential guides" when they exist. */
const GUIDES = [
  { path: "/dementia/", title: "Normal aging and dementia", text: "How everyday forgetfulness differs from the memory loss of dementia." },
  { path: "/home-2/", title: "Different types of dementia", text: "The main causes of dementia and how their symptoms differ." },
  { path: "/cognition-and-cognitive-testing/", title: "Cognition and memory testing", text: "What doctors check, and what the common memory tests involve." },
  { path: "/alcohol-dementia-wernicke-korsakoff-syndrome/", title: "Alcohol and dementia", text: "Alcohol-related brain damage and Wernicke-Korsakoff syndrome." },
];
const existingPathsQuery = defineQuery(`*[_type == "page" && path.current in $paths].path.current`);

const CARE_SLUG = "dementia-care";

function TopicRow({ category, posts, flip }: { category: CategoryRef; posts: PostCard[]; flip: boolean }) {
  const [first, ...rest] = posts;
  return (
    <section aria-labelledby={`t-${category.slug}`} className="container-site mt-24">
      <div className="mb-8 flex items-end justify-between gap-6 border-b-2 border-ink pb-4">
        <h2 id={`t-${category.slug}`} className="display text-[30px] leading-none sm:text-[38px]">
          {category.title}
        </h2>
        <Link href={`/category/${category.slug}/`} className="group flex shrink-0 items-center gap-2 pb-1 text-[15px] font-semibold text-ink hover:text-dawn">
          See all <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
      <div className={`grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <GridCard post={first} />
        <div className="divide-y divide-line border-t border-line lg:border-t-0">
          {rest.map((p) => (
            <RowCard key={p._id} post={p} showExcerpt />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [settings, list, cats, guidePaths] = await Promise.all([
    getSettings(),
    getPostList(1),
    sanityFetch<(CategoryRef & { count: number })[]>(categoryCountsWithTitleQuery, {}, ["category", "post"]),
    sanityFetch<string[]>(existingPathsQuery, { paths: GUIDES.map((g) => g.path) }, ["page"]),
  ]);
  const counts = Object.fromEntries((cats ?? []).map((c) => [c.slug, c.count]));
  const [lead, ...others] = list.items;
  const rail = others.slice(0, 8);
  const shown = new Set([lead, ...rail].filter(Boolean).map((p) => p._id));

  // Care band first, then the topic rows, handing out posts in page order so nothing repeats.
  const topicCats = settings.homeSections.filter((c) => c.slug !== CARE_SLUG);
  const [carePool, ...pools] = await Promise.all([
    sanityFetch<PostCard[]>(homeSectionQuery, { slug: CARE_SLUG, limit: 18 }, ["post"]),
    ...topicCats.map((c) => sanityFetch<PostCard[]>(homeSectionQuery, { slug: c.slug, limit: 16 }, ["post"])),
  ]);
  const take = (pool: PostCard[] | null, n: number) => {
    const out = (pool ?? []).filter((p) => !shown.has(p._id)).slice(0, n);
    out.forEach((p) => shown.add(p._id));
    return out;
  };
  const care = take(carePool, 6);
  const topics = topicCats.map((c, i) => ({ category: c, posts: take(pools[i], 4) })).filter((t) => t.posts.length >= 2);
  const rest = list.items.filter((p) => !shown.has(p._id));
  const more = rest.slice(0, Math.floor(Math.min(rest.length, 6) / 3) * 3);
  const guides = GUIDES.filter((g) => (guidePaths ?? []).includes(g.path));

  return (
    <>
      <h1 className="sr-only">{settings.homeTitle}</h1>
      <JsonLd data={[collectionSchema({ name: settings.homeTitle, url: "/", description: metaDescription(settings.description) })]} />

      <Hero lead={lead} count={list.total} />
      {!lead && <p className="container-site py-24 text-body">Articles appear here once they are imported into Sanity.</p>}
      <Doors />
      <NewsRail posts={rail} />

      <section id="signs" aria-labelledby="signs-title" className="scroll-mt-36 bg-paper-2 py-20">
        <div className="container-site">
          <div className="mb-10 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-10">
            <div>
              <p className="kicker">10 early warning signs</p>
              <h2 id="signs-title" className="display mt-2 text-[34px] leading-[1.05] sm:text-[46px]">
                Normal aging, or <span className="accent text-dawn">an early sign of dementia?</span>
              </h2>
            </div>
            <p className="text-[17px] leading-relaxed text-body">Everyone forgets things. Open each sign to compare it with what is typical with age, and tick the changes you have noticed.</p>
          </div>
          <WarningSigns />
        </div>
      </section>

      <TypesAtlas counts={counts} />
      {topics[0] && <TopicRow category={topics[0].category} posts={topics[0].posts} flip={false} />}
      {care.length > 0 && <CareBand posts={care} />}
      {topics.slice(1).map((t, i) => (
        <TopicRow key={t.category.slug} category={t.category} posts={t.posts} flip={i % 2 === 0} />
      ))}
      <StartHere guides={guides} />

      {more.length > 0 && (
        <section className="container-site mt-24">
          <div className="mb-8 flex items-end justify-between gap-6 border-b-2 border-ink pb-4">
            <h2 className="display text-[30px] leading-none sm:text-[38px]">More stories</h2>
            <Link href="/page/2/" className="group flex shrink-0 items-center gap-2 pb-1 text-[15px] font-semibold text-ink hover:text-dawn">
              Older articles <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <GridCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
