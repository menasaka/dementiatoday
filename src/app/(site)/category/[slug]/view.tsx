import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive } from "@/components/Archive";
import { FaqSection, JsonLd } from "@/components/ArticleParts";
import { breadcrumbSchema, collectionSchema, faqSchema } from "@/lib/schema";
import { pageHref } from "@/components/Pagination";
import { getPostList, metaDescription, type CategoryRef } from "@/lib/content";
import { sanityFetch } from "@/sanity/lib/fetch";
import { categoryCountsQuery, categoryQuery, PAGE_SIZE } from "@/sanity/lib/queries";

type Category = CategoryRef & {
  description?: string | null;
  seo?: { title?: string; description?: string; noindex?: boolean } | null;
  faq?: { question: string; answer: string }[] | null;
  parent?: CategoryRef | null;
  children?: CategoryRef[] | null;
};

export const getCategory = (slug: string) => sanityFetch<Category>(categoryQuery, { slug }, ["category"]);

/** Every category page (first pages and /page/N/), for generateStaticParams. */
export async function categoryPages() {
  const rows = (await sanityFetch<{ slug: string; count: number }[]>(categoryCountsQuery, {}, ["category", "post"])) ?? [];
  return rows.filter((r) => r.count > 0).map((r) => ({ slug: r.slug, pages: Math.ceil(r.count / PAGE_SIZE) }));
}

export async function categoryMetadata(slug: string, page: number): Promise<Metadata> {
  const c = await getCategory(slug);
  if (!c) return {};
  const base = `/category/${slug}/`;
  return {
    title: c.seo?.title ? { absolute: c.seo.title } : page > 1 ? `${c.title} - Page ${page}` : c.title,
    description: metaDescription(c.seo?.description ?? c.description ?? `Latest articles about ${c.title.toLowerCase()}.`),
    alternates: { canonical: pageHref(base, page) },
    robots: c.seo?.noindex ? { index: false } : undefined,
  };
}

export async function CategoryView({ slug, page }: { slug: string; page: number }) {
  const [c, list] = await Promise.all([getCategory(slug), getPostList(page, { category: slug })]);
  if (!c || list.total === 0 || page > list.pages) notFound();
  const base = `/category/${slug}/`;
  const url = page > 1 ? `${base}page/${page}/` : base;
  const faq = (c.faq ?? []).filter((f) => f?.question && f?.answer);
  const notCondition = ["dementia-news", "dementia", "aging-dementia", "dementia-care", "coronavirus-covid-19-and-alzheimers"].includes(slug);
  const crumbs = [...(c.parent ? [{ label: c.parent.title, href: `/category/${c.parent.slug}/` }] : []), { label: c.title, href: `/category/${slug}/` }];
  return (
    <>
    <JsonLd
      data={[
        collectionSchema({ name: c.title, url, description: c.description ?? undefined, condition: notCondition ? undefined : c.title }),
        breadcrumbSchema([{ name: "Home", url: "/" }, ...crumbs.map((x) => ({ name: x.label, url: x.href }))]),
        page === 1 ? faqSchema(faq, url) : null,
      ]}
    />
    <Archive kicker="Topic" title={c.title} description={c.description} crumbs={crumbs} list={list} base={`/category/${slug}/`} page={page} coverSeed={slug}>
      {c.children?.length ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {c.children.map((child) => (
            <li key={child.slug}>
              <Link href={`/category/${child.slug}/`} className="inline-block rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] text-ink-2 transition-colors hover:border-dawn hover:text-dawn">
                {child.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Archive>
    {faq.length > 0 && page === 1 && (
      <section className="container-read mt-20">
        <FaqSection faq={faq} />
      </section>
    )}
    </>
  );
}
