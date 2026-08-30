"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { artThemes, copy, projects, type Project } from "./content";
import anistreamCover from "./covers/anistream.jpg";
import glowmarketCover from "./covers/glowmarket.jpg";
import roomlyCover from "./covers/roomly.jpg";
import siaCover from "./covers/sia.jpg";
import { useMediaQuery } from "./motion";
import { useT, dual } from "./i18n";
import { PaperField } from "./paper-field";
import { ArrowOut, Chevron, SocialIcon } from "./tech-icons";

function bundledSrc(image: string | { src: string }) {
  return typeof image === "string" ? image : image.src;
}

const bundledCovers: Record<string, string> = {
  anistream: bundledSrc(anistreamCover),
  glowmarket: bundledSrc(glowmarketCover),
  roomly: bundledSrc(roomlyCover),
  sia: bundledSrc(siaCover),
};

const containCovers = new Set(["glowmarket", "sia"]);

/**
 * The stack is a tall scroll track with a sticky viewport inside it. Each card
 * reads the track's own progress and derives its transform from it, so the
 * whole sequence is a pure function of scroll position — nothing imperative,
 * and no pinning plugin involved.
 *
 * The budget is split into a lead-in, one segment per hand-off, and a tail, so
 * the first and last cards hold still at either end of the track.
 *
 * Below `md` and for `prefers-reduced-motion`, stylesheet rules marked
 * `!important` neutralise these inline transforms and the cards simply stack in
 * normal flow — see the matching blocks in globals.css.
 */
const LEAD = 0.18;
const TAIL = 0.1;
/**
 * Share of a segment spent moving. The remainder is dwell: the card sits still
 * and fully legible before the next one starts climbing over it. Kept under
 * half so the copy can actually be read, not just flashed.
 */
const MOVE = 0.36;
/** Incoming cards start just below the slot so a rotate never peeks a sliver. */
const ENTER_FROM = 106;
/** How far a settled previous card peeks above the current one, per layer. */
const PEEK = 3.45;
const PEEK_LAYERS = 2;
const SCALE_IN = 0.974;
const SCALE_RECESS = 0.022;
const ROTATE_IN = 0.7;
const DIM_BASE = 0.07;
const DIM_STEP = 0.04;
const DIM_MAX = 0.15;
const ART_ZOOM = 1.05;

