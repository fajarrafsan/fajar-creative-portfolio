"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { ease } from "./motion";

const IntroReadyContext = createContext(true);

export function useIntroReady() {
  return useContext(IntroReadyContext);
}

function lockPageScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  window.dispatchEvent(new CustomEvent("portfolio-scroll-lock", { detail: locked }));
}

const curtainEase = [0.76, 0, 0.24, 1] as const;

/** How long the intro reads before the curtain starts lifting. */
const HOLD_MS = 2350;
/** How long the curtain takes to clear. Shared with the overlay's exit transition
 *  so the hero's cue and the panels can never drift apart. */
const CURTAIN_MS = 1180;
const REDUCED_HOLD_MS = 420;
const REDUCED_CURTAIN_MS = 300;

const letter = {
  hidden: { y: "112%", rotateX: -52, opacity: 0 },
  shown: (index: number) => ({
    y: "0%",
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.72, ease, delay: 0.22 + index * 0.05 },
  }),
};

function Percent({ source }: { source: MotionValue<number> }) {
  const [label, setLabel] = useState("00");
  useMotionValueEvent(source, "change", (value) => {
    setLabel(String(Math.round(value)).padStart(2, "0"));
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
  const progress = useMotionValue(0);
  const panels = [0, 1, 2, 3, 4];

  useEffect(() => {
    const controls = animate(progress, 100, {
      duration: reduced ? 0.32 : 2.15,
      ease,
    });
    return () => controls.stop();
  }, [progress, reduced]);

  return (
    <motion.div
      className="intro-overlay pointer-events-auto fixed inset-0 z-[210] overflow-hidden text-paper"
      role="status"
      aria-live="polite"
      aria-label="Memuat. See work."
      initial={false}
      exit={{ opacity: 1 }}
      transition={{ duration: (reduced ? REDUCED_CURTAIN_MS : CURTAIN_MS) / 1000 }}
    >
      <div className="absolute inset-0 flex" aria-hidden="true">
        {panels.map((index) => (
          <motion.div
            key={index}
            className="h-full flex-1 bg-ink"
            exit={reduced ? { opacity: 0 } : { y: "-101%" }}
            transition={
              reduced
                ? { duration: 0.28, ease }
                : { duration: 0.84, delay: 0.08 + index * 0.055, ease: curtainEase }
            }
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.22]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,239,232,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(240,239,232,0.09) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.span
        className="pointer-events-none absolute inset-x-0 z-[2] h-px bg-acid/80"
        aria-hidden="true"
        initial={reduced ? false : { top: "-2%", opacity: 0 }}
        animate={{ top: "102%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.05, ease: [0.4, 0, 0.2, 1] }}
      />

      <motion.div
        className="relative z-[3] flex h-full flex-col justify-between px-[3vw] pt-[max(28px,env(safe-area-inset-top))] pb-[max(28px,env(safe-area-inset-bottom))] max-[680px]:px-[18px] max-[420px]:px-3.5"
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.2 : 0.32, ease }}
      >
        <div className="flex items-center justify-between gap-4 pt-2 text-[11px] tracking-[0.16em] uppercase">
          <span className="flex min-h-11 items-center gap-3">
            <span className="grid size-10 place-items-center border border-paper/25">
              <span className="font-display text-[14px] leading-none font-[800] tracking-[-0.04em]">
                F<span className="text-acid">/</span>R
              </span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-paper/45">Index 01</span>
              <span className="mt-1.5">Loading</span>
            </span>
          </span>
          <span className="font-mono tabular-nums text-[clamp(28px,4vw,42px)] leading-none tracking-[-0.06em] text-acid">
            <Percent source={progress} />
            <span className="ml-1 text-[11px] tracking-[0.16em] text-paper/35">/ 100</span>
          </span>
        </div>

        <div className="relative my-auto">
          <motion.p
            className="m-0 mb-[clamp(12px,2vw,22px)] text-[11px] tracking-[0.22em] text-paper/45 uppercase"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease }}
          >
            Selected work · 2026
          </motion.p>

          <h1 className="font-display relative m-0 text-[clamp(72px,18vw,188px)] leading-[0.74] font-[800] tracking-[-0.085em] max-[420px]:text-[clamp(58px,17.5vw,72px)]">
            <span className="sr-only">See work.</span>
            <span aria-hidden="true">
              <SplitWord word="SEE" offset={0} reduced={reduced} />
              <span className="relative mt-[0.02em] ml-[clamp(28px,8vw,120px)] block w-fit">
                <SplitWord word="WORK" offset={4} reduced={reduced} className="relative z-[1]" />
                <motion.span
                  className="absolute inset-y-0 -inset-x-[0.06em] z-0 origin-left bg-acid"
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: reduced ? 0.2 : 0.58, delay: reduced ? 0 : 1.28, ease }}
                  aria-hidden="true"
                />
                <motion.span
                  className="pointer-events-none absolute inset-0 z-[2] overflow-hidden text-ink"
                  initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: reduced ? 0.2 : 0.58, delay: reduced ? 0 : 1.28, ease }}
                  aria-hidden="true"
                >
                  <span className="block overflow-hidden py-[0.03em]">
                    {["W", "O", "R", "K"].map((char) => (
                      <span key={char} className="inline-block origin-bottom-left">
                        {char}
                      </span>
                    ))}
                  </span>
                </motion.span>
              </span>
            </span>
          </h1>

          <motion.p
            className="mt-[clamp(18px,2.4vw,28px)] max-w-[28ch] text-[13px] leading-snug text-paper/55 max-[420px]:text-[12px]"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.15, ease }}
          >
            Fajar Rafsan — fullstack, Java &amp; React. Bandung.
          </motion.p>
        </div>

        <div className="mb-2">
          <p className="mb-3 flex items-center justify-between gap-4 text-[10px] tracking-[0.16em] text-[#8d8f85] uppercase">
            <span>Fajar Rafsan</span>
            <span>Fullstack · Bandung</span>
          </p>
          <div className="relative h-[3px] overflow-hidden bg-paper/15" aria-hidden="true">
            <motion.span
              className="block h-full origin-left bg-acid"
              initial={{ scaleX: reduced ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduced ? 0.2 : 2.15, ease }}
            />
            {reduced ? null : (
              <motion.span
                className="absolute top-1/2 size-2 -translate-y-1/2 bg-paper"
                initial={{ left: "0%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 2.15, ease }}
              />
            )}
          </div>
        </div>
      </motion.div>

      <motion.span
        className="pointer-events-none absolute -right-[18%] -bottom-[28%] z-[1] font-display text-[clamp(160px,28vw,420px)] leading-none font-[800] tracking-[-0.1em] text-paper/[0.04] select-none"
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease }}
      >
        WORK
      </motion.span>
    </motion.div>
  );
}

