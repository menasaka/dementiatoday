// The project ID is public. The fallback lets the hosted Studio (`sanity deploy`), which does not read NEXT_PUBLIC_ variables, build too.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "eb5rh6pq";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-01";

/** False until a Sanity project is connected; the site then renders the built-in content. */
export const isSanityConfigured = projectId.length > 0;
