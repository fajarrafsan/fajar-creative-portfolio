"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { ease } from "@/app/lib/motion";
import { copy } from "@/app/content";
import { useT } from "@/app/lib/i18n";

const IntroReadyContext = createContext(true);
const IntroInteractiveReadyContext = createContext(true);

export function useIntroReady() {
  return useContext(IntroReadyContext);
}

export function useIntroInteractiveReady() {
  return useContext(IntroInteractiveReadyContext);
}

function lockPageScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  window.dispatchEvent(new CustomEvent("portfolio-scroll-lock", { detail: locked }));
}

const curtainEase = [0.76, 0, 0.24, 1] as const;

/** How long the intro reads before the curtain starts lifting. */
const HOLD_MS = 1500;
/** How long the curtain takes to clear. Shared with the overlay's exit transition
 *  so the hero's cue and the panels can never drift apart. */
const CURTAIN_MS = 920;
const REDUCED_HOLD_MS = 160;
const REDUCED_CURTAIN_MS = 180;

const letter = {
  hidden: { y: "112%", rotateX: -52, opacity: 0 },
  shown: (index: number) => ({
    y: "0%",
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.56, ease, delay: 0.12 + index * 0.035 },
  }),
};

function Percent({ source }: { source: MotionValue<number> }) {
  const [label, setLabel] = useState("00");
  const lastStep = useRef(-1);
  useMotionValueEvent(source, "change", (value) => {
    const step = value >= 99 ? 100 : Math.floor(value / 5) * 5;
    if (step === lastStep.current) return;
    lastStep.current = step;
    setLabel(String(step).padStart(2, "0"));
  });
  return <>{label}</>;
}

