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
  initial: { opacity: 0, y: 48 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -13% 0px" },
  transition: { duration: 0.72, ease },
} as const;

/** Parent/child pair for lists that should cascade rather than pop in together. */
export const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
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

export const profileItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export const profileChipParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const profileChip: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  shown: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease } },
};

export const profileWord: Variants = {
  hidden: { y: "108%", rotateX: -42, opacity: 0 },
  shown: (index: number) => ({
    y: "0%",
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.7, ease, delay: 0.04 + index * 0.045 },
  }),
};

/** Architecture diagram: core pops, routes draw outward, then nodes cascade. */
export const graphParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export const graphCore: Variants = {
  hidden: { scale: 0.7, opacity: 0 },
  shown: { scale: 1, opacity: 1, transition: { duration: 0.7, ease } },
};

export const graphRoute: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: { duration: 0.55, ease } },
};

export const graphNode: Variants = {
  hidden: { scale: 0.82, opacity: 0 },
  shown: { scale: 1, opacity: 1, transition: { duration: 0.5, ease } },
};

export const heroLine: Variants = {
  hidden: { y: "112%", rotate: 2, opacity: 0 },
  shown: (index: number) => ({
    y: "0%",
    rotate: 0,
    opacity: 1,
    transition: { duration: 1.05, ease, delay: 0.08 + index * 0.09 },
  }),
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
