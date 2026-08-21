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

const lanes = Array.from({ length: 10 }, (_, i) => {
  const color = COLORS[i % COLORS.length];
  return {
    id: i,
    d: sineLane(96 + i * 40, 46, 0.7, -40, 1180),
    color,
    width: color === "#d8ff3e" ? 1.55 : 1.15,
    rail: color === "#d8ff3e" ? 0.16 : 0.09,
    flow: color === "#d8ff3e" ? 0.82 : 0.48,
    duration: `${18 + (i % 5) * 2.2}s`,
    delay: `${(i * 0.55).toFixed(2)}s`,
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
      className={`hero-paths pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(90deg,#000_0%,#000_48%,transparent_76%),linear-gradient(180deg,#000_0%,#000_60%,transparent_88%)] [mask-composite:intersect] [-webkit-mask-image:linear-gradient(90deg,#000_0%,#000_48%,transparent_76%),linear-gradient(180deg,#000_0%,#000_60%,transparent_88%)] [-webkit-mask-composite:source-in] ${className ?? ""}`}
      style={{ opacity: active ? 1 : 0, transition: "opacity 0.8s ease" }}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMinYMid slice"
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
