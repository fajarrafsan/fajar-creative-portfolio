"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import Lenis from "lenis";
import { copy } from "./content";
import { useT } from "./i18n";

/** Shared easing — a soft overshoot-free curve that matches the type's weight. */
export const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Spread onto any `motion.*` element to fade + rise it into view once.
 * Motion renders the `initial` state during SSR, so there is no flash of
 * un-animated content on first paint.
 */
export const reveal = {
  initial: { opacity: 0, y: 44, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "0px 0px -120px 0px", amount: 0.25 },
  transition: { duration: 0.72, ease },
} as const;

/**
 * Scroll-entrance that survives locale re-renders.
 *
 * `whileInView` with `once` lives inside Motion's visual element. A language
 * switch re-renders copy (and remounts any child whose React key is the
 * translated string). New children inherit `initial: "hidden"` while the
 * parent has already finished its in-view cycle, so they stay at opacity 0.
 * Latched React state plus `animate` is the higher-priority target, so a
 * remount plays into "shown" instead of getting stuck.
 */
export function useLatchedInView(
  ref: RefObject<Element | null>,
  options: { margin?: string; amount?: number } = {},
) {
  const reduced = useReducedMotion() === true;
  const inView = useInView(ref, { once: true, ...options });
  return { reduced, shown: reduced || inView };
}

/** Same entrance as `reveal`, held in React state so a locale switch cannot rewind it. */
export function LatchedReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, shown } = useLatchedInView(ref, { margin: "0px 0px -120px 0px", amount: 0.25 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={shown ? false : reduced ? false : { opacity: 0, y: 44, filter: "blur(6px)" }}
      animate={shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 44, filter: "blur(6px)" }}
      transition={{ duration: 0.72, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Parent/child pair for lists that should cascade rather than pop in together. */
export const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.18 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, x: -24 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.72, ease } },
};

/** Profile: headline, chips, copy, then a nested stats stagger. */
export const profileParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

// A soft blur-to-focus riding along with the fade is what makes this read as
// "materializing" rather than a plain fade — a small touch, but it's the
// difference between a mechanical opacity tween and something that feels shot
// on camera with a rack focus.
export const profileItem: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.62, ease } },
};

export const profileChipParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
};

export const profileChip: Variants = {
  hidden: { opacity: 0, scale: 0.84, y: 18, filter: "blur(4px)" },
  shown: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 280, damping: 18, mass: 0.55 },
  },
};

/** SplitText-style line lockup, in Motion — two headline lines only. */
export const profileWord: Variants = {
  hidden: { y: "110%", rotateX: -52, opacity: 0, filter: "blur(5px)" },
  shown: (index: number) => ({
    y: "0%",
    rotateX: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.78, ease, delay: 0.05 + index * 0.08 },
  }),
};

export const profileStatParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const profileStat: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease },
  },
};

/**
 * Architecture copy on ink. Same latch + lockup idea as profile so a locale
 * remount cannot rewind `whileInView` `once`. Stagger lives on the text
 * column only — never wrap SystemGraph in this parent.
 */
export const archParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

export const archItem: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.62, ease } },
};

export const archWord: Variants = {
  hidden: { y: "108%", rotateX: -38, opacity: 0, filter: "blur(5px)" },
  shown: (index: number) => ({
    y: "0%",
    rotateX: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.82, ease, delay: 0.04 + index * 0.1 },
  }),
};

export const archMetaParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.02 } },
};

export const archMeta: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/**
 * Architecture diagram assembly.
 *
 * Each stage below is its own nested stagger scope (see `graphFormationShell`
 * and the per-leg group in system-graph.tsx), so this outer sequence only
 * has to place a handful of BIG beats in order — backdrop, frame + rings,
 * wiring, core, protocol pills, then the node cards cascading in last. Every
 * nested scope reuses this same 0.09s cadence, so the whole thing reads as
 * one continuous build rather than several independently-timed animations.
 */
