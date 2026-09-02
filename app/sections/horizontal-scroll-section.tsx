"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { FrontEndGraph } from "./system-graph";
import { InkField } from "@/app/components/ink-field";
import { TechIcon } from "@/app/components/tech-icons";
import { copy, frontendArchitecture, type RichText } from "@/app/content";
import { useT, type Dual } from "@/app/lib/i18n";
import { archItem, archParent, archWord, ease, useLatchedInView } from "@/app/lib/motion";

export type HorizontalPanel = {
  number: string;
  title: Dual | string;
  body: Dual<RichText> | RichText;
  nodeId?: string;
  icons?: string[];
};

type HeadingLines = Dual<RichText[]>;

type HorizontalScrollSectionProps = {
  panels: HorizontalPanel[];
  kicker?: Dual | string;
  heading?: HeadingLines;
  id?: string;
};

/** Fallback until measure: last 16% of the pin track holds panel 05. */
const HOLD = 0.16;

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
          <em key={index} className="arch-token not-italic">
            {segment.text}
          </em>
        );
      })}
    </>
  );
}

function LineLockup({
  lines,
  id,
  shown,
  reduced,
  compact,
}: {
  lines: RichText[];
  id: string;
  shown: boolean;
  reduced: boolean;
  compact?: boolean;
}) {
  return (
    <h2
      id={id}
      className={
        compact
          ? "font-display m-0 text-[clamp(32px,3.6vw,56px)] leading-[0.88] font-[560] tracking-[-0.07em]"
          : "font-display m-0 text-[clamp(36px,10.4vw,52px)] leading-[0.88] font-[560] tracking-[-0.07em] max-[420px]:text-[clamp(32px,9.6vw,42px)]"
      }
    >
      {lines.map((line, lineIndex) => (
        <span
          className={`block overflow-hidden pt-[0.04em] pb-[0.1em] [perspective:800px] ${lineIndex === 1 ? "mt-[0.06em]" : ""}`}
          key={lineIndex}
        >
          <motion.span className="inline-block origin-bottom-left" variants={archWord} custom={lineIndex}>
            {line.map((segment, index) =>
              segment.tone === "acid" ? (
                <span key={index} className="relative text-acid">
                  <motion.span
                    className="absolute inset-x-[-0.02em] bottom-[0.06em] z-0 h-[2px] origin-left bg-acid"
                    initial={false}
                    animate={{ scaleX: shown ? 1 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.7, ease, delay: reduced || !shown ? 0 : 0.28 + lineIndex * 0.1 }}
                    aria-hidden="true"
                  />
                  <span className="relative z-[1]">{segment.text}</span>
                </span>
              ) : (
                <span key={index} className={segment.wrap === "sm" ? "max-[720px]:block" : undefined}>
                  {segment.text}
                </span>
              ),
            )}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

const pad = (value: number) => String(value).padStart(2, "0");
const PIN_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

/**
 * One continuous ink wash that reaches up over the architecture section above
 * (via `--ink-span`) so arsitektur-gerak and FE-arsitektur read as a single,
 * unbroken background — no seam where the two sections touch. The field is
 * anchored to the pin viewport (desktop) / stack (mobile) and extends upward
 * by exactly the architecture height, keeping the pattern aligned throughout.
 */
function InkFieldHost() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-0"
      style={{ top: "calc(-1 * var(--ink-span, 0px))", bottom: 0 }}
      aria-hidden="true"
    >
      <InkField seed={20260822} particles={0} />
    </div>
  );
}

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

/**
 * Emphasis window for one panel, in track progress.
 *
 * The strip translates on a single shared ramp, which moved every panel at
 * exactly the same rate and gave none of them a moment of their own — the
 * whole run read as a conveyor belt. The rotated card stack on 21st.dev
 * solves the same problem by handing each card its own `[start, end]` slice of
 * the scrub rather than one ramp for all of them; this does that horizontally.
 *
 * `holdAt` is where the strip finishes travelling and rests, so panel `i` is
 * centred at that fraction of the way through the travel — not at `i / total`,
 * which would drift out of step with the strip during the hold.
 */
/**
 * How firmly each panel decelerates into place.
 *
 * 0 is the raw linear ramp the strip used to run on — every panel crossing at
 * exactly the same speed, which is what made the run read as a conveyor belt.
 * 1 would be full smootherstep, which overshoots into feeling stuck between
 * panels. The blend below keeps the strip locked 1:1 to the wheel — no spring,
 * no lag — while letting each panel ease in and out of its slot.
 */
const SETTLE = 0.62;

function smootherstep(x: number) {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Linear travel, bent so each panel arrives and departs rather than sliding. */
function settleStep(f: number) {
  return f + (smootherstep(f) - f) * SETTLE;
}

function panelCentre(index: number, total: number, holdAt: number) {
  return total <= 1 ? 0 : (holdAt * index) / (total - 1);
}

function Panel({
  panel,
  paneWidth,
  headingPrefix,
  inert = false,
  progress,
  index = 0,
  total = 1,
  holdAt = 1,
}: {
  panel: HorizontalPanel;
  paneWidth?: number;
  headingPrefix: string;
  inert?: boolean;
  progress?: MotionValue<number>;
  index?: number;
  total?: number;
  holdAt?: number;
}) {
  const headingId = `${headingPrefix}-panel-${panel.number}`;
  const pin = typeof paneWidth === "number" && paneWidth > 0;
  const t = useT();
  const title = t(panel.title);
  const body = t(panel.body);

  // One panel's width, expressed in track progress — the distance over which
  // a panel goes from off-centre to centred.
  //
  // Floored above zero on purpose: `holdAt` is 0 until the pin has been
  // measured, and a zero span collapses the input range below to [0, 0, 0].
  // Motion requires those offsets to increase, so a degenerate range throws
  // "Offsets must be monotonically non-decreasing" and takes the section down.
  const span = Math.max(1e-4, total > 1 ? holdAt / (total - 1) : 1);
  const centre = panelCentre(index, total, holdAt);
  const zero = useMotionValue(0);
  const source = progress ?? zero;

  /**
   * Distance from this panel's centre, 0 (centred) to 1 (a full panel away).
   *
   * Written as a function rather than as a `[start, centre, end]` input range.
   * Motion compiles range-form transforms of a scroll value into native WAAPI
   * keyframes, whose offsets must be non-negative and increasing — and panel 0
   * is centred at progress 0, so its window opens at a negative offset. That
   * threw "Offsets must be monotonically non-decreasing" and took the whole
   * section down with it. The function form never reaches that machinery, and
   * the arithmetic is a subtraction per panel per frame.
   */
  // Eased, not linear: a panel holds its emphasis while it is near the centre
  // and then falls away smoothly, instead of starting to dim the instant it
  // moves. This is most of what separates "considered" from "mechanical".
  const away = (p: number) => {
    const d = Math.min(1, Math.abs(p - centre) / span);
    return d * d * (3 - 2 * d);
  };

  // Transform and opacity only — both ride the compositor, so the emphasis
  // costs nothing on top of the translation the strip is already doing.
  const emphasis = useTransform(source, (p) => 1 - 0.58 * away(p));
  const lift = useTransform(source, (p) => 26 * away(p));
  const swell = useTransform(source, (p) => 1 - 0.07 * away(p));

  return (
    <motion.article
      aria-labelledby={headingId}
      inert={inert || undefined}
      aria-hidden={inert || undefined}
      style={
        pin
          ? { flex: `0 0 ${paneWidth}px`, width: paneWidth,
              opacity: progress ? emphasis : 1,
              y: progress ? lift : 0,
              scale: progress ? swell : 1 }
          : undefined
      }
      className={
        pin
          ? "flex w-full shrink-0 flex-col justify-center gap-5 px-[3vw] py-2"
          : "flex w-full flex-col gap-5 border border-paper/15 bg-ink-soft/80 px-5 py-6 max-[420px]:px-[18px] max-[420px]:py-5"
      }
    >
      <span className="font-mono text-[12px] tracking-[0.16em] text-acid">{panel.number}</span>
      <h3
        id={headingId}
        className="font-display m-0 max-w-[16ch] text-[clamp(32px,4vw,56px)] leading-[0.88] font-[560] tracking-[-0.07em]"
      >
        {title}
      </h3>
      {panel.icons?.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={t(copy.panelTechAria)}>
          {panel.icons.map((icon) => (
            <li key={icon}>
              <span className="inline-flex min-h-11 items-center gap-2.5 border border-paper/20 px-3 py-2 text-acid">
                <TechIcon name={icon} className="size-[18px] shrink-0" />
                <span className="text-[11px] tracking-[0.1em] text-paper uppercase">
                  {ICON_LABELS[icon] ?? icon}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="m-0 max-w-[54ch] text-[18px] leading-[1.65] text-[#c4c6bc] max-[680px]:text-[16.5px] max-[680px]:leading-[1.62]">
        <RichBody segments={body} />
      </p>
    </motion.article>
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

function SectionChrome({
  kicker,
  heading,
  headingId,
  current,
  total,
  compact,
}: {
  kicker: string;
  heading?: RichText[];
  headingId: string;
  current: string;
  total: string;
  compact?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reduced, shown } = useLatchedInView(rootRef, {
    margin: "0px 0px -10% 0px",
    amount: 0.2,
  });
  const enter = shown ? "shown" : "hidden";
  const initial = shown ? false : reduced ? "shown" : "hidden";

  return (
    <motion.div
      ref={rootRef}
      className="relative z-[2] min-w-0"
      variants={archParent}
      initial={initial}
      animate={enter}
    >
      <div className={`flex items-end justify-between gap-6 ${compact ? "mb-3" : "mb-5"} max-[680px]:mb-4 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-3`}>
        <motion.p
          variants={archItem}
          className="m-0 flex min-w-0 items-center gap-2.5 text-[12px] tracking-[0.16em] text-acid uppercase"
        >
          <i className="size-1.5 shrink-0 bg-acid" aria-hidden="true" />
          <span className="truncate">{kicker}</span>
        </motion.p>
        <motion.p variants={archItem} className="m-0 shrink-0 font-mono text-[12px] tracking-[0.14em] text-acid tabular-nums">
          {current} / {total}
        </motion.p>
      </div>
      {heading ? <LineLockup lines={heading} id={headingId} shown={shown} reduced={reduced} compact={compact} /> : null}
    </motion.div>
  );
}

function StackLayout({
  panels,
  kicker,
  heading,
  headingId,
  id,
}: {
  panels: HorizontalPanel[];
  kicker: Dual | string;
  heading?: HeadingLines;
  headingId: string;
  id: string;
}) {
  const t = useT();
  const kickerLabel = t(kicker);
  const headingLines = heading ? t(heading) : undefined;
  return (
    <div className="frontend-stack relative px-[3vw] pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.75rem))] pb-[clamp(120px,22vw,180px)] max-[680px]:px-[18px] max-[420px]:px-3.5" data-frontend="stack">
      <InkFieldHost />
      <div className="relative z-[2] mb-[clamp(28px,4vw,48px)]">
        <SectionChrome
          kicker={kickerLabel}
          heading={headingLines}
          headingId={headingId}
          current={pad(1)}
          total={pad(panels.length)}
        />
      </div>
      <div className="relative z-[1]">
        <div className="mb-8 grid place-items-center">
          {/* `StackLayout` only ever mounts on mobile/touch (the desktop pin
              stage below uses a separate render path), so this can grow
              freely without any breakpoint gymnastics or desktop risk — the
              compact card (see system-graph.tsx) needs the extra width to
              not feel cramped. Still capped well under the panel column's
              width: it's a preview above the detail list, not the headline. */}
          <FrontEndGraph className="mx-auto w-[min(100%,340px)] max-[420px]:w-[min(90vw,300px)]" />
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
 * Pin math (desktop, fine pointer, motion allowed):
 *   pinH     = sticky viewport (100dvh, not 100svh)
 *   travel   = (panelCount - 1) * paneWidth
 *   holdPx   = 0.42 * pinH  — rest on panel 05, then unpin before #work
 *   trackH   = pinH + travel + holdPx
 *   x maps [0, travel/runway, 1] → [0, -travel, -travel] so 05 holds
 *     during holdPx instead of interpolating into empty space
 *
 * Sticky offset is top-0; inner chrome only clears the 64px + 10px site nav
 * (~5.5rem), not the old 7.5rem void that made the pin feel mistimed.
 *
 * Mobile / touch never mounts the pin stage. SSR and first paint are always
 * the stacked list so panels 02–05 cannot be clipped beside panel 01.
 */
export function HorizontalScrollSection({
  panels,
  kicker = frontendArchitecture.kicker,
  heading,
  id = "frontend",
}: HorizontalScrollSectionProps) {
  const t = useT();
  const reduced = Boolean(useReducedMotion());
  const desktop = useDesktopPin();
  const pin = desktop && !reduced;

  const trackRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [travel, setTravel] = useState(0);
  const [holdAt, setHoldAt] = useState(1 - HOLD);
  const [trackHeight, setTrackHeight] = useState<number | null>(null);
  const [paneWidth, setPaneWidth] = useState(0);
  const [active, setActive] = useState(0);
  const [archPad, setArchPad] = useState(0);

  // How far the architecture section above extends up. `InkFieldHost` uses
  // this as `--ink-span` so arch + frontend share ONE continuous background.
  useLayoutEffect(() => {
    const arch = document.getElementById("architecture");
    if (!arch) return;
    const measure = () => setArchPad(Math.round(arch.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(arch);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  /**
   * Strip travel, eased per panel.
   *
   * The range form `[0, holdAt, 1] -> [0, -travel, -travel]` moved every panel
   * at one constant rate. Walking the scrub in panel-space instead lets each
   * segment carry its own easing, so a panel decelerates as it centres and
   * picks up again as it leaves. Position still tracks scroll exactly — the
   * curve is reshaped, not delayed, so nothing drifts after the wheel stops.
   */
  const x = useTransform(scrollYProgress, (p) => {
    const steps = Math.max(1, panels.length - 1);
    if (travel <= 0 || holdAt <= 0) return 0;
    const u = Math.min(1, Math.max(0, p / holdAt)) * steps;
    const i = Math.min(steps - 1, Math.floor(u));
    return -(i + settleStep(u - i)) * (travel / steps);
  });

  useLayoutEffect(() => {
    if (!pin) return;

    const viewport = stickyRef.current;
    const strip = stripRef.current;
    const stage = stageRef.current;
    if (!viewport || !strip || !stage) return;

    const measure = () => {
      const pinH = viewport.clientHeight;
      const pane = stage.clientWidth;
      setPaneWidth(pane);
      const nextTravel = Math.max(0, pane * panels.length - pane);
      const holdPx = Math.round(pinH * 0.42);
      const runway = nextTravel + holdPx;
      setTravel(nextTravel);
      setHoldAt(runway > 0 ? nextTravel / runway : 1);
      setTrackHeight(pinH + runway);
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
    const content = holdAt <= 0 ? progress : Math.min(1, progress / holdAt);
    const index = Math.round(content * (panels.length - 1));
    setActive(Math.min(panels.length - 1, Math.max(0, index)));
  });

  const headingId = `${id}-title`;
  const total = pad(panels.length);
  const current = pad(active + 1);
  const headingLines = heading ? t(heading) : undefined;

  return (
    <section
      ref={trackRef}
      id={id}
      aria-labelledby={heading ? headingId : undefined}
      className="relative text-paper"
      style={{
        ...(pin && trackHeight ? { height: trackHeight } : {}),
        ["--ink-span" as string]: `${archPad}px`,
      }}
    >
      {pin ? (
        <div ref={stickyRef} className="frontend-pin relative sticky top-0 flex h-dvh max-h-dvh flex-col bg-transparent" data-frontend="pin">
          <InkFieldHost />
          <header className="relative z-[2] shrink-0 px-[3vw] pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.75rem))] pb-2">
            <SectionChrome
              kicker={t(kicker)}
              heading={headingLines}
              headingId={headingId}
              current={current}
              total={total}
              compact
            />
          </header>
          <div className="relative z-[1] grid min-h-0 flex-1 grid-cols-[minmax(240px,0.92fr)_minmax(280px,1.08fr)] items-stretch gap-x-8">
            <div ref={stageRef} className="min-h-0 overflow-hidden">
              <motion.div ref={stripRef} className="horizontal-pin-strip flex h-full will-change-transform" style={{ x }}>
                {panels.map((panel, index) => (
                  <Panel
                    key={panel.number}
                    panel={panel}
                    headingPrefix={`${id}-pin`}
                    paneWidth={paneWidth}
                    inert={index !== active}
                    progress={scrollYProgress}
                    index={index}
                    total={panels.length}
                    holdAt={holdAt}
                  />
                ))}
              </motion.div>
            </div>
            <div className="relative flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden py-4 pr-[3vw] pl-2 [container-type:size]">
              <FrontEndGraph
                activeId={panels[active]?.nodeId}
                className="h-auto max-h-full w-[min(100%,100cqh)] max-w-full"
              />
            </div>
          </div>
          <div className="relative z-[2] mx-[3vw] mt-2 mb-6 h-[3px] shrink-0 bg-paper/15" aria-hidden="true">
            <motion.span className="absolute inset-y-0 left-0 bg-acid" style={{ scaleX: scrollYProgress, originX: 0, width: "100%" }} />
          </div>
        </div>
      ) : (
        <StackLayout panels={panels} kicker={kicker} heading={heading} headingId={headingId} id={id} />
      )}
    </section>
  );
}
