"use client";

import { useReducedMotion } from "motion/react";

const COLORS = ["#d8ff3e", "#f0efe8", "#8d73ff"] as const;

function sineLane(y: number, amp: number, cycles: number, x0: number, x1: number) {
  const width = x1 - x0;
  const steps = 10;
  const tau = Math.PI * 2 * cycles;

  const at = (t: number) => {
    const x = x0 + width * t;
    const yy = y + Math.sin(t * tau) * amp;
    const slope = ((amp * tau) / width) * Math.cos(t * tau);
    return { x, y: yy, slope };
  };

  const first = at(0);
  let d = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
  for (let i = 1; i <= steps; i += 1) {
    const a = at((i - 1) / steps);
    const b = at(i / steps);
    const dx = b.x - a.x;
    d += ` C ${(a.x + dx / 3).toFixed(2)} ${(a.y + (a.slope * dx) / 3).toFixed(2)} ${(b.x - dx / 3).toFixed(2)} ${(b.y - (b.slope * dx) / 3).toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }
  return d;
}

const lanes = Array.from({ length: 6 }, (_, i) => {
  const color = COLORS[i % COLORS.length];
  return {
    id: i,
    d: sineLane(56 + i * 22, 16, 0.42, -28, 720),
    color,
    width: color === "#d8ff3e" ? 1.4 : 1.05,
    rail: color === "#d8ff3e" ? 0.14 : 0.07,
    flow: color === "#d8ff3e" ? 0.5 : 0.28,
    duration: `${20 + (i % 4) * 2.4}s`,
    delay: `${(i * 0.7).toFixed(2)}s`,
  };
});

export function BackgroundPaths({
  className,
  active = true,
}: {
  className?: string;
  active?: boolean;
}) {
  const reduced = Boolean(useReducedMotion());
  const live = Boolean(active) && !reduced;

  return (
    <div
      className={`hero-paths pointer-events-none absolute top-[20%] left-[38%] z-0 h-[22%] w-[26%] overflow-hidden transition-opacity duration-700 max-[1000px]:top-[16%] max-[1000px]:left-[8%] max-[1000px]:h-[22%] max-[1000px]:w-[42%] max-[680px]:top-[24%] max-[680px]:left-[4%] max-[680px]:h-[16%] max-[680px]:w-[48%] ${active ? "opacity-100 max-[680px]:opacity-30" : "opacity-0"} ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMinYMin slice"
        fill="none"
      >
        {lanes.map((lane) => (
          <g key={lane.id}>
            <path
              d={lane.d}
              stroke={lane.color}
              strokeWidth={lane.width}
              strokeOpacity={lane.rail}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className={live ? "hero-path-flow" : undefined}
              d={lane.d}
              pathLength={1}
              stroke={lane.color}
              strokeWidth={lane.width + 0.35}
              strokeOpacity={lane.flow}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
              style={
                live
                  ? {
                      strokeDasharray: "0.28 0.72",
                      animationDuration: lane.duration,
                      animationDelay: lane.delay,
                    }
                  : { strokeDasharray: "0.28 0.72", strokeDashoffset: 0.22 }
              }
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
