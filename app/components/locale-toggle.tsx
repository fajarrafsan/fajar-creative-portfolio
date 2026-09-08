"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, type Locale } from "@/app/lib/i18n";
import { ease } from "@/app/lib/motion";

const OPTIONS: { code: Locale; label: string; full: string }[] = [
  { code: "id", label: "ID", full: "Bahasa Indonesia" },
  { code: "en", label: "EN", full: "English" },
];

/**
 * Two-state language switch.
 *
 * Both codes stay visible rather than one toggling button: with only two
 * languages, showing the alternative is what makes the control legible at a
 * glance — a lone "EN" is ambiguous about whether it is the current state or
 * the action. The acid pill slides between them with a shared layoutId, the
 * same device the header's nav underline already uses.
 */
export function LocaleToggle({ className, layoutId = "locale-pill" }: { className?: string; layoutId?: string }) {
  const { locale, setLocale } = useLocale();
  const reduced = Boolean(useReducedMotion());

  return (
    <div
      className={`box-content flex h-11 shrink-0 items-stretch border border-paper/25 ${className ?? ""}`}
      role="group"
      aria-label="Language / Bahasa"
    >
      {OPTIONS.map((option) => {
        const active = locale === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLocale(option.code)}
            aria-pressed={active}
            // The visible label is a two-letter code, so the accessible name
            // spells the language out instead of leaving "ID" to be guessed.
            aria-label={option.full}
            data-cursor
            className={`group/locale relative grid h-full min-w-11 w-11 place-items-center overflow-hidden text-[11px] font-semibold tracking-[0.1em] transition-[color,background-color,transform] duration-200 focus-visible:-outline-offset-4 active:translate-y-px ${
              active ? "text-ink" : "text-paper/60 hover:bg-paper/[0.06] hover:text-paper focus-visible:bg-paper/[0.06] focus-visible:text-paper"
            }`}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 bg-acid"
                transition={reduced ? { duration: 0 } : { duration: 0.28, ease }}
              />
            ) : null}
            {!active ? (
              <span className="absolute inset-x-1 bottom-0 h-px origin-left scale-x-0 bg-acid transition-transform duration-300 group-hover/locale:scale-x-100 group-focus-visible/locale:scale-x-100" aria-hidden="true" />
            ) : null}
            <span className="relative z-[1]">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
