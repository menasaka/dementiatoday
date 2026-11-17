# Dementia Today (dementiatoday.net)

Next.js 16 (Cache Components) + Sanity, replacing the WordPress/GrandNews site with the same URLs.
Studio is embedded at `/studio`. Sanity project `eb5rh6pq`, dataset `production`.
(The older Studio-only import in `LLM-projects/Dementia-today`, project `zw1vwm1u`, is not used.)

## Design: "Kinship"

- Original logo kept as-is (`public/brand/logo.png`, 300×60 from WordPress). Colours come from it:
  navy `#00507f` (primary, token `dawn`) and leaf green `#4fae44` (`leaf`/`sun`; darker `sage` for text).
- Type chosen for older readers: Atkinson Hyperlegible Next (UI), Literata (article body),
  Source Serif 4 (headlines). Article text is 19–20.5px.
- **Homepage has its own look** (`src/components/HomeSections.tsx`): welcome hero with search and
  today's story, "What brings you here today?" doors, news rail, the interactive 10 warning signs
  checklist (`#signs`, `src/components/WarningSigns.tsx`), types-of-dementia atlas, caregiver band,
  topic rows, essential guides.
- **Section (category) and article pages** keep the shared sister-site layout (archive grid;
  3-column article with On this page / related topics on the left and sidebar on the right),
  restyled with the tokens in `src/app/globals.css`.
- Covers for posts without a photo are generated "memory threads" (`src/components/Cover.tsx`).
- Sitewide help band: sudden-change warning signs, missing-person steps, 911 and the
  Alzheimer's Association 24/7 Helpline 800-272-3900.

## Icons

`node scripts/make-icons.mjs` renders `public/brand/mark.svg` (the logo's cross-and-figure icon redrawn
as a vector) into `favicon-32x32`, `-48x48`, `-72x72`, `-96x96`, `-192x192` PNGs, `favicon.ico`,
`icon.svg`, `apple-touch-icon.png`, PWA icons and `brand/og.png`. The `<head>` links are in
`src/app/layout.tsx` (`metadata.icons`).

## Content migration

```bash
node scripts/migrate-wp.mts      # WordPress REST → migration-output/dementiatoday.ndjson
npx sanity dataset import migration-output/dementiatoday.ndjson production --replace
```

The export decodes the old obfuscated press-contact emails, moves each news article's own
"Frequently Asked Questions" (`<details>` blocks) into that post's `faq` field, downloads images
locally (24 were already missing on the old server) and writes `migration-output/urls.txt`
for checking every URL after launch.

## Local preview

`dementiatoday-dev` (port 4100) and `dementiatoday-prod` (4101) in the parent folder's `.claude/launch.json`.

## Deploy (Vercel)

Environment variables: `NEXT_PUBLIC_SANITY_PROJECT_ID=eb5rh6pq`, `NEXT_PUBLIC_SANITY_DATASET=production`,
`NEXT_PUBLIC_SITE_URL=https://www.dementiatoday.net`, `SANITY_REVALIDATE_SECRET` (also set on the Sanity
webhook "Revalidate site" → `https://www.dementiatoday.net/api/revalidate/`, trailing slash required).

Before switching DNS, the news auto-publisher (`dementiatoday-publisher`) must publish to Sanity
instead of WordPress, otherwise new articles keep going to the old site.
