import { cacheLife, cacheTag } from "next/cache";
import type { QueryParams } from "next-sanity";
import { client } from "./client";

/**
 * Cached GROQ fetch. Results stay cached until the Sanity webhook
 * (/api/revalidate/) invalidates the "sanity" tag or a document-type tag.
 * Article lists (anything tagged "post": homepage, categories, news box, feed, sitemap) also
 * refresh at least hourly, so a new article shows up even if a webhook call is lost.
 * Returns null when no Sanity project is connected yet.
 */
export async function sanityFetch<T>(query: string, params: QueryParams = {}, tags: string[] = []): Promise<T | null> {
  "use cache";
  if (tags.includes("post")) cacheLife({ stale: 300, revalidate: 3600, expire: 60 * 60 * 24 * 30 });
  else cacheLife("max");
  cacheTag("sanity", ...tags);
  if (!client) return null;
  return client.fetch<T>(query, params);
}
