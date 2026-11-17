import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "general", title: "General", default: true },
    { name: "nav", title: "Menu" },
    { name: "home", title: "Homepage" },
    { name: "footer", title: "Footer" },
    { name: "sidebar", title: "Article sidebar" },
  ],
  fields: [
    defineField({ name: "siteName", type: "string", group: "general" }),
    defineField({ name: "tagline", type: "string", group: "general", description: "Shown next to the site name in browser tabs." }),
    defineField({ name: "description", title: "Default meta description", type: "text", rows: 3, group: "general" }),
    defineField({ name: "ogImage", title: "Default social share image", type: "imageWithAlt", group: "general" }),
    defineField({ name: "nav", title: "Main menu", type: "array", of: [{ type: "navItem" }], group: "nav" }),
    defineField({
      name: "homeSections",
      title: "Category sections on the homepage",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      group: "home",
    }),
    defineField({ name: "homeTitle", title: "Homepage meta title", type: "string", group: "home" }),
    defineField({ name: "about", title: "Footer about text", type: "text", rows: 4, group: "footer" }),
    defineField({ name: "footerLinks", type: "array", of: [{ type: "link" }], group: "footer" }),
    defineField({ name: "disclaimer", title: "Medical disclaimer", type: "text", rows: 3, group: "footer" }),
    defineField({
      name: "sidebarEmbed",
      title: "Sidebar embed (top of the right sidebar)",
      type: "object",
      group: "sidebar",
      options: { collapsible: true },
      fields: [
        defineField({ name: "enabled", type: "boolean", initialValue: true }),
        defineField({ name: "title", type: "string" }),
        defineField({ name: "embedCode", title: "Embed code (HTML)", type: "text", rows: 5 }),
        defineField({ name: "image", type: "imageWithAlt", description: "Used when there is no embed code." }),
        defineField({ name: "link", type: "string" }),
        defineField({ name: "height", type: "number", initialValue: 420 }),
      ],
    }),
    defineField({
      name: "sidebarAd",
      title: "Sidebar ad (sticky, bottom of the right sidebar)",
      type: "object",
      group: "sidebar",
      options: { collapsible: true },
      fields: [
        defineField({ name: "enabled", type: "boolean", initialValue: true }),
        defineField({ name: "image", type: "imageWithAlt", description: "300×600 or 300×250" }),
        defineField({ name: "link", type: "string" }),
        defineField({ name: "embedCode", title: "Ad code (HTML)", type: "text", rows: 5 }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const singletonTypes = [siteSettings];
