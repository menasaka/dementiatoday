/**
 * Homepage-only sections. The homepage has its own look ("front porch": a welcoming, guided
 * entrance); category and article pages keep the shared site layout.
 */
import Link from "next/link";
import { formatDate, type PostCard } from "@/lib/content";
import { Media } from "./Cards";
import { Arrow, HELPLINE, SearchIcon } from "./Header";

const CHIPS = [
  { label: "Early signs", href: "/#signs" },
  { label: "Alzheimer’s", href: "/category/alzheimers-disease/" },
  { label: "Caregiving", href: "/category/dementia-care/" },
  { label: "Memory tests", href: "/cognition-and-cognitive-testing/" },
  { label: "Research news", href: "/category/dementia-news/" },
];

/** Hero: welcome, a big search box with suggestions, and today's lead story. */
export function Hero({ lead, count }: { lead?: PostCard; count: number }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      {/* Soft leaf and navy shapes, echoing the logo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(79,174,68,0.16),transparent)] motion-safe:animate-drift" />
        <div className="absolute -right-48 -bottom-56 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(0,80,127,0.12),transparent)]" />
      </div>
      <div className="dot-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" aria-hidden="true" />

      <div className="container-site relative grid gap-12 py-14 md:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/70 px-3.5 py-1.5 text-[13px] font-semibold text-sage">
            <span className="size-2 rounded-full bg-leaf" aria-hidden="true" />
            {count.toLocaleString("en-US")} articles for families, caregivers and patients
          </p>
          <p className="display mt-6 text-[44px] leading-[1.02] sm:text-[60px] lg:text-[72px]">
            Memory changes.
            <br />
            <span className="accent text-dawn">You don’t face them alone.</span>
          </p>
          <p className="mt-6 max-w-[52ch] text-[18.5px] leading-relaxed text-body sm:text-[19.5px]">
            Clear, independent information on Alzheimer’s disease and other dementias: the early signs, getting a diagnosis, treatment, day-to-day care and the latest research.
          </p>

          <form action="/search/" role="search" className="mt-8 max-w-[600px]">
            <label htmlFor="hero-q" className="sr-only">
              Search Dementia Today
            </label>
            <div className="flex items-center gap-2 rounded-2xl border-2 border-ink/80 bg-white p-2 pl-5 shadow-[0_18px_40px_-22px_rgba(5,42,66,0.45)] focus-within:border-dawn">
              <span aria-hidden="true" className="text-muted">
                <SearchIcon size={20} />
              </span>
              <input id="hero-q" name="q" type="search" placeholder="What would you like to understand?" className="h-12 min-w-0 flex-1 bg-transparent text-[17.5px] text-ink outline-none placeholder:text-muted" />
              <button type="submit" className="h-12 shrink-0 rounded-xl bg-dawn px-5 text-[16px] font-semibold text-white hover:bg-night">
                Search
              </button>
            </div>
          </form>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Popular topics">
            {CHIPS.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="inline-block rounded-full border border-line-2 bg-white px-4 py-2 text-[15px] text-ink-2 transition-colors hover:border-dawn hover:text-dawn">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {lead && (
          <article className="group relative">
            {/* Photos from the news publisher often carry the headline, so the title sits below the image, not on it. */}
            <div className="relative overflow-hidden rounded-[32px] bg-night shadow-[0_40px_80px_-40px_rgba(5,42,66,0.6)]">
              <div className="overflow-hidden">
                <Media post={lead} className="aspect-[16/10] w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]" sizes="(min-width: 1024px) 560px, 100vw" priority />
              </div>
              <div className="p-6 sm:p-8">
                <p className="inline-flex items-center gap-2 rounded-full bg-ice px-3 py-1 text-[12px] font-bold tracking-[0.12em] text-night uppercase">Today’s story</p>
                <h2 className="mt-3 font-display text-[26px] leading-[1.12] font-semibold tracking-[-0.015em] text-balance text-white sm:text-[32px]">
                  <Link href={lead.path} className="after:absolute after:inset-0">
                    {lead.title}
                  </Link>
                </h2>
                <p className="mt-3 flex flex-wrap items-center gap-x-2 text-[14px] text-mist">
                  {lead.category && <span className="font-semibold text-ice">{lead.category.title}</span>}
                  <span aria-hidden="true">·</span>
                  <time dateTime={lead.publishedAt ?? undefined}>{formatDate(lead.publishedAt)}</time>
                </p>
              </div>
            </div>
            {/* Leaf tab, a nod to the logo */}
            <span aria-hidden="true" className="absolute -top-4 -right-3 hidden size-16 rotate-12 rounded-[6px_48px_6px_48px] bg-leaf sm:block" />
          </article>
        )}
      </div>
    </section>
  );
}

