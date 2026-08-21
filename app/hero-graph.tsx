"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { graphCore, graphNode, graphParent, useMediaQuery } from "./motion";
import { TechIcon } from "./tech-icons";

const CORE = { x: 500, y: 500, r: 128 };
const CARD = { w: 240, h: 90 };
const MAX_TILT = 6;

type Node = {
  id: string;
  label: string;
  sub: string;
  icon: string;
  x: number;
  y: number;
  flow: "in" | "out";
};

const nodes: Node[] = [
  { id: "java", label: "Java", sub: "SE / EE", icon: "java", x: 155, y: 500, flow: "in" },
  { id: "spring", label: "Spring", sub: "Boot API", icon: "springboot", x: 500, y: 150, flow: "in" },
  { id: "react", label: "React", sub: "19 SPA", icon: "react", x: 845, y: 500, flow: "out" },
  { id: "ts", label: "TypeScript", sub: "Contracts", icon: "typescript", x: 500, y: 850, flow: "out" },
];

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
  scale?: MotionValue<number>;
};

export function HeroGraph({ rotate, y, scale }: HeroGraphProps) {
  const reduced = Boolean(useReducedMotion());
  const finePointer = useMediaQuery("(pointer: fine)");
  const tilt = finePointer && !reduced;
  const rootRef = useRef<HTMLDivElement>(null);
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
    <motion.div
      ref={rootRef}
      className="hero-system pointer-events-none absolute top-[10%] -right-[1vw] z-0 size-[clamp(320px,42vw,700px)] origin-center will-change-transform max-[1000px]:top-[18%] max-[1000px]:right-[-18vw] max-[1000px]:size-[70vw] max-[680px]:top-[22%] max-[680px]:right-[-26vw] max-[680px]:size-[82vw]"
      style={{ rotate, y, scale }}
      aria-hidden="true"
    >
      <div className="size-full [perspective:1200px]">
        <motion.div
          className="relative size-full origin-center [transform-style:preserve-3d]"
          style={tilt ? { rotateX: tiltX, rotateY: tiltY } : undefined}
        >
          <motion.div
            variants={graphParent}
            initial="hidden"
            animate="shown"
            className="relative size-full"
          >
            <div className="absolute inset-0 bg-[image:linear-gradient(rgba(240,239,232,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(240,239,232,0.12)_1px,transparent_1px)] bg-[size:16%_16%] opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,255,62,0.16),transparent_52%)]" />
            <span className="absolute inset-0 rounded-full border border-acid/30" />
            <span className="absolute inset-[11%] rounded-full border border-paper/10" />

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

              <g className="origin-center animate-spin-slow [transform-box:view-box] [transform-origin:500px_500px]">
                <circle cx="500" cy="500" r="250" fill="none" stroke="#8d73ff" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="7 12" vectorEffect="non-scaling-stroke" />
                <circle cx="500" cy="250" r="5" fill="#8d73ff" />
                <circle cx="750" cy="500" r="4" fill="#397cff" />
              </g>
              <g className="origin-center animate-spin-reverse [transform-box:view-box] [transform-origin:500px_500px]">
                <circle cx="500" cy="500" r="340" fill="none" stroke="#ff613c" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 14" vectorEffect="non-scaling-stroke" />
                <circle cx="160" cy="500" r="4" fill="#ff613c" />
                <circle cx="500" cy="840" r="5" fill="#d8ff3e" />
              </g>

              {legs.map(({ node, d, from, to }, index) => (
                <motion.g key={node.id} variants={graphNode}>
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
              variants={graphCore}
              style={{ x: "-50%", y: "-50%" }}
              className="absolute top-1/2 left-1/2 z-[4] flex aspect-square w-[28%] flex-col items-center justify-center rounded-full bg-acid text-ink shadow-[0_0_0_18px_rgba(216,255,62,0.06),0_0_70px_rgba(216,255,62,0.28)]"
            >
              <small className="text-[8px] tracking-[0.16em] uppercase">Core</small>
              <strong className="text-[clamp(16px,2.2vw,36px)] leading-[0.86] tracking-[-0.07em]">FULL</strong>
              <span className="text-[8px] tracking-[0.16em] uppercase">Stack</span>
            </motion.div>

            {nodes.map((node) => (
              <motion.div
                key={node.id}
                variants={graphNode}
                className="absolute z-[5] flex h-[min(44px,12%)] w-[min(158px,32%)] items-center gap-2 border border-paper/20 bg-ink/90 px-2 backdrop-blur-sm"
                style={{
                  left: pct(node.x),
                  top: pct(node.y),
                  x: "-50%",
                  y: "-50%",
                }}
              >
                <span className="grid size-7 shrink-0 place-items-center border border-acid/30 bg-acid/10 text-acid max-[680px]:size-6">
                  <TechIcon name={node.icon} className="size-3.5 max-[680px]:size-3" />
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-[12px] leading-none tracking-[-0.03em]">{node.label}</strong>
                  <small className="mt-1 block truncate text-[8px] tracking-[0.1em] text-[#96988f] uppercase">{node.sub}</small>
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
