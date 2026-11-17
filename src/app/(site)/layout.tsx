import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HelpBand } from "@/components/HelpBand";
import { HideOn } from "@/components/HideOn";
import { SignsBanner } from "@/components/WarningSigns";
import { JsonLd } from "@/components/ArticleParts";
import { getSettings, siteUrl } from "@/lib/content";
import { organizationSchema, websiteSchema } from "@/lib/schema";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      {/* React hoists this into <head>. Kept out of `metadata.alternates`, which blocks prerendering of /studio. */}
      <link rel="alternate" type="application/rss+xml" title={settings.siteName} href={`${siteUrl}/feed/`} />
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Header settings={settings} />
      <main id="main" className="pb-24">
        {children}
        {/* The 10-sign checklist on every internal page; the homepage has the checklist itself. */}
        <HideOn paths={["/"]}>
          <SignsBanner className="mt-24" />
        </HideOn>
      </main>
      <HelpBand />
      <Footer settings={settings} />
    </>
  );
}
