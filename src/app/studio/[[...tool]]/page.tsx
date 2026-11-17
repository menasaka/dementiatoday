import type { Metadata, Viewport } from "next";
import { NextStudio } from "next-sanity/studio";
import { isSanityConfigured } from "@/sanity/env";
import config from "../../../../sanity.config";

export const metadata: Metadata = { title: "Studio", robots: { index: false, follow: false }, referrer: "same-origin" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main style={{ fontFamily: "system-ui", padding: 48, maxWidth: 640 }}>
        <h1>Sanity Studio is not connected yet</h1>
        <p>Set NEXT_PUBLIC_SANITY_PROJECT_ID (see .env.example), then reload this page.</p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
