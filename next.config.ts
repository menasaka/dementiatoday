import type { NextConfig } from "next";
import { createClient } from "next-sanity";

/** Redirects managed in Sanity (Studio › Redirects), loaded at build time. */
async function sanityRedirects() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) return [];
  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-11-01",
    useCdn: false,
  });
  const rows = await client.fetch<{ source: string; destination: string; permanent?: boolean }[]>(
    `*[_type == "redirect" && defined(source) && defined(destination)]{ source, destination, permanent }`,
  );
  return rows.map((r) => ({ source: r.source, destination: r.destination, permanent: r.permanent ?? true }));
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Off on purpose: with it on, unknown URLs stream a 200 "soft 404". Off, they return a real 404
  // while new articles still render on first visit (then stay cached).
  partialPrefetching: false,
  // WordPress URLs end in a slash; keep them identical so rankings carry over.
  trailingSlash: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    return [
      // Old WordPress endpoints.
      { source: "/wp-admin/:path*", destination: "/studio/", permanent: false },
      { source: "/wp-login.php", destination: "/studio/", permanent: false },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      // The old WordPress HTML sitemap page.
      { source: "/sitemap/", destination: "/sitemap.xml", permanent: true },
      { source: "/:type(post|page|category|author)-sitemap:n(\\d*).xml", destination: "/sitemap.xml", permanent: true },
      { source: "/feed/:rest+", destination: "/feed/", permanent: true },
      { source: "/comments/feed/", destination: "/feed/", permanent: true },
      { source: "/category/:slug/feed/", destination: "/category/:slug/", permanent: true },
      { source: "/:slug/feed/", destination: "/:slug/", permanent: true },
      { source: "/:slug/amp/", destination: "/:slug/", permanent: true },
      { source: "/:slug/comment-page-:n/", destination: "/:slug/", permanent: true },
      // WordPress search (/?s=term) → /search/?q=term
      { source: "/", has: [{ type: "query", key: "s", value: "(?<term>.*)" }], destination: "/search/?q=:term", permanent: true },
      // Tag archives (16 tags, a handful of posts) are not carried over.
      { source: "/tag/:slug/:rest*", destination: "/", permanent: true },
      ...(await sanityRedirects()),
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
