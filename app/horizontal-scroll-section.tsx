"use client";

import { useEffect, useLayoutEffect, useRef, useState, type UIEvent } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { FrontEndGraph } from "./system-graph";
import { TechIcon } from "./tech-icons";

export type HorizontalPanel = {
  number: string;
  title: string;
  body: string;
  nodeId?: string;
  icons?: string[];
};

type Mode = "pin" | "swipe" | "stack";

type HorizontalScrollSectionProps = {
  panels: HorizontalPanel[];
  kicker?: string;
  heading?: string;
  id?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

function useDesktopPin() {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return matches;
}

/**
 * Sticky horizontal scroller driven by native vertical scroll.
 * Wheel and touchmove are never intercepted — Lenis/the browser keep the
 * document moving, and this component only maps that progress onto `x`.
 */
export function HorizontalScrollSection({
  panels,
  kicker = "Front-end architecture",
  heading,
  id = "frontend",
}: HorizontalScrollSectionProps) {
  const reduced = Boolean(useReducedMotion());
  const desktop = useDesktopPin();
  const mode: Mode = reduced ? "stack" : desktop ? "pin" : "swipe";

  const trackRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [travel, setTravel] = useState(0);
  const [trackHeight, setTrackHeight] = useState<number | null>(null);
  const [paneWidth, setPaneWidth] = useState(0);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Progress 0 = first panel flush left; progress 1 = last panel flush left.
  // `travel` is (stripWidth − viewportWidth), so the output range [0, −travel]
  // moves the strip one horizontal pixel per vertical pixel of leftover track.
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  useLayoutEffect(() => {
    // Stale measurements from a previous pin phase are harmless outside it:
    // `x`, pane width, and track height are only consumed while mode is "pin",
    // and re-entering pin re-runs this effect (mode is a dependency).
    if (mode !== "pin") return;

    const viewport = stickyRef.current;
    const strip = stripRef.current;
    const stage = stageRef.current;
    if (!viewport || !strip || !stage) return;

    const measure = () => {
      const viewportH = viewport.clientHeight;
      const viewportW = stage.clientWidth;
      setPaneWidth(viewportW);
      const stripW = viewportW * panels.length;
      const nextTravel = Math.max(0, stripW - viewportW);
      setTravel(nextTravel);
      // Sticky pane stays 100svh. Extra track height equals the horizontal
      // leftover, so the pin lasts exactly as long as the strip needs to move.
      setTrackHeight(viewportH + nextTravel);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(strip);
    observer.observe(stage);
    window.addEventListener("resize", measure);
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [mode, panels.length]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (mode !== "pin" || panels.length < 2) return;
    const index = Math.round(progress * (panels.length - 1));
    setActive(Math.min(panels.length - 1, Math.max(0, index)));
  });

  const onSwipeScroll = (event: UIEvent<HTMLDivElement>) => {
    const scroller = event.currentTarget;
    const width = scroller.clientWidth;
    if (!width) return;
    const index = Math.round(scroller.scrollLeft / width);
    setActive(Math.min(panels.length - 1, Math.max(0, index)));
  };

  const headingId = `${id}-title`;
  const total = pad(panels.length);
  const current = pad(active + 1);
  const activeNodeId = panels[active]?.nodeId;
  const graph = (
    <FrontEndGraph
      activeId={activeNodeId}
      className={
        mode === "pin"
          ? "h-auto max-h-full w-[min(100%,100cqh)] max-w-full"
          : mode === "swipe"
            ? "w-full max-w-[min(100%,380px)] max-[420px]:max-w-[260px]"
            : "mx-auto w-[min(100%,560px)]"
      }
    />
  );

  return (
    <section
      ref={trackRef}
      id={id}
      aria-labelledby={heading ? headingId : undefined}
      className="relative bg-ink bg-[image:radial-gradient(circle_at_78%_52%,rgba(216,255,62,0.08),transparent_34%)] text-paper"
      style={mode === "pin" && trackHeight ? { height: trackHeight } : undefined}
    >
      <div
        ref={stickyRef}
        className={
          mode === "pin"
            ? "sticky top-0 flex h-[100svh] flex-col overflow-hidden"
            : mode === "swipe"
              ? "flex min-h-[100svh] flex-col"
              : "flex flex-col px-[3vw] py-[clamp(72px,10vw,140px)] max-[680px]:px-[18px] max-[420px]:px-3.5"
        }
      >
        <header className="relative z-[2] flex shrink-0 items-center justify-between gap-3 px-[3vw] pt-[max(7.5rem,calc(env(safe-area-inset-top)+5.75rem))] pb-5 max-[680px]:px-[18px] max-[680px]:pt-[max(6.5rem,calc(env(safe-area-inset-top)+5rem))] max-[420px]:gap-2 max-[420px]:px-3.5">
          <p className="m-0 min-w-0 truncate text-[11px] tracking-[0.1em] text-acid uppercase">{kicker}</p>
          <p
            className="m-0 shrink-0 font-mono text-[11px] tracking-[0.14em] text-acid tabular-nums"
            aria-hidden="true"
          >
            {current} / {total}
          </p>
          <span className="sr-only">
            Panel {active + 1} dari {panels.length}
          </span>
        </header>

        {mode === "swipe" ? (
          <>
            {heading ? (
              <h2
                id={headingId}
                className="font-display mx-[3vw] mt-4 mb-6 max-w-[18ch] text-[clamp(26px,7vw,40px)] leading-[0.94] font-[560] tracking-[-0.06em] max-[680px]:mx-[18px] max-[420px]:mx-3.5 max-[420px]:text-[clamp(22px,6.8vw,26px)]"
              >
                {heading}
              </h2>
            ) : null}
            <div className="grid shrink-0 place-items-center px-[3vw] pt-1 pb-8 max-[680px]:px-[18px] max-[420px]:px-3.5 max-[420px]:pb-5">
              {graph}
            </div>
            <div
              className="min-h-0 flex-1 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              data-lenis-prevent
              onScroll={onSwipeScroll}
            >
              <div ref={stripRef} className="flex h-full min-h-[42svh]">
                {panels.map((panel) => (
                  <Panel key={panel.number} panel={panel} variant="swipe" headingPrefix={id} />
                ))}
              </div>
            </div>
          </>
        ) : mode === "stack" ? (
          <>
            {heading ? (
              <h2
                id={headingId}
                className="font-display mt-6 mb-10 max-w-[18ch] text-[clamp(28px,3.4vw,52px)] leading-[0.94] font-[560] tracking-[-0.06em]"
              >
                {heading}
              </h2>
            ) : null}
            <div className="mb-12 grid place-items-center">{graph}</div>
            <div>
              <motion.div ref={stripRef} className="flex flex-col gap-8">
                {panels.map((panel) => (
                  <Panel key={panel.number} panel={panel} variant="stack" headingPrefix={id} />
                ))}
              </motion.div>
            </div>
          </>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(240px,0.92fr)_minmax(280px,1.15fr)] items-stretch gap-x-8 px-0">
            <div className="flex min-h-0 min-w-0 flex-col justify-center gap-6 py-4">
              {heading ? (
                <h2
                  id={headingId}
                  className="font-display m-0 max-w-[16ch] shrink-0 px-[3vw] text-[clamp(28px,3vw,48px)] leading-[0.94] font-[560] tracking-[-0.06em]"
                >
                  {heading}
                </h2>
              ) : null}
              <div ref={stageRef} className="min-h-0 overflow-hidden">
                <motion.div
                  ref={stripRef}
                  className="horizontal-pin-strip flex will-change-transform"
                  style={{ x }}
                >
                  {panels.map((panel, index) => (
                    <Panel
                      key={panel.number}
                      panel={panel}
                      variant="pin"
                      headingPrefix={id}
                      paneWidth={paneWidth}
                      inert={index !== active}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
            <div className="relative flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden py-5 pr-[3vw] pl-2 [container-type:size]">
              {graph}
            </div>
          </div>
        )}

        {mode === "pin" ? (
          <div className="relative z-[2] mx-[3vw] mb-5 h-[3px] shrink-0 bg-paper/15 max-[680px]:mx-[18px] max-[420px]:mx-3.5" aria-hidden="true">
            <motion.span className="absolute inset-y-0 left-0 bg-acid" style={{ scaleX: scrollYProgress, originX: 0, width: "100%" }} />
          </div>
        ) : mode === "swipe" ? (
          <div className="relative z-[2] mx-[3vw] mb-4 h-[3px] shrink-0 bg-paper/15 max-[680px]:mx-[18px] max-[420px]:mx-3.5" aria-hidden="true">
            <span
              className="absolute inset-y-0 left-0 bg-acid"
              style={{
                width: `${panels.length > 1 ? (active / (panels.length - 1)) * 100 : 100}%`,
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

const ICON_LABELS: Record<string, string> = {
  react: "React",
  javascript: "JavaScript",
  typescript: "TypeScript",
  vite: "Vite",
  tailwind: "Tailwind",
  jwt: "JWT",
  websocket: "WebSocket",
  card: "Checkout",
};

function Panel({
  panel,
  variant,
  paneWidth,
  headingPrefix,
  inert = false,
}: {
  panel: HorizontalPanel;
  variant: Mode;
  paneWidth?: number;
  headingPrefix: string;
  inert?: boolean;
}) {
  const headingId = `${headingPrefix}-panel-${panel.number}`;
  const pin = variant === "pin";
  const swipe = variant === "swipe";

  return (
    <article
      aria-labelledby={headingId}
      inert={inert || undefined}
      aria-hidden={inert || undefined}
      style={pin && paneWidth ? { flex: `0 0 ${paneWidth}px`, width: paneWidth } : undefined}
      className={
        pin
          ? "flex w-full shrink-0 flex-col gap-4 px-[3vw] py-1"
          : swipe
            ? "flex min-h-[42svh] w-full min-w-full shrink-0 snap-start snap-always flex-col gap-4 border-r border-paper/12 px-[3vw] py-8 max-[680px]:px-[18px] max-[420px]:min-h-[36svh] max-[420px]:px-3.5 max-[420px]:py-6"
            : "flex flex-col gap-4 border border-paper/15 bg-ink-soft px-[clamp(20px,3vw,40px)] py-[clamp(28px,4vw,48px)]"
      }
    >
      <span className="font-mono text-[11px] tracking-[0.16em] text-acid">{panel.number}</span>
      <h3
        id={headingId}
        className="font-display m-0 max-w-[14ch] text-[clamp(30px,4.2vw,68px)] leading-[0.88] font-[620] tracking-[-0.07em] max-[420px]:text-[clamp(24px,7.4vw,30px)]"
      >
        {panel.title}
      </h3>
      {panel.icons?.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Teknologi pada panel ini">
          {panel.icons.map((icon) => (
            <li key={icon}>
              <span className="inline-flex min-h-11 items-center gap-2 border border-paper/20 px-3 py-2 text-acid">
                <TechIcon name={icon} className="size-[18px] shrink-0" />
                <span className="text-[10px] tracking-[0.1em] text-paper uppercase">
                  {ICON_LABELS[icon] ?? icon}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="m-0 max-w-[54ch] text-[16px] leading-[1.55] text-[#aeb0a8] max-[680px]:text-base">
        {panel.body}
      </p>
    </article>
  );
}
