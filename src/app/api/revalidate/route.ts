import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Accepts both the slim projection {_type, "path": path.current} and the full document
// (Sanity's default payload), where path is a slug object.
type Payload = { _type?: string; path?: string | { current?: string } };

/**
 * Sanity webhook target: https://dementiatoday.net/api/revalidate/ (keep the trailing slash),
 * signed with SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });

  // `true` waits for the Content Lake to settle before we refetch.
  const { isValidSignature, body } = await parseBody<Payload>(req, secret, true);
  if (!isValidSignature) return Response.json({ error: "Invalid signature" }, { status: 401 });
  if (!body?._type) return Response.json({ error: "Missing _type" }, { status: 400 });

  const path = typeof body.path === "string" ? body.path : body.path?.current;
  // Expire at once (no stale-while-revalidate), so the first visit after publishing shows the edit.
  const now = { expire: 0 };
  revalidateTag(body._type, now);
  if (path) revalidateTag(`path:${path}`, now);
  // Pages, the homepage, sidebars and settings reference each other, so refresh shared queries too.
  revalidateTag("sanity", now);

  return Response.json({ revalidated: [body._type, path].filter(Boolean) });
}
