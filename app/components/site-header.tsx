"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { copy, githubUrl, linkedInUrl } from "@/app/content";
import { Magnetic, ease } from "@/app/lib/motion";
import { SocialIcon } from "./tech-icons";
import { openCvPreview } from "@/app/sections/cv-preview";
import { useIntroReady } from "@/app/sections/intro";
import { LocaleToggle } from "./locale-toggle";
import { dual, useT } from "@/app/lib/i18n";

const links = [
  { href: "#profile", id: "profile", label: dual("Profil", "Profile"), index: "01" },
  { href: "#work", id: "work", label: dual("Proyek", "Projects"), index: "02" },
  { href: "#stack", id: "tech", label: dual("Stack", "Stack"), index: "03" },
  { href: "#certificates", id: "certificates", label: dual("Sertifikat", "Certificates"), index: "04" },
  { href: "#contact", id: "contact", label: dual("Kontak", "Contact"), index: "05" },
] as const;

/** Page sections in document order, mapped onto the four header tabs. */
const spyMap: { id: string; tab: string | null }[] = [
  { id: "top", tab: null },
  { id: "profile", tab: "profile" },
  { id: "architecture", tab: "work" },
  { id: "frontend", tab: "work" },
  { id: "work", tab: "work" },
  { id: "stack", tab: "tech" },
  { id: "tech", tab: "tech" },
  { id: "experience", tab: "tech" },
  { id: "certificates", tab: "certificates" },
  { id: "contact", tab: "contact" },
];

function lockPageScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  window.dispatchEvent(new CustomEvent("portfolio-scroll-lock", { detail: locked }));
}

function BandungClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
    // First tick is deferred a frame so the effect body stays free of
    // synchronous setState; SSR keeps rendering the `--:--` placeholder.
    const frame = requestAnimationFrame(() => setTime(format()));
    const timer = window.setInterval(() => setTime(format()), 30_000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  if (!time) {
    return <span className="font-mono tabular-nums text-paper/50">--:-- WIB</span>;
  }

  return <span className="font-mono tabular-nums">{time} WIB</span>;
}

