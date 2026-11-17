"use client";

import Link from "next/link";
import { useState } from "react";

/** Adapted from the Alzheimer's Association's "10 early signs and symptoms of Alzheimer's". */
export const SIGNS = [
  { t: "Memory loss that disrupts daily life", sign: "Forgetting recent events or important dates, asking the same question again and again, relying more and more on notes or family.", typical: "Sometimes forgetting a name or an appointment, then remembering it later." },
  { t: "Trouble planning or solving problems", sign: "Difficulty following a familiar recipe, keeping track of monthly bills or concentrating on numbers.", typical: "Making an occasional mistake when paying bills." },
  { t: "Difficulty with familiar tasks", sign: "Getting lost driving to a familiar place, or forgetting the rules of a favourite game.", typical: "Occasionally needing help with settings on a new device." },
  { t: "Confusion with time or place", sign: "Losing track of dates, seasons and the passage of time; forgetting where they are or how they got there.", typical: "Getting confused about the day of the week, then working it out." },
  { t: "Trouble with images and distances", sign: "Problems judging distance, telling colours apart or reading, which can affect balance and driving.", typical: "Vision changes from cataracts or other eye conditions." },
  { t: "New problems with words", sign: "Stopping mid-conversation with no idea how to go on, or calling things by the wrong name.", typical: "Sometimes struggling to find the right word." },
  { t: "Misplacing things", sign: "Putting things in unusual places and being unable to retrace steps; sometimes accusing others of stealing.", typical: "Misplacing glasses or keys now and then, and finding them by retracing steps." },
  { t: "Poor judgment", sign: "Unusual decisions with money, giving large amounts to telemarketers, paying less attention to grooming.", typical: "Making a bad decision once in a while." },
  { t: "Withdrawal from work or social life", sign: "Pulling away from hobbies, social activities or conversations they used to enjoy.", typical: "Sometimes not feeling like going to a family or social event." },
  { t: "Changes in mood and personality", sign: "Becoming confused, suspicious, depressed, fearful or anxious; easily upset in new places.", typical: "Becoming irritable when a familiar routine is disrupted." },
];

/**
 * Interactive checklist. Readers tick the changes they have noticed in themselves or someone
 * close to them; the result explains next steps. It never scores or diagnoses.
 */
