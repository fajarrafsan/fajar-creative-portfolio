"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue, type Variants } from "motion/react";
import {
  graphCore,
  graphFormationShell,
  graphNode,
  graphOrbitSpinUp,
  graphRing,
  graphSurface,
  heroGraphParent,
  useMediaQuery,
} from "@/app/lib/motion";
import { TechIcon } from "@/app/components/tech-icons";
import { useIntroReady } from "./intro";
import { copy } from "@/app/content";
import { useT } from "@/app/lib/i18n";

const CORE = { x: 500, y: 500, r: 128 };
const CARD = { w: 240, h: 90 };
const MAX_TILT = 6;

type Node = {
  id: string;
  label: string;
  mobileLabel: string;
  sub: string;
  icon: string;
  x: number;
  y: number;
  flow: "in" | "out";
};

const nodes: Node[] = [
  { id: "java", label: "Java", mobileLabel: "Java", sub: "SE / EE", icon: "java", x: 220, y: 500, flow: "in" },
  { id: "spring", label: "Spring", mobileLabel: "Spring", sub: "Boot API", icon: "springboot", x: 500, y: 220, flow: "in" },
  { id: "react", label: "React", mobileLabel: "React", sub: "19 SPA", icon: "react", x: 780, y: 500, flow: "out" },
  { id: "ts", label: "TypeScript", mobileLabel: "TS", sub: "Contracts", icon: "typescript", x: 500, y: 780, flow: "out" },
];

const mobileGraphCore: Variants = {
  hidden: { scale: 0.72, opacity: 0, filter: "blur(7px)" },
  shown: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 105, damping: 18, mass: 0.9 },
  },
};

