"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  cvPreviewCta,
  cvProfiles,
  type CvLanguage,
  type CvRole,
} from "@/app/content";
import { ease } from "@/app/lib/motion";
import { useLocale } from "@/app/lib/i18n";

const OPEN_EVENT = "portfolio-cv-open";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type CvOpenOptions = {
  role?: CvRole;
  language?: CvLanguage;
};

export function openCvPreview(options: CvOpenOptions = {}) {
  window.dispatchEvent(new CustomEvent<CvOpenOptions>(OPEN_EVENT, { detail: options }));
}

function lockPageScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  window.dispatchEvent(new CustomEvent("portfolio-scroll-lock", { detail: locked }));
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 4v10M8 10l4 4 4-4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

function IconArrowOut({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 16 17 7M10 7h7v7M17 17H7V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="m3 8.5 3 3L13 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

export function CvPreview() {
  const { locale, t } = useLocale();
  const reduced = Boolean(useReducedMotion());
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<CvRole>("fullstack");
  const [language, setLanguage] = useState<CvLanguage>("id");
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const roleLegendId = useId();
  const languageLegendId = useId();
  const statusId = useId();

  const activeProfile = cvProfiles.find((profile) => profile.id === role) ?? cvProfiles[0];
  const activeFile = activeProfile.files[language];
  const languageLabel = language === "id" ? t(cvPreviewCta.languageId) : t(cvPreviewCta.languageEn);
  const selectionLabel = `${t(activeProfile.label)} · ${languageLabel}`;

  const close = useCallback(() => {
    setOpen(false);
    if (window.location.hash === "#cv") {
      const url = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", url);
    }
  }, []);

  useEffect(() => {
    const show = (options: CvOpenOptions = {}) => {
      setRole(options.role ?? "fullstack");
      setLanguage(options.language ?? locale);
      setOpen(true);
    };
    const onOpen = (event: Event) => show((event as CustomEvent<CvOpenOptions>).detail ?? {});
    const onHash = () => {
      if (window.location.hash === "#cv") show();
    };
    onHash();
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("hashchange", onHash);
    };
  }, [locale]);

  useEffect(() => {
    lockPageScroll(open);
    const overlay = overlayRef.current;
    const shell = overlay?.parentElement;
    const inerted = shell
      ? Array.from(shell.children).filter(
          (element): element is HTMLElement => element instanceof HTMLElement && element !== overlay && !element.hasAttribute("inert"),
        )
      : [];

    if (open) {
      lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      inerted.forEach((element) => element.setAttribute("inert", ""));
      const frame = requestAnimationFrame(() => titleRef.current?.focus());
      return () => {
        cancelAnimationFrame(frame);
        inerted.forEach((element) => element.removeAttribute("inert"));
        lockPageScroll(false);
      };
    }

    lastFocus.current?.focus();
    return () => lockPageScroll(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (element) => element.tabIndex >= 0,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1) ?? first;
      const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!activeElement || !focusable.includes(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.querySelectorAll<HTMLElement>("[data-cv-scroll]").forEach((element) => {
      element.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }, [language, open, reduced, role]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          className="cv-overlay fixed inset-0 z-[110] flex overflow-hidden overscroll-contain bg-ink/88 touch-pan-y md:p-[max(12px,env(safe-area-inset-top))_max(16px,env(safe-area-inset-right))_max(12px,env(safe-area-inset-bottom))_max(16px,env(safe-area-inset-left))]"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.22, ease }}
          onClick={close}
          data-lenis-prevent
        >
          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="relative m-auto grid h-dvh w-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[#080a09] text-paper shadow-[0_40px_100px_rgba(0,0,0,0.52)] md:h-[min(90dvh,900px)] md:max-w-[1180px] md:border md:border-paper/18"
            initial={reduced ? false : { opacity: 0, y: 18, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.995 }}
            transition={{ duration: reduced ? 0 : 0.3, ease }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex min-h-[68px] items-center justify-between gap-4 border-b border-paper/14 bg-[#080a09] px-[max(16px,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)] pr-[max(12px,env(safe-area-inset-right))] md:min-h-16 md:px-5 md:pt-0">
              <div className="min-w-0">
                <p className="m-0 flex items-center gap-2 font-mono text-[11px] tracking-[0.13em] text-acid uppercase">
                  <span className="size-1.5 shrink-0 bg-acid" aria-hidden="true" />
                  {t(cvPreviewCta.eyebrow)}
                </p>
                <p className="mt-1 mb-0 max-w-[68vw] truncate text-[12px] text-paper/48 md:max-w-[60vw]">
                  {activeFile.filename}
                </p>
              </div>
              <button
                type="button"
                className="grid size-11 shrink-0 touch-manipulation place-items-center border border-paper/24 text-paper transition-colors duration-200 hover:border-acid hover:bg-acid hover:text-ink focus-visible:border-acid focus-visible:text-acid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid active:bg-acid active:text-ink"
                aria-label={t(cvPreviewCta.closeAria)}
                onClick={close}
                data-cursor
              >
                <IconClose className="size-4.5" />
              </button>
            </header>

            <div data-cv-scroll className="min-h-0 overflow-y-auto overscroll-contain lg:grid lg:grid-cols-[minmax(285px,0.36fr)_minmax(0,1fr)] lg:overflow-hidden">
              <aside className="border-b border-paper/14 px-4 py-5 sm:px-5 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-6 lg:py-7 max-[360px]:px-3 max-[360px]:py-4" data-cv-scroll>
                <h2
                  ref={titleRef}
                  id={titleId}
                  tabIndex={-1}
                  className="font-display m-0 max-w-[12ch] text-[clamp(30px,8.5vw,48px)] leading-[0.9] font-[680] tracking-[-0.065em] outline-none lg:text-[44px] max-[360px]:text-[28px]"
                >
                  {t(cvPreviewCta.title)}
                </h2>
                <p id={descriptionId} className="mt-4 mb-6 max-w-[52ch] text-base leading-[1.55] text-[#b9bbb1] max-[360px]:mt-3 max-[360px]:mb-5 max-[360px]:text-[15px]">
                  {t(cvPreviewCta.description)}
                </p>

                <fieldset className="m-0 min-w-0 border-0 p-0" aria-labelledby={roleLegendId}>
                  <legend id={roleLegendId} className="mb-2.5 block w-full font-mono text-[12px] tracking-[0.12em] text-paper/62 uppercase">
                    01 / {t(cvPreviewCta.roleLegend)}
                  </legend>
                  <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                    {cvProfiles.map((profile) => {
                      const selected = profile.id === role;
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          aria-pressed={selected}
                          aria-label={`${t(cvPreviewCta.roleLegend)}: ${t(profile.label)}. ${profile.focus}`}
                          className={`group/role relative min-h-[88px] min-w-0 touch-manipulation border px-2.5 py-3 text-left transition-[background-color,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid active:bg-acid active:text-ink lg:min-h-[82px] lg:px-3.5 max-[360px]:min-h-[72px] max-[360px]:px-2 max-[360px]:py-2.5 ${
                            selected
                              ? "border-acid bg-acid text-ink"
                              : "border-paper/18 bg-surface text-paper hover:border-paper/45 hover:bg-paper/6"
                          }`}
                          onClick={() => setRole(profile.id)}
                          data-cursor
                        >
                          <span className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.1em] uppercase opacity-65">
                            {profile.index}
                            {selected ? <IconCheck className="size-3.5" /> : <span aria-hidden="true">—</span>}
                          </span>
                          <strong className="font-display mt-2 block truncate text-[14px] leading-none font-[680] tracking-[-0.035em] sm:text-[15px] lg:text-[18px]">
                            {t(profile.label)}
                          </strong>
                          <span className="mt-2 hidden truncate font-mono text-[10px] tracking-[0.04em] opacity-65 lg:block">
                            {profile.focus}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset className="mt-5 min-w-0 border-0 p-0" aria-labelledby={languageLegendId}>
                  <legend id={languageLegendId} className="mb-2.5 block w-full font-mono text-[12px] tracking-[0.12em] text-paper/62 uppercase">
                    02 / {t(cvPreviewCta.languageLegend)}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(["id", "en"] as const).map((item) => {
                      const selected = item === language;
                      const label = item === "id" ? t(cvPreviewCta.languageId) : t(cvPreviewCta.languageEn);
                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={selected}
                          className={`flex min-h-12 touch-manipulation items-center justify-between gap-3 border px-3.5 text-[14px] font-semibold tracking-[0.09em] uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid active:bg-acid active:text-ink ${
                            selected
                              ? "border-acid bg-acid text-ink"
                              : "border-paper/18 bg-surface text-paper hover:border-paper/45"
                          }`}
                          onClick={() => setLanguage(item)}
                          data-cursor
                        >
                          <span>{item.toUpperCase()}</span>
                          <span className="text-[10px] font-medium opacity-60 max-[380px]:hidden">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-5 border border-paper/14 bg-surface p-4 max-[360px]:p-3.5">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase">
                    <span className="border border-acid/35 px-2 py-1 text-acid">{t(cvPreviewCta.fileReady)}</span>
                    {activeProfile.recommended ? (
                      <span className="border border-paper/18 px-2 py-1 text-paper/60">{t(cvPreviewCta.recommended)}</span>
                    ) : null}
                  </div>
                  <p className="mt-3 mb-2 font-display text-[21px] leading-none font-[650] tracking-[-0.04em]">{selectionLabel}</p>
                  <p className="m-0 text-base leading-[1.5] text-[#b9bbb1] max-[360px]:text-[15px]">{t(activeProfile.summary)}</p>
                  <p className="mt-3 mb-0 font-mono text-[11px] leading-[1.45] tracking-[0.04em] text-paper/48 [overflow-wrap:anywhere]">
                    PDF · {String(activeFile.pages).padStart(2, "0")} {t(cvPreviewCta.pages)} · {activeFile.size}
                  </p>
                </div>
              </aside>

              <section className="min-h-0 bg-[#101310] lg:overflow-y-auto" data-cv-scroll aria-labelledby={statusId}>
                <div className="sticky top-0 z-10 flex min-h-11 items-center justify-between gap-3 border-b border-paper/12 bg-[#101310]/96 px-4 font-mono text-[10px] tracking-[0.11em] uppercase backdrop-blur-sm sm:px-5">
                  <span id={statusId} className="text-paper/55">03 / {t(cvPreviewCta.preview)}</span>
                  <span className="text-acid">01 / {String(activeFile.pages).padStart(2, "0")}</span>
                </div>
                <div className="relative px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                  <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(240,239,232,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(240,239,232,0.05)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden="true" />
                  <a
                    className="group/preview relative mx-auto block w-full max-w-[680px] touch-manipulation border border-paper/18 bg-[#d8d7d0] p-2 shadow-[10px_10px_0_rgba(216,255,62,0.12)] transition-[border-color,box-shadow] duration-200 hover:border-acid hover:shadow-[14px_14px_0_rgba(216,255,62,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid active:border-acid sm:p-3"
                    href={activeFile.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t(cvPreviewCta.openPdf)}: ${selectionLabel}, ${t(cvPreviewCta.opensNewTab)}`}
                    data-cursor
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.img
                        key={`${role}-${language}`}
                        src={activeFile.preview}
                        width={935}
                        height={1324}
                        alt={`${t(cvPreviewCta.preview)} — ${selectionLabel}`}
                        className="block h-auto w-full bg-white"
                        initial={reduced ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: reduced ? 0 : 0.22, ease }}
                        draggable={false}
                      />
                    </AnimatePresence>
                    <span className="absolute right-4 bottom-4 flex min-h-11 items-center gap-2 border border-paper/24 bg-ink/92 px-3 text-[11px] tracking-[0.1em] text-acid uppercase opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100 max-[680px]:hidden">
                      {t(cvPreviewCta.previewHint)} <IconArrowOut className="size-3.5" />
                    </span>
                  </a>
                </div>
              </section>
            </div>

            <footer className="grid gap-3 border-t border-paper/14 bg-[#080a09] px-[max(16px,env(safe-area-inset-left))] pt-3 pr-[max(16px,env(safe-area-inset-right))] pb-[max(12px,env(safe-area-inset-bottom))] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center md:px-5 md:py-3">
              <div className="min-w-0" role="status" aria-live="polite">
                <p className="m-0 font-mono text-[10px] tracking-[0.11em] text-acid uppercase">{t(cvPreviewCta.selected)}</p>
                <p className="mt-1 mb-0 truncate text-[13px] text-paper/70">{selectionLabel}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  className="inline-flex min-h-12 touch-manipulation items-center justify-center gap-2.5 border border-paper/24 px-4 text-[13px] font-semibold tracking-[0.1em] uppercase transition-colors duration-200 hover:border-acid hover:text-acid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid active:bg-paper/8 max-[360px]:gap-1.5 max-[360px]:px-2 max-[360px]:text-[11px]"
                  href={activeFile.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${t(cvPreviewCta.openPdf)}: ${selectionLabel}, ${t(cvPreviewCta.opensNewTab)}`}
                  data-cursor
                >
                  {t(cvPreviewCta.openPdf)} <IconArrowOut className="size-3.5" />
                </a>
                <a
                  className="inline-flex min-h-12 touch-manipulation items-center justify-center gap-2.5 border border-acid bg-acid px-4 text-[13px] font-semibold tracking-[0.1em] text-ink uppercase transition-colors duration-200 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid active:bg-paper max-[360px]:gap-1.5 max-[360px]:px-2 max-[360px]:text-[11px]"
                  href={activeFile.href}
                  download={activeFile.download}
                  aria-label={`${t(cvPreviewCta.downloadPdf)}: ${selectionLabel}`}
                  data-cursor
                >
                  <IconDownload className="size-4" /> {t(cvPreviewCta.downloadPdf)}
                </a>
              </div>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
