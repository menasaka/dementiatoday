/**
 * schema.org structured data (JSON-LD).
 *
 * Sitewide: Organization (publisher) and WebSite (with search).
 * Per page: MedicalWebPage (reviewer, last reviewed, specialty, condition), BreadcrumbList,
 * FAQPage (always matching the visible FAQ section), NewsArticle for news.
 */
import type { Faq } from "./article";
import { siteUrl } from "./content";

export const ORG_ID = `${siteUrl}/#organization`;
export const WEBSITE_ID = `${siteUrl}/#website`;

export const abs = (url?: string | null) => (!url ? undefined : url.startsWith("http") ? url : `${siteUrl}${url}`);

/** The publisher, with the contact details from the site's Contact page. */
export function organizationSchema() {
  const address = {
    "@type": "PostalAddress",
    streetAddress: "1607 Busch Blvd. Suite 77",
    addressLocality: "Tampa",
    addressRegion: "FL",
    postalCode: "33512",
    addressCountry: "US",
  };
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "NewsMediaOrganization"],
    "@id": ORG_ID,
    name: "Dementia Today",
    alternateName: "DementiaToday.net",
    url: `${siteUrl}/`,
    logo: { "@type": "ImageObject", url: `${siteUrl}/brand/icon-512.png`, width: 512, height: 512 },
    image: `${siteUrl}/brand/og.png`,
    description: "Independent information on Alzheimer's disease and other dementias: early signs, diagnosis, treatment, caregiving and research news.",
    email: "support@dementiatoday.net",
    address,
    parentOrganization: { "@type": "Organization", name: "Derby Psychiatry Association, Inc.", address },
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: "support@dementiatoday.net", availableLanguage: ["English"] }],
    knowsAbout: ["Dementia", "Alzheimer's disease", "Vascular dementia", "Lewy body dementia", "Frontotemporal dementia", "Mild cognitive impairment", "Dementia caregiving"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${siteUrl}/`,
    name: "Dementia Today",
    alternateName: "DementiaToday.net",
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export type Crumb = { name: string; url: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.url) })),
  };
}

export function faqSchema(faq: Faq[], url: string) {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${abs(url)}#faq`,
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/\s*•\s+/g, " ") } })),
  };
}

/** Topics that are a medical condition (used for MedicalWebPage.about). */
const NOT_CONDITIONS = new Set(["dementia-news", "dementia", "aging-dementia", "dementia-care", "coronavirus-covid-19-and-alzheimers"]);

type Person = { name: string; credentials?: string | null };

const personSchema = (p: Person) => ({ "@type": "Person", name: p.name, honorificSuffix: p.credentials ?? undefined, jobTitle: "Physician" });

/** An article: MedicalWebPage, plus NewsArticle for news stories. */
export function articleSchemas({
  url,
  title,
  description,
  image,
  publishedAt,
  modifiedAt,
  reviewedAt,
  reviewer,
  author,
  category,
  isNews,
}: {
  url: string;
  title: string;
  description?: string;
  image?: string | null;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  reviewedAt?: string | null;
  reviewer?: Person | null;
  author?: { name: string; url: string } | null;
  category?: { title: string; slug: string } | null;
  isNews: boolean;
}) {
  const pageUrl = abs(url)!;
  const img = abs(image);
  const condition = category && !NOT_CONDITIONS.has(category.slug);
  const page = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    headline: title,
    description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    author: author ? { "@type": "Person", name: author.name, url: abs(author.url) } : { "@id": ORG_ID },
    reviewedBy: reviewer ? personSchema(reviewer) : undefined,
    lastReviewed: reviewer && reviewedAt ? reviewedAt : undefined,
    datePublished: publishedAt ?? undefined,
    dateModified: modifiedAt ?? publishedAt ?? undefined,
    audience: { "@type": "MedicalAudience", audienceType: "Patient" },
    specialty: "https://schema.org/Neurologic",
    about: condition ? { "@type": "MedicalCondition", name: category!.title } : { "@type": "Thing", name: category?.title ?? "Dementia" },
    primaryImageOfPage: img ? { "@type": "ImageObject", url: img } : undefined,
    mainEntityOfPage: pageUrl,
  };
  const out: Record<string, unknown>[] = [page];
  if (isNews) {
    out.push({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "@id": `${pageUrl}#article`,
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
      headline: title.slice(0, 110),
      description,
      image: img ? [img] : [`${siteUrl}/brand/og.png`],
      datePublished: publishedAt ?? undefined,
      dateModified: modifiedAt ?? publishedAt ?? undefined,
      inLanguage: "en",
      author: author ? { "@type": "Person", name: author.name, url: abs(author.url) } : { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
    });
  }
  return out;
}

/** Homepage, category and other collection pages. */
export function collectionSchema({ name, url, description, condition }: { name: string; url: string; description?: string; condition?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalWebPage", "CollectionPage"],
    "@id": `${abs(url)}#webpage`,
    url: abs(url),
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    audience: { "@type": "MedicalAudience", audienceType: "Patient" },
    specialty: "https://schema.org/Neurologic",
    about: condition ? { "@type": "MedicalCondition", name: condition } : undefined,
  };
}

/** A plain page (Contact, Advertise). */
export function webPageSchema({ name, url, type = "WebPage" }: { name: string; url: string; type?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${abs(url)}#webpage`,
    url: abs(url),
    name,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
  };
}

function prune(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(prune);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, prune(v)]),
    );
  return value;
}

/** JSON for an inline <script type="application/ld+json">. */
export const jsonLd = (data: unknown) => JSON.stringify(prune(data)).replace(/</g, "\\u003c");
