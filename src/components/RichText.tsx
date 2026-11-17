import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextBlock, type PortableTextComponents } from "next-sanity";

type ImageValue = { src?: string; alt?: string; caption?: string; width?: number; height?: number };
type TableValue = { caption?: string; headerRow?: boolean; rows?: { _key: string; cells?: string[] }[] };

const components: PortableTextComponents = {
  types: {
    imageWithAlt: ({ value }: { value: ImageValue }) =>
      value.src ? (
        <figure className="my-10">
          <Image
            src={value.src}
            alt={value.alt ?? ""}
            width={value.width ?? 1200}
            height={value.height ?? 800}
            sizes="(min-width: 768px) 720px, 100vw"
            className="mx-auto h-auto max-w-full rounded-2xl"
          />
          {value.caption && <figcaption className="mt-2 text-center font-sans text-sm text-muted">{value.caption}</figcaption>}
        </figure>
      ) : null,
    embed: ({ value }: { value: { url?: string; title?: string } }) =>
      value.url ? (
        <div className="my-10 aspect-video overflow-hidden rounded-2xl bg-paper-2">
          <iframe src={value.url} title={value.title || "Embedded content"} loading="lazy" allowFullScreen className="size-full border-0" />
        </div>
      ) : null,
    table: ({ value }: { value: TableValue }) => {
      const rows = value.rows ?? [];
      const [head, ...rest] = value.headerRow ? rows : [undefined, ...rows];
      return (
        <div className="my-8 overflow-x-auto font-sans text-[15px]">
          <table className="w-full border-collapse">
            {value.caption && <caption className="mb-2 text-left text-sm text-muted">{value.caption}</caption>}
            {head && (
              <thead>
                <tr>
                  {head.cells?.map((c, i) => (
                    <th key={i} className="border-b-2 border-ink px-3 py-2 text-left font-semibold text-ink">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rest.map((r) =>
                r ? (
                  <tr key={r._key}>
                    {r.cells?.map((c, i) => (
                      <td key={i} className="border-b border-line px-3 py-2 align-top">
                        {c}
                      </td>
                    ))}
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </div>
      );
    },
  },
  marks: {
    link: ({ value, children }: { value?: { href?: string; blank?: boolean }; children: React.ReactNode }) => {
      const href = value?.href ?? "#";
      if (href.startsWith("/") && !href.startsWith("//")) return <Link href={href}>{children}</Link>;
      const external = /^https?:/i.test(href);
      return (
        <a href={href} rel={external ? "noopener nofollow" : undefined} target={value?.blank ? "_blank" : undefined}>
          {children}
        </a>
      );
    },
  },
};

type HeadingProps = { value: { _key?: string }; children?: React.ReactNode };

/** `anchors` maps block keys to heading ids, so the table of contents can link to sections. */
export function RichText({ value, dropCap = true, anchors }: { value?: PortableTextBlock[] | null; dropCap?: boolean; anchors?: Map<string, string> }) {
  if (!value?.length) return null;
  const id = (v: { _key?: string }) => (v._key ? anchors?.get(v._key) : undefined);
  const withAnchors: PortableTextComponents = anchors?.size
    ? {
        ...components,
        block: {
          h2: ({ value: v, children }: HeadingProps) => (
            <h2 id={id(v)} className="scroll-mt-36">
              {children}
            </h2>
          ),
          h3: ({ value: v, children }: HeadingProps) => (
            <h3 id={id(v)} className="scroll-mt-36">
              {children}
            </h3>
          ),
        },
      }
    : components;
  return (
    <div className={`prose-site ${dropCap ? "dropcap" : ""}`}>
      <PortableText value={value} components={withAnchors} />
    </div>
  );
}
