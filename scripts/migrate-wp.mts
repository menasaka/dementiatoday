/**
 * WordPress to Sanity export for dementiatoday.net.
 *
 *   node scripts/migrate-wp.mts
 *
 * Reads posts, pages, categories, authors and media from the live WordPress REST
 * API and writes migration-output/dementiatoday.ndjson, ready for:
 *
 *   npx sanity dataset import migration-output/dementiatoday.ndjson --dataset production --replace
 *
 * Images are referenced with `_sanityAsset`, so the Sanity CLI downloads and
 * uploads them during the import. Every image URL is checked first, because one
 * missing file would stop the whole import. Nothing is written to Sanity here.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { htmlToBlocks, randomKey } from "@portabletext/block-tools";
import { compileSchema } from "@portabletext/schema";
import { JSDOM, VirtualConsole } from "jsdom";

const SITE = "https://dementiatoday.net";
const API = `${SITE}/wp-json/wp/v2`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "migration-output");
const OUT_FILE = "dementiatoday.ndjson";
// The host returns 406 to non-browser clients, so identify as a browser.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const IMG_DIR = resolve(ROOT, "migration-output", "images");

// Pages handled by dedicated Next.js routes.
const SKIP_PAGE_PATHS = new Set(["/", "/sitemap/"]);

type Doc = Record<string, unknown> & { _id: string; _type: string };
type Rendered = { rendered: string };
type WpPost = {
  id: number;
  link: string;
  slug: string;
  date_gmt: string;
  modified_gmt: string;
  title: Rendered;
  content: Rendered;
  excerpt: Rendered;
  author: number;
  categories: number[];
  featured_media: number;
};
type WpPage = { id: number; link: string; slug: string; title: Rendered; content: Rendered };
type WpCategory = { id: number; name: string; slug: string; description: string; parent: number; count: number };
type WpUser = { id: number; name: string; slug: string; description: string };
type WpMedia = { id: number; source_url: string; alt_text: string; caption: Rendered };

const report: string[] = [];
const log = (msg: string) => {
  console.log(msg);
  report.push(msg);
};

// ---------- fetching ----------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** fetch with retries for flaky connections and 5xx/429 responses. */
async function fetchRetry(url: string, init: RequestInit = {}): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers: { "User-Agent": UA, Accept: "text/html,application/json,image/*,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9" }, redirect: "follow" });
      if (res.ok || (res.status < 500 && res.status !== 429)) return res;
      if (attempt >= 4) return res;
    } catch (err) {
      if (attempt >= 4) throw err;
    }
    await sleep(1500 * attempt);
  }
}

async function getJson<T>(url: string): Promise<{ data: T; totalPages: number }> {
  const res = await fetchRetry(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return { data: (await res.json()) as T, totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1) };
}

async function getAll<T>(endpoint: string, fields: string, extra = ""): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1, total = 1; page <= total; page++) {
    const { data, totalPages } = await getJson<T[]>(`${API}/${endpoint}?per_page=100&page=${page}&_fields=${fields}${extra}`);
    out.push(...data);
    total = totalPages;
    if (total > 1) process.stdout.write(`\r  ${endpoint}: page ${page}/${total}`);
    await sleep(200); // be gentle with the live server
  }
  if (out.length > 100) process.stdout.write("\n");
  return out;
}

/** Runs `fn` over items with limited concurrency. */
async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

// ---------- HTML helpers ----------

