import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";
import { sanityFetch } from "@/sanity/lib/fetch";
import { sitemapQuery } from "@/sanity/lib/queries";

type Data = { docs: { path: string; lastModified?: string }[]; categories: { slug: string; lastModified?: string }[] };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await sanityFetch<Data>(sitemapQuery, {}, ["post", "page", "category"]);
  const newest = data?.docs.reduce<string | undefined>((max, d) => (d.lastModified && (!max || d.lastModified > max) ? d.lastModified : max), undefined);
  return [
    { url: `${siteUrl}/`, lastModified: newest, changeFrequency: "daily", priority: 1 },
    ...(data?.categories ?? []).map((c) => ({ url: `${siteUrl}/category/${c.slug}/`, lastModified: c.lastModified, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...(data?.docs ?? []).map((d) => ({ url: `${siteUrl}${d.path}`, lastModified: d.lastModified, priority: 0.7 })),
  ];
}
