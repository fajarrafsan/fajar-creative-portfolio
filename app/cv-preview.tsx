"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  cvDocument,
  cvFile,
  cvPhone,
  email,
  githubUrl,
  linkedInUrl,
  profileLocation,
} from "./content";
import { ease } from "./motion";

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

function IconPrint({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 9V4h10v5M7 17H5.5A1.5 1.5 0 0 1 4 15.5v-5A1.5 1.5 0 0 1 5.5 9h13A1.5 1.5 0 0 1 20 10.5v5a1.5 1.5 0 0 1-1.5 1.5H17M7 14h10v6H7z" stroke="currentColor" strokeWidth="1.8" />
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
                  data-cursor
                >
                  <IconPrint className="size-4" />
                  <span className="max-[420px]:hidden">Cetak / </span>PDF
                </a>
                <button
                  ref={closeRef}
                  type="button"
                  className="grid size-11 place-items-center border border-paper/20 text-[18px] transition-colors duration-200 hover:border-acid hover:text-acid"
                  aria-label="Tutup pratinjau CV"
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
                  <p className="mt-2 mb-4 text-[15px] tracking-[0.02em] text-acid">{cvDocument.role}</p>
                  <p className="m-0 max-w-[62ch] text-[15px] leading-[1.55] text-[#c4c6bc]">{cvDocument.summary}</p>
                </div>
                <address className="m-0 text-right text-[12px] leading-[1.7] text-[#9ea090] not-italic max-[720px]:text-left">
                  <a className="text-paper no-underline hover:text-acid" href={`mailto:${email}`}>
                    {email}
                  </a>
                  <br />
                  <a className="text-paper no-underline hover:text-acid" href={`tel:${cvPhone.replace(/\s/g, "")}`}>
                    {cvPhone}
                  </a>
                  <br />
                  {profileLocation} (UTC+7)
                  <br />
                  <a className="text-paper no-underline hover:text-acid" href={githubUrl} target="_blank" rel="noreferrer">
                    github.com/fajarrafsan02-bit
                  </a>
                  <br />
                  <a className="text-paper no-underline hover:text-acid" href={linkedInUrl} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </address>
              </div>

              <SectionHead icon={<IconCode className="size-3.5" />} label="Keahlian & penguasaan teknologi" />
              <div className="mb-9 grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
                {cvDocument.skills.map((group) => (
                  <article key={group.title} className="border border-paper/12 bg-surface p-5">
                    <h3 className="mt-0 mb-3 text-[13px] font-[560] tracking-[-0.02em]">{group.title}</h3>
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-[1.45] text-[#b4b6ac]">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-[0.45em] size-1 shrink-0 bg-acid" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <SectionHead icon={<IconBriefcase className="size-3.5" />} label="Pengalaman kerja" />
              {cvDocument.jobs.map((job) => (
                <article key={job.role} className="mb-8">
                  <div className="mb-2 flex items-baseline justify-between gap-4 max-[720px]:flex-col max-[720px]:gap-1">
                    <h3 className="m-0 text-[16px] leading-snug font-[560] tracking-[-0.02em]">
                      {job.role} — {job.place}
                    </h3>
                    <p className="m-0 shrink-0 text-[11px] tracking-[0.08em] text-acid uppercase">{job.period}</p>
                  </div>
                  <p className="mt-0 mb-3 text-[14px] leading-[1.5] text-[#c4c6bc]">{job.summary}</p>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px] leading-[1.5] text-[#b4b6ac]">
                    {job.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2.5">
                        <span className="mt-[0.55em] size-1.5 shrink-0 bg-acid" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}

              <p className="mb-8 text-[13px] leading-[1.5] text-[#9ea090]">
                <strong className="font-[560] text-paper">{cvDocument.education.place}</strong>
                {" · "}
                {cvDocument.education.detail}
                {" · "}
                {cvDocument.education.period}
              </p>

              <p className="mb-3 text-[11px] tracking-[0.14em] text-acid uppercase">Proyek pilihan</p>
              <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 max-[900px]:grid-cols-1">
                {cvDocument.projects.map((project) => (
                  <li key={project.title} className="border border-paper/12 p-4">
                    <p className="m-0 flex items-baseline justify-between gap-3 text-[13px] font-[560]">
                      {project.title}
                      <span className="font-mono text-[10px] tracking-[0.08em] text-acid">{project.year}</span>
                    </p>
                    <p className="mt-1 mb-2 text-[10px] tracking-[0.08em] text-[#8d8f85] uppercase">{project.stack}</p>
                    <p className="m-0 text-[13px] leading-[1.45] text-[#b4b6ac]">{project.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="flex min-h-16 items-center justify-between gap-3 border-t border-paper/12 px-4 max-[680px]:flex-col max-[680px]:items-stretch max-[680px]:py-3">
              <p className="m-0 text-[10px] tracking-[0.12em] text-[#8d8f85] uppercase max-[680px]:text-center">
                Open for fullstack opportunities
              </p>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center bg-acid px-5 text-[11px] tracking-[0.12em] text-ink uppercase transition-colors duration-200 hover:bg-paper"
                onClick={close}
              >
                Tutup Preview
              </button>
            </footer>
          </motion.section>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
