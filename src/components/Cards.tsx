import Image from "next/image";
import Link from "next/link";
import { formatDate, readingLabel, type PostCard } from "@/lib/content";
import { Cover } from "./Cover";

/** Photo if the article has one, otherwise its own generated landscape. */
export function Media({ post, className, sizes, priority }: { post: PostCard; className: string; sizes: string; priority?: boolean }) {
  if (post.image?.src) {
    return (
      <Image
        src={post.image.src}
        alt={post.image.alt ?? ""}
        width={post.image.width ?? 1200}
        height={post.image.height ?? 800}
        sizes={sizes}
        priority={priority}
        className={`${className} object-cover`}
      />
    );
  }
  return <Cover seed={post.path} category={post.category?.slug} className={className} />;
}

export function Meta({ post, className = "" }: { post: PostCard; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 text-[13px] text-muted ${className}`}>
      <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt, "medium")}</time>
      <span aria-hidden="true" className="size-[3px] rounded-full bg-line-2" />
      <span>{readingLabel(post.readingTime)}</span>
    </p>
  );
}

function Kicker({ post }: { post: PostCard }) {
  if (!post.category) return null;
  return (
    <Link href={`/category/${post.category.slug}/`} className="kicker relative z-10 w-fit hover:text-ink">
      {post.category.title}
    </Link>
  );
}

/** Title link covering the whole card; the underline sweeps in on hover. */
function TitleLink({ post }: { post: PostCard }) {
  return (
    <Link href={post.path} className="link-sweep after:absolute after:inset-0 group-hover:[background-size:100%_1px]">
      {post.title}
    </Link>
  );
}

const lift = "transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]";

/** The day's lead story. */
export function LeadCard({ post }: { post: PostCard }) {
  return (
    <article className="group relative">
      <div className="overflow-hidden rounded-[28px]">
        <Media post={post} className={`aspect-[16/10] w-full ${lift}`} sizes="(min-width: 1024px) 760px, 100vw" priority />
      </div>
      <div className="mt-7 flex flex-col gap-3">
        <Kicker post={post} />
        <h2 className="display text-[34px] leading-[1.06] sm:text-[46px] lg:text-[52px]">
          <TitleLink post={post} />
        </h2>
        {post.excerpt && <p className="line-clamp-3 max-w-[60ch] font-serif text-[18px] leading-relaxed text-body sm:text-[19px]">{post.excerpt}</p>}
        <Meta post={post} className="mt-1" />
      </div>
    </article>
  );
}

/** Numbered list item for "Latest" and "Most recent" rails. */
export function NumberedCard({ post, n }: { post: PostCard; n: number }) {
  return (
    <article className="group relative grid grid-cols-[auto_1fr] gap-x-5 py-5">
      <span aria-hidden="true" className="display w-8 text-[34px] leading-none text-dawn-2/80">
        {n}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Kicker post={post} />
        <h3 className="headline text-[19px] leading-[1.25]">
          <TitleLink post={post} />
        </h3>
        <Meta post={post} />
      </div>
    </article>
  );
}

/** Standard card for grids and archives. */
export function GridCard({ post, priority }: { post: PostCard; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col">
      <div className="overflow-hidden rounded-2xl">
        <Media post={post} className={`aspect-[3/2] w-full ${lift}`} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" priority={priority} />
      </div>
      <div className="mt-5 flex grow flex-col gap-2">
        <Kicker post={post} />
        <h3 className="headline text-[22px] leading-[1.2]">
          <TitleLink post={post} />
        </h3>
        {post.excerpt && <p className="line-clamp-3 text-[15px] leading-relaxed text-body">{post.excerpt}</p>}
        <Meta post={post} className="mt-auto pt-2" />
      </div>
    </article>
  );
}

/** Horizontal card with a small square image. */
export function RowCard({ post, showExcerpt = false }: { post: PostCard; showExcerpt?: boolean }) {
  return (
    <article className="group relative grid grid-cols-[1fr_auto] items-start gap-5 py-5">
      <div className="flex min-w-0 flex-col gap-1.5">
        <Kicker post={post} />
        <h3 className="headline text-[19px] leading-[1.25] sm:text-[20px]">
          <TitleLink post={post} />
        </h3>
        {showExcerpt && post.excerpt && <p className="line-clamp-2 text-[15px] leading-relaxed text-body">{post.excerpt}</p>}
        <Meta post={post} />
      </div>
      <div className="overflow-hidden rounded-xl">
        <Media post={post} className={`aspect-square w-[88px] sm:w-[108px] ${lift}`} sizes="108px" />
      </div>
    </article>
  );
}