const virtualConsole = new VirtualConsole();
const parseHtml = (html: string) => new JSDOM(html, { virtualConsole }).window.document;
const decodeDoc = new JSDOM("<!doctype html><p></p>").window.document;
/** Decodes HTML entities, repeatedly: some WordPress titles are double-encoded ("J&amp;amp;J"). */
const decode = (s = "") => {
  const el = decodeDoc.createElement("textarea");
  let out = s;
  for (let i = 0; i < 3 && /&(#\d+|#x[0-9a-f]+|[a-z]+);/i.test(out); i++) {
    el.innerHTML = out;
    out = el.value;
  }
  return out.trim();
};
const stripTags = (html = "") => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const HOST_RE = /^(?:https?:)?\/\/(?:www\.)?dementiatoday\.net/i;
/** Makes links to the old site relative; fixes "dementiatoday.net/x/" links that lack a scheme. */
function toRelative(href: string) {
  let h = href.trim().replace(/^(?:www\.)?dementiatoday\.net/i, "");
  h = h.replace(HOST_RE, "");
  if (h === "") return "/";
  return h;
}
const absoluteUrl = (src: string) => new URL(src.replace(/^(?:www\.)?dementiatoday\.net/i, ""), SITE).href;

const schema = compileSchema({
  styles: [{ name: "normal" }, { name: "h2" }, { name: "h3" }, { name: "h4" }, { name: "blockquote" }],
  lists: [{ name: "bullet" }, { name: "number" }],
  decorators: [{ name: "strong" }, { name: "em" }, { name: "underline" }],
  annotations: [{ name: "link", fields: [{ name: "href", type: "string" }, { name: "blank", type: "boolean" }] }],
});

const MARK_RE = /^@@(IMG|EMBED|TABLE):(\d+)@@$/;

type Pending = { images: { url: string; alt: string; caption?: string }[]; embeds: { url: string; title?: string }[]; tables: { rows: string[][]; caption?: string }[] };

const stats = { images: 0, embeds: 0, tables: 0, scripts: 0, forms: 0, emails: 0, faqPosts: 0 };
const internalLinks = new Map<string, Set<string>>(); // target path -> source paths

/** Questions and answers lifted out of the last converted body (see takeFaq). */
let lastFaq: { question: string; answer: string }[] = [];

/**
 * The news publisher writes each article's FAQ as <h2>Frequently Asked Questions</h2> followed by
 * <details><summary>1. Question?</summary><div>Answer</div></details>. Those pairs are unique to
 * the article, so they move to the post's own `faq` field (rendered once, with FAQPage markup)
 * and are removed from the body.
 */
function takeFaq(body: HTMLElement) {
  const items = [...body.querySelectorAll("details")]
    .map((d) => {
      const summary = d.querySelector("summary");
      const question = (summary?.textContent ?? "").replace(/\s+/g, " ").trim().replace(/^\d+[.)]\s*/, "");
      summary?.remove();
      const answer = (d.textContent ?? "").replace(/\s+/g, " ").trim();
      return { d, question, answer };
    })
    .filter((x) => x.question && x.answer);
  lastFaq = items.map(({ question, answer }) => ({ question, answer }));
  if (!items.length) return;
  stats.faqPosts++;
  items.forEach((x) => x.d.remove());
  for (const h of [...body.querySelectorAll("h2, h3, h4, p, strong")]) {
    if (/^(frequently asked questions|faqs?)\s*:?$/i.test((h.textContent ?? "").trim())) (h.closest("p") ?? h).remove();
  }
}

/**
 * Converts WordPress HTML to Portable Text. Images, iframes and tables become
 * their own blocks via text markers; scripts, styles, forms and shortcodes are dropped.
 */
