"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { graphCore, graphNode, graphParent, graphRoute } from "./motion";
import { TechIcon } from "./tech-icons";

/**
 * Architecture diagram.
 *
 * Everything is laid out in one normalized 1000x1000 space. The SVG uses
 * `preserveAspectRatio="none"` and the HTML pieces are positioned in percent of
 * the same box, so both stretch identically and a connector drawn to a node's
 * coordinates always lands on that node — at any frame aspect ratio.
 *
 * Text and the core disc stay as HTML: `preserveAspectRatio="none"` would shear
 * SVG text on any non-square frame.
 */

const CORE = { x: 500, y: 500, r: 150 }; // matches the disc's w-[30%]
const CARD = { w: 226, h: 108 };

export type GraphNode = {
  id: string;
  index: string;
  title: string;
  sub: string;
  proto: string;
  icon?: string;
  x: number;
  y: number;
  flow: "in" | "out" | "both";
  compact?: boolean;
};

type ArchitectureGraphProps = {
  idPrefix: string;
  ariaLabel: string;
  coreTitle: string;
  coreSub: string;
  nodes: GraphNode[];
  activeId?: string;
  className?: string;
};

const backendNodes: GraphNode[] = [
  { id: "client", index: "01", title: "Client", sub: "React 19 SPA", proto: "HTTPS", x: 500, y: 96, flow: "in" },
  { id: "gateway", index: "02", title: "Gateway", sub: "Route & secure", proto: "HTTP", x: 225, y: 168, flow: "in", compact: true },
  { id: "auth", index: "03", title: "Auth", sub: "JWT / OAuth2", proto: "Bearer", x: 775, y: 168, flow: "both", compact: true },
  { id: "service", index: "04", title: "Service", sub: "Business logic", proto: "Bean", x: 872, y: 500, flow: "both" },
  { id: "data", index: "05", title: "Data", sub: "PostgreSQL", proto: "JDBC", x: 775, y: 832, flow: "out", compact: true },
  { id: "payments", index: "06", title: "Payments", sub: "Xendit", proto: "Webhook", x: 500, y: 904, flow: "in" },
  { id: "events", index: "07", title: "Events", sub: "RabbitMQ", proto: "AMQP", x: 225, y: 832, flow: "out", compact: true },
  { id: "cache", index: "08", title: "Cache", sub: "Redis", proto: "RESP", x: 128, y: 500, flow: "both" },
];

const frontendNodes: GraphNode[] = [
  { id: "views", index: "01", title: "Views", sub: "SPA screens", proto: "UI", icon: "react", x: 500, y: 96, flow: "in" },
  { id: "components", index: "02", title: "Components", sub: "Reusable UI", proto: "JSX", icon: "javascript", x: 225, y: 168, flow: "in", compact: true },
  { id: "types", index: "03", title: "Types", sub: "TypeScript", proto: "TS", icon: "typescript", x: 775, y: 168, flow: "both", compact: true },
  { id: "styling", index: "04", title: "Styling", sub: "Tailwind v4", proto: "CSS", icon: "tailwind", x: 872, y: 500, flow: "both" },
  { id: "bundler", index: "05", title: "Bundler", sub: "Vite", proto: "ESM", icon: "vite", x: 775, y: 832, flow: "out", compact: true },
  { id: "checkout", index: "06", title: "Checkout", sub: "Xendit / Midtrans", proto: "SDK", icon: "card", x: 500, y: 904, flow: "in" },
  { id: "realtime", index: "07", title: "Realtime", sub: "WebSocket", proto: "STOMP", icon: "websocket", x: 225, y: 832, flow: "out", compact: true },
  { id: "auth", index: "08", title: "Auth", sub: "OAuth / JWT", proto: "Bearer", icon: "jwt", x: 128, y: 500, flow: "both" },
];

