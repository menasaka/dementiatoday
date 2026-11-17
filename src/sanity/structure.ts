import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Dementia Today")
    .items([
      S.listItem().title("Site settings").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("post").title("Articles"),
      S.listItem()
        .title("Articles by category")
        .child(
          S.documentTypeList("category")
            .title("Categories")
            .child((categoryId) =>
              S.documentList()
                .title("Articles")
                .filter('_type == "post" && $categoryId in categories[]._ref')
                .params({ categoryId })
                .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
            ),
        ),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("page").title("Pages"),
      S.documentTypeListItem("author").title("Authors"),
      S.divider(),
      S.documentTypeListItem("redirect").title("Redirects"),
    ]);