function htmlToBody(html: string, sourcePath: string): unknown[] {
  const doc = parseHtml(`<!doctype html><body>${html}</body>`);
  const body = doc.body;
  takeFaq(body);
  const pending: Pending = { images: [], embeds: [], tables: [] };
  const marker = (kind: string, i: number) => {
    const p = doc.createElement("p");
    p.textContent = `@@${kind}:${i}@@`;
    return p;
  };
  /** Replace an inline element with a block marker, lifting it out of its paragraph. */
  const replaceWithMarker = (el: Element, kind: string, i: number) => {
    const m = marker(kind, i);
    const block = el.closest("p, figure, h1, h2, h3, h4, h5, h6, li, blockquote, div.wp-caption") ?? el;
    if (block !== el && block.parentNode) {
      block.parentNode.insertBefore(m, block);
      el.remove();
      if (!block.textContent?.trim() && !block.querySelector("img, iframe, table")) block.remove();
    } else {
      el.replaceWith(m);
    }
  };

  // Old ExpressionEngine email obfuscation: <span id="eeEncEmail_…"> + a script that writes
  // a reversed array of characters. Decode it back into a plain mailto link.
  // Two variants: <span id="eeEncEmail_…"> with l[n] = '…' assignments, and <span data-eeEncEmail_…> with an array literal.
  const encSpans = [...body.querySelectorAll("span")].filter((sp) => sp.id.startsWith("eeEncEmail_") || [...sp.attributes].some((a) => a.name.startsWith("data-eeencemail_")));
  for (const span of encSpans) {
    const script = span.nextElementSibling?.tagName === "SCRIPT" ? span.nextElementSibling : null;
    const code = script?.textContent ?? "";
    const literal = code.match(/l\s*=\s*\[([\s\S]*?)\]\s*,\s*i\s*=/)?.[1];
    const parts = literal
      ? [...literal.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\(.)/g, "$1"))
      : [...code.matchAll(/l\[\d+\]\s*=\s*'([^']*)'/g)].map((m) => m[1]);
    const html = parts
      .reverse()
      .map((p) => (/^ \d+$/.test(p) ? String.fromCharCode(Number(p)) : p))
      .join("");
    const email = html.replace(/<[^>]+>/g, " ").match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/)?.[0] ?? html.match(/mailto:([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/)?.[1];
    if (email) {
      const a = doc.createElement("a");
      a.setAttribute("href", `mailto:${email}`);
      a.textContent = email;
      span.replaceWith(a);
      stats.emails++;
    } else span.remove();
    script?.remove();
  }

  body.querySelectorAll("script, style, noscript, form, input, button, select, textarea").forEach((n) => {
    if (n.tagName === "SCRIPT") stats.scripts++;
    if (n.tagName === "FORM") stats.forms++;
    n.remove();
  });

  for (const table of [...body.querySelectorAll("table")]) {
    const rows = [...table.querySelectorAll("tr")].map((tr) => [...tr.querySelectorAll("th, td")].map((c) => stripTags(c.innerHTML)));
    const caption = table.querySelector("caption")?.textContent?.trim() || undefined;
    if (rows.some((r) => r.some(Boolean))) {
      pending.tables.push({ rows, caption });
      stats.tables++;
      replaceWithMarker(table, "TABLE", pending.tables.length - 1);
    } else table.remove();
  }

  for (const iframe of [...body.querySelectorAll("iframe")]) {
    const src = iframe.getAttribute("src") ?? iframe.getAttribute("data-src");
    if (src && /^(https?:)?\/\//.test(src)) {
      pending.embeds.push({ url: new URL(src, SITE).href, title: iframe.getAttribute("title") ?? undefined });
      stats.embeds++;
      replaceWithMarker(iframe, "EMBED", pending.embeds.length - 1);
    } else iframe.remove();
  }

  for (const img of [...body.querySelectorAll("img")]) {
    const src = img.getAttribute("data-src") ?? img.getAttribute("src");
    if (!src || src.startsWith("data:")) {
      img.remove();
      continue;
    }
    const figure = img.closest("figure, .wp-caption");
    const caption = figure?.querySelector("figcaption, .wp-caption-text")?.textContent?.trim() || undefined;
    figure?.querySelector("figcaption, .wp-caption-text")?.remove();
    pending.images.push({ url: absoluteUrl(src), alt: decode(img.getAttribute("alt") ?? ""), caption });
    stats.images++;
    replaceWithMarker(img, "IMG", pending.images.length - 1);
  }

  for (const a of [...body.querySelectorAll("a[href]")]) {
    const href = toRelative(a.getAttribute("href")!);
    a.setAttribute("href", href);
    if (href.startsWith("/") && !href.startsWith("//")) {
      const target = href.split(/[?#]/)[0];
      if (!internalLinks.has(target)) internalLinks.set(target, new Set());
      internalLinks.get(target)!.add(sourcePath);
    }
  }

  // No shortcodes are used on this site; square brackets in the text are editorial ("[Pfizer Inc]"), so keep them.
  let prepared = body.innerHTML
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<h1(\s|>)/gi, "<h2$1")
    .replace(/<\/h1>/gi, "</h2>")
    .replace(/<h[56](\s|>)/gi, "<h4$1")
    .replace(/<\/h[56]>/gi, "</h4>");
  // <b>/<i> are common in this content; block-tools handles them, but normalise to be safe.
  prepared = prepared.replace(/<(\/?)b(\s|>)/gi, "<$1strong$2").replace(/<(\/?)i(\s|>)/gi, "<$1em$2");

  const blocks = htmlToBlocks(prepared, schema, { parseHtml }) as Array<Record<string, unknown>>;
  const out: unknown[] = [];
  for (const block of blocks) {
    const children = block.children as Array<{ text?: string }> | undefined;
    const text = children?.map((c) => c.text ?? "").join("").trim() ?? "";
    const m = text.match(MARK_RE);
    if (!m) {
      if (block._type !== "block" || text.replace(/ /g, "").trim()) out.push({ ...block, _key: randomKey(12) });
      continue;
    }
    const i = Number(m[2]);
    if (m[1] === "IMG") {
      const img = pending.images[i];
      out.push({ _type: "imageWithAlt", _key: randomKey(12), alt: img.alt, caption: img.caption, _sanityAsset: `image@${img.url}` });
    }
    if (m[1] === "EMBED") out.push({ _type: "embed", _key: randomKey(12), ...pending.embeds[i] });
    if (m[1] === "TABLE") {
      const t = pending.tables[i];
      out.push({ _type: "table", _key: randomKey(12), caption: t.caption, headerRow: true, rows: t.rows.map((cells) => ({ _type: "tableRow", _key: randomKey(12), cells })) });
    }
  }
  return out;
}

// ---------- image checks ----------

const imageOk = new Map<string, boolean>();
/** url -> local file. The host blocks the Sanity CLI's downloader, so images are fetched here and imported from disk. */
const localFile = new Map<string, string>();
async function checkImage(url: string) {
  if (imageOk.has(url)) return imageOk.get(url)!;
  let ok = false;
  try {
    const res = await fetchRetry(url);
    ok = res.ok && (res.headers.get("content-type") ?? "").startsWith("image/");
    if (ok) {
      const name = `${createHash("sha1").update(url).digest("hex").slice(0, 16)}${extname(new URL(url).pathname).toLowerCase() || ".jpg"}`;
      const file = resolve(IMG_DIR, name);
      if (!existsSync(file)) writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      localFile.set(url, pathToFileURL(file).href);
    }
  } catch {
    ok = false;
  }
  imageOk.set(url, ok);
  return ok;
}
const assetUrl = (v: unknown) => (typeof v === "string" && v.startsWith("image@") ? v.slice(6) : undefined);

/** Removes image blocks/fields whose file no longer exists on the old server. */
function dropMissingImages(docs: Doc[], missing: Set<string>) {
  let removed = 0;
  for (const d of docs) {
    if (Array.isArray(d.body)) {
      const before = d.body.length;
      d.body = (d.body as Record<string, unknown>[]).filter((b) => !(b._type === "imageWithAlt" && missing.has(assetUrl(b._sanityAsset) ?? "")));
      removed += before - (d.body as unknown[]).length;
    }
    for (const field of ["mainImage", "logo"]) {
      const img = d[field] as Record<string, unknown> | undefined;
      if (img && missing.has(assetUrl(img._sanityAsset) ?? "")) {
        delete d[field];
        removed++;
      }
    }
  }
  return removed;
}

// ---------- mapping helpers ----------

const pathOf = (link: string) => {
  const p = toRelative(link).split(/[?#]/)[0];
  return p.endsWith("/") ? p : `${p}/`;
};
const slugField = (current: string) => ({ _type: "slug", current });
const ref = (_ref: string, withKey = false) => ({ _type: "reference", _ref, ...(withKey ? { _key: randomKey(12) } : {}) });
const keyed = <T extends object>(items: T[], type?: string) => items.map((i) => ({ ...(type ? { _type: type } : {}), ...i, _key: randomKey(12) }));
const iso = (gmt?: string) => (gmt ? new Date(`${gmt}Z`).toISOString() : undefined);
const cleanExcerpt = (html?: string) =>
  stripTags(html)
    .replace(/\s*(\[(…|&hellip;|\.\.\.)\]|…|Read More.*)$/i, "")
    .trim() || undefined;

/** Menu (editable in Studio). Child strings are category slugs; "page:<slug>" links a page. Empty categories are skipped. */
const NAV: { label: string; slug?: string; href?: string; children?: string[] }[] = [
  {
    label: "Types of dementia",
    href: "/home-2/",
    children: [
      "alzheimers-disease",
      "vascular-dementia",
      "lewy-body-dementia",
      "frontotemporal-dementia",
      "parkinsons-disease",
      "huntingtons-disease",
      "creutzfeldt-jacob-dementia",
      "alcohol-related-dementia",
      "wernicke-korsakoff-syndrome",
    ],
  },
  { label: "Understanding dementia", slug: "dementia", children: ["page:dementia", "page:cognition-and-cognitive-testing", "aging-dementia", "coronavirus-covid-19-and-alzheimers"] },
  { label: "Care & caregiving", slug: "dementia-care" },
  { label: "Alzheimer's", slug: "alzheimers-disease" },
  { label: "News", slug: "dementia-news" },
  { label: "About", href: "/who-are-we/" },
];
/** Clearer display names. Slugs and URLs are unchanged. */
const CATEGORY_TITLES: Record<string, string> = {
  dementia: "Understanding Dementia",
  "dementia-news": "Dementia News",
  "alzheimers-disease": "Alzheimer's Disease",
  "aging-dementia": "Aging & Dementia",
  "alcohol-related-dementia": "Alcohol-Related Dementia",
  "coronavirus-covid-19-and-alzheimers": "COVID-19 and Alzheimer's",
  "creutzfeldt-jacob-dementia": "Creutzfeldt-Jakob Disease",
  "dementia-care": "Dementia Care",
  "frontotemporal-dementia": "Frontotemporal Dementia",
  "huntingtons-disease": "Huntington's Disease",
  "lewy-body-dementia": "Lewy Body Dementia",
  "parkinsons-disease": "Parkinson's Disease Dementia",
  "vascular-dementia": "Vascular Dementia",
  "wernicke-korsakoff-syndrome": "Wernicke-Korsakoff Syndrome",
};
const HOME_SECTIONS = ["alzheimers-disease", "dementia-care", "dementia", "aging-dementia", "parkinsons-disease", "wernicke-korsakoff-syndrome"];

// ---------- main ----------

async function main() {
  const docs: Doc[] = [];

  log("Fetching categories, authors, pages...");
  const categories = (await getAll<WpCategory>("categories", "id,name,slug,description,parent,count")).filter((c) => c.count > 0);
  const users = await getAll<WpUser>("users", "id,name,slug,description");
  const pages = await getAll<WpPage>("pages", "id,link,slug,title,content");
  log(`  ${categories.length} categories with posts, ${users.length} authors, ${pages.length} pages`);

  log("Fetching posts...");
  const posts = await getAll<WpPost>("posts", "id,link,slug,date_gmt,modified_gmt,title,content,excerpt,author,categories,featured_media", "&status=publish");
  log(`  ${posts.length} posts`);

  const mediaIds = [...new Set(posts.map((p) => p.featured_media).filter(Boolean))];
  const media = new Map<number, WpMedia>();
  for (let i = 0; i < mediaIds.length; i += 100) {
    const { data } = await getJson<WpMedia[]>(`${API}/media?per_page=100&include=${mediaIds.slice(i, i + 100).join(",")}&_fields=id,source_url,alt_text,caption`);
    data.forEach((m) => media.set(m.id, m));
  }
  log(`  ${media.size} featured images (${posts.filter((p) => p.featured_media).length} posts have one)`);

  const catId = new Map<number, string>();
  for (const c of categories) catId.set(c.id, `category-${c.slug}`);
  for (const c of categories) {
    docs.push({
      _id: `category-${c.slug}`,
      _type: "category",
      title: CATEGORY_TITLES[c.slug] ?? decode(c.name),
      slug: slugField(c.slug),
      parent: c.parent && catId.has(c.parent) ? ref(catId.get(c.parent)!) : undefined,
      description: stripTags(c.description) || undefined,
    });
  }

  for (const u of users) {
    docs.push({ _id: `author-${u.slug}`, _type: "author", name: decode(u.name), slug: slugField(u.slug), bio: stripTags(u.description) || undefined });
  }

  for (const p of pages) {
    const path = pathOf(p.link);
    if (SKIP_PAGE_PATHS.has(path)) continue;
    docs.push({ _id: `page-${p.slug}`, _type: "page", title: decode(p.title.rendered), path: slugField(path), body: htmlToBody(p.content.rendered, path) });
  }

  const postPaths = new Set<string>();
  for (const p of posts) {
    const path = pathOf(p.link);
    if (postPaths.has(path)) {
      log(`  ! duplicate path ${path} (post ${p.id}) skipped`);
      continue;
    }
    postPaths.add(path);
    const m = p.featured_media ? media.get(p.featured_media) : undefined;
    const cats = p.categories.filter((id) => catId.has(id));
    // Put the specific topic first; the catch-all news category goes last.
    cats.sort((a, b) => Number(catId.get(a) === "category-dementia-news") - Number(catId.get(b) === "category-dementia-news"));
    const author = users.find((u) => u.id === p.author);
    docs.push({
      _id: `post-${p.id}`,
      _type: "post",
      wpId: p.id,
      title: decode(p.title.rendered),
      path: slugField(path),
      publishedAt: iso(p.date_gmt),
      updatedAt: p.modified_gmt && p.modified_gmt !== p.date_gmt ? iso(p.modified_gmt) : undefined,
      author: author ? ref(`author-${author.slug}`) : undefined,
      categories: cats.map((id) => ref(catId.get(id)!, true)),
      excerpt: cleanExcerpt(p.excerpt.rendered),
      mainImage: m ? { _type: "imageWithAlt", alt: decode(m.alt_text), caption: stripTags(m.caption?.rendered) || undefined, _sanityAsset: `image@${absoluteUrl(m.source_url)}` } : undefined,
      body: htmlToBody(p.content.rendered, path),
      faq: lastFaq.length ? keyed(lastFaq, "faqItem") : undefined,
    });
  }
  log(`  converted ${postPaths.size} posts`);
  log(`  content: ${stats.images} inline images, ${stats.embeds} embeds, ${stats.tables} tables; ${stats.emails} obfuscated emails decoded; ${stats.faqPosts} FAQs moved to the faq field; dropped ${stats.scripts} other scripts, ${stats.forms} forms`);

  // Site settings.
  const homeHtml = await (await fetchRetry(`${SITE}/`)).text();
  const homeDoc = parseHtml(homeHtml);
  const homeDescription = homeDoc.querySelector('meta[name="description"]')?.getAttribute("content") ?? undefined;
  const logoSrc = homeDoc.querySelector("#logo img, .logo img, img[src*='logo3']")?.getAttribute("src") ?? "/wp-content/uploads/2020/05/logo3.png";
  const hasCat = (slug: string) => catId.has(categories.find((c) => c.slug === slug)?.id ?? -1);
  const pageTitle = (slug: string) => decode(pages.find((p) => p.slug === slug)?.title.rendered ?? slug).replace(/s+[–-]s+.*$/, "");
  const childOk = (s: string) => (s.startsWith("page:") ? pages.some((p) => p.slug === s.slice(5)) : hasCat(s));
  const catLink = (slug: string) => {
    if (slug.startsWith("page:")) return { _type: "link", label: pageTitle(slug.slice(5)), internal: ref(`page-${slug.slice(5)}`) };
    const c = categories.find((x) => x.slug === slug)!;
    return { _type: "link", label: CATEGORY_TITLES[slug] ?? decode(c.name), internal: ref(`category-${slug}`) };
  };
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: "Dementia Today",
    tagline: "Living with dementia: information, symptoms, care and research news",
    homeTitle: "Dementia - Living with dementia - information, symptoms and treatments | Doctor-Reviewed Articles",
    description: homeDescription ? decode(homeDescription) : undefined,
    logo: { _type: "imageWithAlt", alt: "Dementia Today", _sanityAsset: `image@${absoluteUrl(logoSrc)}` },
    nav: keyed(
      NAV.map((n) => ({
        _type: "navItem",
        label: n.label,
        internal: n.slug && hasCat(n.slug) ? ref(`category-${n.slug}`) : undefined,
        href: n.href,
        children: n.children ? keyed(n.children.filter(childOk).map(catLink)) : undefined,
      })),
    ),
    homeSections: HOME_SECTIONS.filter(hasCat).map((s) => ref(`category-${s}`, true)),
    about:
      "Dementia Today publishes independent information on Alzheimer's disease and other dementias: early signs, diagnosis, treatment, caregiving and research news, for families, caregivers and people living with memory loss.",
    disclaimer:
      "The content on this site is for information only and is not a substitute for professional medical advice, diagnosis or treatment. If a person with dementia is missing, injured or in danger, call 911 or your local emergency number.",
    footerLinks: keyed(
      [
        ["Who are we?", "who-are-we"],
        ["Contact", "contact"],
        ["Advertise with us", "advertise-with-us"],
        ["Privacy policy", "privacy-policy"],
        ["Terms and conditions", "terms-and-conditions"],
      ]
        .filter(([, slug]) => pages.some((p) => p.slug === slug))
        .map(([label, slug]) => ({ _type: "link", label, internal: ref(`page-${slug}`) })),
    ),
  });

  // Check every image before handing the file to the Sanity CLI.
  const urls = new Set<string>();
  for (const d of docs) {
    for (const field of ["mainImage", "logo"]) {
      const u = assetUrl((d[field] as Record<string, unknown> | undefined)?._sanityAsset);
      if (u) urls.add(u);
    }
    for (const b of (d.body ?? []) as Record<string, unknown>[]) {
      const u = assetUrl(b._sanityAsset);
      if (u) urls.add(u);
    }
  }
  mkdirSync(IMG_DIR, { recursive: true });
  log(`Downloading ${urls.size} images...`);
  await pool([...urls], 8, checkImage);
  const missing = new Set([...urls].filter((u) => !imageOk.get(u)));
  const removed = dropMissingImages(docs, missing);
  log(`  ${urls.size - missing.size} images OK, ${missing.size} missing on the old server (${removed} image blocks removed):`);
  [...missing].forEach((u) => log(`    - ${u}`));
  // Point every image at its downloaded copy.
  const toLocal = (o?: Record<string, unknown>) => {
    const u = assetUrl(o?._sanityAsset);
    if (o && u && localFile.has(u)) o._sanityAsset = `image@${localFile.get(u)}`;
  };
  for (const d of docs) {
    toLocal(d.mainImage as Record<string, unknown> | undefined);
    toLocal(d.logo as Record<string, unknown> | undefined);
    ((d.body ?? []) as Record<string, unknown>[]).forEach((b) => toLocal(b));
  }

  // Internal links that point nowhere on the new site.
  const known = new Set<string>(["/", ...docs.filter((d) => d.path).map((d) => (d.path as { current: string }).current)]);
  for (const c of categories) known.add(`/category/${c.slug}/`);
  for (const u of users) known.add(`/author/${u.slug}/`);
  const broken = [...internalLinks].filter(([target]) => {
    const t = target.endsWith("/") || /\.[a-z0-9]{2,4}$/i.test(target) ? target : `${target}/`;
    return !known.has(t) && !t.startsWith("/wp-content/");
  });
  log(`\n${broken.length} internal link targets don't exist on the new site (they 404 today too, or need a redirect):`);
  broken.slice(0, 200).forEach(([target, sources]) => log(`    - ${target}  (from ${[...sources].slice(0, 3).join(", ")}${sources.size > 3 ? ", …" : ""})`));

    const ndjson = docs
    .map((d) => JSON.stringify(d, (_, v) => (v === undefined ? undefined : v)))
    .join("\n")
    .replace(/\?�/g, "·")
    .replace(/�/g, "");
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, OUT_FILE), `${ndjson}\n`);
  // A plain list of every URL, for checking the new site after launch.
  writeFileSync(resolve(OUT_DIR, "urls.txt"), `${[...known].sort().join("\n")}\n`);

  const counts = docs.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d._type]: (acc[d._type] ?? 0) + 1 }), {});
  log(`\nWrote ${docs.length} documents to migration-output/${OUT_FILE}`);
  Object.entries(counts).forEach(([t, n]) => log(`  ${t}: ${n}`));
  writeFileSync(resolve(OUT_DIR, "report.txt"), `${report.join("\n")}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
