import type { PortableTextBlock } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PAGE_SIZE, postListQuery, settingsQuery } from "@/sanity/lib/queries";

export type Img = { src: string; alt?: string; caption?: string; width?: number; height?: number };
export type NavLink = { label: string; href?: string | null };
export type NavItem = NavLink & { children?: NavLink[] | null };
export type CategoryRef = { title: string; slug: string };

export type SiteSettings = {
  siteName: string;
  tagline: string;
  description: string;
  homeTitle: string;
  about: string;
  disclaimer: string;
  ogImage?: string | null;
  nav: NavItem[];
  footerLinks: NavLink[];
  homeSections: CategoryRef[];
  sidebarEmbed?: { enabled?: boolean; title?: string; embedCode?: string; image?: string; alt?: string; link?: string; height?: number } | null;
  sidebarAd?: { enabled?: boolean; image?: string; alt?: string; link?: string; embedCode?: string } | null;
};

export type PostCard = {
  _id: string;
  title: string;
  path: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  image?: Img | null;
  category?: CategoryRef | null;
  readingTime?: number | null;
};

export type Doc = {
  _id: string;
  _type: "post" | "page";
  title: string;
  path: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  excerpt?: string | null;
  readingTime?: number | null;
  image?: Img | null;
  body?: PortableTextBlock[] | null;
  categories?: CategoryRef[] | null;
  author?: { name: string; slug: string } | null;
  seo?: { title?: string; description?: string; noindex?: boolean; ogImage?: string } | null;
  categoryIds?: string[] | null;
  faq?: { question: string; answer: string }[] | null;
  reviewedAt?: string | null;
  reviewer?: { name: string; credentials?: string | null; photo?: string | null } | null;
};

/** Used until Sanity is connected, and for any field left empty in Site settings. */
export const defaultSettings: SiteSettings = {
  siteName: "Dementia Today",
  tagline: "Living with dementia: information, symptoms, care and research news",
  homeTitle: "Dementia - Living with dementia - information, symptoms and treatments | Doctor-Reviewed Articles",
  description:
    "Dementia - Living with dementia - information, symptoms and treatments | Doctor-Reviewed Articles",
  about: "Dementia Today publishes independent information on Alzheimer's disease and other dementias.",
  disclaimer:
    "The content on this site is for information only and is not a substitute for professional medical advice, diagnosis or treatment. If a person with dementia is missing, injured or in danger, call 911 or your local emergency number.",
  nav: [
    { label: "News", href: "/category/dementia-news/" },
    { label: "Contact", href: "/contact/" },
  ],
  footerLinks: [{ label: "Contact", href: "/contact/" }],
  homeSections: [],
};

export async function getSettings(): Promise<SiteSettings> {
  const raw = await sanityFetch<Partial<SiteSettings>>(settingsQuery, {}, ["siteSettings"]);
  if (!raw) return defaultSettings;
  const out = { ...defaultSettings } as Record<string, unknown>;
  for (const [k, v] of Object.entries(raw)) {
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    out[k] = v;
  }
  return out as SiteSettings;
}

export type PostList = { items: PostCard[]; total: number; pages: number };

export async function getPostList(page: number, filter: { category?: string; author?: string } = {}): Promise<PostList> {
  const start = (page - 1) * PAGE_SIZE;
  const res = await sanityFetch<{ items: PostCard[]; total: number }>(
    postListQuery,
    { category: filter.category ?? "", author: filter.author ?? "", start, end: start + PAGE_SIZE },
    ["post"],
  );
  const total = res?.total ?? 0;
  return { items: res?.items ?? [], total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Parses the [n] segment of /page/[n]/ URLs. Page 1 lives at the bare URL, so only 2+ is valid. */
export function parsePageNumber(n: string): number | null {
  if (!/^\d+$/.test(n)) return null;
  const v = Number(n);
  return v >= 2 ? v : null;
}

export const formatDate = (iso?: string | null, style: "long" | "medium" = "long") =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: style === "long" ? "long" : "short", day: "numeric", timeZone: "UTC" }) : "";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dementiatoday.net").replace(/\/$/, "");

/** Meta description fallback: trims an excerpt to ~155 characters on a word boundary. */
export function metaDescription(text?: string | null) {
  if (!text) return undefined;
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= 158) return t;
  return `${t.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export const readingLabel = (min?: number | null) => `${Math.max(1, min ?? 1)} min read`;
