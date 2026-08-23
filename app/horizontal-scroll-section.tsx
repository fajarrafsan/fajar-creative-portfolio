"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { InkParticles } from "./ink-particles";
import { FrontEndGraph } from "./system-graph";
import { TechIcon } from "./tech-icons";
import type { RichText } from "./content";

export type HorizontalPanel = {
  number: string;
  title: string;
  body: RichText;
  nodeId?: string;
  icons?: string[];
};

type HorizontalScrollSectionProps = {
  panels: HorizontalPanel[];
  kicker?: string;
  heading?: RichText;
  id?: string;
};

/** Renders the shared segment vocabulary: acid = the paragraph's punchline,
    strong = lifted names/entities on the dark card, dim = receding phrases. */
function RichBody({ segments }: { segments: RichText }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (!segment.tone) return <span key={index}>{segment.text}</span>;
        if (segment.tone === "acid")
          return (
            <strong key={index} className="font-semibold text-acid">
              {segment.text}
            </strong>
          );
        if (segment.tone === "dim")
          return (
            <span key={index} className="text-[#84867a]">
              {segment.text}
            </span>
          );
        return (
          <strong key={index} className="font-medium text-paper">
            {segment.text}
          </strong>
        );
      })}
    </>
  );
}

/** Display-heading variant: the anaphora words ("layar", "aksi") pick up the
    accent so the two parallel clauses read as one rhetorical shape. */
function AccentHeading({ segments }: { segments: RichText }) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.tone === "acid" ? (
          <span key={index} className="text-acid">
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}

const pad = (value: number) => String(value).padStart(2, "0");
const PIN_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