function SplitWord({
  word,
  offset,
  reduced,
  className,
}: {
  word: string;
  offset: number;
  reduced: boolean;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden py-[0.03em] [perspective:900px] ${className ?? ""}`}>
      {word.split("").map((char, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block origin-bottom-left will-change-transform"
          variants={letter}
          custom={offset + index}
          initial={reduced ? false : "hidden"}
          animate="shown"
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

function IntroOverlay({ reduced }: { reduced: boolean }) {
  const t = useT();
  const progress = useMotionValue(0);
  const panels = [0, 1, 2, 3, 4];
  const seeWord = t(copy.introSee);
  const workWord = t(copy.introWork);

  useEffect(() => {
    const controls = animate(progress, 100, {
      duration: (reduced ? REDUCED_HOLD_MS : HOLD_MS) / 1000,
      ease,
    });
    return () => controls.stop();
  }, [progress, reduced]);

  return (
    <motion.div
      className="intro-overlay pointer-events-auto fixed inset-0 z-[210] overflow-hidden text-paper"
      role="status"
      aria-live="polite"
      aria-label={t(copy.introAria)}
      initial={false}
      exit={{ opacity: 1 }}
      transition={{ duration: (reduced ? REDUCED_CURTAIN_MS : CURTAIN_MS) / 1000 }}
    >
      <div className="absolute inset-0 flex" aria-hidden="true">
        {panels.map((index) => (
          <motion.div
            key={index}
            className="intro-shutter relative h-full flex-1 overflow-hidden"
            exit={reduced ? { opacity: 0 } : { y: "-101%" }}
            transition={
              reduced
                ? { duration: REDUCED_CURTAIN_MS / 1000, ease }
                : { duration: 0.72, delay: index * 0.05, ease: curtainEase }
            }
          >
            <span className="absolute top-[18%] right-2 font-mono text-[9px] tracking-[0.16em] text-paper/18 max-[420px]:hidden">
              0{index + 1}
            </span>
            <span className="absolute right-2 bottom-[18%] size-1 bg-acid/35 max-[420px]:right-1" />
          </motion.div>
        ))}
      </div>

      {reduced ? null : (
        <motion.span
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px bg-acid/80 will-change-transform"
          aria-hidden="true"
          initial={{ y: "-2vh", opacity: 0 }}
          animate={{ y: "102vh", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.42, ease: [0.4, 0, 0.2, 1] }}
        />
      )}

      <motion.div
        className="relative z-[3] flex h-full flex-col justify-between px-[3vw] pt-[max(28px,env(safe-area-inset-top))] pb-[max(28px,env(safe-area-inset-bottom))] max-[680px]:px-[18px] max-[360px]:px-4"
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.14 : 0.24, ease }}
      >
        <div className="flex items-center justify-between gap-4 pt-2 text-[11px] tracking-[0.16em] uppercase">
          <span className="flex min-h-11 items-center gap-3">
            <span className="grid size-10 place-items-center border border-paper/25">
              <span className="font-display text-[15px] leading-none font-[800] tracking-[-0.04em]">
                F<span className="text-acid">/</span>R
              </span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-paper/45">{t(copy.introIndex)}</span>
              <span className="mt-1.5">{t(copy.introLoading)}</span>
            </span>
          </span>
          <span className="flex items-end gap-3" aria-hidden="true">
            <span className="mb-0.5 hidden font-mono text-[9px] leading-none tracking-[0.16em] text-paper/35 uppercase min-[540px]:block">
              System / portfolio
            </span>
            <span className="font-mono tabular-nums text-[clamp(28px,4vw,42px)] leading-none tracking-[-0.06em] text-acid">
              <Percent source={progress} />
              <span className="ml-1 text-[11px] tracking-[0.16em] text-paper/35">/ 100</span>
            </span>
          </span>
        </div>

        <div className="relative my-auto">
          <motion.p
            className="m-0 mb-[clamp(12px,2vw,22px)] text-[11px] tracking-[0.22em] text-paper/45 uppercase"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease }}
          >
            {t(copy.introKicker)}
          </motion.p>

          <h1 className="font-display relative m-0 text-[clamp(72px,18vw,188px)] leading-[0.74] font-[800] tracking-[-0.085em] max-[420px]:text-[clamp(52px,17vw,68px)] max-[360px]:text-[52px]">
            <span className="sr-only">{t(copy.introSr)}</span>
            <span aria-hidden="true">
              <SplitWord word={seeWord} offset={0} reduced={reduced} />
              <span className="relative mt-[0.02em] ml-[clamp(28px,8vw,120px)] block w-fit">
                <SplitWord word={workWord} offset={seeWord.length + 1} reduced={reduced} className="relative z-[1]" />
                <motion.span
                  className="absolute inset-y-0 -inset-x-[0.06em] z-0 origin-left bg-acid"
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: reduced ? 0.12 : 0.46, delay: reduced ? 0 : 0.82, ease }}
                  aria-hidden="true"
                />
                <motion.span
                  className="pointer-events-none absolute inset-0 z-[2] overflow-hidden text-ink"
                  initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: reduced ? 0.12 : 0.46, delay: reduced ? 0 : 0.82, ease }}
                  aria-hidden="true"
                >
                  <span className="block overflow-hidden py-[0.03em]">
                    {workWord.split("").map((char, index) => (
                      <span key={`${char}-${index}`} className="inline-block origin-bottom-left">
                        {char}
                      </span>
                    ))}
                  </span>
                </motion.span>
              </span>
            </span>
          </h1>

          <motion.p
            className="mt-[clamp(18px,2.4vw,28px)] max-w-[28ch] text-[13px] leading-snug text-paper/55 max-[420px]:text-[13px]"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.48, delay: reduced ? 0 : 0.72, ease }}
          >
            {t(copy.introByline)}
          </motion.p>
        </div>

        <div className="mb-2">
          <p className="mb-3 flex items-center justify-between gap-4 text-[11px] tracking-[0.16em] text-[#8d8f85] uppercase">
            <span>Fajar Rafsan</span>
            <span>{t(copy.brandRole)}</span>
          </p>
          <div className="relative h-[3px] overflow-hidden bg-paper/15" aria-hidden="true">
            <motion.span
              className="block h-full origin-left bg-acid"
              initial={{ scaleX: reduced ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduced ? 0.12 : HOLD_MS / 1000, ease }}
            />
          </div>
        </div>
      </motion.div>

      <motion.span
        className="pointer-events-none absolute -right-[18%] -bottom-[28%] z-[1] font-display text-[clamp(160px,28vw,420px)] leading-none font-[800] tracking-[-0.1em] text-paper/[0.04] select-none max-[420px]:hidden"
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease }}
      >
        {workWord}
      </motion.span>
    </motion.div>
  );
}

export function IntroGate({ children }: { children: ReactNode }) {
  const reduced = Boolean(useReducedMotion());
  const [open, setOpen] = useState(true);
  const [visualReady, setVisualReady] = useState(false);
  const [interactiveReady, setInteractiveReady] = useState(false);
  const completedRef = useRef(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const mainWasInertRef = useRef(false);

  const releasePage = useCallback(() => {
    const main = mainRef.current;
    if (main && !mainWasInertRef.current) main.inert = false;
    lockPageScroll(false);
  }, []);

  const completeIntro = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    document.documentElement.dataset.intro = "revealed";
    releasePage();
    setInteractiveReady(true);
  }, [releasePage]);

  // The portfolio now starts forming as soon as the shutters lift. Interaction
  // stays inert until the last shutter has cleared, so the handoff is visually
  // continuous without exposing controls underneath the overlay too early.
  useEffect(() => {
    lockPageScroll(true);
    const main = document.querySelector<HTMLElement>("main");
    mainRef.current = main;
    mainWasInertRef.current = main?.hasAttribute("inert") ?? false;
    if (main && !mainWasInertRef.current) main.inert = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = prefersReduced ? REDUCED_HOLD_MS : HOLD_MS;
    const curtain = prefersReduced ? REDUCED_CURTAIN_MS : CURTAIN_MS;

    document.documentElement.dataset.intro = "holding";
    const lift = window.setTimeout(() => {
      document.documentElement.dataset.intro = "lifting";
      setVisualReady(true);
      setOpen(false);
    }, hold);
    const fallback = window.setTimeout(completeIntro, hold + curtain + 80);

    return () => {
      window.clearTimeout(lift);
      window.clearTimeout(fallback);
      releasePage();
    };
  }, [completeIntro, releasePage]);

  return (
    <IntroReadyContext.Provider value={visualReady}>
      <IntroInteractiveReadyContext.Provider value={interactiveReady}>
        {children}
        <AnimatePresence onExitComplete={completeIntro}>
          {open ? <IntroOverlay reduced={reduced} /> : null}
        </AnimatePresence>
      </IntroInteractiveReadyContext.Provider>
    </IntroReadyContext.Provider>
  );
}