// This is a two-act sequence, not one long cascade: the box forms completely
// (frame draws, corners snap in) and only THEN does the rest of the graph
// wake up (rings, wiring, core, node cards). graphParent's own stagger here
// is deliberately tiny (0.02s) — just enough to break a tie between elements
// that start at the same moment — because the real pacing comes from the
// explicit delays on graphBoxFrame/graphCornerMark (act one) and
// graphContentPhase (act two, defined below graphNode). Framer adds a
// child's own transition delay on top of its parent-computed stagger delay,
// so those explicit numbers are the actual timeline; the stagger is not.
export const graphParent: Variants = {
  hidden: {},
  shown: {
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0,
    },
  },
};

/** Act one, beat one: the box frame draws itself in. */
export const graphBoxFrame: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  shown: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.9, ease, delay: 0.05 },
  },
};

/** Act one, beat two: corner marks snap into place as the frame finishes drawing. */
export const graphCornerMark: Variants = {
  hidden: { scale: 0, opacity: 0 },
  shown: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: 0.66 + index * 0.06 },
  }),
};

/** Stage 2: Central Core Disc spring pop with glow awakening */
export const graphCore: Variants = {
  hidden: { scale: 0.35, opacity: 0, filter: "blur(12px)" },
  shown: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 190, damping: 16, mass: 0.75 },
  },
};

/** Stage 3: Connecting ray tracing route paths */
export const graphRoute: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  shown: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.75, ease },
  },
};

/** Stage 4: Protocol text badges pop */
export const graphProto: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 6 },
  shown: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

/** Stage 5: Outer node cards cascade reveal */
export const graphNode: Variants = {
  hidden: { scale: 0.72, opacity: 0, y: 16, filter: "blur(8px)" },
  shown: {
    scale: 1,
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 210, damping: 19 },
  },
};

/**
 * Act two: everything that isn't the box — halo, orbit rings, wiring, core,
 * protocol pills, node cards. System-graph-exclusive (not shared with
 * HeroGraph), so this delay is safe to hand-tune: it's the one number that
 * decides when "the graph" is allowed to start relative to "the box".
 * 0.95s sits just after graphBoxFrame + graphCornerMark's act one finishes
 * (frame: 0.05 + 0.9 = 0.95s; last corner: 0.66 + 3*0.06 + ~0.3 spring settle
 * ≈ 1.14s) — close enough that act two picks up right as the box's own
 * motion is settling, not after an awkward dead pause.
 */
export const graphContentPhase: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.95 } },
};

/**
 * Round-diagram formation.
 *
 * Every circular diagram on the site (the hero's orbit and the two
 * architecture graphs) is built from the same three layers: a flat backdrop,
 * a pair of static halo rings, and a pair of dashed orbit rings that spin
 * forever once in place. Left alone they all just pop in at once. These three
 * variants stage that as an assembly instead — backdrop fades, rings
 * materialize with a small spring "snap", then the orbit rings spin up out of
 * a hard rotation offset and settle into their ambient CSS spin — so the
 * frame reads as being built before anything populates it.
 *
 * `graphFormationShell` wraps the backdrop/ring/orbit elements as a single
 * nested stagger scope. That keeps it to exactly one slot in whatever outer
 * stagger it sits inside (`graphParent` / `heroGraphParent`), so adding this
 * formation sequence never reshuffles the timing already tuned for the
 * legs, core disc, and node cards.
 */
export const graphFormationShell: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08 } },
};

export const graphSurface: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.55, ease } },
};

export const graphRing: Variants = {
  hidden: { opacity: 0, scale: 0.55 },
  shown: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 115, damping: 16, mass: 0.6 },
  },
};

/**
 * The rotate offset only ever plays once, on the outer wrapper — the inner
 * `<g>` keeps its own perpetual CSS spin (`animate-spin-slow` /
 * `animate-spin-reverse`) untouched on a separate element, so the one-off
 * "spin up into place" and the ambient rotation never fight over the same
 * `transform`.
 */
