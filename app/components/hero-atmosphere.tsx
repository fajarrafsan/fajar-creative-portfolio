"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useMediaQuery } from "./motion";

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
  const springX = useSpring(pointerX, { stiffness: 48, damping: 26, mass: 1.05 });
  const springY = useSpring(pointerY, { stiffness: 48, damping: 26, mass: 1.05 });
  const bloomX = useTransform(springX, [-1, 1], [-12, 12]);
  const bloomY = useTransform(springY, [-1, 1], [-6, 6]);
  const floorX = useTransform(springX, [-1, 1], [4, -4]);
  const gridX = useTransform(springX, [-1, 1], [-3, 3]);

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
      <motion.div className="hero-atmosphere-backplane" style={variant === "hero" ? { x: gridX } : undefined} />
      <div className="hero-atmosphere-beam" />
      <motion.div
        className="hero-atmosphere-bloom"
        style={variant === "hero" ? { x: bloomX, y: bloomY } : undefined}
      />

      <motion.div
        className="hero-atmosphere-floor-wrap"
        style={variant === "hero" ? { x: floorX, y: scrollY } : undefined}
      >
        <div className="hero-atmosphere-floor" />
      </motion.div>

      <div className="hero-atmosphere-horizon" />

      <div className="hero-atmosphere-vignette" />
    </div>
  );
}