function connector(node: GraphNode) {
  const dx = CORE.x - node.x;
  const dy = CORE.y - node.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;

  const toVertical = ux === 0 ? Infinity : (CARD.w / 2 + 4) / Math.abs(ux);
  const toHorizontal = uy === 0 ? Infinity : (CARD.h / 2 + 4) / Math.abs(uy);
  const inset = Math.min(toVertical, toHorizontal);

  const from = { x: node.x + ux * inset, y: node.y + uy * inset };
  const to = { x: CORE.x - ux * (CORE.r + 4), y: CORE.y - uy * (CORE.r + 4) };
  return {
    from,
    to,
    mid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
    d: `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} L ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
  };
}

const pct = (v: number) => `${(v / 10).toFixed(2)}%`;
const ticks = [200, 400, 600, 800].flatMap((x) => [200, 400, 600, 800].map((y) => ({ x, y })));

function ArchitectureGraph({
  idPrefix,
  ariaLabel,
  coreTitle,
  coreSub,
  nodes,
  activeId,
  className,
}: ArchitectureGraphProps) {
  const legs = nodes.map((node) => ({ node, ...connector(node) }));
  const haloId = `${idPrefix}-halo`;
  const strokeId = `${idPrefix}-leg`;

  return (
    <motion.div
      variants={graphParent}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.3 }}
      className={`graph-frame relative isolate aspect-square overflow-hidden border border-paper/25 bg-ink-soft/85 ${className ?? ""}`}
      aria-label={ariaLabel}
    >
      <div
        className="absolute inset-0 -z-[2] opacity-65 bg-[image:linear-gradient(rgba(240,239,232,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(240,239,232,0.25)_1px,transparent_1px)] bg-[size:20%_20%]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-[1] bg-[radial-gradient(circle_at_center,rgba(216,255,62,0.1),transparent_45%)]"
        aria-hidden="true"
      />

      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 z-[2] size-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d8ff3e" stopOpacity="0.15" />
            <stop offset="55%" stopColor="#d8ff3e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#d8ff3e" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id={haloId}>
            <stop offset="60%" stopColor="#d8ff3e" stopOpacity="0" />
            <stop offset="100%" stopColor="#d8ff3e" stopOpacity="0.14" />
          </radialGradient>
        </defs>

        {ticks.map((t) => (
          <path
            key={`${idPrefix}-${t.x}-${t.y}`}
            d={`M ${t.x - 7} ${t.y} H ${t.x + 7} M ${t.x} ${t.y - 7} V ${t.y + 7}`}
            stroke="#f0efe8"
            strokeOpacity="0.16"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <circle cx={CORE.x} cy={CORE.y} r={CORE.r + 96} fill={`url(#${haloId})`} />

        <g className="graph-orbit origin-center animate-spin-slow">
          <circle
            cx={CORE.x}
            cy={CORE.y}
            r={CORE.r + 62}
            fill="none"
            stroke="#8d73ff"
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="6 10"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={CORE.x} cy={CORE.y - CORE.r - 62} r="7" fill="#8d73ff" />
          <circle cx={CORE.x + CORE.r + 62} cy={CORE.y} r="6" fill="#ff613c" />
        </g>
        <g className="graph-orbit origin-center animate-spin-reverse">
          <circle
            cx={CORE.x}
            cy={CORE.y}
            r={CORE.r + 108}
            fill="none"
            stroke="#397cff"
            strokeOpacity="0.32"
            strokeWidth="1"
            strokeDasharray="2 14"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={CORE.x - CORE.r - 108} cy={CORE.y} r="5" fill="#397cff" />
        </g>

        {legs.map(({ node, d, from, to }, index) => (
          <g key={node.id} className="graph-leg">
            <motion.path
              id={`${idPrefix}-leg-${node.id}`}
              className="graph-route"
              variants={graphRoute}
              d={d}
              fill="none"
              stroke={`url(#${strokeId})`}
              strokeWidth={activeId === node.id ? "2.4" : "1.5"}
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={from.x} cy={from.y} r="4" fill="#d8ff3e" fillOpacity="0.85" />
            <circle cx={to.x} cy={to.y} r="3" fill="#d8ff3e" fillOpacity="0.5" />
            <circle className="data-packet" r="5" fill="#d8ff3e">
              <animateMotion
                dur={`${2.8 + index * 0.35}s`}
                repeatCount="indefinite"
                keyPoints={node.flow === "out" ? "1;0" : "0;1"}
                keyTimes="0;1"
                calcMode="linear"
              >
                <mpath href={`#${idPrefix}-leg-${node.id}`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                dur={`${2.8 + index * 0.35}s`}
                values="0;1;1;0"
                keyTimes="0;0.15;0.8;1"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>

      <motion.div
        variants={graphCore}
        style={{ x: "-50%", y: "-50%" }}
        className="graph-core absolute top-1/2 left-1/2 z-[5] flex aspect-square w-[30%] flex-col items-center justify-center rounded-full bg-acid text-ink shadow-[0_0_0_24px_rgba(216,255,62,0.05),0_0_90px_rgba(216,255,62,0.2)]"
      >
        <small className="text-[8px] tracking-[0.14em] uppercase max-[420px]:text-[7px]">Core</small>
        <strong className="my-[3px] -mb-0.5 text-[clamp(18px,2.6vw,42px)] leading-[0.9] tracking-[-0.065em] max-[420px]:text-[13px]">
          {coreTitle}
        </strong>
        <span className="text-[8px] tracking-[0.14em] uppercase max-[420px]:text-[7px]">{coreSub}</span>
      </motion.div>

      {legs.map(({ node, mid }) => (
        <span
          key={`${node.id}-proto`}
          className={`absolute z-[4] -translate-x-1/2 -translate-y-1/2 bg-ink/85 px-1.5 py-0.5 text-[8px] leading-none tracking-[0.14em] text-acid/80 uppercase max-[1000px]:hidden`}
          style={{ left: pct(mid.x), top: pct(mid.y) }}
          aria-hidden="true"
        >
          {node.proto}
        </span>
      ))}

      {nodes.map((node) => {
        const active = activeId === node.id;
        return (
          <motion.div
            key={node.id}
            variants={graphNode}
            className={`graph-node absolute z-[6] flex w-(--card-w) h-(--card-h) items-center gap-2 overflow-hidden border bg-ink/95 px-2.5 py-2 transition-colors duration-250 max-[680px]:gap-1 max-[680px]:px-1.5 max-[680px]:py-1 ${
              active ? "border-acid text-acid" : "border-paper/25 hover:border-acid hover:bg-[#171b16]"
            }`}
            style={{
              left: pct(node.x),
              top: pct(node.y),
              "--card-w": pct(CARD.w),
              "--card-h": pct(CARD.h),
              x: "-50%",
              y: "-50%",
            } as CSSProperties}
          >
            <span className="w-5 shrink-0 text-[9px] leading-none text-acid max-[420px]:hidden">{node.index}</span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[clamp(12px,1.05vw,16px)] leading-tight tracking-[-0.03em] max-[420px]:text-[10px]">
                {node.title}
              </strong>
              <small className={`mt-0.5 block truncate text-[8px] leading-tight tracking-[0.08em] uppercase max-[420px]:text-[7px] ${active ? "text-acid/80" : "text-[#96988f]"}`}>
                {node.sub}
              </small>
            </div>
            {node.icon ? (
              <span
                className={`grid size-7 shrink-0 place-items-center border max-[680px]:size-6 max-[420px]:hidden ${
                  active ? "border-acid/50 bg-acid/10" : "border-paper/15"
                }`}
              >
                <TechIcon
                  name={node.icon}
                  className={`size-3.5 max-[680px]:size-3 ${active ? "text-acid" : "text-[#c4c6bc]"}`}
                />
              </span>
            ) : null}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function SystemGraph() {
  return (
    <ArchitectureGraph
      idPrefix="be"
      coreTitle="SPRING"
      coreSub="BOOT"
      nodes={backendNodes}
      className="w-[min(100%,720px)] justify-self-end min-[1001px]:max-[1200px]:w-[min(100%,620px)] max-[1000px]:mx-auto max-[1000px]:mt-[50px]"
      ariaLabel="Diagram arsitektur: klien, gateway, autentikasi, service, data, cache, events, dan pembayaran mengelilingi inti Spring Boot"
    />
  );
}

export function FrontEndGraph({
  activeId,
  className,
}: {
  activeId?: string;
  className?: string;
}) {
  return (
    <ArchitectureGraph
      idPrefix="fe"
      coreTitle="FRONT"
      coreSub="END"
      nodes={frontendNodes}
      activeId={activeId}
      className={className}
      ariaLabel="Diagram arsitektur front-end: views, komponen, tipe, styling, bundler, auth, realtime, dan checkout mengelilingi inti Front End"
    />
  );
}