export const graphOrbitSpinUp: Variants = {
  hidden: { opacity: 0, scale: 0.72, rotate: -130 },
  shown: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.85, ease },
  },
};

/**
 * Hero entrance staging.
 *
 * These delays are measured from the moment the intro curtain has fully
 * cleared, not from the moment it starts lifting — see `IntroGate`. Each beat
 * lands after the one before it so the first paint reads as a sequence:
 * headline, then diagram, then the stack chips.
 */
export const heroLine: Variants = {
  hidden: { y: "116%", rotate: 2.5, opacity: 0 },
  shown: (index: number) => ({
    y: "0%",
    rotate: 0,
    opacity: 1,
    transition: { duration: 1.15, ease, delay: 0.12 + index * 0.13 },
  }),
};

/** Beat 2: the orbital diagram, held back until the headline is on its last word. */
export const heroGraphParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.075, delayChildren: 0.46 } },
};

/** Beat 3: the stack chips deal in one after another, like cards off a deck. */
export const heroChipParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.075, delayChildren: 0.82 } },
};

export const heroChip: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.9, rotate: -3 },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.55, ease },
  },
};

/**
 * Closing contact panel.
 *
 * A full-viewport acid section, so it is arrived at rather than scrolled
 * past — paced like a closing title card. Every delay below is explicit
 * rather than left to `staggerChildren`, because the beats need to overlap
 * in a specific way (the CTAs start while the headline's last line is still
 * travelling) and index-based stagger can't express that.
 */
export const contactParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.04 } },
};

export const contactItem: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
};

/** Beat 2: the oversized closing headline, one masked line at a time. */
export const contactLine: Variants = {
  hidden: { y: "112%", rotate: 2, opacity: 0 },
  shown: (index: number) => ({
    y: "0%",
    rotate: 0,
    opacity: 1,
    transition: { duration: 1.05, ease, delay: 0.16 + index * 0.13 },
  }),
};

/** Beat 3: CTA buttons deal in, the same gesture as the hero's stack chips. */
export const contactCtaParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.52 } },
};

export const contactCta: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.94 },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 24, mass: 0.6 },
  },
};

/**
 * Beat 4: the social rows. The two hairlines draw themselves across first and
 * the row content follows — which is why those rules are real elements here
 * rather than a `border-y`: a border cannot be scaled independently of the
 * box it belongs to.
 */
export const contactRowsParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.68 } },
};

// `opacity` is carried here even though `scaleX` does the visible work: the
// stall watchdog in globals.css only rescues elements whose inline style
// contains "opacity", so a scale-only variant would stay invisible forever if
// the Motion bundle never boots.
export const contactRule: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  shown: { scaleX: 1, opacity: 1, transition: { duration: 0.8, ease } },
};

export const contactRow: Variants = {
  hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
  shown: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
};

/** Beat 5: the legal line, last and quietest. */
export const contactFoot: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 1.02 } },
};

/**
 * Certificate wall.
 *
 * `certFrame` is the important one: it animates the wrapper AROUND the
 * coverflow carousel, never the cards. The carousel writes `transform` to
 * every card on every frame to build the rake, so a variant touching a card's
 * transform would be overwritten mid-animation — and would also fight the
 * drag. Scaling the container sidesteps both.
 */
export const certParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const certItem: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
};

export const certFrame: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 20, mass: 0.8 },
  },
};

/** Re-keyed per slide, so the index flips rather than cross-fades. */
export const certCounter: Variants = {
  hidden: { opacity: 0, y: "-55%" },
  shown: { opacity: 1, y: "0%", transition: { duration: 0.32, ease } },
};

