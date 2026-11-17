import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Literata, Source_Serif_4 } from "next/font/google";
import { defaultSettings, siteUrl } from "@/lib/content";
import "./globals.css";

// Atkinson Hyperlegible was designed for readers with low vision: a good fit for an older audience.
const atkinson = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin"], display: "swap", adjustFontFallback: false });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], display: "swap" });
const literata = Literata({ variable: "--font-literata", subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], display: "swap" });
const mono = Atkinson_Hyperlegible_Mono({ variable: "--font-atkinson-mono", subsets: ["latin"], display: "swap", adjustFontFallback: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultSettings.homeTitle,
    template: `%s - ${defaultSettings.siteName}`,
  },
  description: defaultSettings.description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: { siteName: defaultSettings.siteName, type: "website", locale: "en_US", images: ["/brand/og.png"] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#f6f4ee" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${sourceSerif.variable} ${literata.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
