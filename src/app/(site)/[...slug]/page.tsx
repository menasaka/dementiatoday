import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mark } from "@/components/Brand";
import { CopyLink, ReadingProgress } from "@/components/ArticleChrome";
import {
  DoctorAvatar,
  FaqSection,
  JsonLd,
  KeyPoints,
  RelatedPages,
  RelatedTopics,
  ReviewerByline,
  SidebarAd,
  SidebarAdSpace,
  SidebarFeature,
  SidebarArticles,
  SidebarEmbed,
  SidebarHelp,
} from "@/components/ArticleParts";
import { GridCard, Media } from "@/components/Cards";
import { Arrow } from "@/components/Header";
import { OnThisPage } from "@/components/OnThisPage";
import { RichText } from "@/components/RichText";
import { SignsPromo } from "@/components/WarningSigns";
import { articleFaq, deriveKeyPoints, outline, type Block } from "@/lib/article";
import { formatDate, getSettings, metaDescription, readingLabel, siteUrl, type CategoryRef, type Doc, type PostCard } from "@/lib/content";
import { articleSchemas, breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema";
import { sanityFetch } from "@/sanity/lib/fetch";
import { allDocPathsQuery, docByPathQuery, latestNewsQuery, relatedPoolQuery } from "@/sanity/lib/queries";

// Every known URL is prerendered; params are read outside <Suspense> so that unknown URLs
// return a real 404 status instead of a streamed soft 404.
export const instant = false;

const toPath = (slug: string[]) => `/${slug.join("/")}/`;
const getDoc = (path: string) => sanityFetch<Doc>(docByPathQuery, { path }, [`path:${path}`, "post", "page"]);

const STOP = new Set("a an and are as at be by can for from has have how in is it its new of on or that the their this to was what when which who why will with may more".split(" "));
const titleWords = (title: string) =>
  [...new Set(title.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))].slice(0, 8).map((w) => `${w}*`);

function getRelated(doc: Doc) {
  if (!doc.categoryIds?.length) return Promise.resolve([] as PostCard[]);
  return sanityFetch<PostCard[]>(relatedPoolQuery, { id: doc._id, cats: doc.categoryIds, words: titleWords(doc.title) }, ["post"]).then((r) => r ?? []);
}

export async function generateStaticParams() {
  const paths = (await sanityFetch<string[]>(allDocPathsQuery, {}, ["post", "page"])) ?? [];
  const params = paths.filter((p) => p !== "/").map((p) => ({ slug: p.split("/").filter(Boolean) }));
  // Cache Components needs at least one entry; paths added later render on first visit.
  return params.length ? params : [{ slug: ["contact"] }];
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const doc = await getDoc(toPath((await params).slug));
  if (!doc) return {};
  const image = doc.seo?.ogImage ?? doc.image?.src ?? "/brand/og.png";
  const isPost = doc._type === "post";
  return {
    // WordPress used the bare title (no site-name suffix); keep it identical.
    title: { absolute: doc.seo?.title || doc.title },
    description: metaDescription(doc.seo?.description ?? doc.excerpt),
    alternates: { canonical: doc.path },
    robots: doc.seo?.noindex ? { index: false } : undefined,
    openGraph: {
      type: isPost ? "article" : "website",
      url: doc.path,
      images: [image],
      ...(isPost ? { publishedTime: doc.publishedAt ?? undefined, modifiedTime: doc.updatedAt ?? undefined, section: doc.categories?.[0]?.title } : {}),
    },
  };
}

function PageView({ doc }: { doc: Doc }) {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({ name: doc.title, url: doc.path, type: doc.path === "/contact/" ? "ContactPage" : "WebPage" }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: doc.title, url: doc.path },
          ]),
        ]}
      />
      <header className="border-b border-line">
        <div className="container-read pt-16 pb-12 md:pt-24">
          <p className="kicker mb-4">{doc.path === "/contact/" ? "Get in touch" : "Dementia Today"}</p>
          <h1 className="display text-[44px] leading-[1.02] md:text-[64px]">{doc.title}</h1>
        </div>
      </header>
      <article className="container-read pt-12">
        <RichText value={doc.body} dropCap={false} />
      </article>
    </>
  );
}

const shareBtn = "flex size-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-ink-3 hover:text-ink";