/** True once the viewport is at least `query` wide. Starts false to match SSR. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

/**
 * Lenis inertial scrolling plus smooth handling for in-page anchors.
 * Motion's `useScroll` reads `window.scrollY`, which Lenis drives natively,
 * so the two need no wiring between them.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  // Motion server-renders every `initial` state as an inline style, so a bundle
  // that fails to load would leave the page's text stuck at opacity 0. The
  // watchdog in the document head reveals everything if this never fires.
  useEffect(() => {
    document.documentElement.dataset.motionReady = "1";
    document.documentElement.classList.remove("motion-stalled");
  }, []);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      allowNestedScroll: true,
    });
    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    const onAnchorClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const destination = hash === "#top" ? 0 : document.querySelector(hash);
      if (destination === null) return;
      event.preventDefault();
      lenis.scrollTo(destination as HTMLElement, { duration: 1.15 });
    };

    document.addEventListener("click", onAnchorClick);

    const onScrollLock = (event: Event) => {
      const locked = Boolean((event as CustomEvent<boolean>).detail);
      if (locked) lenis.stop();
      else lenis.start();
    };
    window.addEventListener("portfolio-scroll-lock", onScrollLock);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("portfolio-scroll-lock", onScrollLock);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}

/** Acid bar across the top of the page, driven by total scroll progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      className="scroll-progress fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-acid"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

/**
 * Custom pointer.
 *
 * Two bodies, deliberately on different springs: a hard dot that tracks almost
 * exactly, and a ring that lags behind it. That lag is the whole effect — a
 * single element moving in lockstep just reads as a re-skinned system cursor.
 *
 * The ring paints with `mix-blend-mode: difference`, which is what makes one
 * cursor work across this site's alternating ink / paper / acid sections: it
 * inverts whatever is under it instead of needing a colour per section.
 *
 * The native cursor is hidden by a class this component puts on <html>, never
 * from static CSS — if the bundle fails to boot, the class is never added and
 * the visitor keeps a working system cursor rather than an invisible one.
 * Touch devices never mount it at all.
 */
