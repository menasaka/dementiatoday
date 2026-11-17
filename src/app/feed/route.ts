import { defaultSettings, siteUrl } from "@/lib/content";
import { sanityFetch } from "@/sanity/lib/fetch";
import { feedQuery } from "@/sanity/lib/queries";

type FeedItem = { title: string; path: string; excerpt?: string; publishedAt?: string; categories?: string[]; author?: string };

const esc = (s = "") => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed at /feed/, the same URL WordPress used. */
export async function GET() {
  const items = (await sanityFetch<FeedItem[]>(feedQuery, {}, ["post"])) ?? [];
  const s = defaultSettings;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${esc(s.siteName)}</title>
<link>${siteUrl}/</link>
<atom:link href="${siteUrl}/feed/" rel="self" type="application/rss+xml"/>
<description>${esc(s.tagline)}</description>
<language>en-US</language>
${items[0]?.publishedAt ? `<lastBuildDate>${new Date(items[0].publishedAt).toUTCString()}</lastBuildDate>` : ""}
${items
  .map(
    (i) => `<item>
<title>${esc(i.title)}</title>
<link>${siteUrl}${i.path}</link>
<guid isPermaLink="true">${siteUrl}${i.path}</guid>
${i.publishedAt ? `<pubDate>${new Date(i.publishedAt).toUTCString()}</pubDate>` : ""}
${i.author ? `<dc:creator>${esc(i.author)}</dc:creator>` : ""}
${(i.categories ?? []).map((c) => `<category>${esc(c)}</category>`).join("")}
${i.excerpt ? `<description>${esc(i.excerpt)}</description>` : ""}
</item>`,
  )
  .join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
