import { AuthorView, authorMetadata, authorPages } from "./view";

// Every known URL is prerendered; params are read outside <Suspense> so that unknown URLs
// return a real 404 status instead of a streamed soft 404.
export const instant = false;

export async function generateStaticParams() {
  const pages = await authorPages();
  return pages.length ? pages.map(({ slug }) => ({ slug })) : [{ slug: "david" }];
}

export async function generateMetadata({ params }: PageProps<"/author/[slug]">) {
  return authorMetadata((await params).slug, 1);
}

export default async function AuthorPage({ params }: PageProps<"/author/[slug]">) {
  return <AuthorView slug={(await params).slug} page={1} />;
}
