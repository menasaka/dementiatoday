import { CategoryView, categoryMetadata, categoryPages } from "./view";

// Every known URL is prerendered; params are read outside <Suspense> so that unknown URLs
// return a real 404 status instead of a streamed soft 404.
export const instant = false;

export async function generateStaticParams() {
  const pages = await categoryPages();
  return pages.length ? pages.map(({ slug }) => ({ slug })) : [{ slug: "dementia-news" }];
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">) {
  return categoryMetadata((await params).slug, 1);
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  return <CategoryView slug={(await params).slug} page={1} />;
}