export function timings(index: number, total: number) {
  const step = (1 - LEAD - TAIL) / Math.max(1, total - 1);
  const enterStart = LEAD + (index - 1) * step;
  const exitStart = LEAD + index * step;
  return {
    step,
    move: step * MOVE,
    enterStart,
    enterEnd: enterStart + step * MOVE,
    exitStart,
    exitEnd: exitStart + step * MOVE,
  };
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** C2 smootherstep — zero 1st/2nd derivative at the ends, so reverse scroll doesn't kick. */
function smootherstep(value: number) {
  const x = clamp01(value);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function unit(progress: number, start: number, duration: number) {
  if (duration <= 0) return progress >= start ? 1 : 0;
  return smootherstep((progress - start) / duration);
}

function layersAbove(progress: number, index: number, total: number) {
  if (index >= total - 1) return 0;
  let layers = 0;
  for (let i = index + 1; i < total; i++) {
    const t = timings(i, total);
    if (progress <= t.enterStart) break;
    layers += unit(progress, t.enterStart, t.move);
  }
  return Math.min(PEEK_LAYERS, layers);
}

function cardY(progress: number, index: number, total: number) {
  const t = timings(index, total);
  let enter = 0;
  if (index !== 0) {
    if (progress <= t.enterStart) enter = ENTER_FROM;
    else if (progress < t.enterEnd) enter = ENTER_FROM * (1 - unit(progress, t.enterStart, t.move));
    else enter = 0;
  }
  return `${enter - layersAbove(progress, index, total) * PEEK}%`;
}

function cardScale(progress: number, index: number, total: number) {
  const t = timings(index, total);
  if (index !== 0 && progress < t.enterEnd) {
    const u = progress <= t.enterStart ? 0 : unit(progress, t.enterStart, t.move);
    return SCALE_IN + (1 - SCALE_IN) * u;
  }
  return 1 - SCALE_RECESS * layersAbove(progress, index, total);
}

function cardRotate(progress: number, index: number, total: number) {
  if (index === 0) return 0;
  const t = timings(index, total);
  if (progress >= t.enterEnd) return 0;
  if (progress <= t.enterStart) return ROTATE_IN;
  return ROTATE_IN * (1 - unit(progress, t.enterStart, t.move));
}

function cardDim(progress: number, index: number, total: number) {
  if (index >= total - 1) return 0;
  const layers = layersAbove(progress, index, total);
  if (layers <= 0) return 0;
  return Math.min(DIM_MAX, DIM_BASE + DIM_STEP * layers);
}

function cardCopy(progress: number, index: number, total: number) {
  const t = timings(index, total);
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const fadeIn = t.move * 0.16;
  const fadeOut = t.move * 0.42;

  if (isFirst) {
    if (progress <= t.exitStart) return 1;
    return 1 - smootherstep((progress - t.exitStart) / fadeOut);
  }
  if (isLast) {
    if (progress >= t.enterEnd) return 1;
    if (progress <= t.enterStart + fadeIn) return 0;
    return smootherstep((progress - t.enterStart - fadeIn) / Math.max(0.0001, t.move - fadeIn));
  }
  if (progress <= t.enterStart + fadeIn) return 0;
  if (progress < t.enterEnd) {
    return smootherstep((progress - t.enterStart - fadeIn) / Math.max(0.0001, t.move - fadeIn));
  }
  if (progress <= t.exitStart) return 1;
  return 1 - smootherstep((progress - t.exitStart) / fadeOut);
}

function cardArtScale(progress: number, index: number, total: number) {
  if (index === 0) return 1;
  const t = timings(index, total);
  if (progress >= t.enterEnd) return 1;
  if (progress <= t.enterStart) return ART_ZOOM;
  return ART_ZOOM - (ART_ZOOM - 1) * unit(progress, t.enterStart, t.move);
}

function topCardIndex(progress: number, total: number) {
  for (let i = total - 1; i >= 1; i--) {
    if (progress > timings(i, total).enterStart) return i;
  }
  return 0;
}

function ProjectCard({
  project,
  index,
  total,
  progress,
  inert,
  stacked,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  inert: boolean;
  stacked: boolean;
}) {
  const translate = useT();
  const reduced = Boolean(useReducedMotion());
  const cover = bundledCovers[project.variant] ?? project.cover;

  const y = useTransform(progress, (p) => cardY(p, index, total));
  const scale = useTransform(progress, (p) => cardScale(p, index, total));
  const rotate = useTransform(progress, (p) => cardRotate(p, index, total));
  const dimOpacity = useTransform(progress, (p) => cardDim(p, index, total));
  const copyOpacity = useTransform(progress, (p) => cardCopy(p, index, total));
  const artScale = useTransform(progress, (p) => cardArtScale(p, index, total));
  const pointerEvents = useTransform(progress, (p) =>
    index === topCardIndex(p, total) ? "auto" : "none",
  );

  return (
    <motion.article
      className="project-card group/art relative min-w-0 overflow-hidden border-2 border-ink bg-paper md:absolute md:inset-[92px_0_36px] md:grid md:grid-rows-[minmax(0,1fr)_auto] md:overflow-hidden md:will-change-transform"
      style={{
        y,
        scale,
        rotate,
        originX: 0.5,
        originY: 0,
        zIndex: index + 1,
        pointerEvents: stacked ? pointerEvents : "auto",
      }}
      {...(inert ? { inert: true } : {})}
    >
      <div
        className={`project-art relative h-[min(56vw,770px)] min-h-[520px] overflow-hidden md:h-full md:min-h-0 max-[680px]:h-[108vw] max-[680px]:min-h-0 max-[420px]:h-[100vw] ${artThemes[project.variant]}`}
        data-cursor
        aria-hidden="true"
      >
        <motion.div
          className={`project-art-motion absolute grid place-items-center transition-[filter] duration-300 will-change-transform group-hover/art:saturate-[1.1] ${
            cover ? "inset-0" : "-inset-[8%]"
          }`}
          style={{ scale: artScale }}
        >
          {cover ? (
            <>
              <img
                src={cover}
                alt=""
                draggable={false}
                className={
                  containCovers.has(project.variant)
                    ? "pointer-events-none absolute inset-0 size-full object-contain object-center"
                    : "pointer-events-none absolute inset-0 size-full object-cover"
                }
                style={
                  containCovers.has(project.variant)
                    ? undefined
                    : { objectPosition: project.coverPosition ?? "50% 50%" }
                }
              />
              <span
                className={
                  project.variant === "glowmarket"
                    ? "absolute inset-0 bg-linear-to-t from-[#27180d]/20 via-transparent to-[#27180d]/8"
                    : project.variant === "sia"
                      ? "absolute inset-0 bg-linear-to-t from-[#12233a]/28 via-transparent to-[#12233a]/10"
                      : "absolute inset-0 bg-linear-to-t from-ink/42 via-ink/8 to-ink/14"
                }
              />
              {project.variant === "anistream" && (
                <>
                  <motion.span
                    className="absolute top-1/2 left-[3.5%] z-[4] grid size-12 place-items-center rounded-full border border-paper/35 bg-ink/70 text-paper max-[680px]:size-10"
                    style={{ y: "-50%" }}
                    animate={reduced ? undefined : { x: [0, -8, 0] }}
                    transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Chevron dir="left" className="size-5 max-[680px]:size-4" />
                  </motion.span>
                  <motion.span
                    className="absolute top-1/2 right-[3.5%] z-[4] grid size-12 place-items-center rounded-full bg-[#e11d2e] text-paper max-[680px]:size-10"
                    style={{ y: "-50%" }}
                    animate={reduced ? undefined : { x: [0, 8, 0] }}
                    transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Chevron dir="right" className="size-5 max-[680px]:size-4" />
                  </motion.span>
                </>
              )}
            </>
          ) : (
            <>
              {project.variant === "anistream" && (
                <>
                  <span className="absolute z-[1] aspect-square w-[62%] rounded-full border-[34px] border-current" />
                  <span className="absolute z-[2] h-0 w-0 translate-x-[10px] border-y-[45px] border-l-[72px] border-y-transparent border-l-paper" />
                </>
              )}
              {project.variant === "roomly" && (
                <>
                  <span className="absolute inset-[18%_24%] z-[1] rounded-[50%_50%_4px_4px] border-2 border-current" />
                  <span className="absolute z-[1] h-[84%] w-[18%] rotate-[23deg] bg-paper/75 mix-blend-screen" />
                </>
              )}
              {project.variant === "glowmarket" && (
                <>
                  <span className="absolute z-[1] aspect-square w-[55%] rounded-full border-2 border-current shadow-[inset_0_0_0_55px_rgba(255,235,158,0.22)]" />
                  <span className="absolute z-[1] h-[18%] w-[82%] rotate-[-19deg] rounded-full border-2 border-current" />
                </>
              )}
              <span className="art-disc absolute z-[1] aspect-square w-[44%] rounded-full bg-current opacity-15" />
              <span className="art-line-a absolute z-[3] h-px w-[122%] rotate-[19deg] bg-current" />
              <span className="art-line-b absolute z-[3] h-px w-[122%] rotate-[-24deg] bg-current" />
              <span className="art-window-one absolute left-[14%] z-[2] h-[58%] w-[28%] rotate-[10deg] border border-current" />
              <span className="art-window-two absolute right-[12%] z-[2] h-[30%] w-[38%] rotate-[-8deg] border border-current" />
              <strong className="font-display absolute bottom-[11.5%] left-[11.5%] z-[4] text-[clamp(88px,15vw,235px)] leading-[0.78] font-[820] tracking-[-0.13em] max-[680px]:text-[27vw]">
                {project.mark}
              </strong>
            </>
          )}
        </motion.div>
        <span className="pointer-events-none absolute inset-[2.5%_2%] z-[5] border border-current/20" />
        <i className="absolute top-[3.5%] left-[2%] z-[6] text-[clamp(15px,1.6vw,22px)] leading-none font-light not-italic">
          +
        </i>
        <span className="absolute right-[2%] bottom-[3.5%] z-[6] size-2 bg-current" />
      </div>

      <div className="project-meta">
        <motion.div className="project-main" style={{ opacity: copyOpacity }}>
          <div className="project-copy-head">
            <div className="project-kicker">
              <span className="project-number">{project.number}</span>
              <span className="project-kicker-rule" aria-hidden="true" />
              <span className="min-w-0">{translate(project.type)}</span>
            </div>
            <h3 className="font-display m-0 flex min-w-0 items-center gap-3 text-[clamp(36px,11vw,60px)] leading-[0.86] font-bold tracking-[-0.07em] md:text-[clamp(40px,4.2vw,68px)] max-[420px]:text-[clamp(28px,8.8vw,36px)]">
              {project.title}
              <span
                className="hidden size-[0.34em] shrink-0 place-items-center border-2 border-current p-[0.08em] opacity-70 transition-transform duration-250 group-hover/art:translate-x-[3px] group-hover/art:-translate-y-[3px] md:grid"
                aria-hidden="true"
              >
                <ArrowOut className="size-full" />
              </span>
            </h3>
          </div>
          <div className="project-copy-body">
            <p className="project-note">{translate(project.note)}</p>
            <ul className="project-metrics">
              {project.metrics.map(([label, value]) => (
                <li className="flex min-w-0 items-baseline gap-2" key={typeof label === "string" ? label : label.en}>
                  <span className="text-[#6f7068]">{translate(label)}</span>
                  <span className="font-semibold text-ink">{translate(value)}</span>
                </li>
              ))}
            </ul>
            <ul className="project-stack-list" aria-label={translate(dual(`Teknologi ${project.title}`, `${project.title} technologies`))}>
              {project.stack.map((item) => (
                <li
                  className="border border-ink/25 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.12em] whitespace-nowrap uppercase transition-colors duration-200 group-hover/art:border-ink/55"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        <motion.div className="project-aside" style={{ opacity: copyOpacity }}>
          <div className="project-year">
            <span>{translate(copy.year)}</span>
            <span className="project-year-value">{project.year}</span>
          </div>
          <div className="project-actions">
            {project.demo && (
              <a
                className="group/live relative mb-2 flex min-h-11 items-center justify-between gap-3 overflow-hidden border-2 border-ink bg-ink px-3.5 font-semibold tracking-[0.12em] text-acid uppercase transition-colors duration-250 hover:bg-acid hover:text-ink focus-visible:bg-acid focus-visible:text-ink"
                href={project.demo}
                target="_blank"
                rel="noreferrer"
              >
                <span
                  className="pointer-events-none absolute inset-y-0 -left-full w-1/2 animate-sheen bg-linear-to-r from-transparent via-acid/25 to-transparent"
                  aria-hidden="true"
                />
                <span className="relative flex items-center gap-2">
                  <i
                    className="size-[7px] shrink-0 animate-pulse-dot rounded-full bg-current not-italic"
                    aria-hidden="true"
                  />
                  {translate(copy.liveDemo)}
                </span>
                <span
                  className="relative grid size-4 shrink-0 place-items-center transition-transform duration-250 group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5"
                  aria-hidden="true"
                >
                  <ArrowOut className="size-3.5" />
                </span>
              </a>
            )}
            <div className="project-source">
              {project.links.map(([label, href], linkIndex) => {
                const github = href.includes("github.com");
                return (
                  <a
                    className="group/link flex min-h-11 items-center justify-between gap-3 border-t border-ink/30 px-2.5 text-[10px] font-medium tracking-[0.12em] uppercase transition-colors duration-250 first:border-t-0 hover:bg-ink hover:text-acid focus-visible:bg-ink focus-visible:text-acid"
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      {github ? (
                        <SocialIcon name="github" className="size-3.5 shrink-0 opacity-70" />
                      ) : (
                        <i className="not-italic opacity-45">{String(linkIndex + 1).padStart(2, "0")}</i>
                      )}
                      <span className="min-w-0">{label}</span>
                    </span>
                    <span
                      className="grid size-4 shrink-0 place-items-center transition-transform duration-250 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                      aria-hidden="true"
                    >
                      <ArrowOut className="size-3.5" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
      <motion.span
        className="project-dim pointer-events-none absolute inset-0 z-30 bg-ink"
        style={{ opacity: dimOpacity }}
      />
    </motion.article>
  );
}

export function ProjectStack() {
  const stageRef = useRef<HTMLDivElement>(null);
  const total = projects.length;
  const [active, setActive] = useState(0);
  // Cards only take turns on the pinned desktop stage; on mobile every card is
  // on screen in flow and must stay reachable by keyboard.
  const stacked = useMediaQuery("(min-width: 768px)");

  /**
   * Window-scroll progress of the track (`start start` → `end end`).
   * Motion's `useScroll({ target })` is accelerated via CSS view timelines in
   * Chromium, and those freeze at 0 when an ancestor uses `overflow-x: clip`
   * (html, body, and main all do). Sampling the track's box on animation
   * frames follows native scroll and Lenis without listening to a hijacked
   * wheel stream.
   */
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let frame = 0;
    let cancelled = false;
    let running = false;

    const tick = () => {
      if (cancelled || !running) return;
      const rect = el.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      scrollYProgress.set(range <= 0 ? 0 : clamp01(-rect.top / range));
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = Boolean(entry?.isIntersecting);
        if (next && !running) {
          running = true;
          frame = requestAnimationFrame(tick);
        } else if (!next && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [scrollYProgress]);
  const playhead = useTransform(scrollYProgress, (p) => `${(clamp01(p) * 100).toFixed(2)}%`);

  const step = (1 - LEAD - TAIL) / Math.max(1, total - 1);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // Flip the index at the midpoint of each hand-off, so the card that now
    // covers the stack is the one that can be focused and clicked.
    const u = (p - LEAD) / step;
    const next = Math.min(total - 1, Math.max(0, Math.floor(u + 1 - MOVE / 2)));
    setActive((current) => (current === next ? current : next));
  });

  return (
    <div className="project-pin-shell mt-8">
      <div
        ref={stageRef}
        className="project-track relative md:h-(--track-height)"
        style={{ "--track-height": `${(total + 1.2) * 100}vh` } as React.CSSProperties}
      >
        <div className="project-stage relative z-[1] bg-paper md:sticky md:top-0 md:isolate md:h-svh md:min-h-[700px] md:overflow-hidden">
          <div className="hidden md:contents">
            <PaperField variant="work" />
          </div>
          <div
            className="project-stage-progress pointer-events-none absolute inset-x-0 top-7 z-20 hidden grid-cols-[auto_minmax(120px,1fr)_auto_auto] items-center gap-4 text-[10px] tracking-[0.14em] text-ink uppercase md:grid"
            aria-hidden="true"
          >
            <span className="font-display text-[13px] font-semibold tracking-[0.08em] tabular-nums">
              {String(active + 1).padStart(2, "0")}
              <span className="mx-1.5 font-sans text-[10px] font-medium tracking-[0.14em] text-[#6f7068]">/</span>
              {String(total).padStart(2, "0")}
            </span>
            <span className="project-progress-rail">
              <motion.i className="project-progress-fill" style={{ scaleX: scrollYProgress }} />
              <motion.i className="project-progress-head" style={{ left: playhead }} />
            </span>
            <span className="max-w-[18ch] truncate text-[#4c4d46]">{projects[active]?.title}</span>
            <ol className="m-0 flex list-none items-center gap-1.5 p-0">
              {projects.map((project, index) => (
                <li
                  className={
                    index === active
                      ? "size-2 border border-ink bg-acid"
                      : index < active
                        ? "size-1.5 bg-ink"
                        : "size-1.5 border border-ink/40"
                  }
                  key={project.number}
                />
              ))}
            </ol>
          </div>

          <div className="project-list relative z-[1] grid gap-[clamp(100px,12vw,190px)] pt-8 md:absolute md:inset-0 md:block md:pt-0 max-[680px]:gap-[98px]">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.number}
                project={project}
                index={index}
                total={total}
                progress={scrollYProgress}
                inert={stacked && index !== active}
                stacked={stacked}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
