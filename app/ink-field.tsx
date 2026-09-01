"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { InkParticles } from "./ink-particles";

function wallDelay(period: number) {
  return `${-((Date.now() / 1000) % period).toFixed(3)}s`;
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
    ["--ink-dust-delay" as string]: wallDelay(22),
    ["--ink-fiber-delay" as string]: wallDelay(28),
    ["--ink-breathe-delay" as string]: wallDelay(16),
    ["--ink-grid-delay" as string]: wallDelay(18),
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
