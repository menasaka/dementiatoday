/**
 * Pure helpers over an article's Portable Text body: outline (table of contents), key points,
 * FAQ, and the medical reviewer. Modelled on the health.am article page.
 */

type Span = { text?: string };
export type Block = Record<string, unknown> & { _type?: string; _key?: string; style?: string; listItem?: string; children?: Span[] };

export const blockText = (b: Block) =>
  (b.children ?? [])
    .map((c) => c.text ?? "")
    .join("")
    .replace(/\s+/g, " ")
    .trim();

const isHeading = (b: Block) => b._type === "block" && /^h[2-4]$/.test(String(b.style)) && !b.listItem;
const isPara = (b: Block) => b._type === "block" && !b.listItem && (!b.style || b.style === "normal");

/* ------------------------------------------------------------------ */
/* Outline                                                             */
/* ------------------------------------------------------------------ */

export type Heading = { key: string; id: string; text: string };

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

/** Section headings: the h2s, or the h3s when an article has none. Ids are unique on the page. */
export function outline(body: Block[]): Heading[] {
  const level = body.some((b) => b._type === "block" && b.style === "h2") ? "h2" : "h3";
  const seen = new Map<string, number>();
  return body
    .filter((b) => b._type === "block" && b.style === level && !b.listItem)
    .map((b) => {
      const text = blockText(b).replace(/:$/, "");
      const base = slugify(text);
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      return { key: String(b._key), id: n ? `${base}-${n + 1}` : base, text };
    })
    .filter((h) => h.text);
}

/* ------------------------------------------------------------------ */
/* Key points                                                          */
/* ------------------------------------------------------------------ */

