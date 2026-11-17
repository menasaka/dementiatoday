import { defineArrayMember, defineField, defineType } from "sanity";

/** Image with alt text and an optional caption. */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Alt text", type: "string", description: "Describe the image for screen readers and search engines." }),
    defineField({ name: "caption", type: "string" }),
  ],
});

/** A link to an internal document or any URL. */
export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "internal", title: "Internal page", type: "reference", to: [{ type: "category" }, { type: "page" }, { type: "post" }] }),
    defineField({ name: "href", title: "Or URL", type: "string", description: "Used when no internal page is chosen, e.g. /contact/ or https://…" }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

/** Main menu item with an optional dropdown. */
export const navItem = defineType({
  name: "navItem",
  title: "Menu item",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "internal", title: "Internal page", type: "reference", to: [{ type: "category" }, { type: "page" }, { type: "post" }] }),
    defineField({ name: "href", title: "Or URL", type: "string" }),
    defineField({ name: "children", title: "Dropdown links", type: "array", of: [{ type: "link" }] }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "title", title: "Meta title", type: "string", description: "Leave empty to use the title.", validation: (r) => r.max(70).warning("Keep under 70 characters") }),
    defineField({ name: "description", title: "Meta description", type: "text", rows: 3, validation: (r) => r.max(170).warning("Keep under 170 characters") }),
    defineField({ name: "ogImage", title: "Social share image", type: "imageWithAlt" }),
    defineField({ name: "noindex", title: "Hide from search engines", type: "boolean", initialValue: false }),
  ],
});

/** YouTube / Vimeo / other iframe embed inside an article. */
export const embed = defineType({
  name: "embed",
  title: "Video / embed",
  type: "object",
  fields: [
    defineField({ name: "url", title: "Embed URL", type: "url", description: "e.g. https://www.youtube.com/embed/VIDEO_ID", validation: (r) => r.required() }),
    defineField({ name: "title", type: "string" }),
  ],
  preview: { select: { title: "title", subtitle: "url" }, prepare: ({ title, subtitle }) => ({ title: `Embed: ${title || subtitle || ""}` }) },
});

/** Table kept as simple rows of cells (migrated from WordPress tables). */
export const table = defineType({
  name: "table",
  type: "object",
  fields: [
    defineField({ name: "caption", type: "string" }),
    defineField({ name: "headerRow", title: "First row is a header", type: "boolean", initialValue: true }),
    defineField({
      name: "rows",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "tableRow",
          fields: [defineField({ name: "cells", type: "array", of: [{ type: "string" }] })],
          preview: { select: { cells: "cells" }, prepare: ({ cells }) => ({ title: (cells ?? []).join(" | ") }) },
        }),
      ],
    }),
  ],
  preview: { select: { caption: "caption", rows: "rows" }, prepare: ({ caption, rows }) => ({ title: `Table: ${caption || `${rows?.length ?? 0} rows`}` }) },
});

export const richText = defineType({
  name: "richText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      marks: {
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({ name: "internal", type: "reference", to: [{ type: "post" }, { type: "page" }, { type: "category" }] }),
              defineField({ name: "href", title: "URL", type: "string" }),
              defineField({ name: "blank", title: "Open in new tab", type: "boolean" }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: "imageWithAlt" }),
    defineArrayMember({ type: "embed" }),
    defineArrayMember({ type: "table" }),
  ],
});

/** Questions and answers for this page only (shown as the FAQ section and FAQPage markup). */
export const faqList = defineType({
  name: "faqList",
  title: "FAQ",
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      name: "faqItem",
      fields: [
        defineField({ name: "question", type: "string", validation: (r) => r.required() }),
        defineField({ name: "answer", type: "text", rows: 4, validation: (r) => r.required() }),
      ],
      preview: { select: { title: "question", subtitle: "answer" } },
    }),
  ],
  description: "Unique to this page and answered from its content. Leave empty to show questions found in the article's own headings.",
});

export const objectTypes = [imageWithAlt, link, navItem, seo, embed, table, richText, faqList];
