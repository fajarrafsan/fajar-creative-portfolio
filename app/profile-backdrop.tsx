"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useMediaQuery } from "./motion";

type Kind = "plus" | "sq" | "dot";
type Tone = "ink" | "acid" | "java";

type Mote = {
  id: number;
  x: string;
  y: string;
  kind: Kind;
  tone: Tone;
  duration: string;
  delay: string;
  dx: string;
  dy: string;
};

function rng(seed: number) {
  let t = seed + 1;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMotes(seed: number, count: number): Mote[] {
  const next = rng(seed);
  return Array.from({ length: count }, (_, id) => {
    const roll = next();
    const kind: Kind = roll < 0.34 ? "plus" : roll < 0.62 ? "sq" : "dot";
    const tone: Tone = id % 6 === 0 ? "acid" : id % 9 === 0 ? "java" : "ink";
    return {
      id,
      x: `${(next() * 96 + 2).toFixed(2)}%`,
      y: `${(next() * 92 + 4).toFixed(2)}%`,
      kind,
      tone,
      duration: `${11 + next() * 10}s`,
      delay: `${(next() * 8).toFixed(2)}s`,
      dx: `${(next() * 22 - 10).toFixed(1)}px`,
      dy: `${(-26 - next() * 18).toFixed(1)}px`,
    };
  });
}

const MOTE_TONE: Record<Tone, string> = {
  ink: "text-ink/18",
  acid: "text-acid/50",
  java: "text-java/30",
};

function Mark({ kind }: { kind: Kind }) {
  if (kind === "plus") {
    return (
      <svg width="8" height="8" viewBox="0 0 9 9" fill="none" aria-hidden="true">
        <path d="M4.5.5v8M.5 4.5h8" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  if (kind === "sq") {
    return <i className="block size-[3px] bg-current" />;
  }
  return <i className="block size-0.5 rounded-full bg-current" />;
}

/**
 * Modern animated backdrop for the paper profile section, styled after the
 * "smoke / aurora // drifting motes" treatments popular on 21st.dev but kept
 * light and on-brand.
 *
 * Layered over the existing PaperField grid (which still supplies the hairline
 * grid + vignette) it adds:
 *   1. three oversized, soft-gradient aurora blobs (acid / java / violet) with
 *      gentle scroll-parallax plus an ambient float,
 *   2. a soft pointer-reactive aureole (fine pointers only) that drifts toward
 *      the cursor, and
 *   3. a sparse field of drifting ink/acid/java motes so the section breathes.
 *
 * Every layer is pointer-events-none and aria-hidden. Reduced-motion removes
 * the parallax, the ambient float and the pointer glow, leaving a calm static
 * wash; touch devices never wire the pointer glow.
 */
export function ProfileBackdrop() {
  const reduced = Boolean(useReducedMotion());
  const finePointer = useMediaQuery("(pointer: fine)");
  const rootRef = useRef<HTMLDivElement>(null);
  const motes = buildMotes(20260823, 26);

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "end start"],
  });

  const blob0y = useTransform(scrollYProgress, [0, 1], [-60, 90]);
  const blob1y = useTransform(scrollYProgress, [0, 1], [50, -70]);
  const blob2y = useTransform(scrollYProgress, [0, 1], [20, -40]);

  const blobs = [
    {
      className:
        "left-[-18%] top-[-22%] size-[min(760px,64vw)] rounded-full bg-[radial-gradient(circle,rgba(216,255,62,0.5),transparent_62%)]",
      style: { y: reduced ? undefined : blob0y },
      float: { x: [0, 34, 0], y: [0, 26, 0] },
      floatDur: 17,
    },
    {
      className:
        "right-[-16%] top-[6%] size-[min(620px,54vw)] rounded-full bg-[radial-gradient(circle,rgba(255,97,60,0.34),transparent_64%)]",
      style: { y: reduced ? undefined : blob1y },
      float: { x: [0, -30, 0], y: [0, -22, 0] },
      floatDur: 21,
    },
    {
      className:
        "left-[22%] bottom-[-26%] size-[min(660px,58vw)] rounded-full bg-[radial-gradient(circle,rgba(141,115,255,0.26),transparent_64%)]",
      style: { y: reduced ? undefined : blob2y },
      float: { x: [0, 40, 0], y: [0, 30, 0] },
      floatDur: 24,
    },
  ];

  // Pointer aureole. Springs lag the pointer like the site cursor, but far
  // larger and softer — a light "spotlight" on the paper field. Tracked on
  // window because the backdrop itself is pointer-events-none and sits under
  // the section content, so a pointer event can never target it directly.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const gx = useSpring(px, { stiffness: 60, damping: 20, mass: 1.2 });
  const gy = useSpring(py, { stiffness: 60, damping: 20, mass: 1.2 });

  const active = finePointer && !reduced;
  useEffect(() => {
    if (!active) return;
    const onMove = (event: PointerEvent) => {
      const bounds = rootRef.current?.getBoundingClientRect();
      if (!bounds) return;
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        return;
      px.set(event.clientX - bounds.left - bounds.width / 2);
      py.set(event.clientY - bounds.top - bounds.height / 2);
    };
    const onLeave = () => {
      px.set(0);
      py.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [active, px, py]);

  return (
    <div
      ref={rootRef}
      className="profile-backdrop pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Pointer aureole — soft spotlight, sits above blobs but below content. */}
      <motion.div
        className="absolute top-1/2 left-1/2 size-[min(720px,70vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(216,255,62,0.16),rgba(255,97,60,0.05),transparent_70%)] blur-2xl"
        style={active ? { left: "50%", top: "50%", x: gx, y: gy } : undefined}
      />

      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          style={blob.style}
        >
          <motion.div
            className={`absolute ${blob.className}`}
            animate={reduced ? undefined : { x: blob.float.x, y: blob.float.y }}
            transition={
              reduced
                ? undefined
                : { duration: blob.floatDur, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }
            }
          />
        </motion.div>
      ))}

      {/* Drifting motes — same cadence as the architecture motes, ink-toned. */}
      {motes.map((mote) => (
        <span
          key={mote.id}
          className={`profile-mote absolute ${MOTE_TONE[mote.tone]} ${reduced ? "" : "is-live"}`}
          style={{
            left: mote.x,
            top: mote.y,
            "--mote-dur": mote.duration,
            "--mote-delay": mote.delay,
            "--mote-x": mote.dx,
            "--mote-y": mote.dy,
          } as CSSProperties}
        >
          <Mark kind={mote.kind} />
        </span>
      ))}

      {/* Soft top glow to keep the section label legible against the blobs. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(240,239,232,0.92),transparent)]" />
    </div>
  );
}
