/**
 * Renders the brand mark (public/brand/mark.svg, the cross-and-figure icon from the
 * Dementia Today logo, redrawn as a vector) into every icon size the site needs.
 *   node scripts/make-icons.mjs
 *
 * Favicons: 32, 48, 72, 96 and 192 px PNGs (linked from src/app/layout.tsx), favicon.ico
 * (16/32/48), icon.svg, apple-touch-icon (180), PWA icons (192/512 + maskable) and og.png.
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const svg = readFileSync("public/brand/mark.svg");
// Full-bleed version for platforms that apply their own mask (iOS, Android maskable).
const square = Buffer.from(svg.toString().replace('rx="14"', 'rx="0"'));
const render = (src, size) => sharp(src, { density: 72 * (size / 64) * 2 }).resize(size, size).png().toBuffer();
const png = (size) => render(svg, size);

/** Packs PNGs into a .ico (PNG-compressed entries, supported by every modern browser). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((x) => x.data)]);
}

for (const size of [32, 48, 72, 96, 192]) writeFileSync(`public/favicon-${size}x${size}.png`, await png(size));
const icoImages = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) })));
writeFileSync("public/favicon.ico", ico(icoImages));
writeFileSync("public/icon.svg", svg);
writeFileSync("public/apple-touch-icon.png", await render(square, 180));
writeFileSync("public/brand/icon-192.png", await png(192));
writeFileSync("public/brand/icon-512.png", await png(512));
writeFileSync("public/brand/maskable-512.png", await sharp(square, { density: 1152 }).resize(410, 410).extend({ top: 51, bottom: 51, left: 51, right: 51, background: "#ffffff" }).png().toBuffer());
writeFileSync(
  "public/site.webmanifest",
  JSON.stringify(
    {
      name: "Dementia Today",
      short_name: "Dementia Today",
      start_url: "/",
      display: "standalone",
      background_color: "#f6f4ee",
      theme_color: "#00507f",
      icons: [
        { src: "/favicon-72x72.png", sizes: "72x72", type: "image/png" },
        { src: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/brand/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log("icons written");

// Default social share image (1200x630): the original logo on linen, with a soft leaf-green arc.
const logo = await sharp("public/brand/logo.png").resize(600, 120, { kernel: "lanczos3" }).png().toBuffer();
const og = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#f6f4ee"/>
  <circle cx="1080" cy="640" r="420" fill="#4fae44" fill-opacity=".10"/>
  <circle cx="1080" cy="640" r="300" fill="#00507f" fill-opacity=".07"/>
  <rect x="120" y="398" width="72" height="6" rx="3" fill="#4fae44"/>
  <text x="120" y="458" font-family="Georgia, serif" font-size="44" font-weight="700" fill="#0f2230">Living with dementia</text>
  <text x="120" y="508" font-family="Segoe UI, Arial, sans-serif" font-size="27" fill="#36454f">Early signs, diagnosis, care and research news</text>
</svg>`);
writeFileSync("public/brand/og.png", await sharp(og).composite([{ input: logo, left: 110, top: 200 }]).png().toBuffer());
console.log("og image written");
