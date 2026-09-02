"use client";

import { motion } from "motion/react";
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
export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

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
            className={`relative grid h-full min-w-11 w-11 place-items-center text-[10px] font-semibold tracking-[0.1em] transition-colors duration-200 ${
              active ? "text-ink" : "text-paper/60 hover:text-paper"
            }`}
          >
            {active ? (
              <motion.span
                layoutId="locale-pill"
                className="absolute inset-0 bg-acid"
                transition={{ duration: 0.28, ease }}
              />
            ) : null}
            <span className="relative z-[1]">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