function Share({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return (
    <div className="flex items-center gap-2">
      <CopyLink url={url} />
      <a href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener" aria-label="Share on X" className={shareBtn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.8 3h3.2l-7 8 8.2 10h-6.4l-5-6.2L5 21H1.8l7.5-8.6L1.5 3h6.6l4.5 5.7L17.8 3Zm-1.1 16.2h1.8L7.4 4.7H5.5l11.2 14.5Z" />
        </svg>
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener" aria-label="Share on Facebook" className={shareBtn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.3v2H7.6V12h2.8v9.8H14V12h2.8l.4-3.5H14Z" />
        </svg>
      </a>
      <a href={`mailto:?subject=${t}&body=${u}`} aria-label="Share by email" className={shareBtn}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </a>
    </div>
  );
}

export default async function DocPage({ params }: PageProps<"/[...slug]">) {
  const path = toPath((await params).slug);
  const [doc, settings] = await Promise.all([getDoc(path), getSettings()]);
  if (!doc) notFound();
  if (doc._type === "page") return <PageView doc={doc} />;

  const [pool, news] = await Promise.all([getRelated(doc), sanityFetch<PostCard>(latestNewsQuery, { path: doc.path }, ["post"])]);
  const body = (doc.body ?? []) as unknown as Block[];
  const category = doc.categories?.[0] ?? null;
  const url = `${siteUrl}${doc.path}`;

  // Left sidebar: the closest titles. Right sidebar: the next ones, pictures first. Below: more in the topic.
  const relatedPages = pool.slice(0, 8);
  const rest = pool.slice(8);
  const relatedReading = [...rest.filter((p) => p.image?.src), ...rest.filter((p) => !p.image?.src)].slice(0, 6);
  const keepReading = rest.filter((p) => !relatedReading.includes(p)).slice(0, 3);
  const topicMap = new Map<string, CategoryRef>();
  for (const c of [...(doc.categories ?? []), ...pool.map((p) => p.category).filter((c): c is CategoryRef => !!c)]) topicMap.set(c.slug, c);
  const relatedTopics = [...topicMap.values()].slice(0, 10);

  const headings = outline(body);
  const anchors = new Map(headings.map((h) => [h.key, h.id]));
  const keyPoints = deriveKeyPoints(body);
  // Shown only when an editor has recorded a real medical review in Studio (reviewer + date).
  const reviewer = doc.reviewer?.name && doc.reviewedAt ? doc.reviewer : null;
  const reviewedAt = reviewer ? doc.reviewedAt! : null;
  const faq = articleFaq({ title: doc.title, body, stored: doc.faq });

  const toc = [
    ...(keyPoints.length ? [{ id: "key-points", text: "Key points" }] : []),
    ...(headings.length >= 2 ? headings.map(({ id, text }) => ({ id, text })) : [{ id: "article-body", text: "Article" }]),
    ...(faq.length ? [{ id: "faq", text: "Frequently asked questions" }] : []),
    ...(reviewer ? [{ id: "reviewed-by", text: "Medical review" }] : []),
  ];
  const card = { _id: doc._id, title: doc.title, path: doc.path, image: doc.image, category };
  const isNews = doc.categories?.some((c) => c.slug === "dementia-news") ?? false;

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={[
          ...articleSchemas({
            url: doc.path,
            title: doc.title,
            description: metaDescription(doc.seo?.description ?? doc.excerpt),
            image: doc.image?.src,
            publishedAt: doc.publishedAt,
            modifiedAt: doc.updatedAt,
            reviewedAt,
            reviewer,
            author: doc.author ? { name: doc.author.name, url: `/author/${doc.author.slug}/` } : null,
            category,
            isNews,
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            ...(category ? [{ name: category.title, url: `/category/${category.slug}/` }] : []),
            { name: doc.title, url: doc.path },
          ]),
          faqSchema(faq, doc.path),
        ]}
      />

      <article className="container-site pt-8 sm:pt-12">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_18.75rem] xl:grid-cols-[14.5rem_minmax(0,1fr)_18.75rem]">
          {/* Main column */}
          <div className="min-w-0 xl:col-start-2 xl:row-start-1">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
              {category && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link href={`/category/${category.slug}/`} className="kicker hover:text-ink">
                    {category.title}
                  </Link>
                </>
              )}
            </nav>
            <h1 className="display mt-5 text-[36px] leading-[1.06] sm:text-[48px] lg:text-[52px]">{doc.title}</h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line py-4 text-[13.5px] text-muted">
              {reviewer ? (
                <a href="#reviewed-by" className="inline-flex items-center gap-2">
                  <DoctorAvatar name={reviewer.name} photo={reviewer.photo} size={30} />
                  <span className="text-ink-2">
                    {reviewer.name}
                    {reviewer.credentials ? `, ${reviewer.credentials}` : ""}
                  </span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 text-ink-2">
                  <Mark size={26} id="byline" />
                  {doc.author?.name ?? settings.siteName}
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span>Published {formatDate(doc.publishedAt)}</span>
              <span aria-hidden="true">·</span>
              <span>{readingLabel(doc.readingTime)}</span>
              <span className="ml-auto hidden sm:block">
                <Share url={url} title={doc.title} />
              </span>
            </div>

            <figure className="mt-8">
              <div className={`overflow-hidden rounded-2xl ${doc.image?.src ? "bg-white" : ""}`}>
                {doc.image?.src ? (
                  <Image
                    src={doc.image.src}
                    alt={doc.image.alt ?? ""}
                    width={doc.image.width ?? 1600}
                    height={doc.image.height ?? 1000}
                    priority
                    sizes="(min-width: 1280px) 700px, (min-width: 1024px) 60vw, 100vw"
                    className="mx-auto h-auto max-h-[560px] w-auto max-w-full"
                  />
                ) : (
                  <Media post={card} className="aspect-[16/7] w-full" sizes="100vw" />
                )}
              </div>
              {doc.image?.caption && <figcaption className="mt-2 text-[13px] text-muted">{doc.image.caption}</figcaption>}
            </figure>

            {keyPoints.length > 0 && (
              <div className="mt-8">
                <KeyPoints points={keyPoints} />
              </div>
            )}

            <div id="article-body" className="mt-10 scroll-mt-36">
              <RichText value={doc.body} anchors={anchors} />
            </div>

            {faq.length > 0 && (
              <div className="mt-14">
                <FaqSection faq={faq} />
              </div>
            )}

            {reviewer && reviewedAt && (
              <div className="mt-12">
                <ReviewerByline name={reviewer.name} credentials={reviewer.credentials} photo={reviewer.photo} reviewedAt={reviewedAt} />
              </div>
            )}

            <p className="mt-6 rounded-xl bg-paper-2 px-5 py-4 text-[13.5px] leading-relaxed text-muted">{settings.disclaimer}</p>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              {doc.categories && doc.categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[13px] text-muted">Filed under</span>
                  {doc.categories.map((c) => (
                    <Link key={c.slug} href={`/category/${c.slug}/`} className="rounded-full border border-line bg-white px-3 py-1 text-[13px] text-ink-2 hover:border-dawn hover:text-dawn">
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
              <Share url={url} title={doc.title} />
            </div>
          </div>

          {/* Left sidebar: after the article in page order, beside it on wide screens */}
          <aside className="min-w-0 lg:col-start-1 xl:sticky xl:top-36 xl:row-start-1 xl:max-h-[calc(100vh-10rem)] xl:self-start xl:overflow-y-auto xl:pr-2 [scrollbar-width:thin]">
            <div className="space-y-8">
              <OnThisPage items={toc} />
              <RelatedTopics topics={relatedTopics} current={category?.slug} />
              <RelatedPages posts={relatedPages} />
            </div>
          </aside>

          {/* Right sidebar */}
          <aside className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:col-start-3 xl:row-span-1">
            <div className="flex h-full flex-col gap-6">
              <SignsPromo />
              <SidebarEmbed embed={settings.sidebarEmbed ?? null} />
              <SidebarArticles posts={relatedReading} />
              <SidebarFeature post={news} />
              <SidebarAdSpace />
              <div className="flex flex-col gap-6 lg:sticky lg:top-36">
                <SidebarHelp />
                <SidebarAd ad={settings.sidebarAd ?? null} />
              </div>
            </div>
          </aside>
        </div>
      </article>

      {keepReading.length > 0 && (
        <section className="container-site mt-20">
          <div className="mb-8 flex items-end justify-between gap-6 border-b border-ink pb-4">
            <h2 className="display text-[32px] leading-none sm:text-[40px]">Keep reading</h2>
            {category && (
              <Link href={`/category/${category.slug}/`} className="group hidden shrink-0 items-center gap-2 pb-1 text-[14px] font-semibold text-ink hover:text-dawn sm:flex">
                More in {category.title} <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {keepReading.map((p) => (
              <GridCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
