import { Arrow, HELPLINE } from "./Header";

const URGENT = [
  "Confusion that comes on suddenly, over hours or days",
  "Face drooping, arm weakness or slurred speech",
  "A fall, a head injury or new severe pain",
  "Very drowsy or hard to wake",
];

const MISSING = [
  { n: "15 min", t: "Search close by first", d: "Check the house, garden, car and the places the person often walks to. Don’t spend longer than about 15 minutes." },
  { n: "911", t: "Then call for help", d: "Tell the operator the person has dementia and is a vulnerable adult. Police treat this as urgent." },
  { n: "Photo", t: "Have details ready", d: "A recent photo, what they were wearing, medical conditions and places they used to live or work." },
];

/** Sitewide band above the footer: when to get help now, and what to do if someone goes missing. */
export function HelpBand({ compact = false }: { compact?: boolean }) {
  return (
    <section id="help" aria-labelledby="help-title" className={`grid-lines relative scroll-mt-32 overflow-hidden bg-night text-mist ${compact ? "rounded-3xl" : ""}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/3 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(79,174,68,0.22),rgba(79,174,68,0.05)_55%,transparent)]" />
      <div className={`relative ${compact ? "p-7 sm:p-10" : "container-site py-20 md:py-24"}`}>
        <div className={`grid gap-12 ${compact ? "" : "lg:grid-cols-[1fr_1.2fr] lg:items-start"}`}>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[12.5px] font-bold tracking-[0.14em] text-ice uppercase">
              <span className="size-2 rounded-full bg-ice" />
              Getting help
            </p>
            <h2 id="help-title" className={`display mt-5 text-white ${compact ? "text-[30px]" : "text-[40px] md:text-[54px]"} leading-[1.04]`}>
              Sudden changes are <span className="accent text-ice">not just the dementia.</span>
            </h2>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed">
              Dementia usually changes slowly. A sharp change over hours or days can mean an infection, delirium, a stroke or a medication problem, and needs a doctor the same day.{" "}
              <strong className="text-white">Call 911 or your local emergency number</strong> if you see any of these:
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {URGENT.map((s) => (
                <li key={s} className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] leading-snug text-white">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="tel:911" className="group flex items-center gap-2 rounded-full bg-alert px-6 py-3.5 text-[16px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(192,57,43,0.8)] hover:bg-[#a33024]">
                Call 911 <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href={`tel:${HELPLINE.tel}`} className="group flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-[16px] font-semibold text-white hover:border-ice hover:text-ice">
                24/7 Helpline <span className="numeric">{HELPLINE.label}</span>
              </a>
            </div>
            <p className="mt-3 max-w-[56ch] text-[13.5px] leading-relaxed text-mist/80">
              The free Alzheimer’s Association Helpline answers questions about memory loss, diagnosis and caregiving, day and night, in more than 200 languages (US).
            </p>
          </div>
          <div>
            <p className="text-[13px] font-bold tracking-[0.14em] text-ice uppercase">If someone with dementia is missing</p>
            <ol className="mt-4 grid gap-3">
              {MISSING.map((r, i) => (
                <li key={r.t} className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                  <span className="flex w-20 shrink-0 flex-col justify-center border-r border-white/10 pr-4 font-display text-[24px] leading-none font-semibold text-ice">
                    <span className="mb-1.5 font-sans text-[10.5px] font-bold tracking-[0.18em] text-mist/70">STEP {i + 1}</span>
                    {r.n}
                  </span>
                  <span>
                    <span className="block text-[17px] font-semibold text-white">{r.t}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed">{r.d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[13.5px] leading-relaxed text-mist/80">
              Based on Alzheimer’s Association guidance on wandering. Outside the US, call your local emergency number.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
