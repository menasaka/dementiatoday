import Image from "next/image";
import logo from "../../public/brand/logo.png";

/**
 * Brand assets. The wordmark is the original Dementia Today logo (public/brand/logo.png, kept
 * unchanged from the WordPress site). The square mark is its cross-and-figure icon redrawn as a
 * vector (public/brand/mark.svg); scripts/make-icons.mjs renders the favicons from that file.
 */
export function Mark({ size = 36, className = "" }: { size?: number; className?: string; id?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG, no optimisation needed
  return <img src="/brand/mark.svg" width={size} height={size} alt="" aria-hidden="true" className={`shrink-0 ${className}`} />;
}

/** The original logo. On dark backgrounds it sits on a white tile, because its lettering is navy. */
export function Wordmark({ name = "Dementia Today", onDark = false, size = "md", priority = false }: { name?: string; onDark?: boolean; size?: "md" | "lg"; priority?: boolean }) {
  const w = size === "lg" ? 260 : 230;
  const img = <Image src={logo} alt={name} width={w} height={w / 5} priority={priority} className="block h-auto" style={{ width: w }} />;
  return onDark ? <span className="inline-block rounded-xl bg-white px-4 py-3">{img}</span> : img;
}
