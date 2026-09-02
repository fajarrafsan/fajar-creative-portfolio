"use client";

import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  graphBoxFrame,
  graphContentPhase,
  graphCore,
  graphCornerMark,
  graphFormationShell,
  graphNode,
  graphOrbitSpinUp,
  graphParent,
  graphProto,
  graphRing,
  graphRoute,
  graphSurface,
  useMediaQuery,
} from "./motion";
import { TechIcon } from "./tech-icons";
import { copy } from "./content";
import { dual, useT, type Dual } from "./i18n";

/**
 * Architecture diagram.
 *
 * Everything is laid out in one normalized 1000x1000 space. The SVG uses
 * `preserveAspectRatio="none"` and the HTML pieces (core disc, proto pills,
 * node cards) are positioned in percent of the same box, so both stretch
 * identically and a connector drawn to a node's coordinates always lands on
 * that node — at any frame aspect ratio.
 *
 * Visually this is the same node-card language as `HeroGraph` one section up
 * (flat ink panel, one hairline border, no rounded corners, no gradients or
 * drop shadows) rather than a separate style — they're the same family of
 * diagram and should read as one system.
 */

const CORE = { x: 500, y: 500, r: 130 }; // matches the core disc's w-[26%]

// The octagon's radius (360 units, set in the node coordinates below) leaves
// almost no horizontal slack for a wider card — but height has real room,
// since the card sits well clear of its diagonal neighbors vertically.
// Verified by brute-force search: this is close to the largest box (in
// either dimension) that still clears every neighbor, the frame edge, and
// the core disc by an 8-unit margin at every node position.
const CARD = { w: 232, h: 100 }; // desktop: 23.2% x 10.0%
const CARD_COMPACT = { w: 246, h: 138 }; // ≤1000px: 24.6% x 13.8% — same width ceiling, taller card breathes instead of cramming

export type GraphNode = {
  id: string;
  index: string;
  title: string;
  sub: Dual | string;
  proto: string;
  icon?: string;
  x: number;
  y: number;
  flow: "in" | "out" | "both";
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
  { id: "client", index: "01", title: "Client", sub: "React 19 SPA", proto: "HTTPS", x: 500, y: 140, flow: "in" },
  { id: "gateway", index: "02", title: "Gateway", sub: dual("Rute & amankan", "Route & secure"), proto: "HTTP", x: 245, y: 245, flow: "in" },
  { id: "auth", index: "03", title: "Auth", sub: "JWT / OAuth2", proto: "Bearer", x: 755, y: 245, flow: "both" },
  { id: "service", index: "04", title: "Service", sub: dual("Logika bisnis", "Business logic"), proto: "Bean", x: 860, y: 500, flow: "both" },
  { id: "data", index: "05", title: "Data", sub: "PostgreSQL", proto: "JDBC", x: 755, y: 755, flow: "out" },
  { id: "payments", index: "06", title: "Payments", sub: "Xendit", proto: "Webhook", x: 500, y: 860, flow: "in" },
  { id: "events", index: "07", title: "Events", sub: "RabbitMQ", proto: "AMQP", x: 245, y: 755, flow: "out" },
  { id: "cache", index: "08", title: "Cache", sub: "Redis", proto: "RESP", x: 140, y: 500, flow: "both" },
];

const frontendNodes: GraphNode[] = [
  { id: "views", index: "01", title: "Views", sub: dual("Layar SPA", "SPA screens"), proto: "UI", icon: "react", x: 500, y: 140, flow: "in" },
  { id: "components", index: "02", title: "Components", sub: dual("UI pakai-ulang", "Reusable UI"), proto: "JSX", icon: "javascript", x: 245, y: 245, flow: "in" },
  { id: "types", index: "03", title: "Types", sub: "TypeScript", proto: "TS", icon: "typescript", x: 755, y: 245, flow: "both" },
  { id: "styling", index: "04", title: "Styling", sub: "Tailwind v4", proto: "CSS", icon: "tailwind", x: 860, y: 500, flow: "both" },
  { id: "bundler", index: "05", title: "Bundler", sub: "Vite", proto: "ESM", icon: "vite", x: 755, y: 755, flow: "out" },
  { id: "checkout", index: "06", title: "Checkout", sub: "Xendit / Midtrans", proto: "SDK", icon: "card", x: 500, y: 860, flow: "in" },
  { id: "realtime", index: "07", title: "Realtime", sub: "WebSocket", proto: "STOMP", icon: "websocket", x: 245, y: 755, flow: "out" },
  { id: "auth", index: "08", title: "Auth", sub: "OAuth / JWT", proto: "Bearer", icon: "jwt", x: 140, y: 500, flow: "both" },
];

