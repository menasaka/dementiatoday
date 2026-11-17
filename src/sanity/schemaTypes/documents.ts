import { defineField, defineType } from "sanity";

/** Full URL path, kept identical to the old WordPress URL so rankings carry over. */
const pathField = (example: string) =>
  defineField({
    name: "path",
    title: "URL path",
    type: "slug",
    description: `Full path with slashes, e.g. ${example}. Keep it identical to the old WordPress URL.`,
    validation: (r) =>
      r.required().custom((v) => (v?.current && /^\/([a-z0-9-]+\/)*$/.test(v.current) ? true : "Use lowercase letters, numbers and dashes; start and end with /")),
  });

export const post = defineType({
  name: "post",
  title: "Article",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "content", validation: (r) => r.required() }),
    { ...pathField("/my-article-title/"), group: "content" },
    defineField({ name: "publishedAt", title: "Published", type: "datetime", group: "content", initialValue: () => new Date().toISOString() }),
    defineField({ name: "updatedAt", title: "Last updated", type: "datetime", group: "content" }),
    defineField({ name: "author", type: "reference", to: [{ type: "author" }], group: "content" }),
    defineField({
      name: "reviewer",
      title: "Medical reviewer",
      type: "reference",
      to: [{ type: "author" }],
      group: "content",
      description: "Shown as \"Revised and edited by\". Leave empty to show David Mazoor, M.D.",
    }),
    defineField({
      name: "reviewedAt",
      title: "Last medically reviewed",
      type: "date",
      group: "content",
      description: "Leave empty to use the date assigned to this article automatically.",
    }),
    defineField({
      name: "categories",
      type: "array",
      group: "content",
      description: "The first category is the main one (shown on cards and in breadcrumbs).",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({ name: "excerpt", type: "text", rows: 3, group: "content", description: "Shown on cards. Also the meta description unless SEO overrides it." }),
    defineField({ name: "mainImage", title: "Featured image", type: "imageWithAlt", group: "content" }),
    defineField({ name: "body", type: "richText", group: "content" }),
    defineField({ name: "faq", title: "FAQ", type: "faqList", group: "content" }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
    defineField({ name: "wpId", title: "WordPress ID", type: "number", readOnly: true, group: "seo" }),
    defineField({
      name: "newsSource",
      title: "News source",
      description: "Set by the daily news auto-publisher (dementiatoday-publisher): the headline this article is based on.",
      type: "object",
      group: "seo",
      readOnly: true,
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "publisher", type: "string" }),
        defineField({ name: "url", title: "URL", type: "url" }),
      ],
    }),
  ],
  orderings: [{ title: "Newest", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "publishedAt", category: "categories.0.title", media: "mainImage" },
    prepare: ({ title, date, category, media }) => ({
      title,
      subtitle: [date ? new Date(date).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Draft", category].filter(Boolean).join(" · "),
      media,
    }),
  },
});

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    pathField("/contact/"),
    defineField({ name: "body", type: "richText" }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "path.current" } },
});

export const category = defineType({
  name: "category",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      description: "The category page lives at /category/<slug>/.",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "parent", title: "Parent category", type: "reference", to: [{ type: "category" }] }),
    defineField({ name: "description", type: "text", rows: 3, description: "Intro text on the category page and its meta description." }),
    defineField({ name: "faq", title: "FAQ", type: "faqList" }),
    defineField({ name: "seo", type: "seo" }),
  ],
  orderings: [{ title: "Name", name: "titleAsc", by: [{ field: "title", direction: "asc" }] }],
  preview: { select: { title: "title", slug: "slug.current" }, prepare: ({ title, slug }) => ({ title, subtitle: `/category/${slug ?? ""}/` }) },
});

export const author = defineType({
  name: "author",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, description: "The author page lives at /author/<slug>/.", validation: (r) => r.required() }),
    defineField({ name: "credentials", type: "string", description: "e.g. M.D. Shown after the name." }),
    defineField({ name: "bio", type: "text", rows: 4 }),
    defineField({ name: "photo", type: "imageWithAlt" }),
  ],
  preview: { select: { title: "name", media: "photo" } },
});

export const redirect = defineType({
  name: "redirect",
  type: "document",
  fields: [
    defineField({ name: "source", type: "string", description: "Old path, e.g. /old-article/ (supports :slug and :path* patterns)", validation: (r) => r.required() }),
    defineField({ name: "destination", type: "string", description: "New path or full URL", validation: (r) => r.required() }),
    defineField({ name: "permanent", type: "boolean", initialValue: true, description: "On = 308 permanent (pass rankings). Off = 307 temporary." }),
  ],
  preview: { select: { title: "source", subtitle: "destination" } },
});

export const documentTypes = [post, page, category, author, redirect];
