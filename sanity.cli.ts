import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
  // Hosted copy of the Studio: `npx sanity deploy` → https://allfordiabetes.sanity.studio
  // (the site also serves the same Studio at /studio/). Hosted at the root, so no /studio base path.
  studioHost: "allfordiabetes",
  project: { basePath: "/" },
});