const DOORS = [
  {
    href: "/#signs",
    kicker: "I’m noticing changes",
    title: "Is it normal aging, or something more?",
    text: "Compare 10 common early signs with the changes that come with age.",
    tone: "bg-sage-soft text-ink",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    href: "/home-2/",
    kicker: "We just got a diagnosis",
    title: "Understand the type of dementia",
    text: "Alzheimer’s, vascular, Lewy body, frontotemporal and more, explained simply.",
    tone: "bg-dawn-soft text-ink",
    icon: "M12 3a7 7 0 0 0-7 7c0 2.4 1.2 4.1 2.6 5.4.9.8 1.4 1.9 1.4 3.1V20h6v-1.5c0-1.2.5-2.3 1.4-3.1A7.2 7.2 0 0 0 19 10a7 7 0 0 0-7-7ZM9.5 23h5",
  },
  {
    href: "/category/dementia-care/",
    kicker: "I’m caring for someone",
    title: "Practical help for every day",
    text: "Communication, safety at home, wandering, and looking after yourself too.",
    tone: "bg-[#f7ecd9] text-ink",
    icon: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z",
  },
  {
    href: "/category/dementia-news/",
    kicker: "I follow the research",
    title: "New treatments and studies",
    text: "Clinical trials, prevention research and drug approvals, as they happen.",
    tone: "bg-night text-white",
    icon: "M9 3h6M10 3v6.5L4.6 18.3A1.8 1.8 0 0 0 6.1 21h11.8a1.8 1.8 0 0 0 1.5-2.7L14 9.5V3M7.5 15h9",
  },
];

