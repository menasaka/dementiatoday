/**
 * Generates a unique FAQ for every article and topic page from that page's own text, and stores it
 * in the page's "FAQ" field in Sanity (shown on the page and as FAQPage markup).
 *
 * Uses the Claude Message Batches API (asynchronous, half price). Two steps:
 *
 *   npx sanity exec scripts/generate-faq.mts --with-user-token -- submit    # sends the batch
 *   npx sanity exec scripts/generate-faq.mts --with-user-token -- collect   # writes results to Sanity
 *
 * `collect` can be re-run until the batch has finished (most finish within an hour).
 * Pages that already have an FAQ are skipped; add `--all` to `submit` to regenerate everything.
 *
 * Credentials: the Anthropic client reads ANTHROPIC_API_KEY (or an `ant auth login` profile).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { getCliClient } from "sanity/cli";

const MODEL = "claude-haiku-5-5";
const STATE_FILE = "migration-output/faq-batch.json";
const MAX_INPUT_CHARS = 60_000; // longest article is ~41k characters; nothing is truncated today

const sanity = getCliClient({ apiVersion: "2026-11-01" });
const anthropic = new Anthropic();
const [mode = "submit", ...flags] = process.argv.slice(2).filter((a) => a !== "--");

const SYSTEM = `You write the FAQ section for one page of All for Diabetes, a website with information and news about type 1, type 2 and gestational diabetes: symptoms, blood sugar, treatment and daily life.

Write 4 to 6 questions that a reader of this specific page would ask, each answered only from the page text you are given.

Rules:
- Every question must be specific to this page: name its actual subject, study, condition, treatment, finding, people or numbers. A question that could appear on any other page is not allowed.
- Answers: 2 to 4 plain sentences, self-contained, and supported by the page text. Never add facts, numbers, advice or claims that are not in the text. Keep the page's own hedging ("may", "the study suggests").
- Cover different parts of the page; do not ask two questions with the same answer.
- Do not write generic questions such as: what are the key points of this article, what is this article about, who reviewed or wrote this article, where can I get help, is this a substitute for medical advice.
- Do not repeat the page title word for word as a question.
- Plain text only: no markdown, no lists, no quotation of the question inside the answer.`;

const SCHEMA = {
  type: "object",
  properties: {
    faq: {
      type: "array",
      items: {
        type: "object",
        properties: { question: { type: "string" }, answer: { type: "string" } },
        required: ["question", "answer"],
        additionalProperties: false,
      },
    },
  },
  required: ["faq"],
  additionalProperties: false,
};

const GENERIC = /key points of this article|what is this article about|who (reviewed|wrote|edited) this|where can i get help|substitute for (professional )?medical advice/i;

type Page = { _id: string; kind: "post" | "category"; title: string; text: string };

async function loadPages(all: boolean): Promise<Page[]> {
  const missing = all ? "" : "&& !defined(faq[0])";
  const posts = await sanity.fetch<{ _id: string; title: string; category?: string; text: string }[]>(
    `*[_type == "post" && !(_id in path("drafts.**")) ${missing}]{ _id, title, "category": categories[0]->title, "text": pt::text(body) }`,
  );
  const cats = await sanity.fetch<{ _id: string; title: string; description?: string; items: { title: string; excerpt?: string }[] }[]>(
    `*[_type == "category" && !(_id in path("drafts.**")) ${missing}]{
      _id, title, description,
      "items": *[_type == "post" && references(^._id)] | order(publishedAt desc) [0...25]{ title, excerpt }
    }`,
  );
  return [
    ...posts
      .filter((p) => p.text?.trim())
      .map((p) => ({
        _id: p._id,
        kind: "post" as const,
        title: p.title,
        text: `Title: ${p.title}\nTopic: ${p.category ?? "Mental health"}\n\n${p.text}`.slice(0, MAX_INPUT_CHARS),
      })),
    ...cats
      .filter((c) => c.items.length)
      .map((c) => ({
        _id: c._id,
        kind: "category" as const,
        title: c.title,
        text: `This is the topic page "${c.title}". It lists these articles (title, then summary):\n\n${c.description ? `${c.description}\n\n` : ""}${c.items
          .map((i) => `- ${i.title}${i.excerpt ? `: ${i.excerpt}` : ""}`)
          .join("\n")}`.slice(0, MAX_INPUT_CHARS),
      })),
  ];
}

async function submit() {
  const pages = await loadPages(flags.includes("--all"));
  if (!pages.length) return console.log("Every page already has an FAQ. Use --all to regenerate.");
  // custom_id allows only [a-zA-Z0-9_-]{1,64}; keep a map back to Sanity ids.
  const ids: Record<string, string> = {};
  const requests = pages.map((p, i) => {
    const customId = `p${i}`;
    ids[customId] = p._id;
    return {
      custom_id: customId,
      params: {
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM,
        output_config: { effort: "low" as const, format: { type: "json_schema" as const, schema: SCHEMA } },
        messages: [{ role: "user" as const, content: p.text }],
      },
    };
  });
  const batch = await anthropic.messages.batches.create({ requests });
  mkdirSync("migration-output", { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify({ batchId: batch.id, ids, createdAt: new Date().toISOString() }, null, 2));
  console.log(`Submitted ${requests.length} pages (${pages.filter((p) => p.kind === "post").length} articles, ${pages.filter((p) => p.kind === "category").length} topics).`);
  console.log(`Batch ${batch.id} is ${batch.processing_status}. Run "collect" later to save the results.`);
}

function clean(faq: { question: string; answer: string }[]) {
  const seen = new Set<string>();
  return faq
    .map((f) => ({ question: f.question.trim().replace(/\s+/g, " "), answer: f.answer.trim().replace(/\s+/g, " ") }))
    .filter((f) => f.question.endsWith("?") && f.answer.length >= 40 && !GENERIC.test(f.question))
    .filter((f) => !seen.has(f.question.toLowerCase()) && seen.add(f.question.toLowerCase()))
    .slice(0, 6);
}

async function collect() {
  if (!existsSync(STATE_FILE)) throw new Error(`No ${STATE_FILE}. Run "submit" first.`);
  const state = JSON.parse(readFileSync(STATE_FILE, "utf8")) as { batchId: string; ids: Record<string, string> };
  const batch = await anthropic.messages.batches.retrieve(state.batchId);
  const c = batch.request_counts;
  if (batch.processing_status !== "ended") {
    return console.log(`Batch ${batch.id}: ${batch.processing_status} (${c.processing} processing, ${c.succeeded} done). Try again later.`);
  }
  let saved = 0;
  const failed: string[] = [];
  let tx = sanity.transaction();
  let pending = 0;
  for await (const result of await anthropic.messages.batches.results(state.batchId)) {
    const id = state.ids[result.custom_id];
    if (result.result.type !== "succeeded") {
      failed.push(`${id} (${result.result.type})`);
      continue;
    }
    const message = result.result.message;
    const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    if (message.stop_reason !== "end_turn" || !text) {
      failed.push(`${id} (${message.stop_reason})`);
      continue;
    }
    let faq: { question: string; answer: string }[];
    try {
      faq = clean((JSON.parse(text) as { faq: { question: string; answer: string }[] }).faq ?? []);
    } catch {
      failed.push(`${id} (invalid JSON)`);
      continue;
    }
    if (faq.length < 3) {
      failed.push(`${id} (only ${faq.length} usable questions)`);
      continue;
    }
    tx = tx.patch(id, { set: { faq: faq.map((f) => ({ _type: "faqItem", _key: randomUUID().slice(0, 12), ...f })) } });
    saved++;
    if (++pending === 100) {
      await tx.commit();
      tx = sanity.transaction();
      pending = 0;
    }
  }
  if (pending) await tx.commit();
  console.log(`Saved FAQs on ${saved} pages. ${failed.length} skipped.`);
  if (failed.length) {
    writeFileSync("migration-output/faq-failed.txt", `${failed.join("\n")}\n`);
    console.log(`Skipped pages are listed in migration-output/faq-failed.txt; run "submit" again to retry them.`);
  }
}

await (mode === "collect" ? collect() : submit());
