import { defineQuery } from "next-sanity";

export const PAGE_SIZE = 12;

const img = `{ "src": asset->url, "alt": coalesce(alt, ""), caption, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`;
const linkHref = `coalesce(
  select(internal->_type == "category" => "/category/" + internal->slug.current + "/", internal->path.current),
  href
)`;
const card = `{
  _id, title, "path": path.current, excerpt, publishedAt,
  "readingTime": round(length(pt::text(body)) / 1100),
  "image": mainImage${img},
  "category": categories[0]->{ title, "slug": slug.current }
}`;

/** Sidebar news block: the newest news story with a photo, other than the page being read. */
export const latestNewsQuery = defineQuery(`*[_type == "post" && defined(mainImage.asset) && path.current != $path && "dementia-news" in categories[]->slug.current] | order(publishedAt desc)[0] ${card}`);

export const settingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  siteName, tagline, description, homeTitle, about, disclaimer,
  "ogImage": ogImage.asset->url,
  nav[]{ label, "href": ${linkHref}, children[]{ label, "href": ${linkHref} } },
  footerLinks[]{ label, "href": ${linkHref} },
  "sidebarEmbed": sidebarEmbed{ enabled, title, embedCode, "image": image.asset->url, "alt": image.alt, link, height },
  "sidebarAd": sidebarAd{ enabled, "image": image.asset->url, "alt": image.alt, link, embedCode },
  "homeSections": homeSections[]->{ title, "slug": slug.current }
}`);

/** One page of the newest posts, optionally limited to a category or author. */
export const postListQuery = defineQuery(`{
  "items": *[_type == "post" && defined(path.current) && ($category == "" || $category in categories[]->slug.current) && ($author == "" || author->slug.current == $author)]
    | order(publishedAt desc) [$start...$end] ${card},
  "total": count(*[_type == "post" && defined(path.current) && ($category == "" || $category in categories[]->slug.current) && ($author == "" || author->slug.current == $author)])
}`);

export const categoryQuery = defineQuery(`*[_type == "category" && slug.current == $slug][0]{
  title, "slug": slug.current, description, seo, "faq": faq[]{ question, answer },
  "parent": parent->{ title, "slug": slug.current },
  "children": *[_type == "category" && parent._ref == ^._id] | order(title asc){ title, "slug": slug.current }
}`);

export const authorQuery = defineQuery(`*[_type == "author" && slug.current == $slug][0]{ name, "slug": slug.current, bio, "photo": photo${img} }`);

/** Category slugs with post counts, for generateStaticParams. */
export const categoryCountsQuery = defineQuery(`*[_type == "category"]{ "slug": slug.current, "count": count(*[_type == "post" && references(^._id)]) }`);
export const authorCountsQuery = defineQuery(`*[_type == "author"]{ "slug": slug.current, "count": count(*[_type == "post" && references(^._id)]) }`);

const bodyProjection = `body[]{
  ...,
  _type == "imageWithAlt" => ${img},
  markDefs[]{ ..., _type == "link" => { "href": ${linkHref}, blank } }
}`;

export const docByPathQuery = defineQuery(`*[_type in ["post", "page"] && path.current == $path][0]{
  _id, _type, title, "path": path.current, publishedAt, updatedAt, excerpt,
  "readingTime": round(length(pt::text(body)) / 1100),
  "image": mainImage${img},
  ${bodyProjection},
  "categories": categories[]->{ title, "slug": slug.current },
  "author": author->{ name, "slug": slug.current },
  "categoryIds": categories[]._ref,
  "faq": faq[]{ question, answer },
  reviewedAt,
  "reviewer": reviewer->{ name, credentials, "photo": photo.asset->url },
  seo{ title, description, noindex, "ogImage": ogImage.asset->url },
}`);

export const allDocPathsQuery = defineQuery(`*[_type in ["post", "page"] && defined(path.current)].path.current`);


/** Topic tiles on the homepage: the biggest categories, minus the catch-all ones. */
export const topicsQuery = defineQuery(`*[_type == "category" && !(slug.current in ["dementia-news", "uncategorized"])]{
  title, "slug": slug.current, "count": count(*[_type == "post" && references(^._id)])
} | order(count desc) [0...8]`);

export const homeSectionQuery = defineQuery(`*[_type == "post" && $slug in categories[]->slug.current] | order(publishedAt desc) [0...$limit] ${card}`);

export const searchQuery = defineQuery(`*[_type == "post" && defined(path.current) && (title match $q || excerpt match $q || pt::text(body) match $q)]
  | score(boost(title match $q, 3), excerpt match $q, pt::text(body) match $q)
  | order(_score desc, publishedAt desc) [0...30] ${card}`);

export const sitemapQuery = defineQuery(`{
  "docs": *[_type in ["post", "page"] && defined(path.current) && seo.noindex != true]{ "path": path.current, "lastModified": coalesce(updatedAt, publishedAt, _updatedAt) },
  "categories": *[_type == "category" && count(*[_type == "post" && references(^._id)]) > 0]{ "slug": slug.current, "lastModified": _updatedAt }
}`);

export const feedQuery = defineQuery(`*[_type == "post" && defined(path.current)] | order(publishedAt desc) [0...30]{
  title, "path": path.current, excerpt, publishedAt, "categories": categories[]->title, "author": author->name
}`);

export const redirectsQuery = defineQuery(`*[_type == "redirect" && defined(source) && defined(destination)]{ source, destination, permanent }`);

export const categoryTitlesQuery = defineQuery(`*[_type == "category"]{ "slug": slug.current, title }`);

/** Articles sharing a category, closest titles first: feeds Related pages, Related reading and Keep reading. */
export const relatedPoolQuery = defineQuery(`*[_type == "post" && _id != $id && defined(path.current) && references($cats)]
  | score(title match $words)
  | order(_score desc, publishedAt desc) [0...24] ${card}`);

/** Every category with its post count, for the "types of dementia" atlas on the homepage. */
export const categoryCountsWithTitleQuery = defineQuery(`*[_type == "category"]{
  title, "slug": slug.current, "count": count(*[_type == "post" && references(^._id)])
}`);
