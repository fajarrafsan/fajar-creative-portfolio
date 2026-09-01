"use client";

import { useReducedMotion } from "motion/react";

type Kind = "plus" | "sq" | "dot";
type Tone = "paper" | "acid" | "violet";

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
    const tone: Tone = id % 6 === 0 ? "acid" : id % 10 === 0 ? "violet" : "paper";
    return {
      id,
      x: `${(next() * 58 + 3).toFixed(2)}%`,
      y: `${(next() * 90 + 5).toFixed(2)}%`,
      kind,
      tone,
      duration: `${10 + next() * 9}s`,
      delay: `${(next() * 7).toFixed(2)}s`,
      dx: `${(next() * 14 - 4).toFixed(1)}px`,
      dy: `${(-22 - next() * 16).toFixed(1)}px`,
    };
  });
}

const TONE: Record<Tone, string> = {
  paper: "text-paper/28",
  acid: "text-acid/40",
  violet: "text-violet/28",
};

function Mark({ kind }: { kind: Kind }) {
  if (kind === "plus") {
    return (
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
        <path d="M4.5.5v8M.5 4.5h8" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  if (kind === "sq") {
    return <i className="block size-[3px] bg-current" />;
  }
  return <i className="block size-0.5 rounded-full bg-current" />;
}

export function InkParticles({
  className,
  seed = 20260822,
  count = 32,
  variant = "default",
  live = true,
}: {
  className?: string;
  seed?: number;
  count?: number;
  /** `copy` keeps motes on the text side so they do not sit on graph nodes. */
  variant?: "default" | "copy";
  /** Parent field pauses motes when off-screen. */
  live?: boolean;
}) {
  const reduced = Boolean(useReducedMotion());
  const motes = buildMotes(seed, count);
  const drifting = live && !reduced;
  const mask =
    variant === "copy"
      ? "[mask-image:linear-gradient(90deg,#000_0%,#000_34%,transparent_56%)] max-[1000px]:[mask-image:linear-gradient(180deg,#000_0%,#000_40%,transparent_76%)]"
      : "[mask-image:linear-gradient(90deg,#000_0%,#000_46%,transparent_74%)] max-[1000px]:[mask-image:linear-gradient(180deg,#000_0%,#000_58%,transparent_90%)]";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${mask} ${className ?? ""}`}
      aria-hidden="true"
    >
      {motes.map((mote) => (
        <span
          key={mote.id}
          className={`architecture-mote absolute ${TONE[mote.tone]} ${drifting ? "is-live" : ""}`}
          style={{
            left: mote.x,
            top: mote.y,
            "--mote-dur": mote.duration,
            "--mote-delay": mote.delay,
            "--mote-x": mote.dx,
            "--mote-y": mote.dy,
          }}
        >
          <Mark kind={mote.kind} />
        </span>
      ))}
    </div>
  );
}
