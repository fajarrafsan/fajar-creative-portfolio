"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  cvDocument,
  cvFile,
  cvPhone,
  cvPhoneTel,
  cvPreviewCta,
  email,
  githubUrl,
  linkedInUrl,
} from "./content";
import { ease } from "./motion";
import { useT } from "./i18n";

const OPEN_EVENT = "portfolio-cv-open";

export function openCvPreview() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

function lockPageScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  window.dispatchEvent(new CustomEvent("portfolio-scroll-lock", { detail: locked }));
}

function IconCode({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 8 5 12l4 4M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 7V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8V7M4 9.5h16v9.2H4zM4 13.2h16" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="miter" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 4v10M8 10l4 4 4-4M5 18h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

function SectionHead({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <p className="mb-4 flex items-center gap-2.5 text-[11px] tracking-[0.14em] text-acid uppercase">
      <span className="grid size-7 place-items-center border border-acid/40 text-acid">{icon}</span>
      {label}
    </p>
  );
}

export function CvPreview() {
  const t = useT();
  const reduced = Boolean(useReducedMotion());
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const close = () => {
    setOpen(false);
    if (window.location.hash === "#cv") {
      const url = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", url);
    }
  };

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onHash = () => {
      if (window.location.hash === "#cv") setOpen(true);
    };
    onHash();
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    lockPageScroll(open);
    if (open) {
      lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      closeRef.current?.focus();
    } else {
      lastFocus.current?.focus();
    }
    return () => lockPageScroll(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cv-overlay fixed inset-0 z-[110] overflow-y-auto overscroll-contain bg-ink/80 backdrop-blur-md touch-pan-y"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease }}
          onClick={close}
          data-lenis-prevent
        >
          <div className="flex min-h-full items-start justify-center p-[max(10px,env(safe-area-inset-top))_max(12px,env(safe-area-inset-right))_max(12px,env(safe-area-inset-bottom))_max(12px,env(safe-area-inset-left))]">
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative my-auto w-full max-w-[1080px] border border-paper/15 bg-[#0a0b0a] text-paper shadow-[0_40px_80px_rgba(0,0,0,0.45)]"
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex min-h-14 items-center justify-between gap-2 border-b border-paper/12 px-4 max-[680px]:px-3 max-[420px]:px-2">
              <p className="m-0 flex min-w-0 items-center gap-2.5 text-[10px] tracking-[0.12em] uppercase">
                <span className="size-2 shrink-0 rounded-full bg-acid" aria-hidden="true" />
                <span className="truncate">{cvFile.filename}</span>
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  className="inline-flex min-h-11 items-center gap-2 border border-paper/20 px-3 text-[10px] tracking-[0.12em] uppercase transition-colors duration-200 hover:border-acid hover:bg-acid hover:text-ink max-[420px]:px-2.5"
                  href={cvFile.href}
                  download={cvFile.download}
                  aria-label={t(cvPreviewCta.label)}
                >
                  <IconDownload className="size-4" />
                  {t(cvPreviewCta.header)}
                </a>
                <button
                  ref={closeRef}
                  type="button"
                  className="grid size-11 place-items-center border border-paper/20 text-[18px] transition-colors duration-200 hover:border-acid hover:text-acid"
                  aria-label={t(cvPreviewCta.closeAria)}
                  onClick={close}
                >
                  ×
                </button>
              </div>
            </header>

            <div className="px-[clamp(16px,4vw,42px)] py-[clamp(20px,3.5vw,40px)]">
              <div className="mb-8 grid grid-cols-[minmax(0,1.4fr)_minmax(180px,0.7fr)] items-start gap-6 max-[720px]:grid-cols-1">
                <div>
                  <h2 id={titleId} className="font-display m-0 text-[clamp(28px,8vw,52px)] leading-[0.92] font-[650] tracking-[-0.06em] max-[420px]:text-[clamp(26px,8.2vw,32px)]">
                    {cvDocument.name}
                  </h2>
                  <p className="mt-2 mb-4 text-[15px] tracking-[0.02em] text-acid">{t(cvDocument.role)}</p>
                  <p className="m-0 max-w-[62ch] text-[15px] leading-[1.55] text-[#c4c6bc]">{t(cvDocument.summary)}</p>
                </div>
                <address className="m-0 text-right text-[12px] leading-[1.7] text-[#9ea090] not-italic max-[720px]:text-left">
                  <a className="text-paper no-underline hover:text-acid" href={`mailto:${email}`}>
                    {email}
                  </a>
                  <br />
                  <a className="text-paper no-underline hover:text-acid" href={`tel:${cvPhoneTel}`}>
                    {cvPhone}
                  </a>
                  <br />
                  {cvDocument.location} (UTC+7)
                  <br />
                  <a className="text-paper no-underline hover:text-acid" href={githubUrl} target="_blank" rel="noreferrer">
                    {githubUrl.replace(/^https?:\/\//, "")}
                  </a>
                  <br />
                  <a className="text-paper no-underline hover:text-acid" href={linkedInUrl} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </address>
              </div>

              <SectionHead icon={<IconCode className="size-3.5" />} label={t(cvPreviewCta.skills)} />
              <div className="mb-9 grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
                {cvDocument.skills.map((group) => (
                  <article key={t(group.title)} className="border border-paper/12 bg-surface p-5">
                    <h3 className="mt-0 mb-3 text-[13px] font-[560] tracking-[-0.02em]">{t(group.title)}</h3>
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-[1.45] text-[#b4b6ac]">
                      {group.items.map((item) => (
                        <li key={t(item)} className="flex gap-2">
                          <span className="mt-[0.45em] size-1 shrink-0 bg-acid" aria-hidden="true" />
                          {t(item)}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <SectionHead icon={<IconBriefcase className="size-3.5" />} label={t(cvPreviewCta.jobs)} />
              {cvDocument.jobs.map((job) => (
                <article key={`${job.role.en}-${job.period.en}`} className="mb-8">
                  <div className="mb-2 flex items-baseline justify-between gap-4 max-[720px]:flex-col max-[720px]:gap-1">
                    <h3 className="m-0 text-[16px] leading-snug font-[560] tracking-[-0.02em]">
                      {t(job.role)} — {job.place}
                    </h3>
                    <p className="m-0 shrink-0 text-[11px] tracking-[0.08em] text-acid uppercase">{t(job.period)}</p>
                  </div>
                  <p className="mt-0 mb-3 text-[14px] leading-[1.5] text-[#c4c6bc]">{t(job.summary)}</p>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px] leading-[1.5] text-[#b4b6ac]">
                    {job.bullets.map((bullet) => (
                      <li key={bullet.en} className="flex gap-2.5">
                        <span className="mt-[0.55em] size-1.5 shrink-0 bg-acid" aria-hidden="true" />
                        {t(bullet)}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}

              <p className="mb-3 text-[11px] tracking-[0.14em] text-acid uppercase">{t(cvPreviewCta.education)}</p>
              <article className="mb-8">
                <div className="mb-2 flex items-baseline justify-between gap-4 max-[720px]:flex-col max-[720px]:gap-1">
                  <h3 className="m-0 text-[16px] leading-snug font-[560] tracking-[-0.02em]">
                    {t(cvDocument.education.program)} — {cvDocument.education.place}
                  </h3>
                  <p className="m-0 shrink-0 text-[11px] tracking-[0.08em] text-acid uppercase">{t(cvDocument.education.period)}</p>
                </div>
                <p className="mt-0 mb-2 text-[14px] leading-[1.5] text-[#c4c6bc]">{t(cvDocument.education.detail)}</p>
                <p className="m-0 text-[13px] leading-[1.5] text-[#9ea090]">{t(cvDocument.education.note)}</p>
              </article>

              <p className="mb-3 text-[11px] tracking-[0.14em] text-acid uppercase">{t(cvPreviewCta.achievements)}</p>
              <ul className="mb-8 flex list-none flex-col gap-2 p-0 text-[14px] leading-[1.5] text-[#b4b6ac]">
                {cvDocument.achievements.map((item) => (
                  <li key={item.en} className="flex gap-2.5">
                    <span className="mt-[0.55em] size-1.5 shrink-0 bg-acid" aria-hidden="true" />
                    {t(item)}
                  </li>
                ))}
              </ul>

              <p className="mb-3 text-[11px] tracking-[0.14em] text-acid uppercase">{t(cvPreviewCta.projects)}</p>
              <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 max-[900px]:grid-cols-1">
                {cvDocument.projects.map((project) => (
                  <li key={project.title} className="border border-paper/12 p-4">
                    <p className="m-0 flex items-baseline justify-between gap-3 text-[13px] font-[560]">
                      {project.title}
                      <span className="font-mono text-[10px] tracking-[0.08em] text-acid">{project.year}</span>
                    </p>
                    <p className="mt-1 mb-2 text-[10px] tracking-[0.08em] text-[#8d8f85] uppercase">{project.stack}</p>
                    <p className="m-0 text-[13px] leading-[1.45] text-[#b4b6ac]">{t(project.detail)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-paper/12 px-4 py-3 max-[680px]:flex-col max-[680px]:items-stretch">
              <p className="m-0 max-w-[48ch] text-[13px] leading-[1.45] text-[#9ea090] max-[680px]:text-center">
                {t(cvPreviewCta.support)}
              </p>
              <div className="flex shrink-0 items-center gap-2 max-[680px]:flex-col max-[680px]:items-stretch">
                <a
                  className="inline-flex min-h-11 items-center justify-center gap-2 bg-acid px-5 text-[11px] tracking-[0.12em] text-ink uppercase transition-colors duration-200 hover:bg-paper"
                  href={cvFile.href}
                  download={cvFile.download}
                  aria-label={t(cvPreviewCta.label)}
                >
                  <IconDownload className="size-4" />
                  {t(cvPreviewCta.label)}
                </a>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center border border-paper/20 px-5 text-[11px] tracking-[0.12em] uppercase transition-colors duration-200 hover:border-acid hover:text-acid"
                  onClick={close}
                >
                  {t(cvPreviewCta.close)}
                </button>
              </div>
            </footer>
          </motion.section>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
