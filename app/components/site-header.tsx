"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { copy, githubUrl, linkedInUrl } from "@/app/content";
import { Magnetic, ease } from "@/app/lib/motion";
import { SocialIcon } from "./tech-icons";
import { openCvPreview } from "@/app/sections/cv-preview";
import { useIntroInteractiveReady, useIntroReady } from "@/app/sections/intro";
import { LocaleToggle } from "./locale-toggle";
import { dual, useT } from "@/app/lib/i18n";

const links = [
  { href: "#profile", id: "profile", label: dual("Profil", "Profile"), index: "01" },
  { href: "#work", id: "work", label: dual("Proyek", "Projects"), index: "02" },
  { href: "#stack", id: "tech", label: dual("Stack", "Stack"), index: "03" },
  { href: "#education", id: "education", label: dual("Pendidikan", "Education"), index: "04" },
  { href: "#certificates", id: "certificates", label: dual("Sertifikat", "Certificates"), index: "05" },
  { href: "#contact", id: "contact", label: dual("Kontak", "Contact"), index: "06" },
] as const;

/** Page sections in document order, mapped onto their header tabs. */
const spyMap: { id: string; tab: string | null }[] = [
  { id: "top", tab: null },
  { id: "profile", tab: "profile" },
  { id: "architecture", tab: "work" },
  { id: "frontend", tab: "work" },
  { id: "work", tab: "work" },
  { id: "stack", tab: "tech" },
  { id: "tech", tab: "tech" },
  { id: "experience", tab: "tech" },
  { id: "education", tab: "education" },
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

function ArrowUpRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      focusable="false"
    >
      <path d="M4 12 12 4M6 4h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      focusable="false"
    >
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

export function SiteHeader() {
  const reduced = Boolean(useReducedMotion());
  const introReady = useIntroReady();
  const introInteractiveReady = useIntroInteractiveReady();
  const t = useT();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useMotionValueEvent(scrollY, "change", (value) => {
    const next = value > 28;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setScrolled(scrollY.get() > 28));
    return () => cancelAnimationFrame(frame);
  }, [scrollY]);

  useEffect(() => {
    const sections = spyMap.flatMap(({ id, tab }) => {
      const el = document.getElementById(id);
      return el ? [{ id, el, tab }] : [];
    });

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }

        const current = [...sections].reverse().find(({ id }) => visible.has(id));
        if (current) setActive((previous) => (previous === current.tab ? previous : current.tab));
      },
      { rootMargin: "-96px 0px -62% 0px", threshold: 0 },
    );

    sections.forEach(({ el }) => observer.observe(el));

    const syncHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1) || "top");
      const current = sections.find((section) => section.id === id);
      if (current) setActive(current.tab);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);

  useEffect(() => {
    const header = headerRef.current;

    if (!introInteractiveReady) {
      if (header) header.inert = true;
      return () => {
        if (header) header.inert = false;
      };
    }

    if (!open) {
      if (header) header.inert = false;
      lockPageScroll(false);
      return;
    }

    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const main = header?.closest("main") ?? document.querySelector("main");
    // SiteHeader and its dialog are rendered inside <main>. Inerting <main>
    // itself would also inert the dialog, leaving a visible menu that cannot
    // receive pointer or keyboard input. Isolate only its background children.
    const backgroundTargets = main
      ? Array.from(main.children).filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement && element !== header && element !== menuRef.current,
        )
      : [];
    const backgroundInertState = backgroundTargets.map((element) => [element, element.hasAttribute("inert")] as const);

    if (header) header.inert = true;
    backgroundInertState.forEach(([element, wasInert]) => {
      if (!wasInert) element.inert = true;
    });
    lockPageScroll(true);

    const frame = requestAnimationFrame(() => dialogCloseRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        event.preventDefault();
        dialogCloseRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeInside = menuRef.current?.contains(document.activeElement) ?? false;
      if (!activeInside) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      lockPageScroll(false);
      if (header) header.inert = false;
      backgroundInertState.forEach(([element, wasInert]) => {
        if (!wasInert) element.inert = false;
      });
      const restoreTarget = restoreFocusRef.current;
      if (restoreTarget && restoreTarget.getClientRects().length > 0) restoreTarget.focus();
      restoreFocusRef.current = null;
    };
  }, [introInteractiveReady, open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1240px)");
    const closeAtDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    closeAtDesktop();
    desktop.addEventListener("change", closeAtDesktop);
    return () => desktop.removeEventListener("change", closeAtDesktop);
  }, []);

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={reduced ? false : { y: -28, opacity: 0 }}
        animate={reduced || introReady ? { y: 0, opacity: 1 } : { y: -28, opacity: 0 }}
        transition={{ duration: 0.7, ease, delay: introReady ? 0.08 : 0 }}
        aria-hidden={!introInteractiveReady || open}
        className="site-nav pointer-events-none fixed inset-x-0 top-0 z-[80] px-[3vw] pt-[max(10px,env(safe-area-inset-top))] max-[680px]:px-5"
      >
        <div
          className={`site-header-frame group/header pointer-events-auto relative flex items-center justify-between gap-4 overflow-hidden border px-3 text-[11px] tracking-[0.1em] uppercase backdrop-blur-xl transition-[height,background-color,border-color,box-shadow] duration-300 max-[680px]:h-14 max-[420px]:gap-2 max-[420px]:px-2 max-[360px]:gap-1 max-[360px]:px-1.5 ${
            open
              ? "h-[60px] border-acid bg-ink shadow-[0_18px_60px_rgba(0,0,0,0.52)]"
              : scrolled
                ? "h-[60px] border-paper/22 bg-ink/92 shadow-[0_18px_50px_rgba(0,0,0,0.38)]"
                : "h-[68px] border-paper/15 bg-ink/68"
          }`}
        >
          <span className="site-header-grid pointer-events-none absolute inset-0" aria-hidden="true" />
          <span className="site-header-scan pointer-events-none absolute inset-x-0 top-0 z-[2] h-px bg-acid" aria-hidden="true" />
          <span className="pointer-events-none absolute top-0 left-0 z-[3] size-2 border-t border-l border-acid/80" aria-hidden="true" />
          <span className="pointer-events-none absolute right-0 bottom-0 z-[3] size-2 border-r border-b border-acid/80" aria-hidden="true" />
          <a
            className="brand group relative z-[4] flex min-h-11 min-w-11 flex-1 items-center gap-3 focus-visible:-outline-offset-4"
            href="#top"
            aria-label={t(copy.brandHome)}
          >
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden border border-paper/25 bg-ink transition-colors duration-200 group-hover:border-acid group-focus-visible:border-acid max-[680px]:size-10 max-[360px]:size-9">
              <span className="absolute inset-0 translate-y-full bg-acid transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0" aria-hidden="true" />
              <span className="font-display relative z-[1] text-[15px] leading-none font-[800] tracking-[-0.04em] whitespace-nowrap transition-colors duration-200 group-hover:text-ink group-focus-visible:text-ink max-[680px]:text-[15px] max-[360px]:text-[13px]">
                F<span className="inline-block text-acid transition-[color,transform] duration-300 group-hover:rotate-12 group-hover:text-ink group-focus-visible:rotate-12 group-focus-visible:text-ink" aria-hidden="true">/</span>R
              </span>
            </span>
            <span className="hidden leading-[1.2] min-[1200px]:grid">
              <strong className="font-display text-[13px] font-[650] tracking-[-0.04em] normal-case transition-colors duration-200 group-hover:text-acid group-focus-visible:text-acid">
                Fajar Rafsan
              </strong>
              <small className="text-[11px] tracking-[0.14em] text-paper/55 transition-colors duration-200 group-hover:text-paper/80 group-focus-visible:text-paper/80">{t(copy.brandRole)}</small>
            </span>
          </a>

          {/* In flow, not absolutely centred. Taking it out of flow meant the
              flex row could not see its width, so the right-hand cluster was
              free to overlap it — which is exactly what happened once more
              link was added. Equal flex-1 on the brand and the cluster keeps
              it optically centred without that risk. */}
          <nav className="relative z-[4] hidden shrink-0 min-[1240px]:block" aria-label={t(dual("Navigasi utama", "Main navigation"))}>
            <ul className="m-0 flex h-11 list-none items-center p-0">
              {links.map((link) => {
                const isActive = active === link.id;
                return (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      aria-current={isActive ? "location" : undefined}
                      onClick={() => setActive(link.id)}
                      className={`group/nav relative isolate inline-flex h-11 items-center overflow-hidden px-3 whitespace-nowrap transition-colors duration-200 focus-visible:-outline-offset-4 ${
                        isActive ? "text-ink" : "text-paper/72 hover:text-paper focus-visible:text-paper"
                      }`}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 bg-acid"
                          transition={reduced ? { duration: 0 } : { duration: 0.28, ease }}
                        />
                      ) : null}
                      <span
                        className={`absolute inset-x-1.5 bottom-0 h-px origin-left transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isActive
                            ? "scale-x-100 bg-ink/45"
                            : "scale-x-0 bg-acid group-hover/nav:scale-x-100 group-focus-visible/nav:scale-x-100"
                        }`}
                        aria-hidden="true"
                      />
                      {!isActive ? (
                        <span className="absolute inset-0 translate-y-full bg-acid/[0.07] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nav:translate-y-0 group-focus-visible/nav:translate-y-0" aria-hidden="true" />
                      ) : null}
                      <span className="relative z-[1] flex items-center gap-2">
                        <span className={`font-mono text-[8px] tracking-[0.12em] transition-opacity duration-200 ${isActive ? "text-ink/60" : "text-acid/65 group-hover/nav:text-acid group-focus-visible/nav:text-acid"}`}>
                          {link.index}
                        </span>
                        <span className="relative block h-[1.05em] overflow-hidden leading-[1.05]">
                          <span className="block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nav:-translate-y-full group-focus-visible/nav:-translate-y-full">
                            {t(link.label)}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`absolute top-full left-0 block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nav:-translate-y-full group-focus-visible/nav:-translate-y-full ${isActive ? "text-ink" : "text-acid"}`}
                          >
                            {t(link.label)}
                          </span>
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative z-[4] flex flex-1 items-center justify-end gap-2 max-[360px]:gap-1">
            {/* Six nav links leave less room than the original set, so the status
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
              className="group/cv inline-flex h-11 shrink-0 items-center gap-1.5 overflow-hidden border border-paper/25 px-3.5 text-paper transition-[color,background-color,border-color,transform] duration-200 hover:border-acid hover:bg-acid hover:text-ink focus-visible:-outline-offset-4 focus-visible:border-acid focus-visible:bg-acid focus-visible:text-ink active:translate-y-px max-[680px]:px-3 max-[420px]:px-2.5 max-[360px]:px-2"
              onClick={() => openCvPreview()}
              aria-label={t(copy.viewCv)}
              data-cursor
            >
              <span className="relative block h-[1em] min-w-[18px] overflow-hidden leading-none">
                <span className="block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cv:-translate-y-full group-focus-visible/cv:-translate-y-full">CV</span>
                <span aria-hidden="true" className="absolute top-full left-0 block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cv:-translate-y-full group-focus-visible/cv:-translate-y-full">CV</span>
              </span>
              <span aria-hidden="true" className="font-mono text-[9px] tracking-[-0.08em] transition-transform duration-300 group-hover/cv:rotate-90 group-focus-visible/cv:rotate-90">[+]</span>
            </button>
            <a
              className="group/github grid size-11 shrink-0 place-items-center border border-paper/25 text-paper transition-[color,background-color,border-color,transform] duration-200 hover:border-acid hover:bg-acid hover:text-ink focus-visible:-outline-offset-4 focus-visible:border-acid focus-visible:bg-acid focus-visible:text-ink active:translate-y-px max-[1100px]:hidden"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t(dual("Profil GitHub Fajar Rafsan", "Fajar Rafsan on GitHub"))}
            >
              <SocialIcon name="github" className="size-4 transition-transform duration-300 group-hover/github:-rotate-6 group-hover/github:scale-110 group-focus-visible/github:-rotate-6 group-focus-visible/github:scale-110" />
            </a>
            <Magnetic className="max-[1320px]:hidden">
              <a
                className="nav-cta group/linkedin inline-flex h-11 items-center gap-2.5 border border-acid bg-acid px-4 text-ink transition-[color,background-color,transform] duration-200 hover:bg-transparent hover:text-paper focus-visible:-outline-offset-4 focus-visible:bg-ink focus-visible:text-paper active:translate-y-px"
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
              >
                <SocialIcon name="linkedin" className="size-3.5" />
                LinkedIn
                <ArrowUpRightIcon className="size-3.5 transition-transform duration-300 group-hover/linkedin:translate-x-0.5 group-hover/linkedin:-translate-y-0.5 group-focus-visible/linkedin:translate-x-0.5 group-focus-visible/linkedin:-translate-y-0.5" />
              </a>
            </Magnetic>
            <button
              ref={menuButtonRef}
              type="button"
              className={`grid size-11 shrink-0 place-items-center border transition-[color,background-color,border-color,transform] duration-200 focus-visible:-outline-offset-4 active:translate-y-px min-[1240px]:hidden ${
                open
                  ? "border-acid bg-acid text-ink"
                  : "border-paper/25 text-paper hover:border-acid hover:bg-acid hover:text-ink focus-visible:border-acid focus-visible:bg-acid focus-visible:text-ink"
              }`}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? t(dual("Tutup navigasi", "Close navigation")) : t(dual("Buka navigasi", "Open navigation"))}
              onClick={() => setOpen((prev) => !prev)}
              data-cursor
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
            ref={menuRef}
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label={t(copy.mobileNav)}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={reduced ? { duration: 0 } : { duration: 0.28, ease }}
            className="mobile-nav-overlay fixed inset-0 z-[120] overflow-y-auto overscroll-contain bg-ink/97 backdrop-blur-xl min-[1240px]:hidden"
            data-lenis-prevent
          >
            <div className="mx-auto flex min-h-full w-full max-w-[920px] flex-col px-[clamp(18px,4vw,40px)] pb-[max(24px,env(safe-area-inset-bottom))] max-[360px]:px-4 max-[360px]:pb-[max(16px,env(safe-area-inset-bottom))]">
              <div className="sticky top-0 z-20 -mx-[clamp(18px,4vw,40px)] flex items-center justify-between border-b border-paper/15 bg-ink/94 px-[clamp(18px,4vw,40px)] pt-[max(12px,env(safe-area-inset-top))] pb-3 backdrop-blur-xl max-[360px]:-mx-4 max-[360px]:px-4 max-[360px]:pt-[max(8px,env(safe-area-inset-top))] max-[360px]:pb-2">
                <div className="flex min-w-0 items-center gap-3" aria-hidden="true">
                  <span className="grid size-11 shrink-0 place-items-center border border-acid bg-acid font-display text-[14px] font-[800] tracking-[-0.04em] text-ink">
                    F/R
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] tracking-[0.18em] text-acid uppercase">SYS / NAV</span>
                    <span className="block truncate text-[12px] tracking-[0.12em] text-paper/65 uppercase">{t(copy.mobileNav)} · 06</span>
                  </span>
                </div>
                <button
                  ref={dialogCloseRef}
                  type="button"
                  className="grid size-12 shrink-0 place-items-center border border-paper/25 text-paper transition-[color,background-color,border-color,transform] duration-200 hover:border-acid hover:bg-acid hover:text-ink focus-visible:-outline-offset-4 focus-visible:border-acid focus-visible:bg-acid focus-visible:text-ink active:translate-y-px max-[360px]:size-11"
                  aria-label={t(dual("Tutup navigasi", "Close navigation"))}
                  onClick={() => setOpen(false)}
                  data-cursor
                >
                  <span className="relative block size-4" aria-hidden="true">
                    <span className="absolute inset-x-0 top-1/2 h-px rotate-45 bg-current" />
                    <span className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-current" />
                  </span>
                </button>
              </div>

              <nav className="flex flex-1 flex-col justify-center py-5 max-[360px]:py-3" aria-label={t(dual("Navigasi seluler", "Mobile navigation"))}>
                <ul className="m-0 flex list-none flex-col p-0">
                  {links.map((link, index) => {
                    const isActive = active === link.id;
                    return (
                      <li key={link.id}>
                        <motion.a
                          href={link.href}
                          aria-current={isActive ? "location" : undefined}
                          initial={reduced ? false : { opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={reduced ? { duration: 0 } : { duration: 0.42, ease, delay: 0.04 + index * 0.045 }}
                          className={`group/mobile-nav relative flex min-h-16 items-center justify-between gap-5 overflow-hidden border-b py-3 pr-2 pl-4 transition-[color,background-color,transform,border-color] duration-200 focus-visible:-outline-offset-4 active:translate-x-1 active:bg-acid active:text-ink max-[360px]:min-h-14 max-[360px]:gap-3 max-[360px]:py-2 max-[360px]:pl-3 ${
                            isActive
                              ? "border-acid/45 bg-acid/[0.06] text-acid"
                              : "border-paper/15 text-paper hover:border-acid/35 hover:bg-paper/[0.04] focus-visible:text-acid"
                          }`}
                          onClick={() => {
                            setActive(link.id);
                            setOpen(false);
                          }}
                        >
                          <span
                            className={`absolute inset-y-3 left-0 w-0.5 origin-center bg-acid transition-transform duration-300 ${
                              isActive ? "scale-y-100" : "scale-y-0 group-hover/mobile-nav:scale-y-100 group-focus-visible/mobile-nav:scale-y-100"
                            }`}
                            aria-hidden="true"
                          />
                          <span className="font-display text-[clamp(30px,8.5vw,52px)] leading-none font-[650] tracking-[-0.07em] uppercase transition-transform duration-300 group-hover/mobile-nav:translate-x-1 group-focus-visible/mobile-nav:translate-x-1 max-[420px]:text-[clamp(27px,8vw,32px)] max-[360px]:text-[clamp(24px,7.8vw,28px)]">
                            {t(link.label)}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className={`font-mono text-[11px] tracking-[0.16em] ${isActive ? "text-acid" : "text-paper/45 group-hover/mobile-nav:text-acid group-focus-visible/mobile-nav:text-acid"}`}>
                              {link.index}
                            </span>
                            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover/mobile-nav:translate-x-1 group-focus-visible/mobile-nav:translate-x-1" />
                          </span>
                        </motion.a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="border-t border-paper/15 pt-5 max-[360px]:pt-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 max-[360px]:mb-3 max-[360px]:gap-2">
                  <LocaleToggle layoutId="locale-pill-mobile-nav" />
                  <span className="inline-flex min-h-11 items-center gap-2 border border-paper/20 px-3 text-[11px] tracking-[0.12em] uppercase max-[360px]:px-2.5 max-[360px]:text-[10px]">
                    <span className="size-2 rounded-full bg-acid shadow-[0_0_0_4px_rgba(216,255,62,0.12)]" aria-hidden="true" />
                    {t(copy.availableBandung)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="col-span-2 inline-flex min-h-12 items-center justify-between gap-3 border border-paper/25 px-4 text-[12px] tracking-[0.11em] uppercase transition-[color,background-color,border-color,transform] duration-200 hover:border-acid hover:bg-acid hover:text-ink focus-visible:-outline-offset-4 focus-visible:border-acid focus-visible:bg-acid focus-visible:text-ink active:translate-y-px"
                    onClick={() => {
                      setOpen(false);
                      requestAnimationFrame(() => openCvPreview());
                    }}
                  >
                    {t(copy.viewCv)}
                    <span aria-hidden="true" className="font-mono text-[10px] tracking-[-0.08em]">[+]</span>
                  </button>
                  <a
                    className="group/mobile-social inline-flex min-h-12 items-center justify-between gap-2 border border-paper/25 px-4 text-[12px] tracking-[0.1em] uppercase transition-[color,background-color,border-color,transform] duration-200 hover:border-acid hover:bg-acid hover:text-ink focus-visible:-outline-offset-4 focus-visible:border-acid focus-visible:bg-acid focus-visible:text-ink active:translate-y-px"
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="inline-flex items-center gap-2"><SocialIcon name="github" className="size-3.5" /> GitHub</span>
                    <ArrowUpRightIcon className="size-3.5 transition-transform duration-300 group-hover/mobile-social:translate-x-0.5 group-hover/mobile-social:-translate-y-0.5 group-focus-visible/mobile-social:translate-x-0.5 group-focus-visible/mobile-social:-translate-y-0.5" />
                  </a>
                  <a
                    className="group/mobile-social inline-flex min-h-12 items-center justify-between gap-2 border border-acid bg-acid px-4 text-[12px] tracking-[0.1em] text-ink uppercase transition-[color,background-color,transform] duration-200 hover:bg-transparent hover:text-paper focus-visible:-outline-offset-4 focus-visible:bg-ink focus-visible:text-paper active:translate-y-px"
                    href={linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="inline-flex items-center gap-2"><SocialIcon name="linkedin" className="size-3.5" /> LinkedIn</span>
                    <ArrowUpRightIcon className="size-3.5 transition-transform duration-300 group-hover/mobile-social:translate-x-0.5 group-hover/mobile-social:-translate-y-0.5 group-focus-visible/mobile-social:translate-x-0.5 group-focus-visible/mobile-social:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