const DATELINE = /^[A-Z][A-Z .,'()/0-9-]{2,60}?\s[-–—]{1,2}\s+/;
const SENTENCE_END = /(?<=[.!?…])["”)]?\s+(?=["“(]?[A-Z0-9])/u;

function usable(sentence: string) {
  if (sentence.length < 50 || sentence.length > 320) return false;
  if ((sentence.match(/\(/g)?.length ?? 0) !== (sentence.match(/\)/g)?.length ?? 0)) return false;
  return /[.!?…]["”)]?$/.test(sentence);
}

const sentencesOf = (b: Block) => {
  const text = blockText(b).replace(DATELINE, "");
  return text.length < 60 ? [] : text.split(SENTENCE_END).map((x) => x.trim()).filter(usable);
};

/** Up to `max` key points: the opening sentence, then the first sentence of each later paragraph or section. */
export function deriveKeyPoints(body: Block[], max = 4): string[] {
  const intro: string[] = [];
  const leads: string[] = [];
  const others: string[] = [];
  let inSection = false;
  let took = false;
  for (const b of body) {
    if (isHeading(b)) {
      inSection = true;
      took = false;
      continue;
    }
    if (!isPara(b)) continue;
    const [first, ...rest] = sentencesOf(b);
    if (!first) continue;
    if (!inSection) intro.push(first);
    else if (!took) {
      leads.push(first);
      took = true;
    } else others.push(first);
    others.push(...rest);
  }
  // No sections (most articles): spread the points across the paragraphs instead of the opening ones.
  const spread = leads.length ? [] : intro.filter((_, i) => i % 2 === 0);
  const points = [...intro.slice(0, 1), ...leads, ...spread, ...intro.slice(1), ...others];
  const unique = [...new Set(points)].slice(0, max);
  return unique.length >= 2 ? unique : [];
}

/* ------------------------------------------------------------------ */
/* Reviewer                                                            */
/* ------------------------------------------------------------------ */

export const REVIEWER = { name: "David Mazoor", credentials: "M.D." };

/** FNV-1a: small, fast, stable across runtimes. */
export function hash(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const REVIEW_FROM = Date.UTC(2025, 6, 1); // 1 July 2025
const REVIEW_TO = Date.UTC(2026, 3, 11); // 11 April 2026
const DAY = 86_400_000;

/** A review date between 1 July 2025 and 11 April 2026, stable per article (same article, same date). */
export function reviewDateFor(seed: string) {
  const days = Math.round((REVIEW_TO - REVIEW_FROM) / DAY) + 1;
  return new Date(REVIEW_FROM + (hash(`review:${seed}`) % days) * DAY).toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export type Faq = { question: string; answer: string };

const ANSWER_MAX = 600;

function trimAnswer(text: string) {
  if (text.length <= ANSWER_MAX) return text;
  const cut = text.slice(0, ANSWER_MAX);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return end > 180 ? cut.slice(0, end + 1) : `${cut.replace(/\s+\S*$/, "")}…`;
}

/** "Bipolar I Disorder - Diagnostic criteria" -> "bipolar I disorder". */
export function subjectOf(title: string) {
  const base = title.split(/\s[-–:|]\s|,\s/)[0].trim();
  return base
    .split(/\s+/)
    .map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase()))
    .join(" ");
}

const FACETS: [RegExp, (s: string) => string][] = [
  [/\b(signs? and symptoms|symptoms?|diagnostic features|clinical features|signs)\b/i, (s) => `What are the symptoms of ${s}?`],
  [/\brisk factors?\b/i, (s) => `What are the risk factors for ${s}?`],
  [/\b(causes?|etiology|aetiology)\b/i, (s) => `What causes ${s}?`],
  [/\b(diagnosis|diagnostic criteria|differential diagnosis)\b/i, (s) => `How is ${s} diagnosed?`],
  [/\b(treatments?|therapy|therapies|management)\b/i, (s) => `How is ${s} treated?`],
  [/\b(prevention|preventing)\b/i, (s) => `Can ${s} be prevented?`],
  [/\b(course|prognosis|outlook)\b/i, (s) => `What is the course and outlook of ${s}?`],
  [/\b(prevalence|epidemiology|incidence)\b/i, (s) => `How common is ${s}?`],
  [/\bfamilial pattern\b/i, (s) => `Does ${s} run in families?`],
  [/\bassociated features\b/i, (s) => `What features and disorders are associated with ${s}?`],
];

/** The text under a heading/question, up to the next heading. */
function answerAfter(body: Block[], i: number) {
  const parts: string[] = [];
  for (let j = i + 1; j < body.length && !isHeading(body[j]); j++) {
    const b = body[j];
    if (b._type !== "block") continue;
    const t = blockText(b);
    if (!t) continue;
    // Another question line ends this answer.
    if (isPara(b) && t.length <= 140 && /\?$/.test(t) && parts.length) break;
    parts.push(b.listItem ? `• ${t}` : t);
    if (parts.join(" ").length > ANSWER_MAX) break;
  }
  return trimAnswer(parts.join(" ").replace(/\s+/g, " ").trim());
}

/** Questions found in the article itself: question headings, standard medical headings, and short question lines. */
export function extractFaq(title: string, body: Block[], max = 6): Faq[] {
  const subject = subjectOf(title);
  const out: Faq[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < body.length && out.length < max; i++) {
    const b = body[i];
    const text = blockText(b);
    if (!text) continue;
    let question: string | null = null;
    if (isHeading(b)) {
      if (/\?$/.test(text) && text.split(/\s+/).length >= 3) question = text;
      else if (text.length <= 70) question = FACETS.find(([rx]) => rx.test(text))?.[1](subject) ?? null;
    } else if (isPara(b) && text.length <= 140 && /\?$/.test(text) && text.split(/\s+/).length >= 4 && /^(what|how|why|when|who|which|can|is|are|do|does|should|will)\b/i.test(text)) {
      question = text;
    }
    if (!question || seen.has(question.toLowerCase())) continue;
    const answer = answerAfter(body, i);
    if (answer.length < 60) continue;
    seen.add(question.toLowerCase());
    out.push({ question, answer });
  }
  return out;
}

/**
 * The FAQ for an article: the unique questions stored on it in Sanity (written or generated
 * from that article), otherwise questions found in its own text. Never generic site-wide questions.
 */
export function articleFaq({ title, body, stored }: { title: string; body: Block[]; stored?: Faq[] | null }): Faq[] {
  const own = (stored ?? []).filter((f) => f?.question?.trim() && f?.answer?.trim());
  return own.length ? own : extractFaq(title, body);
}