function connector(node: GraphNode, card: { w: number; h: number }) {
  const dx = CORE.x - node.x;
  const dy = CORE.y - node.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;

  // Connector line originates at the card's edge, not its center, so it
  // doesn't cut across the card body.
  const toVertical = ux === 0 ? Infinity : card.w / 2 / Math.abs(ux);
  const toHorizontal = uy === 0 ? Infinity : card.h / 2 / Math.abs(uy);
  const inset = Math.min(toVertical, toHorizontal);

  const from = { x: node.x + ux * inset, y: node.y + uy * inset };
  const to = { x: CORE.x - ux * (CORE.r + 5), y: CORE.y - uy * (CORE.r + 5) };
  return {
    from,
    to,
    mid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
    d: `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} L ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
  };
}

const pct = (v: number) => `${(v / 10).toFixed(2)}%`;
const ticks = [200, 400, 600, 800].flatMap((x) => [200, 400, 600, 800].map((y) => ({ x, y })));

// Four small L-shaped corner marks — thin and small like the profile
// portrait's frame corners, not oversized neon HUD brackets competing with
// the content.
const corners = [
  "M0 24 V0 H24",
  "M976 0 H1000 V24",
  "M1000 976 V1000 H976",
  "M24 1000 H0 V976",
];

function ArchitectureGraph({
  idPrefix,
  ariaLabel,
  coreTitle,
  coreSub,
  nodes,
  activeId,
  className,
}: ArchitectureGraphProps) {
  // Matches the section's own `max-[1000px]:grid-cols-1` breakpoint, so the
  // diagram switches to the roomier card at exactly the point its layout
  // already goes single-column. Desktop (`CARD`) is completely untouched.
  const compact = useMediaQuery("(max-width: 1000px)");
  const t = useT();
  const card = compact ? CARD_COMPACT : CARD;
  const legs = nodes.map((node) => ({ node, ...connector(node, card) }));
  // Same "(pointer: fine)" convention HeroGraph/Magnetic already use: without
  // it, a tap on a touch screen fires `whileHover` and the matching CSS
  // `:hover`, and neither reliably clears until the visitor taps elsewhere —
  // a card can be left looking "stuck" highlighted on mobile.
  const finePointer = useMediaQuery("(pointer: fine)");
  const reduced = Boolean(useReducedMotion());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dimSiblings = finePointer && !reduced && hoveredId !== null;
  const haloId = `${idPrefix}-halo`;
  const strokeId = `${idPrefix}-leg`;

  return (
    <motion.div
      variants={graphParent}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.3, margin: "0px 0px -12% 0px" }}
      className={`graph-frame relative isolate aspect-square overflow-hidden border border-paper/15 bg-ink-soft/85 ${className ?? ""}`}
      aria-label={ariaLabel}
    >
      <motion.div variants={graphFormationShell} className="absolute inset-0 -z-[2]">
        <motion.div
          variants={graphSurface}
          className="absolute inset-0 opacity-60 bg-[image:linear-gradient(rgba(240,239,232,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(240,239,232,0.15)_1px,transparent_1px)] bg-[size:40px_40px]"
          aria-hidden="true"
        />
        <motion.div
          variants={graphSurface}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,255,62,0.1),transparent_50%)]"
          aria-hidden="true"
        />
      </motion.div>

      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 z-[2] size-full" aria-hidden="true">
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

        {/* ACT ONE — the box forms: frame draws in, corner marks snap into
            place. Nothing else in the diagram is gated on this group, so it
            plays out completely before act two (below) begins. */}
        <motion.g>
          {/* Faint always-visible base edge, so the frame still reads even if
              JS is slow to hydrate — the animated rect above it is the actual
              "forming" moment, not the only thing holding the box together. */}
          <rect x="2" y="2" width="996" height="996" fill="none" stroke="#f0efe8" strokeOpacity="0.08" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <motion.rect
            variants={graphBoxFrame}
            x="2"
            y="2"
            width="996"
            height="996"
            fill="none"
            stroke="#d8ff3e"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />

          {corners.map((d, index) => (
            <motion.path key={d} variants={graphCornerMark} custom={index} d={d} stroke="#d8ff3e" strokeOpacity="0.7" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
          ))}

          {ticks.map((t) => (
            <path
              key={`${idPrefix}-${t.x}-${t.y}`}
              d={`M ${t.x - 6} ${t.y} H ${t.x + 6} M ${t.x} ${t.y - 6} V ${t.y + 6}`}
              stroke="#f0efe8"
              strokeOpacity="0.12"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </motion.g>

        {/* ACT TWO — the graph animates: halo, orbit rings, then wiring. Held
            back by `graphContentPhase`'s own delay until act one is done. */}
        <motion.g variants={graphContentPhase}>
          <motion.g variants={graphFormationShell}>
            <motion.circle variants={graphRing} cx={CORE.x} cy={CORE.y} r={CORE.r + 85} fill={`url(#${haloId})`} />

            <motion.g variants={graphOrbitSpinUp} className="origin-center [transform-box:view-box] [transform-origin:500px_500px]">
              <g className="graph-orbit origin-center animate-spin-slow">
                <circle cx={CORE.x} cy={CORE.y} r={CORE.r + 55} fill="none" stroke="#8d73ff" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="6 12" vectorEffect="non-scaling-stroke" />
                <circle cx={CORE.x} cy={CORE.y - CORE.r - 55} r="6" fill="#8d73ff" />
                <circle cx={CORE.x + CORE.r + 55} cy={CORE.y} r="5" fill="#ff613c" />
              </g>
            </motion.g>
            <motion.g variants={graphOrbitSpinUp} className="origin-center [transform-box:view-box] [transform-origin:500px_500px]">
              <g className="graph-orbit origin-center animate-spin-reverse">
                <circle cx={CORE.x} cy={CORE.y} r={CORE.r + 98} fill="none" stroke="#397cff" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 16" vectorEffect="non-scaling-stroke" />
                <circle cx={CORE.x - CORE.r - 98} cy={CORE.y} r="5" fill="#397cff" />
              </g>
            </motion.g>
          </motion.g>

          <motion.g variants={graphFormationShell}>
            {legs.map(({ node, d, to }, index) => (
              <g
                key={node.id}
                className="graph-leg transition-opacity duration-300"
                style={{ opacity: dimSiblings && hoveredId !== node.id ? 0.42 : 1 }}
              >
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
                <circle cx={to.x} cy={to.y} r="3.5" fill="#d8ff3e" fillOpacity="0.8" />
                <circle className="data-packet" r="4.5" fill="#d8ff3e">
                  <animateMotion
                    dur={`${2.8 + index * 0.3}s`}
                    repeatCount="indefinite"
                    keyPoints={node.flow === "out" ? "1;0" : "0;1"}
                    keyTimes="0;1"
                    calcMode="linear"
                  >
                    <mpath href={`#${idPrefix}-leg-${node.id}`} />
                  </animateMotion>
                  <animate attributeName="opacity" dur={`${2.8 + index * 0.3}s`} values="0;1;1;0" keyTimes="0;0.15;0.8;1" repeatCount="indefinite" />
                </circle>
              </g>
            ))}
          </motion.g>
        </motion.g>
      </svg>

      {/* ACT TWO, continued in HTML: core disc, protocol pills, node cards.
          `graphContentPhase` here is a second instance of the same variant
          used for the SVG half above — both start from the same delay, so
          the core and the wiring animate on the same clock. */}
      <motion.div variants={graphContentPhase} className="contents">
        {/* Central core disc — flat acid fill + soft glow, matching HeroGraph's core exactly. */}
        <motion.div
          variants={graphCore}
          style={{ x: "-50%", y: "-50%" }}
          className="graph-core absolute top-1/2 left-1/2 z-[5] flex aspect-square w-[26%] flex-col items-center justify-center rounded-full bg-acid text-ink shadow-[0_0_0_20px_rgba(216,255,62,0.06),0_0_80px_rgba(216,255,62,0.26)]"
        >
          <small className="font-mono text-[9px] tracking-[0.16em] uppercase opacity-70 max-[420px]:text-[7px]">{t(copy.graphCore)}</small>
          <strong className="font-display my-[2px] -mb-0.5 text-[clamp(17px,2.4vw,38px)] font-[780] leading-[0.88] tracking-[-0.065em] uppercase max-[420px]:text-[12px]">
            {coreTitle}
          </strong>
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase opacity-85 max-[420px]:text-[7px]">{coreSub}</span>
        </motion.div>

        {/* Protocol pills, floating at each connector's midpoint — kept out of
            the node card entirely so a card's title never has to share a row
            with a badge (that's what was truncating "Gateway"/"Payments"). */}
        <motion.div variants={graphFormationShell} className="contents">
          {legs.map(({ node, mid }) => (
            <motion.span
              key={`${node.id}-proto`}
              variants={graphProto}
              className="pointer-events-none absolute z-[4] -translate-x-1/2 -translate-y-1/2 border border-acid/25 bg-ink/90 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.12em] text-acid/80 uppercase max-[1000px]:hidden"
              style={{ left: pct(mid.x), top: pct(mid.y) }}
            >
              {node.proto}
            </motion.span>
          ))}
        </motion.div>

        {/* Outer node cards */}
        {nodes.map((node) => {
          const active = activeId === node.id;
          return (
            // The centering translate lives on this plain (non-motion)
            // wrapper, sized and positioned with ordinary CSS. It has to be
            // separate from the motion.div below: `graphNode` animates its
            // own `y` for the rise-in effect, and a variant's `y` silently
            // wins over a `style` y once the component mounts — put both on
            // the same element and the "-50%" centering never actually
            // applies, leaving every card offset from its true point (this
            // is what made the octagon look lopsided even with correct math).
            <div
              key={node.id}
              className={`absolute transition-opacity duration-300 ${hoveredId === node.id ? "z-[8]" : "z-[6]"}`}
              style={
                {
                  left: pct(node.x),
                  top: pct(node.y),
                  width: pct(card.w),
                  height: pct(card.h),
                  transform: "translate(-50%, -50%)",
                  // Unhovered siblings stay faintly visible — never 0. Touch
                  // skips this so a tap cannot leave the rest of the diagram blank.
                  opacity: dimSiblings && hoveredId !== node.id ? 0.46 : 1,
                } as CSSProperties
              }
              onPointerEnter={() => {
                if (finePointer) setHoveredId(node.id);
              }}
              onPointerLeave={() => {
                setHoveredId((current) => (current === node.id ? null : current));
              }}
            >
              <motion.div
                variants={graphNode}
                whileHover={finePointer ? { y: -3 } : undefined}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`graph-node flex size-full flex-col justify-center gap-1.5 overflow-hidden border px-2.5 py-2 backdrop-blur-sm transition-colors duration-250 max-[420px]:gap-1 max-[420px]:px-1.5 max-[420px]:py-1 ${
                  active || hoveredId === node.id
                    ? "border-acid bg-[#141a10]/95 text-acid"
                    : "border-paper/40 bg-ink/92 text-paper [@media(pointer:fine)]:hover:border-acid/45 [@media(pointer:fine)]:hover:bg-[#12150f]/95"
                }`}
              >
                <div className="flex min-w-0 items-baseline gap-1.5">
                  {/* The index only fits comfortably once the card itself has
                      room to spare — below ~420px it's the difference between
                      "Auth" fitting and "Auth" clipping to "Au…", so it drops
                      first rather than stealing width from the title. */}
                  <span className="hidden shrink-0 font-mono text-[9px] tracking-[0.06em] text-acid/70 min-[421px]:inline">{node.index}</span>
                  <strong className="min-w-0 flex-1 truncate text-[clamp(12px,1vw,15px)] font-semibold tracking-[-0.02em] text-paper max-[420px]:text-[9px]">
                    {node.title}
                  </strong>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-1.5 max-[420px]:gap-1">
                  <small className={`min-w-0 flex-1 truncate text-[9px] tracking-[0.05em] uppercase ${active || hoveredId === node.id ? "text-acid/75" : "text-[#9a9c92]"} max-[420px]:text-[7px]`}>
                    {t(node.sub)}
                  </small>
                  {node.icon ? <TechIcon name={node.icon} className="size-3 shrink-0 text-[#b7b9ae] max-[420px]:size-2.5" /> : null}
                </div>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export function SystemGraph() {
  const t = useT();
  return (
    <ArchitectureGraph
      idPrefix="be"
      coreTitle="SPRING"
      coreSub="BOOT"
      nodes={backendNodes}
      // Below 1000px the section stacks to a single column and this diagram
      // becomes its own full-width row, so it breaks out of the section's
      // side padding entirely (the `calc(50% - 50vw)` trick) instead of
      // sitting inside it shrunk down — every card gets real screen pixels
      // instead of a scaled-down copy of the desktop layout. Desktop's
      // `w-[min(100%,720px)]` sizing is untouched above 1000px.
      className="relative z-[3] w-[min(100%,720px)] justify-self-end min-[1001px]:max-[1200px]:w-[min(100%,620px)] max-[1000px]:mt-[50px] max-[1000px]:w-screen max-[1000px]:mx-[calc(50%-50vw)]"
      ariaLabel={t(copy.backendGraphAria)}
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
  const t = useT();
  return (
    <ArchitectureGraph
      idPrefix="fe"
      coreTitle="FRONT"
      coreSub="END"
      nodes={frontendNodes}
      activeId={activeId}
      className={className}
      ariaLabel={t(copy.frontendGraphAria)}
    />
  );
}
