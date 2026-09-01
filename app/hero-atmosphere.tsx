"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useMediaQuery } from "./motion";

const dust = [
  [8, 24, 11, 0.2],
  [18, 72, 14, 1.8],
  [27, 42, 12, 3.1],
  [37, 17, 15, 0.9],
  [46, 66, 13, 2.4],
  [56, 34, 16, 4.2],
  [64, 78, 12, 1.1],
  [72, 20, 14, 3.5],
  [79, 53, 17, 0.4],
  [86, 31, 13, 2.8],
  [91, 69, 15, 4.7],
  [96, 44, 11, 1.5],
] as const;

type HeroAtmosphereProps = {
  variant?: "hero" | "intro";
  scrollY?: MotionValue<string>;
};

export function HeroAtmosphere({ variant = "hero", scrollY }: HeroAtmosphereProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const finePointer = useMediaQuery("(pointer: fine)");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 62, damping: 22, mass: 0.8 });
  const springY = useSpring(pointerY, { stiffness: 62, damping: 22, mass: 0.8 });
  const bloomX = useTransform(springX, [-1, 1], [-34, 34]);
  const bloomY = useTransform(springY, [-1, 1], [-18, 18]);
  const floorX = useTransform(springX, [-1, 1], [16, -16]);
  const planeX = useTransform(springX, [-1, 1], [-12, 12]);
  const planeY = useTransform(springY, [-1, 1], [-8, 8]);

  useEffect(() => {
    if (variant === "intro" || reduced || !finePointer) return;

    const reset = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    const track = (event: PointerEvent) => {
      const bounds = rootRef.current?.getBoundingClientRect();
      if (!bounds || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        reset();
        return;
      }

      pointerX.set((event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2);
      pointerY.set(((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2);
    };

    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  }, [finePointer, pointerX, pointerY, reduced, variant]);

  return (
    <div ref={rootRef} className={`hero-atmosphere hero-atmosphere--${variant}`} aria-hidden="true">
      <div className="hero-atmosphere-base" />
      <motion.div className="hero-atmosphere-backplane" style={variant === "hero" ? { x: planeX } : undefined} />
      <div className="hero-atmosphere-beam hero-atmosphere-beam-wide" />
      <div className="hero-atmosphere-beam hero-atmosphere-beam-narrow" />
      <motion.div
        className="hero-atmosphere-bloom"
        style={variant === "hero" ? { x: bloomX, y: bloomY } : undefined}
      />

      <motion.div
        className="hero-atmosphere-floor-wrap"
        style={variant === "hero" ? { x: floorX, y: scrollY } : undefined}
      >
        <div className="hero-atmosphere-floor">
          <span className="hero-atmosphere-floor-glint" />
        </div>
      </motion.div>

      <div className="hero-atmosphere-horizon">
        <span />
      </div>

      <motion.div
        className="hero-atmosphere-plane hero-atmosphere-plane-back"
        style={variant === "hero" ? { x: planeX, y: planeY } : undefined}
      />
      <motion.div
        className="hero-atmosphere-plane hero-atmosphere-plane-front"
        style={variant === "hero" ? { x: bloomX, y: planeY } : undefined}
      />

      <div className="hero-atmosphere-dust">
        {dust.map(([x, y, duration, delay], index) => (
          <span
            key={`${x}-${y}`}
            style={
              {
                "--dust-x": `${x}%`,
                "--dust-y": `${y}%`,
                "--dust-duration": `${duration}s`,
                "--dust-delay": `-${delay}s`,
                "--dust-size": `${index % 4 === 0 ? 2 : 1}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="hero-atmosphere-vignette" />
    </div>
  );
}
