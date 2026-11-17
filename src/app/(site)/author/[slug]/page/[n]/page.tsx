import { notFound } from "next/navigation";
import { parsePageNumber } from "@/lib/content";
import { AuthorView, authorMetadata, authorPages } from "../../view";

// Every known URL is prerendered; params are read outside <Suspense> so that unknown URLs
// return a real 404 status instead of a streamed soft 404.
export const instant = false;

export async function generateStaticParams() {
  const params = (await authorPages()).flatMap(({ slug, pages }) => Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ slug, n: String(i + 2) })));
  return params.length ? params : [{ slug: "david", n: "2" }];
}

export async function generateMetadata({ params }: PageProps<"/author/[slug]/page/[n]">) {
  const { slug, n } = await params;
  return authorMetadata(slug, parsePageNumber(n) ?? 1);
}

export default async function AuthorArchivePage({ params }: PageProps<"/author/[slug]/page/[n]">) {
  const { slug, n } = await params;
  const page = parsePageNumber(n);
  if (!page) notFound();
  return <AuthorView slug={slug} page={page} />;
}