/** "Where are you right now?": four doors into the site, by situation rather than topic. */
export function Doors() {
  return (
    <section aria-labelledby="doors-title" className="container-site pt-20">
      <div className="max-w-[640px]">
        <p className="kicker">Start where you are</p>
        <h2 id="doors-title" className="display mt-2 text-[34px] leading-[1.05] sm:text-[44px]">
          What brings you here today?
        </h2>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DOORS.map((d) => {
          const dark = d.tone.includes("bg-night");
          return (
            <li key={d.href}>
              <Link href={d.href} className={`group flex h-full flex-col rounded-[26px] p-6 transition-transform duration-500 ease-out-soft hover:-translate-y-1 ${d.tone}`}>
                <span className={`flex size-12 items-center justify-center rounded-2xl ${dark ? "bg-white/10 text-ice" : "bg-white text-dawn"}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={d.icon} />
                  </svg>
                </span>
                <span className={`mt-6 text-[13px] font-bold tracking-[0.1em] uppercase ${dark ? "text-ice" : "text-sage"}`}>{d.kicker}</span>
                <span className="mt-2 font-display text-[24px] leading-[1.15] font-semibold tracking-[-0.01em]">{d.title}</span>
                <span className={`mt-3 text-[16px] leading-relaxed ${dark ? "text-mist" : "text-body"}`}>{d.text}</span>
                <span className={`mt-auto inline-flex items-center gap-2 pt-6 text-[15px] font-semibold ${dark ? "text-white" : "text-dawn"}`}>
                  Go <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Horizontal rail of the newest stories, newspaper-dateline style. */
export function NewsRail({ posts }: { posts: PostCard[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="rail-title" className="mt-24 border-y border-line bg-white py-14">
      <div className="container-site">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="kicker">Just published</p>
            <h2 id="rail-title" className="display mt-2 text-[32px] leading-none sm:text-[40px]">
              This week in dementia
            </h2>
          </div>
          <Link href="/page/2/" className="group hidden shrink-0 items-center gap-2 text-[15px] font-semibold text-ink hover:text-dawn sm:flex">
            All recent articles <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      <ol className="no-scrollbar container-site mt-9 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto pb-2 sm:scroll-px-6 lg:scroll-px-8">
        {posts.map((p) => (
          <li key={p._id} className="group relative w-[280px] shrink-0 snap-start sm:w-[300px]">
            <div className="overflow-hidden rounded-2xl">
              <Media post={p} className="aspect-[3/2] w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]" sizes="300px" />
            </div>
            <p className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-muted">
              <time dateTime={p.publishedAt ?? undefined} className="rounded-md bg-paper-2 px-2 py-0.5 text-ink-2">
                {formatDate(p.publishedAt, "medium")}
              </time>
              {p.category && <span className="truncate text-sage">{p.category.title}</span>}
            </p>
            <h3 className="headline mt-2 line-clamp-3 text-[19px] leading-[1.25]">
              <Link href={p.path} className="link-sweep after:absolute after:inset-0 group-hover:[background-size:100%_1px]">
                {p.title}
              </Link>
            </h3>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Plain-language summaries of each type (category). Written for this site; slugs match WordPress. */
const TYPES: { slug: string; name: string; blurb: string }[] = [
  { slug: "alzheimers-disease", name: "Alzheimer’s disease", blurb: "The most common cause of dementia. Memory for recent events is usually affected first." },
  { slug: "vascular-dementia", name: "Vascular dementia", blurb: "Caused by reduced blood flow to the brain, often after strokes. Slowed thinking and planning are common early on." },
  { slug: "lewy-body-dementia", name: "Lewy body dementia", blurb: "Alertness that comes and goes, visual hallucinations and movement changes similar to Parkinson’s." },
  { slug: "frontotemporal-dementia", name: "Frontotemporal dementia", blurb: "Changes in personality, behaviour or language, often starting before age 65." },
  { slug: "parkinsons-disease", name: "Parkinson’s disease dementia", blurb: "Problems with thinking and memory that develop years after Parkinson’s movement symptoms." },
  { slug: "huntingtons-disease", name: "Huntington’s disease", blurb: "An inherited condition affecting movement, mood and thinking, usually from mid-life." },
  { slug: "creutzfeldt-jacob-dementia", name: "Creutzfeldt-Jakob disease", blurb: "A rare, fast-progressing brain disorder caused by abnormal prion proteins." },
  { slug: "alcohol-related-dementia", name: "Alcohol-related dementia", blurb: "Brain damage from years of heavy drinking. Stopping drinking can halt it, and some people improve." },
  { slug: "wernicke-korsakoff-syndrome", name: "Wernicke-Korsakoff syndrome", blurb: "Caused by a severe lack of thiamine (vitamin B1). Early treatment can prevent lasting damage." },
];

/** "Types of dementia" atlas: one tile per condition, with how many articles each has. */
export function TypesAtlas({ counts }: { counts: Record<string, number> }) {
  const types = TYPES.filter((t) => (counts[t.slug] ?? 0) > 0);
  if (!types.length) return null;
  const [first, ...rest] = types;
  return (
    <section aria-labelledby="types-title" className="container-site mt-24">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
        <div className="flex flex-col justify-between rounded-[28px] bg-dawn p-8 text-white sm:p-10">
          <div>
            <p className="text-[12.5px] font-bold tracking-[0.14em] text-ice uppercase">A guide to</p>
            <h2 id="types-title" className="display mt-3 text-[38px] leading-[1.02] text-white sm:text-[48px]">
              Types of dementia
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-white/85">Dementia is not one disease. It is a word for symptoms caused by many different conditions, and each one needs its own approach.</p>
          </div>
          <Link href="/home-2/" className="group mt-10 inline-flex items-center gap-2 self-start rounded-full bg-white px-6 py-3.5 text-[16px] font-semibold text-dawn hover:bg-ice hover:text-night">
            Compare all types <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link href={`/category/${first.slug}/`} className="group mt-8 block rounded-2xl bg-white/10 p-5 hover:bg-white/15">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-display text-[22px] font-semibold">{first.name}</span>
              <span className="text-[13px] text-ice">{counts[first.slug]} articles</span>
            </span>
            <span className="mt-2 block text-[15px] leading-relaxed text-white/80">{first.blurb}</span>
          </Link>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2">
          {rest.map((t, i) => (
            <li key={t.slug} className="bg-white">
              <Link href={`/category/${t.slug}/`} className="group flex h-full gap-4 p-6 transition-colors hover:bg-paper">
                <span aria-hidden="true" className="font-display text-[15px] font-semibold text-leaf">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-display text-[20px] leading-snug font-semibold text-ink group-hover:text-dawn">{t.name}</span>
                    <span className="text-[13px] text-muted">{counts[t.slug]} articles</span>
                  </span>
                  <span className="mt-1.5 block text-[15.5px] leading-relaxed text-body">{t.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const CARER_TIPS = [
  { t: "Take regular breaks", d: "Respite care, day centres and help from family give you time to rest. It is not a luxury." },
  { t: "Find people who understand", d: "Carer support groups, in person or online, are one of the most helpful sources of practical advice." },
  { t: "Plan ahead together", d: "Talk early about wishes, power of attorney and finances, while the person can still take part." },
];

/** Caregiving band: a feature story, more care articles, and three tips for the carer. */
export function CareBand({ posts }: { posts: PostCard[] }) {
  const [feature, ...rest] = posts;
  return (
    <section aria-labelledby="care-title" className="grid-lines relative mt-28 overflow-hidden bg-night py-20 text-mist">
      <div aria-hidden="true" className="pointer-events-none absolute -top-48 right-0 h-[480px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(79,174,68,0.2),transparent)]" />
      <div className="container-site relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <p className="text-[12.5px] font-bold tracking-[0.14em] text-ice uppercase">For caregivers</p>
            <h2 id="care-title" className="display mt-3 text-[36px] leading-[1.04] text-white sm:text-[48px]">
              Caring for someone <span className="accent text-ice">and for yourself</span>
            </h2>
          </div>
          <Link href="/category/dementia-care/" className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-[15px] font-semibold text-white hover:border-ice hover:text-ice">
            All care articles <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {feature ? (
            <article className="group relative">
              <div className="overflow-hidden rounded-3xl">
                <Media post={feature} className="aspect-[16/10] w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]" sizes="(min-width: 1024px) 640px, 100vw" />
              </div>
              <h3 className="mt-6 font-display text-[28px] leading-[1.15] font-semibold tracking-[-0.015em] text-balance text-white sm:text-[32px]">
                <Link href={feature.path} className="link-sweep after:absolute after:inset-0 group-hover:[background-size:100%_1px]">
                  {feature.title}
                </Link>
              </h3>
              {feature.excerpt && <p className="mt-3 line-clamp-3 max-w-[62ch] text-[17px] leading-relaxed">{feature.excerpt}</p>}
            </article>
          ) : (
            <div />
          )}
          <div>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {rest.map((p) => (
                <li key={p._id} className="group relative py-4">
                  <h3 className="text-[17.5px] leading-snug font-semibold text-white group-hover:text-ice">
                    <Link href={p.path} className="after:absolute after:inset-0">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-[13.5px] text-mist/75">{formatDate(p.publishedAt, "medium")}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-3xl bg-white/[0.06] p-6">
              <p className="text-[12.5px] font-bold tracking-[0.14em] text-ice uppercase">Looking after yourself</p>
              <ol className="mt-4 space-y-4">
                {CARER_TIPS.map((t, i) => (
                  <li key={t.t} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-leaf font-display text-[15px] font-semibold text-night">{i + 1}</span>
                    <span>
                      <span className="block text-[16.5px] font-semibold text-white">{t.t}</span>
                      <span className="mt-0.5 block text-[15px] leading-relaxed">{t.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-t border-white/10 pt-4 text-[14.5px]">
                Need to talk? The Alzheimer’s Association Helpline is free, 24/7:{" "}
                <a href={`tel:${HELPLINE.tel}`} className="numeric font-semibold text-ice">
                  {HELPLINE.label}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** "Start here" guides: the site's evergreen reference pages. */
export function StartHere({ guides }: { guides: { title: string; path: string; text: string }[] }) {
  if (!guides.length) return null;
  return (
    <section aria-labelledby="guides-title" className="container-site mt-24">
      <div className="rounded-[32px] border border-line bg-white p-7 sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Start here</p>
            <h2 id="guides-title" className="display mt-2 text-[32px] leading-none sm:text-[40px]">
              Essential guides
            </h2>
          </div>
          <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">Longer reference pages that explain the basics. A good place to begin after a diagnosis.</p>
        </div>
        <ul className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {guides.map((g, i) => (
            <li key={g.path}>
              <Link href={g.path} className="group flex h-full flex-col rounded-2xl bg-paper p-5 transition-colors hover:bg-dawn-soft">
                <span aria-hidden="true" className="font-display text-[40px] leading-none font-semibold text-leaf/70">
                  {i + 1}
                </span>
                <span className="mt-4 font-display text-[20px] leading-snug font-semibold text-ink group-hover:text-dawn">{g.title}</span>
                <span className="mt-2 text-[15px] leading-relaxed text-body">{g.text}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[14.5px] font-semibold text-dawn">
                  Read the guide <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