export function CursorGlow() {
  const t = useT();
  const finePointer = useMediaQuery("(pointer: fine)");
  const reduced = useReducedMotion();
  const [state, setState] = useState<"idle" | "link" | "view">("idle");
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);

  // The dot is nearly rigid; the ring is looser and trails it.
  const dotX = useSpring(x, { stiffness: 1600, damping: 70, mass: 0.28 });
  const dotY = useSpring(y, { stiffness: 1600, damping: 70, mass: 0.28 });
  const ringX = useSpring(x, { stiffness: 380, damping: 34, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 380, damping: 34, mass: 0.6 });

  useEffect(() => {
    if (!finePointer) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };

    // Delegated, so anything rendered later still drives the cursor.
    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest?.("[data-cursor]")) setState("view");
      else if (target?.closest?.("a, button, [role='button']")) setState("link");
      else setState("idle");
    };

    const down = () => setPressed(true);
    const up = () => setPressed(false);
    // Leaving the window should take the cursor with it, or it strands
    // mid-screen while the real pointer is somewhere else entirely.
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    window.addEventListener("blur", leave);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      window.removeEventListener("blur", leave);
    };
  }, [finePointer, x, y]);

  if (!finePointer) return null;

  // Multipliers on a 34px base ring. The "view" swell used to be 5.2x — a
  // 200px disc that swallowed whole project cards. It only has to be wide
  // enough to seat the label.
  const ringSize = state === "view" ? 2.05 : state === "link" ? 1.45 : 1;
  const springy = { type: "spring", stiffness: 420, damping: 32, mass: 0.7 } as const;

  // Visibility is carried by a two-sided outline rather than a blend mode.
  // `mix-blend-difference` cannot work here: the cursor lives in a
  // position:fixed layer, fixed elements always form their own stacking
  // context, and a blended child can only blend against its own stacking
  // context — never the page underneath. So it silently did nothing, and the
  // near-white ring vanished over the paper and acid sections.
  //
  // The dark hairline is what shows on light ground; the acid halo is what
  // shows on ink. Together they cannot both disappear.
  // The dark hairline does the heavy lifting on the acid section, where the
  // ring's own acid border matches the background exactly and contributes
  // nothing — so it is weighted for that worst case, not for ink.
  const ringShadow =
    "0 0 0 1.5px rgba(11,13,12,0.62), 0 0 0 4px rgba(11,13,12,0.14), 0 0 24px 6px rgba(216,255,62,0.45)";
  const dotShadow = "0 0 0 1.5px rgba(11,13,12,0.6), 0 0 14px 3px rgba(216,255,62,0.75)";

  return (
    <div className="cursor-glow pointer-events-none fixed inset-0 z-[300] overflow-hidden" aria-hidden="true">
      {/* Soft halo. Sits under everything and is pure light — it is what makes
          the pointer readable against a busy photo or a dark card, and it is
          the only part that blurs. */}
      <motion.div
        className="absolute top-0 left-0 -mt-8 -ml-8 size-16 rounded-full bg-acid/30 blur-xl"
        style={{ x: reduced ? x : ringX, y: reduced ? y : ringY }}
        animate={{
          scale: (pressed ? 0.9 : 1) * (state === "view" ? 1.7 : state === "link" ? 1.25 : 1),
          opacity: visible ? (state === "idle" ? 0.75 : 1) : 0,
        }}
        transition={springy}
      />

      {/* Ring — trails the dot. Carries both outlines. */}
      <motion.div
        className="absolute top-0 left-0 -mt-[17px] -ml-[17px] size-[34px] rounded-full border"
        style={{ x: reduced ? x : ringX, y: reduced ? y : ringY, boxShadow: ringShadow }}
        animate={{
          scale: (pressed ? 0.88 : 1) * ringSize,
          opacity: visible ? 1 : 0,
          borderColor: state === "view" ? "rgba(216,255,62,0)" : "rgb(216 255 62)",
          backgroundColor: state === "view" ? "rgb(216 255 62)" : "rgba(216,255,62,0.08)",
        }}
        transition={springy}
      />

      {/* Dot — near-rigid, so the pointer still feels precise under the lag. */}
      <motion.div
        className="absolute top-0 left-0 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-acid"
        style={{ x: reduced ? x : dotX, y: reduced ? y : dotY, boxShadow: dotShadow }}
        animate={{
          scale: pressed ? 1.8 : state === "idle" ? 1 : 0,
          opacity: visible ? 1 : 0,
        }}
        transition={springy}
      />

      {/* Label rides the ring, so it lands with the swell rather than ahead of it. */}
      <motion.div
        className="absolute top-0 left-0 -mt-[17px] -ml-[17px] grid size-[34px] place-items-center"
        style={{ x: reduced ? x : ringX, y: reduced ? y : ringY }}
        animate={{ opacity: visible && state === "view" ? 1 : 0 }}
        transition={{ duration: 0.18, ease }}
      >
        <span className="text-[8px] font-extrabold tracking-[0.12em] text-ink uppercase">{t(copy.cursorView)}</span>
      </motion.div>
    </div>
  );
}

/**
 * Pulls its child toward the pointer while hovered. Renders a plain wrapper on
 * touch and for reduced-motion users so nothing shifts under a tap.
 */
export function Magnetic({
  children,
  strength = 0.2,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 14, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 14, mass: 0.4 });

  const active = finePointer && !reduced;

  const track = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!active) return;
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    x.set((event.clientX - bounds.left - bounds.width / 2) * strength);
    y.set((event.clientY - bounds.top - bounds.height / 2) * strength);
  };

  const release = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-flex ${className ?? ""}`}
      style={active ? { x: springX, y: springY } : undefined}
      onPointerMove={track}
      onPointerLeave={release}
    >
      {children}
    </motion.span>
  );
}

/**
 * Two-layer parallax for the hero: the ruled grid drifts one way while the
 * orbiting system mark rotates and sinks, both tied to hero scroll progress.
 */
export function useHeroParallax(target: React.RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end start"] });

  const gridY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const systemRotate = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const systemY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const systemScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  if (reduced) return { gridY: undefined, systemRotate: undefined, systemY: undefined, systemScale: undefined };
  return { gridY, systemRotate, systemY, systemScale };
}
