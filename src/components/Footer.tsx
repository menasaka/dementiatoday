import Link from "next/link";
import type { SiteSettings } from "@/lib/content";
import { Wordmark } from "./Brand";

export function Footer({ settings }: { settings: SiteSettings }) {
  const groups = settings.nav.filter((n) => n.children?.length).slice(0, 3);
  return (
    <footer className="border-t border-white/10 bg-night-2 text-mist">
      <div className="container-site grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" aria-label={`${settings.siteName} home`} className="inline-block">
            <Wordmark name={settings.siteName} onDark size="lg" />
          </Link>
          <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed">{settings.about}</p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
            {settings.footerLinks.map((l) =>
              l.href ? (
                <li key={l.label}>
                  <Link href={l.href} className="text-white hover:text-ice">
                    {l.label}
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-glow uppercase">{g.label}</p>
              <ul className="flex flex-col gap-2.5 text-[14px]">
                {g.children!.map((c) =>
                  c.href ? (
                    <li key={c.label}>
                      <Link href={c.href} className="hover:text-paper">
                        {c.label}
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-4 py-7 text-[13px] text-mist/70 md:flex-row md:items-start md:justify-between">
          <p className="max-w-[90ch] leading-relaxed">{settings.disclaimer}</p>
          <div className="shrink-0 space-y-1.5 md:text-right">
            <p>
              Project supported by{" "}
              <a href="https://www.health.am/" target="_blank" rel="noopener" className="text-white underline decoration-white/30 underline-offset-2 hover:text-ice">
                Armenian Medical Network
              </a>
            </p>
            <p>© {settings.siteName}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