export function SiteHeader() {
  const reduced = Boolean(useReducedMotion());
  const introReady = useIntroReady();
  const t = useT();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const menuId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const spyRef = useRef<{ el: HTMLElement; tab: string | null }[]>([]);

  const syncActive = () => {
    const marker = 120;
    let next: string | null = null;
    for (const item of spyRef.current) {
      if (item.el.getBoundingClientRect().top <= marker) next = item.tab;
    }
    setActive((prev) => (prev === next ? prev : next));
  };

  useMotionValueEvent(scrollY, "change", (value) => {
    const next = value > 28;
    setScrolled((prev) => (prev === next ? prev : next));
    syncActive();
  });

  useEffect(() => {
    spyRef.current = spyMap.flatMap(({ id, tab }) => {
      const el = document.getElementById(id);
      return el ? [{ el, tab }] : [];
    });
    syncActive();
    window.addEventListener("resize", syncActive);
    window.addEventListener("hashchange", syncActive);
    return () => {
      window.removeEventListener("resize", syncActive);
      window.removeEventListener("hashchange", syncActive);
    };
  }, []);

  useEffect(() => {
    lockPageScroll(open);
    if (open) closeRef.current?.focus();
    return () => lockPageScroll(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.header
        initial={reduced ? false : { y: -28, opacity: 0 }}
        animate={reduced || introReady ? { y: 0, opacity: 1 } : { y: -28, opacity: 0 }}
        transition={{ duration: 0.7, ease, delay: introReady ? 0.08 : 0 }}
        className="site-nav pointer-events-none fixed inset-x-0 top-0 z-[80] px-[3vw] pt-[max(10px,env(safe-area-inset-top))] max-[680px]:px-[18px] max-[420px]:px-3 max-[360px]:px-2.5"
      >
        <div
          className={`pointer-events-auto relative flex h-16 items-center justify-between gap-4 overflow-hidden border px-3 text-[11px] tracking-[0.1em] uppercase backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 max-[680px]:h-14 max-[420px]:gap-2 max-[420px]:px-2 max-[360px]:h-13 max-[360px]:gap-1 max-[360px]:px-1.5 ${
            scrolled
              ? "border-paper/20 bg-ink/90 shadow-[0_18px_50px_rgba(0,0,0,0.38)]"
              : "border-paper/15 bg-ink/62"
          }`}
        >
          <a
            className="brand group flex min-w-0 flex-1 items-center gap-3"
            href="#top"
            aria-label={t(copy.brandHome)}
          >
            <span className="flex size-11 shrink-0 items-center justify-center border border-paper/25 bg-ink transition-colors duration-200 group-hover:border-acid group-hover:bg-acid group-hover:text-ink max-[680px]:size-10 max-[360px]:size-9">
              <span className="font-display text-[15px] leading-none font-[800] tracking-[-0.04em] whitespace-nowrap max-[680px]:text-[14px] max-[360px]:text-[13px]">
                F<span className="text-acid group-hover:text-ink" aria-hidden="true">/</span>R
              </span>
            </span>
            <span className="hidden leading-[1.2] min-[1200px]:grid">
              <strong className="font-display text-[13px] font-[650] tracking-[-0.04em] normal-case">
                Fajar Rafsan
              </strong>
              <small className="text-[10px] tracking-[0.14em] text-paper/55">{t(copy.brandRole)}</small>
            </span>
          </a>

          {/* In flow, not absolutely centred. Taking it out of flow meant the
              flex row could not see its width, so the right-hand cluster was
              free to overlap it — which is exactly what happened once a fifth
              link was added. Equal flex-1 on the brand and the cluster keeps
              it optically centred without that risk. */}
          <nav className="hidden shrink-0 min-[1240px]:block" aria-label={t(dual("Navigasi utama", "Main navigation"))}>
            <ul className="m-0 flex h-11 list-none items-center p-0">
              {links.map((link) => {
                const isActive = active === link.id;
                return (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      data-cursor
                      aria-current={isActive ? "location" : undefined}
                      className={`relative inline-flex h-11 items-center px-3.5 whitespace-nowrap transition-colors duration-200 ${
                        isActive ? "text-ink" : "text-paper/75 hover:text-paper"
                      }`}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 bg-acid"
                          transition={{ duration: 0.28, ease }}
                        />
                      ) : null}
                      <span className="relative z-[1]">{t(link.label)}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2 max-[360px]:gap-1">
            {/* Five nav links leave less room than four did, so the status
                strip only appears once there is genuinely space for it. */}
            <p className="nav-location m-0 hidden h-11 items-center gap-2 whitespace-nowrap min-[1620px]:flex">
              <span className="size-2 animate-pulse-dot rounded-full bg-acid shadow-[0_0_0_4px_rgba(216,255,62,0.14)]" aria-hidden="true" />
              <span>{t(copy.available)}</span>
              <span className="text-paper/35" aria-hidden="true">
                /
              </span>
              <BandungClock />
            </p>
            <LocaleToggle />
            <button
              type="button"
              className="inline-flex h-11 shrink-0 items-center border border-paper/25 px-3.5 text-paper transition-colors duration-200 hover:border-acid hover:bg-acid hover:text-ink max-[680px]:px-3 max-[420px]:px-2.5 max-[360px]:px-2"
              onClick={openCvPreview}
              data-cursor
            >
              CV
            </button>
            <a
              className="grid size-11 shrink-0 place-items-center border border-paper/25 text-paper transition-colors duration-200 hover:border-acid hover:bg-acid hover:text-ink max-[1100px]:hidden"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t(dual("Profil GitHub Fajar Rafsan", "Fajar Rafsan on GitHub"))}
            >
              <SocialIcon name="github" className="size-4" />
            </a>
            <Magnetic className="max-[1320px]:hidden">
              <a
                className="nav-cta inline-flex h-11 items-center gap-2.5 border border-acid bg-acid px-4 text-ink transition-colors duration-200 hover:bg-transparent hover:text-paper"
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
              >
                <SocialIcon name="linkedin" className="size-3.5" />
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </Magnetic>
            <button
              ref={closeRef}
              type="button"
              className="grid size-11 shrink-0 place-items-center border border-paper/25 min-[1240px]:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? t(dual("Tutup navigasi", "Close navigation")) : t(dual("Buka navigasi", "Open navigation"))}
              onClick={() => setOpen((prev) => !prev)}
            >
              <span className="relative block h-3 w-4" aria-hidden="true">
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-200 ${
                    open ? "translate-y-[5.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-200 ${
                    open ? "-translate-y-[5.5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label={t(copy.mobileNav)}
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease }}
            className="fixed inset-0 z-[70] flex flex-col bg-ink/96 px-[clamp(18px,4vw,40px)] pt-[max(6.5rem,calc(env(safe-area-inset-top)+5.25rem))] pb-[max(28px,env(safe-area-inset-bottom))] backdrop-blur-xl min-[1240px]:hidden"
          >
            <nav className="flex min-h-0 flex-1 flex-col justify-center" aria-label={t(dual("Navigasi seluler", "Mobile navigation"))}>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {links.map((link, index) => (
                  <li key={link.id}>
                    <motion.a
                      href={link.href}
                      initial={reduced ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease, delay: 0.06 + index * 0.05 }}
                      className="flex min-h-16 items-center justify-between gap-6 border-b border-paper/15 py-3"
                      onClick={() => setOpen(false)}
                    >
                      <span className="font-display text-[clamp(34px,9vw,56px)] leading-none font-[650] tracking-[-0.07em] uppercase max-[420px]:text-[clamp(28px,8.5vw,34px)]">
                        {t(link.label)}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.16em] text-acid">{link.index}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-wrap items-center gap-3 pt-8">
              {/* The header's own switch is hidden at this width, so the sheet
                  carries its own or the language becomes unreachable on phones. */}
              <LocaleToggle />
              <span className="inline-flex min-h-11 items-center gap-2 border border-paper/20 px-3 text-[10px] tracking-[0.12em] uppercase">
                <span className="size-2 rounded-full bg-acid" aria-hidden="true" />
                {t(copy.availableBandung)}
              </span>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 border border-paper/25 px-4 text-[11px] tracking-[0.1em] uppercase"
                onClick={() => {
                  setOpen(false);
                  openCvPreview();
                }}
              >
                {t(copy.viewCv)}
              </button>
              <a
                className="inline-flex min-h-11 items-center gap-2 border border-paper/25 px-4 text-[11px] tracking-[0.1em] uppercase"
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
              >
                <SocialIcon name="github" className="size-3.5" /> GitHub ↗
              </a>
              <a
                className="inline-flex min-h-11 items-center gap-2 border border-acid bg-acid px-4 text-[11px] tracking-[0.1em] text-ink uppercase"
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
              >
                <SocialIcon name="linkedin" className="size-3.5" /> LinkedIn ↗
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
