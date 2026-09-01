"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { InkParticles } from "./ink-particles";

function seededDelay(seed: number, salt: number, period: number) {
  // Integer-only mixing keeps the server render and the browser's first render
  // byte-for-byte identical. Fields that share a seed also keep the same phase,
  // so the architecture and frontend backgrounds still read as one surface.
  let hash = (seed ^ Math.imul(salt, 0x9e3779b1)) >>> 0;
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;

  const offset = ((hash >>> 0) / 0x1_0000_0000) * period;
  return `${-offset.toFixed(3)}s`;
}

/**
 * Dark inverse of PaperField. Pattern layers sit on a plain absolute field
 * that scrolls WITH the architecture/frontend section — a realistic backdrop
 * that is left behind as the page moves, rather than a viewport-fixed wall.
 */
export function InkField({
  className,
  seed = 20260822,
  particles = 14,
}: {
  className?: string;
  seed?: number;
  particles?: number;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const inView = useInView(ref, { margin: "18% 0px" });
  const live = !reduced && inView;

  const phase: CSSProperties = {
    ["--ink-dust-delay" as string]: seededDelay(seed, 1, 22),
    ["--ink-fiber-delay" as string]: seededDelay(seed, 2, 28),
    ["--ink-breathe-delay" as string]: seededDelay(seed, 3, 16),
    ["--ink-grid-delay" as string]: seededDelay(seed, 4, 18),
  };

  return (
    <div
      ref={ref}
      className={`ink-field${live ? " is-live" : ""}${className ? ` ${className}` : ""}`}
      style={phase}
      aria-hidden="true"
    >
      <div className="ink-field-grid" />
      <div className="ink-field-ticks" />
      <div className="ink-field-fiber" />
      <div className="ink-field-dust" />
      <div className="ink-field-leak" />
      <div className="ink-field-vignette" />
      <InkParticles variant="copy" count={particles} seed={seed} live={live} />
    </div>
  );
}

/**
 * Shared ink wash for architecture + frontend. A plain relative group that
 * carries the ink `text-paper` styling only — each section paints its OWN
 * `InkField` onto its visible stage (architecture body, the sticky pin
 * viewport, the stacked mobile layout). Kept separate so the background is
 * never stretched across the frontend's long horizontal-pin track, which made
 * the dark band look "too long" while also scrolling naturally.
 */
export function MotionInk({ children }: { children: ReactNode }) {
  return (
    <div className="motion-ink relative text-paper" data-motion-ink>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
