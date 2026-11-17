import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

export const client = isSanityConfigured
  ? // No API CDN: the webhook fires the moment an editor publishes, and the CDN can still hold the old
    // version then; Next would cache that stale copy until the next publish. Next caches results anyway.
    createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" })
  : null;