function useDesktopPin() {
  const [matches, setMatches] = useState(false);

  useLayoutEffect(() => {
    const media = window.matchMedia(PIN_QUERY);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return matches;
}

function Panel({
  panel,
  paneWidth,
  headingPrefix,
  inert = false,
}: {
  panel: HorizontalPanel;
  paneWidth?: number;
  headingPrefix: string;
  inert?: boolean;
}) {
  const headingId = `${headingPrefix}-panel-${panel.number}`;
  const pin = typeof paneWidth === "number" && paneWidth > 0;

  return (
    <article
      aria-labelledby={headingId}
      inert={inert || undefined}
      aria-hidden={inert || undefined}
      style={pin ? { flex: `0 0 ${paneWidth}px`, width: paneWidth } : undefined}
      className={
        pin
          ? "flex w-full shrink-0 flex-col gap-4 px-[3vw] py-1"
          : "flex w-full flex-col gap-4 border border-paper/15 bg-ink-soft px-4 py-5 max-[420px]:px-[18px] max-[420px]:py-6"
      }
    >
      <span className="font-mono text-[11px] tracking-[0.16em] text-acid">{panel.number}</span>
      <h3
        id={headingId}
        className="font-display m-0 max-w-[14ch] text-[clamp(24px,7.4vw,36px)] leading-[0.88] font-[620] tracking-[-0.07em] md:text-[clamp(30px,4.2vw,68px)]"
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
      <p className="m-0 max-w-[54ch] text-base leading-[1.55] text-[#aeb0a8]">
        <RichBody segments={panel.body} />
      </p>
    </article>
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

function StackLayout({
  panels,
  kicker,
  heading,
  headingId,
  id,
}: {
  panels: HorizontalPanel[];
  kicker: string;
  heading?: string;
  headingId: string;
  id: string;
}) {
  return (
    <div className="frontend-stack relative px-[3vw] pb-[clamp(96px,20vw,160px)] max-[680px]:px-[18px] max-[420px]:px-3.5">
      <InkParticles seed={20260823} className="z-0" />
      <header className="relative z-[2] flex items-center justify-between gap-3 pt-[max(6.5rem,calc(env(safe-area-inset-top)+5rem))] pb-5 max-[420px]:px-0">
        <p className="m-0 min-w-0 truncate text-[11px] tracking-[0.1em] text-acid uppercase">{kicker}</p>
        <p className="m-0 shrink-0 font-mono text-[11px] tracking-[0.14em] text-acid tabular-nums">
          {pad(1)} – {pad(panels.length)}
        </p>
      </header>
      <div className="relative z-[1]">
        {heading ? (
          <h2
            id={headingId}
            className="font-display mt-3 mb-8 max-w-[18ch] text-[clamp(22px,6.8vw,36px)] leading-[0.94] font-[560] tracking-[-0.06em]"
          >
            <AccentHeading segments={heading} />
          </h2>
        ) : null}
        <div className="mb-8 grid place-items-center">
          <FrontEndGraph className="mx-auto w-[min(100%,300px)] max-[420px]:w-[min(88vw,280px)]" />
        </div>
        <div className="flex flex-col gap-5">
          {panels.map((panel) => (
            <Panel key={`${id}-${panel.number}`} panel={panel} headingPrefix={id} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Sticky horizontal scroller driven by native vertical scroll.
 * Wheel and touchmove are never intercepted.
 *
 * Mobile / touch never mounts the pin stage. SSR and first paint are always
 * the stacked list so panels 02–05 cannot be clipped beside panel 01.
 */
export function HorizontalScrollSection({
  panels,
  kicker = "Front-end architecture",
  heading,
  id = "frontend",
}: HorizontalScrollSectionProps) {
  const reduced = Boolean(useReducedMotion());
  const desktop = useDesktopPin();
  const pin = desktop && !reduced;

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

  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  useLayoutEffect(() => {
    if (!pin) return;

    const viewport = stickyRef.current;
    const strip = stripRef.current;
    const stage = stageRef.current;
    if (!viewport || !strip || !stage) return;

    const measure = () => {
      const viewportH = viewport.clientHeight;
      const viewportW = stage.clientWidth;
      setPaneWidth(viewportW);
      const nextTravel = Math.max(0, viewportW * panels.length - viewportW);
      setTravel(nextTravel);
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
  }, [pin, panels.length]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!pin || panels.length < 2) return;
    const index = Math.round(progress * (panels.length - 1));
    setActive(Math.min(panels.length - 1, Math.max(0, index)));
  });

  const headingId = `${id}-title`;
  const total = pad(panels.length);
  const current = pad(active + 1);

  return (
    <section
      ref={trackRef}
      id={id}
      aria-labelledby={heading ? headingId : undefined}
      className="relative bg-ink bg-[image:radial-gradient(circle_at_78%_52%,rgba(216,255,62,0.08),transparent_34%)] text-paper"
      style={pin && trackHeight ? { height: trackHeight } : undefined}
    >
      {pin ? (
        <div ref={stickyRef} className="frontend-pin sticky top-0 flex h-[100svh] flex-col overflow-hidden">
          <InkParticles seed={20260824} className="z-0" />
          <header className="relative z-[2] flex shrink-0 items-center justify-between gap-3 px-[3vw] pt-[max(7.5rem,calc(env(safe-area-inset-top)+5.75rem))] pb-5">
            <p className="m-0 min-w-0 truncate text-[11px] tracking-[0.1em] text-acid uppercase">{kicker}</p>
            <p className="m-0 shrink-0 font-mono text-[11px] tracking-[0.14em] text-acid tabular-nums">
              {current} / {total}
            </p>
          </header>
          <div className="relative z-[1] grid min-h-0 flex-1 grid-cols-[minmax(240px,0.92fr)_minmax(280px,1.15fr)] items-stretch gap-x-8">
            <div className="flex min-h-0 min-w-0 flex-col justify-center gap-6 py-4">
              {heading ? (
                <h2
                  id={headingId}
                  className="font-display m-0 max-w-[16ch] shrink-0 px-[3vw] text-[clamp(28px,3vw,48px)] leading-[0.94] font-[560] tracking-[-0.06em]"
                >
                  <AccentHeading segments={heading} />
                </h2>
              ) : null}
              <div ref={stageRef} className="min-h-0 overflow-hidden">
                <motion.div ref={stripRef} className="horizontal-pin-strip flex will-change-transform" style={{ x }}>
                  {panels.map((panel, index) => (
                    <Panel
                      key={panel.number}
                      panel={panel}
                      headingPrefix={`${id}-pin`}
                      paneWidth={paneWidth}
                      inert={index !== active}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
            <div className="relative flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden py-5 pr-[3vw] pl-2 [container-type:size]">
              <FrontEndGraph
                activeId={panels[active]?.nodeId}
                className="h-auto max-h-full w-[min(100%,100cqh)] max-w-full"
              />
            </div>
          </div>
          <div className="relative z-[2] mx-[3vw] mb-5 h-[3px] shrink-0 bg-paper/15" aria-hidden="true">
            <motion.span className="absolute inset-y-0 left-0 bg-acid" style={{ scaleX: scrollYProgress, originX: 0, width: "100%" }} />
          </div>
        </div>
      ) : (
        <StackLayout panels={panels} kicker={kicker} heading={heading} headingId={headingId} id={id} />
      )}
    </section>
  );
}
