import Image from "next/image";
import Link from "next/link";
import type { Faq } from "@/lib/article";
import { formatDate, type CategoryRef, type PostCard } from "@/lib/content";
import { hash } from "@/lib/article";
import { jsonLd } from "@/lib/schema";
import { Cover } from "./Cover";
import { Arrow } from "./Header";

const BOX = "rounded-2xl border border-line bg-white";
const BOX_TITLE = "text-[11.5px] font-semibold tracking-[0.14em] text-muted uppercase";

/* ------------------------------------------------------------- JSON-LD */

export function JsonLd({ data }: { data: unknown[] }) {
  return (
    <>
      {data.filter(Boolean).map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(d) }} />
      ))}
    </>
  );
}

/* ---------------------------------------------------------- Key points */

export function KeyPoints({ points }: { points: string[] }) {
  return (
    <section id="key-points" aria-labelledby="key-points-title" className="scroll-mt-36 rounded-2xl border border-dawn/25 bg-dawn-soft/60 px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-dawn text-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z" />
          </svg>
        </span>
        <h2 id="key-points-title" className="headline text-[21px]">
          Key points
        </h2>
      </div>
      <ul className="mt-4 space-y-3">
        {points.map((p, i) => (
          <li key={i} className="flex gap-3 text-[16px] leading-relaxed text-ink-2">
            <svg viewBox="0 0 20 20" className="mt-1 size-4 shrink-0 text-dawn" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 10.5l4 4 8-9" />
            </svg>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------------------------------------------------------- Left sidebar */

export function RelatedTopics({ topics, current }: { topics: CategoryRef[]; current?: string }) {
  if (!topics.length) return null;
  return (
    <nav aria-label="Related topics">
      <h2 className={BOX_TITLE}>Related topics</h2>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {topics.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/category/${t.slug}/`}
              aria-current={t.slug === current ? "page" : undefined}
              className={`inline-block rounded-full border px-3 py-1 text-[13px] leading-snug transition-colors ${
                t.slug === current ? "border-dawn bg-dawn-soft text-dawn" : "border-line bg-white text-ink-2 hover:border-dawn hover:text-dawn"
              }`}
            >
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function RelatedPages({ posts }: { posts: PostCard[] }) {
  if (!posts.length) return null;
  return (
    <nav aria-label="Related pages">
      <h2 className={BOX_TITLE}>Related pages</h2>
      <ul className="mt-2 divide-y divide-line">
        {posts.map((p) => (
          <li key={p._id}>
            <Link href={p.path} className="block py-2.5 text-[14px] leading-snug text-ink-2 hover:text-dawn">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* -------------------------------------------------------- Right sidebar */

export type SidebarEmbedData = { enabled?: boolean; title?: string; embedCode?: string; image?: string; alt?: string; link?: string; height?: number } | null;
export type SidebarAdData = { enabled?: boolean; image?: string; alt?: string; link?: string; embedCode?: string } | null;

export function SidebarEmbed({ embed }: { embed: SidebarEmbedData }) {
  if (!embed || embed.enabled === false) return null;
  const height = embed.height || 420;
  let content: React.ReactNode = null;
  if (embed.embedCode) {
    content = (
      <iframe
        title={embed.title || "Embedded content"}
        srcDoc={embed.embedCode}
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        loading="lazy"
        className="block w-full rounded-xl"
        style={{ height }}
      />
    );
  } else if (embed.image) {
    const img = <Image src={embed.image} alt={embed.alt ?? ""} width={600} height={400} className="h-auto w-full rounded-xl" />;
    content = embed.link ? <a href={embed.link}>{img}</a> : img;
  }
  if (!content) return null;
  return (
    <section className={`${BOX} p-4`}>
      {embed.title && <h2 className="headline mb-3 text-[18px]">{embed.title}</h2>}
      {content}
    </section>
  );
}

export function SidebarArticles({ posts }: { posts: PostCard[] }) {
  if (!posts.length) return null;
  return (
    <section className={`${BOX} p-4`}>
      <h2 className={BOX_TITLE}>Related reading</h2>
      <ul className="mt-3 space-y-3.5">
        {posts.map((p) => (
          <li key={p._id}>
            <Link href={p.path} className="group flex items-center gap-3">
              <span className="block size-16 shrink-0 overflow-hidden rounded-lg">
                {p.image?.src ? (
                  <Image src={p.image.src} alt="" width={128} height={128} sizes="64px" className="size-16 object-cover" />
                ) : (
                  <Cover seed={p.path} category={p.category?.slug} className="size-16" />
                )}
              </span>
              <span className="line-clamp-3 text-[14px] leading-snug font-medium text-ink group-hover:text-dawn">{p.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The 24/7 helpline, kept in view at the bottom of the sidebar. */
export function SidebarHelp() {
  return (
    <section className="grid-lines relative overflow-hidden rounded-2xl bg-night p-5 text-mist">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-[radial-gradient(closest-side,rgba(182,227,165,0.32),transparent)]" />
      <p className="relative text-[11.5px] font-bold tracking-[0.16em] text-ice uppercase">Free 24/7 helpline</p>
      <p className="relative mt-1.5 font-display text-[20px] leading-snug font-semibold text-white">Questions about memory loss or caregiving?</p>
      <a href="tel:+18002723900" className="numeric relative mt-4 block rounded-xl bg-white/10 px-4 py-3 text-center text-[22px] font-semibold text-white hover:bg-white/15">
        800-272-3900
      </a>
      <p className="relative mt-3 text-[13.5px] leading-relaxed">Alzheimer’s Association (US), day and night. If someone is missing or in danger, call 911.</p>
    </section>
  );
}

/** House ad space: a plain box pointing advertisers to the Advertise page. */
export function SidebarAdSpace() {
  return (
    <aside aria-label="Advertising space" className={`${BOX} border-dashed px-5 py-7 text-center`}>
      <p className="text-[10.5px] tracking-[0.18em] text-muted uppercase">Advertisement</p>
      <p className="mt-2 font-display text-[19px] leading-snug font-semibold text-ink">Your ad could be here</p>
      <Link href="/advertise-with-us/" className="mt-2 inline-block text-[14px] font-semibold text-dawn hover:underline">
        Advertise with us
      </Link>
    </aside>
  );
}

/** News block: one recent news story, photo and title both linking to it. */
export function SidebarFeature({ post }: { post: PostCard | null }) {
  if (!post) return null;
  return (
    <section className={`${BOX} overflow-hidden`}>
      <Link href={post.path} className="group block">
        <span className="block aspect-[3/2] overflow-hidden">
          {post.image?.src ? (
            <Image src={post.image.src} alt={post.image.alt ?? ""} width={600} height={400} sizes="300px" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <Cover seed={post.path} category={post.category?.slug} className="size-full" />
          )}
        </span>
        <span className="block p-4">
          <span className={`${BOX_TITLE} block`}>Dementia news</span>
          <span className="mt-1.5 line-clamp-3 block font-display text-[18px] leading-snug text-ink group-hover:text-dawn">{post.title}</span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-dawn">
            Read the story <Arrow />
          </span>
        </span>
      </Link>
    </section>
  );
}

export function SidebarAd({ ad }: { ad: SidebarAdData }) {
  if (!ad || ad.enabled === false || (!ad.image && !ad.embedCode)) return null;
  return (
    <aside aria-label="Advertisement" className="text-center">
      <p className="mb-1.5 text-[10.5px] tracking-[0.18em] text-muted uppercase">Advertisement</p>
      {ad.embedCode ? (
        <iframe
          title="Advertisement"
          srcDoc={ad.embedCode}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          loading="lazy"
          className="mx-auto block h-[600px] w-[300px] max-w-full"
        />
      ) : (
        <a href={ad.link || "#"} rel="sponsored noopener" target={ad.link?.startsWith("http") ? "_blank" : undefined}>
          <Image src={ad.image!} alt={ad.alt ?? ""} width={600} height={1200} className="mx-auto h-auto w-full max-w-[300px] rounded-xl" />
        </a>
      )}
    </aside>
  );
}

/* --------------------------------------------------------------- Byline */

const TONES = [
  { bg: "#fde4e8", coat: "#d12a43", skin: "#f1c7a5", hair: "#3b2a20" },
  { bg: "#d9f0ec", coat: "#0e7a6c", skin: "#e0ac86", hair: "#1f1a17" },
  { bg: "#e4e9f2", coat: "#1a2840", skin: "#f3d1b5", hair: "#5a5148" },
];

/** The reviewer's photo, or an illustrated stand-in until one is uploaded in the Studio. */
export function DoctorAvatar({ name, photo, size = 56 }: { name: string; photo?: string | null; size?: number }) {
  if (photo) return <Image src={photo} alt="" width={size * 2} height={size * 2} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  const c = TONES[hash(name) % TONES.length];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="shrink-0 rounded-full" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill={c.bg} />
      <path d="M10 60c2-11 11-17 22-17s20 6 22 17a32 32 0 0 1-44 0z" fill="#ffffff" stroke={c.coat} strokeWidth="1.5" />
      <path d="M26 43l6 9 6-9" fill={c.coat} />
      <path d="M22 46c-3 5-3 9 0 11M42 46c3 5 3 9 0 11" fill="none" stroke="#5b6573" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="22" cy="57.5" r="1.8" fill="#5b6573" />
      <rect x="28" y="36" width="8" height="8" rx="3" fill={c.skin} />
      <circle cx="32" cy="27" r="10.5" fill={c.skin} />
      <path d="M21.5 26c0-7 4.5-11 10.5-11s10.5 4 10.5 11c-2-3.5-5-5-10.5-5s-8.5 1.5-10.5 5z" fill={c.hair} />
    </svg>
  );
}

export function ReviewerByline({ name, credentials, photo, reviewedAt }: { name: string; credentials?: string | null; photo?: string | null; reviewedAt: string }) {
  return (
    <section id="reviewed-by" aria-label="Medical review" className={`${BOX} flex scroll-mt-36 items-center gap-4 p-5 sm:p-6`}>
      <DoctorAvatar name={name} photo={photo} size={64} />
      <div className="min-w-0">
        <p className="text-[13px] text-muted">Revised and edited by</p>
        <p className="headline text-[20px]">
          {name}
          {credentials ? `, ${credentials}` : ""}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5 font-medium text-sage">
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 2.5 3.5 5v4.5c0 4 2.8 7 6.5 8 3.7-1 6.5-4 6.5-8V5L10 2.5Z" />
              <path d="m7 10 2 2 4-4" />
            </svg>
            Medically reviewed
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Last reviewed <time dateTime={reviewedAt}>{formatDate(reviewedAt)}</time>
          </span>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */

/** The visible FAQ that the FAQPage markup describes. */
export function FaqSection({ faq, title = "Frequently asked questions" }: { faq: Faq[]; title?: string }) {
  if (!faq.length) return null;
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-36">
      <h2 id="faq-title" className="display text-[28px] leading-tight sm:text-[32px]">
        {title}
      </h2>
      <div className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {faq.map((f, i) => (
          <details key={i} className="group" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[16px] font-semibold text-ink hover:text-dawn [&::-webkit-details-marker]:hidden">
              <span>{f.question}</span>
              <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-dawn-soft text-dawn transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <Answer text={f.answer} />
          </details>
        ))}
      </div>
    </section>
  );
}

function Answer({ text }: { text: string }) {
  const [lead, ...items] = text.split(/\s*•\s+/);
  return (
    <div className="px-5 pb-5 font-serif text-[16.5px] leading-relaxed text-body">
      {lead && <p>{lead}</p>}
      {items.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-dawn">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
