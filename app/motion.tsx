"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import Lenis from "lenis";

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

/** Parent/child pair for lists that should cascade rather than pop in together. */
export const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.18 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, x: -24 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.72, ease } },
};

/** Profile: short headline words, then copy and stats. Stagger stays under 50ms. */
export const profileParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

// A soft blur-to-focus riding along with the fade is what makes this read as
// "materializing" rather than a plain fade — a small touch, but it's the
// difference between a mechanical opacity tween and something that feels shot
// on camera with a rack focus.
export const profileItem: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
};

export const profileChipParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const profileChip: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 14, filter: "blur(4px)" },
  shown: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 22, mass: 0.6 },
  },
};

export const profileWord: Variants = {
  hidden: { y: "108%", rotateX: -42, opacity: 0, filter: "blur(4px)" },
  shown: (index: number) => ({
    y: "0%",
    rotateX: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease, delay: 0.04 + index * 0.045 },
  }),
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
 * Ring that trails the pointer and swells over anything marked `data-cursor`.
 * Only mounts for fine pointers, so touch devices pay nothing for it.
 */
export function CursorGlow() {
  const finePointer = useMediaQuery("(pointer: fine)");
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 900, damping: 60, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 900, damping: 60, mass: 0.35 });

  useEffect(() => {
    if (!finePointer) return;

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    // Delegated so cards rendered later still light the ring up.
    const over = (event: PointerEvent) =>
      setHovering(Boolean((event.target as HTMLElement | null)?.closest?.("[data-cursor]")));

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [finePointer, x, y]);

  if (!finePointer) return null;

  return (
    <motion.div
      className="cursor-glow pointer-events-none fixed top-0 left-0 z-[80] -ml-8 -mt-8"
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    >
      <motion.div
        className="grid size-16 place-items-center rounded-full border border-acid/45 bg-acid/10"
        animate={{
          scale: hovering ? 1.375 : 1,
          backgroundColor: hovering ? "rgb(216 255 62)" : "rgb(216 255 62 / 0.1)",
        }}
        transition={{ duration: 0.24, ease }}
      >
        <motion.span
          className="text-[9px] font-extrabold tracking-[0.12em] text-ink"
          animate={{ opacity: hovering ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          VIEW
        </motion.span>
      </motion.div>
    </motion.div>
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
