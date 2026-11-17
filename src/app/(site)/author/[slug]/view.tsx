import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archive } from "@/components/Archive";
import { pageHref } from "@/components/Pagination";
import { getPostList, metaDescription } from "@/lib/content";
import { sanityFetch } from "@/sanity/lib/fetch";
import { authorCountsQuery, authorQuery, PAGE_SIZE } from "@/sanity/lib/queries";

type Author = { name: string; slug: string; bio?: string | null };

const getAuthor = (slug: string) => sanityFetch<Author>(authorQuery, { slug }, ["author"]);

export async function authorPages() {
  const rows = (await sanityFetch<{ slug: string; count: number }[]>(authorCountsQuery, {}, ["author", "post"])) ?? [];
  return rows.filter((r) => r.count > 0).map((r) => ({ slug: r.slug, pages: Math.ceil(r.count / PAGE_SIZE) }));
}

export async function authorMetadata(slug: string, page: number): Promise<Metadata> {
  const a = await getAuthor(slug);
  if (!a) return {};
  return {
    title: page > 1 ? `${a.name} - Page ${page}` : a.name,
    description: metaDescription(a.bio ?? `Articles by ${a.name}.`),
    alternates: { canonical: pageHref(`/author/${slug}/`, page) },
  };
}

export async function AuthorView({ slug, page }: { slug: string; page: number }) {
  const [a, list] = await Promise.all([getAuthor(slug), getPostList(page, { author: slug })]);
  if (!a || list.total === 0 || page > list.pages) notFound();
  return <Archive kicker="Author" title={a.name} description={a.bio} crumbs={[{ label: a.name, href: `/author/${slug}/` }]} list={list} base={`/author/${slug}/`} page={page} />;
}
