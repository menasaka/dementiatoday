import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archive } from "@/components/Archive";
import { getPostList, parsePageNumber } from "@/lib/content";

// Every known URL is prerendered; params are read outside <Suspense> so that unknown URLs
// return a real 404 status instead of a streamed soft 404.
export const instant = false;

export async function generateStaticParams() {
  const { pages } = await getPostList(1);
  const params = Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ n: String(i + 2) }));
  return params.length ? params : [{ n: "2" }];
}

export async function generateMetadata({ params }: PageProps<"/page/[n]">): Promise<Metadata> {
  const { n } = await params;
  return { title: `Latest articles - Page ${n}`, alternates: { canonical: `/page/${n}/` } };
}

export default async function HomeArchivePage({ params }: PageProps<"/page/[n]">) {
  const page = parsePageNumber((await params).n);
  if (!page) notFound();
  const list = await getPostList(page);
  if (page > list.pages) notFound();
  return <Archive kicker="Archive" title="All articles" list={list} base="/" page={page} />;
}