const mobileGraphNode: Variants = {
  hidden: { scale: 0.86, opacity: 0, y: 10, filter: "blur(5px)" },
  shown: {
    scale: 1,
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 115, damping: 20, mass: 0.82 },
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function connector(node: Node) {
  const dx = CORE.x - node.x;
  const dy = CORE.y - node.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const toVertical = ux === 0 ? Infinity : (CARD.w / 2 + 6) / Math.abs(ux);
  const toHorizontal = uy === 0 ? Infinity : (CARD.h / 2 + 6) / Math.abs(uy);
  const inset = Math.min(toVertical, toHorizontal);
  const from = { x: node.x + ux * inset, y: node.y + uy * inset };
  const to = { x: CORE.x - ux * (CORE.r + 6), y: CORE.y - uy * (CORE.r + 6) };
  return {
    from,
    to,
    d: `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} L ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
  };
}

const legs = nodes.map((node) => ({ node, ...connector(node) }));
const pct = (v: number) => `${(v / 10).toFixed(2)}%`;

type HeroGraphProps = {
  rotate?: MotionValue<number>;
  y?: MotionValue<string>;
};

export function HeroGraph({ rotate, y }: HeroGraphProps) {
  const t = useT();
  const reduced = Boolean(useReducedMotion());
  const introReady = useIntroReady();
  const wideLayout = useMediaQuery("(min-width: 1001px)");
  const finePointer = useMediaQuery("(pointer: fine)");
  const tilt = wideLayout && finePointer && !reduced && introReady;
  const mobileMotion = !wideLayout && !reduced && introReady;
  const rootRef = useRef<HTMLDivElement>(null);
  const neutralRotate = useMotionValue(0);
  const mobileRotateTarget = useTransform(rotate ?? neutralRotate, (value) => value * 0.1);
  const mobileRotate = useSpring(mobileRotateTarget, { stiffness: 48, damping: 17, mass: 1.05 });
  const rotateX = useSpring(0, { stiffness: 160, damping: 22, mass: 0.5 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 22, mass: 0.5 });
  const tiltX = useTransform(rotateX, (value) => clamp(Number.isFinite(value) ? value : 0, -MAX_TILT, MAX_TILT));
  const tiltY = useTransform(rotateY, (value) => clamp(Number.isFinite(value) ? value : 0, -MAX_TILT, MAX_TILT));

  useEffect(() => {
    if (!tilt) return;

    const reset = () => {
      rotateX.set(0);
      rotateY.set(0);
    };

    const move = (event: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width < 32 || height < 32) {
        reset();
        return;
      }

      const bounds = el.getBoundingClientRect();
      const pad = 96;
      const near =
        event.clientX >= bounds.left - pad &&
        event.clientX <= bounds.right + pad &&
        event.clientY >= bounds.top - pad &&
        event.clientY <= bounds.bottom + pad;

      if (!near) {
        reset();
        return;
      }

      const px = clamp((event.clientX - bounds.left) / width - 0.5, -0.5, 0.5);
      const py = clamp((event.clientY - bounds.top) / height - 0.5, -0.5, 0.5);
      rotateY.set(px * MAX_TILT);
      rotateX.set(-py * MAX_TILT);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  }, [tilt, rotateX, rotateY]);

  return (
    <div
      ref={rootRef}
      className="hero-system pointer-events-none relative z-0 aspect-square w-[min(100%,40vw,560px)] max-[1000px]:w-[min(72vw,380px)] max-[680px]:w-[clamp(244px,76vw,320px)]"
      aria-hidden="true"
    >
      <motion.div
        className="size-full origin-center will-change-transform"
        style={wideLayout ? { rotate, y } : { rotate: mobileRotate }}
      >
        <motion.div
          className="relative size-full will-change-transform"
          initial={false}
          animate={mobileMotion
            ? {
                x: [0, 2.5, -1.5, 0],
                y: [0, -5, -1.5, 0],
                rotate: [0, 0.7, -0.45, 0],
                scale: [1, 1.009, 1.003, 1],
              }
            : { x: 0, y: 0, rotate: 0, scale: 1 }}
          transition={mobileMotion
            ? { duration: 8.8, repeat: Infinity, times: [0, 0.32, 0.7, 1], ease: [0.37, 0, 0.63, 1] }
            : { duration: 0.24, ease: "easeOut" }}
        >
          <motion.div
            variants={heroGraphParent}
            initial="hidden"
            animate={introReady ? "shown" : "hidden"}
            className="absolute inset-[2%] origin-center"
            style={tilt ? { rotateX: tiltX, rotateY: tiltY } : undefined}
          >
            {/* Backdrop + halo rings + orbit rings form first, as one self-contained
                stagger scope — see `graphFormationShell` in motion.tsx. This is what
                makes the diagram read as "built" rather than popping in whole. */}
            <motion.div variants={graphFormationShell} className="absolute inset-0">
              <motion.div
                variants={graphSurface}
                className="absolute inset-0 bg-[image:linear-gradient(rgba(240,239,232,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(240,239,232,0.12)_1px,transparent_1px)] bg-[size:16%_16%] opacity-70"
              />
              <motion.div
                variants={graphSurface}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,255,62,0.16),transparent_52%)]"
              />
              <motion.span variants={graphRing} className="absolute inset-0 rounded-full border border-acid/30" />
              <motion.span variants={graphRing} className="absolute inset-[11%] rounded-full border border-paper/10" />

              <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full" aria-hidden="true">
                <motion.g variants={graphOrbitSpinUp} className="origin-center [transform-box:view-box] [transform-origin:500px_500px]">
                  <g className="origin-center animate-spin-slow [transform-box:view-box] [transform-origin:500px_500px]">
                    <circle cx="500" cy="500" r="250" fill="none" stroke="#8d73ff" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="7 12" vectorEffect="non-scaling-stroke" />
                    <circle cx="500" cy="250" r="5" fill="#8d73ff" />
                    <circle cx="750" cy="500" r="4" fill="#397cff" />
                  </g>
                </motion.g>
                <motion.g variants={graphOrbitSpinUp} className="origin-center [transform-box:view-box] [transform-origin:500px_500px]">
                  <g className="origin-center animate-spin-reverse [transform-box:view-box] [transform-origin:500px_500px]">
                    <circle cx="500" cy="500" r="340" fill="none" stroke="#ff613c" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 14" vectorEffect="non-scaling-stroke" />
                    <circle cx="160" cy="500" r="4" fill="#ff613c" />
                    <circle cx="500" cy="840" r="5" fill="#d8ff3e" />
                  </g>
                </motion.g>
              </svg>
            </motion.div>

            <motion.svg
              viewBox="0 0 1000 1000"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 size-full"
              variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.1 } } }}
            >
              <defs>
                <linearGradient id="hero-leg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d8ff3e" stopOpacity="0.2" />
                  <stop offset="55%" stopColor="#d8ff3e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ff613c" stopOpacity="0.45" />
                </linearGradient>
              </defs>

              {legs.map(({ node, d, from, to }, index) => (
                <motion.g key={node.id} variants={wideLayout ? graphNode : mobileGraphNode}>
                  <motion.path
                    id={`hero-leg-${node.id}`}
                    variants={{
                      hidden: { pathLength: 0, opacity: 0 },
                      shown: { pathLength: 1, opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    d={d}
                    fill="none"
                    stroke="url(#hero-leg)"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx={from.x} cy={from.y} r="4" fill="#d8ff3e" />
                  <circle cx={to.x} cy={to.y} r="3" fill="#d8ff3e" fillOpacity="0.6" />
                  {!reduced ? (
                    <circle className="hero-packet" r="5" fill={index % 2 ? "#ff613c" : "#d8ff3e"}>
                      <animateMotion
                        dur={`${2.6 + index * 0.35}s`}
                        repeatCount="indefinite"
                        keyPoints={node.flow === "out" ? "1;0" : "0;1"}
                        keyTimes="0;1"
                        calcMode="linear"
                      >
                        <mpath href={`#hero-leg-${node.id}`} />
                      </animateMotion>
                      <animate
                        attributeName="opacity"
                        dur={`${2.6 + index * 0.35}s`}
                        values="0;1;1;0"
                        keyTimes="0;0.12;0.82;1"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ) : null}
                </motion.g>
              ))}
            </motion.svg>

            <motion.div
              variants={wideLayout ? graphCore : mobileGraphCore}
              style={{ x: "-50%", y: "-50%" }}
              className="absolute top-1/2 left-1/2 z-[4] flex aspect-square w-[28%] flex-col items-center justify-center rounded-full bg-acid text-ink shadow-[0_0_0_18px_rgba(216,255,62,0.06),0_0_70px_rgba(216,255,62,0.28)] max-[420px]:w-[26%] max-[420px]:shadow-[0_0_0_10px_rgba(216,255,62,0.06),0_0_42px_rgba(216,255,62,0.24)]"
            >
              <small className="text-[8px] tracking-[0.16em] uppercase max-[420px]:text-[6px]">{t(copy.graphCore)}</small>
              <strong className="text-[clamp(16px,2.2vw,36px)] leading-[0.86] tracking-[-0.07em] max-[420px]:text-[13px]">FULL</strong>
              <span className="text-[8px] tracking-[0.16em] uppercase max-[420px]:text-[6px]">Stack</span>
            </motion.div>

            {nodes.map((node) => (
              // The centering translate lives on this plain (non-motion)
              // wrapper, sized and positioned with ordinary CSS. It has to be
              // separate from the motion.div below: Framer's variants define
              // their own `y` for the rise-in effect, and a variant's `y`
              // silently wins over a `style` y once the component mounts —
              // put both on the same element and the "-50%" centering never
              // actually applies, leaving every card offset from its point.
              <div
                key={node.id}
                className="absolute z-[5] h-[min(44px,9%)] w-[min(158px,26%)] max-[420px]:h-8 max-[420px]:w-[29%]"
                style={{ left: pct(node.x), top: pct(node.y), transform: "translate(-50%, -50%)" }}
              >
                <motion.div
                  variants={wideLayout ? graphNode : mobileGraphNode}
                  className="flex size-full items-center gap-2 border border-paper/20 bg-ink/90 px-2 backdrop-blur-sm max-[420px]:gap-1 max-[420px]:px-1"
                >
                  <span className="grid size-7 shrink-0 place-items-center border border-acid/30 bg-acid/10 text-acid max-[680px]:size-6 max-[420px]:size-5">
                    <TechIcon name={node.icon} className="size-3.5 max-[680px]:size-3 max-[420px]:size-2.5" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-[12px] leading-none tracking-[-0.03em] max-[420px]:text-[9px]">
                      <span className="max-[420px]:hidden">{node.label}</span>
                      <span className="hidden max-[420px]:inline">{node.mobileLabel}</span>
                    </strong>
                    <small className="mt-1 block truncate text-[8px] tracking-[0.1em] text-[#96988f] uppercase max-[420px]:hidden">{node.sub}</small>
                  </span>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