export function IntroGate({ children }: { children: ReactNode }) {
  const reduced = Boolean(useReducedMotion());
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);

  // `ready` is deliberately NOT set alongside `setOpen(false)`. The curtain
  // takes CURTAIN_MS to lift and the hero entrance runs about as long, so
  // firing them together plays the whole sequence behind the panels — the
  // visitor gets a hero that has already settled. Cueing the hero only once the
  // panels have cleared is the entire point of having an intro.
  //
  // The cue is a plain timer rather than `onExitComplete` alone: a dropped
  // animation frame (backgrounded tab, interrupted navigation) must never
  // strand the hero at opacity 0. `onExitComplete` still runs, and is a no-op
  // when the timer got there first.
  useEffect(() => {
    lockPageScroll(true);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = prefersReduced ? REDUCED_HOLD_MS : HOLD_MS;
    const curtain = prefersReduced ? REDUCED_CURTAIN_MS : CURTAIN_MS;

    document.documentElement.dataset.intro = "holding";
    const lift = window.setTimeout(() => {
      document.documentElement.dataset.intro = "lifting";
      setOpen(false);
    }, hold);
    const cue = window.setTimeout(() => {
      document.documentElement.dataset.intro = "revealed";
      setReady(true);
      lockPageScroll(false);
    }, hold + curtain);

    return () => {
      window.clearTimeout(lift);
      window.clearTimeout(cue);
    };
  }, []);

  return (
    <IntroReadyContext.Provider value={ready}>
      {children}
      <AnimatePresence
        onExitComplete={() => {
          document.documentElement.dataset.intro = "revealed";
          lockPageScroll(false);
          setReady(true);
        }}
      >
        {open ? <IntroOverlay reduced={reduced} /> : null}
      </AnimatePresence>
    </IntroReadyContext.Provider>
  );
}