export function WarningSigns() {
  const [checked, setChecked] = useState<boolean[]>(() => SIGNS.map(() => false));
  const [open, setOpen] = useState<number | null>(0);
  const count = checked.filter(Boolean).length;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      <ol className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
        {SIGNS.map((s, i) => {
          const isOpen = open === i;
          return (
            <li key={s.t}>
              <div className="flex items-start gap-4 px-5 py-4 sm:px-6">
                <label className="mt-0.5 flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={checked[i]}
                    onChange={() => setChecked((c) => c.map((v, k) => (k === i ? !v : v)))}
                    className="peer sr-only"
                    aria-label={`I have noticed: ${s.t}`}
                  />
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-lg border-2 border-line-2 bg-paper text-transparent transition-colors peer-checked:border-sage peer-checked:bg-sage peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-dawn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                </label>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="group flex min-w-0 flex-1 items-start justify-between gap-4 text-left">
                  <span>
                    <span className="mr-2 font-display text-[15px] font-semibold text-sage">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[17.5px] leading-snug font-semibold text-ink group-hover:text-dawn sm:text-[18.5px]">{s.t}</span>
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true" className={`mt-1.5 shrink-0 text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>
              {isOpen && (
                <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pl-[4.75rem]">
                  <p className="rounded-xl bg-alert-soft/70 p-4 text-[15px] leading-relaxed text-ink-2">
                    <span className="mb-1 block text-[11.5px] font-bold tracking-[0.12em] text-alert uppercase">Possible warning sign</span>
                    {s.sign}
                  </p>
                  <p className="rounded-xl bg-sage-soft p-4 text-[15px] leading-relaxed text-ink-2">
                    <span className="mb-1 block text-[11.5px] font-bold tracking-[0.12em] text-sage uppercase">Typical with age</span>
                    {s.typical}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <aside aria-live="polite" className="rounded-3xl bg-night p-7 text-mist sm:p-9 lg:sticky lg:top-40">
        <p className="text-[12.5px] font-bold tracking-[0.14em] text-ice uppercase">What you’ve noticed</p>
        <p className="mt-3 font-display text-[64px] leading-none font-semibold text-white">
          {count}
          <span className="ml-2 text-[22px] font-normal text-mist">of 10</span>
        </p>
        <div className="mt-5 flex gap-1" aria-hidden="true">
          {checked.map((c, i) => (
            <span key={i} className={`h-2 flex-1 rounded-full transition-colors ${c ? "bg-ice" : "bg-white/15"}`} />
          ))}
        </div>
        {count === 0 ? (
          <p className="mt-6 text-[16.5px] leading-relaxed">Tick any change you have noticed in yourself or someone close to you. Open each sign to compare it with the changes that are typical with age.</p>
        ) : (
          <div className="mt-6 space-y-3 text-[16.5px] leading-relaxed">
            <p className="text-white">
              {count === 1 ? "One change" : `${count} changes`} worth mentioning to a doctor, especially if {count === 1 ? "it is" : "they are"} new or getting worse.
            </p>
            <p>
              Memory problems have many causes, and some are treatable: thyroid problems, low vitamin B12, side effects of medicines, depression, poor sleep or an infection. An early check-up helps either way.
            </p>
          </div>
        )}
        <div className="mt-7 flex flex-col gap-2.5">
          <Link href="/cognition-and-cognitive-testing/" className="rounded-full bg-white px-5 py-3 text-center text-[15px] font-semibold text-night hover:bg-ice">
            How memory is tested
          </Link>
          <Link href="/dementia/" className="rounded-full border border-white/25 px-5 py-3 text-center text-[15px] font-semibold text-white hover:border-ice hover:text-ice">
            Normal aging or dementia?
          </Link>
        </div>
        <p className="mt-6 text-[12.5px] leading-relaxed text-mist/75">Adapted from the Alzheimer’s Association’s 10 warning signs. This list is not a test and cannot diagnose dementia. Nothing you tick is saved or sent.</p>
      </aside>
    </div>
  );
}

/** Compact promo card for sidebars and article ends. */
export function SignsPromo({ className = "" }: { className?: string }) {
  return (
    <Link href="/#signs" className={`group relative block overflow-hidden rounded-2xl bg-sage-soft p-5 ${className}`}>
      <span aria-hidden="true" className="absolute -right-6 -bottom-8 font-display text-[130px] leading-none font-semibold text-leaf/20">
        10
      </span>
      <span className="relative block text-[12px] font-bold tracking-[0.14em] text-sage uppercase">Checklist</span>
      <span className="relative mt-1.5 block font-display text-[21px] leading-snug font-semibold text-ink group-hover:text-dawn">Normal aging, or an early warning sign?</span>
      <span className="relative mt-2 block max-w-[24ch] text-[14.5px] leading-relaxed text-body">Compare 10 common changes side by side, in two minutes.</span>
      <span className="relative mt-4 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-dawn">Open the checklist →</span>
    </Link>
  );
}

/** Wide banner used at the end of internal pages. */
export function SignsBanner({ className = "" }: { className?: string }) {
  return (
    <section className={`container-site ${className}`}>
      <Link href="/#signs" className="group grid items-center gap-6 overflow-hidden rounded-3xl border border-line bg-white p-7 sm:p-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="kicker">Worried about memory changes?</p>
          <p className="display mt-2 text-[28px] leading-tight sm:text-[36px]">
            Normal aging, or an <span className="accent text-dawn">early warning sign?</span>
          </p>
          <p className="mt-3 max-w-[60ch] text-[16.5px] leading-relaxed text-body">Ten common changes, each set beside what is typical with age. Tick what you have noticed and see what to do next.</p>
        </div>
        <span className="inline-flex items-center gap-2 justify-self-start rounded-full bg-dawn px-6 py-3.5 text-[16px] font-semibold text-white transition-colors group-hover:bg-night md:justify-self-end">
          Open the 10-sign checklist <span aria-hidden="true">→</span>
        </span>
      </Link>
    </section>
  );
}
