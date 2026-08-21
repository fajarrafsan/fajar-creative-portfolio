"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { artThemes, projects, type Project } from "./content";
import { useMediaQuery } from "./motion";
import { ArrowOut, Chevron } from "./tech-icons";

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
const LEAD = 0.12;
const TAIL = 0.14;
/**
 * Share of a segment spent moving. The remainder is dwell: the card sits still
 * and fully legible before the next one starts climbing over it. Without this
 * the middle card would reach full opacity for a single instant and immediately
 * begin leaving, so its copy could never actually be read.
 */
const MOVE = 0.6;

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

function ProjectCard({
  project,
  index,
  total,
  progress,
  inert,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  inert: boolean;
}) {
  const t = timings(index, total);
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const reduced = Boolean(useReducedMotion());

  // Incoming card rises from below, rests, then lifts a little and shrinks away.
  // The middle case needs both `enterEnd` and `exitStart` so it holds at 0%
  // through the dwell instead of drifting straight into its exit.
  const y = useTransform(
    progress,
    isFirst
      ? [0, t.exitStart, t.exitEnd]
      : isLast
        ? [0, t.enterStart, t.enterEnd]
        : [0, t.enterStart, t.enterEnd, t.exitStart, t.exitEnd],
    isFirst
      ? ["0%", "0%", "-8%"]
      : isLast
        ? ["108%", "108%", "0%"]
        : ["108%", "108%", "0%", "0%", "-8%"],
  );

  const scale = useTransform(
    progress,
    isLast ? [0, 1] : [0, t.exitStart, t.exitEnd],
    isLast ? [1, 1] : [1, 1, 0.94],
  );

  const rotate = useTransform(
    progress,
    isFirst ? [0, 1] : [0, t.enterStart, t.enterEnd],
    isFirst ? [0, 0] : [1.2, 1.2, 0],
  );

  // The card peels open from a slightly inset rectangle as it arrives.
  const clipInset = useTransform(
    progress,
    isFirst ? [0, 1] : [0, t.enterStart, t.enterEnd],
    isFirst ? [0, 0] : [10, 10, 0],
  );
  const clipPath = useTransform(
    clipInset,
    (v) => `inset(${v.toFixed(3)}% ${(v * 0.15).toFixed(3)}% 0% ${(v * 0.15).toFixed(3)}%)`,
  );

  const dimOpacity = useTransform(
    progress,
    isLast ? [0, 1] : [0, t.exitStart, t.exitEnd],
    isLast ? [0, 0] : [0, 0, 0.55],
  );

  // Copy fades in over the back half of the move, holds through the dwell, and
  // clears early on the way out so it never reads over the card behind it.
  const copyOpacity = useTransform(
    progress,
    isFirst
      ? [0, t.exitStart, t.exitStart + t.move * 0.45]
      : isLast
        ? [0, t.enterStart + t.move * 0.5, t.enterEnd]
        : [0, t.enterStart + t.move * 0.5, t.enterEnd, t.exitStart, t.exitStart + t.move * 0.45],
    isFirst ? [1, 1, 0] : isLast ? [0, 0, 1] : [0, 0, 1, 1, 0],
  );

  const artScale = useTransform(
    progress,
    isFirst ? [0, 1] : [0, t.enterStart, t.enterEnd],
    isFirst ? [1, 1] : [1.08, 1.08, 1],
  );

  return (
    <motion.article
      className="project-card group/art relative bg-paper md:absolute md:inset-[112px_0_24px] md:grid md:grid-rows-[minmax(0,1fr)_auto] md:overflow-hidden md:will-change-[transform,clip-path]"
      style={{ y, scale, rotate, clipPath, zIndex: index + 1 }}
      data-cursor
      {...(inert ? { inert: true } : {})}
    >
      <div
        className={`project-art relative h-[min(56vw,770px)] min-h-[520px] overflow-hidden md:h-full md:min-h-0 max-[680px]:h-[108vw] max-[680px]:min-h-0 ${artThemes[project.variant]}`}
        aria-hidden="true"
      >
        <motion.div
          className={`project-art-motion absolute grid place-items-center transition-[filter] duration-300 will-change-transform group-hover/art:saturate-[1.16] ${
            project.cover ? "inset-0" : "-inset-[8%]"
          }`}
          style={{ scale: artScale }}
        >
          {project.cover ? (
            <>
              <img
                src={project.cover}
                alt=""
                className="absolute inset-0 size-full object-cover object-[center_18%]"
              />
              <span className="absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-ink/25" />
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
        <span className="absolute inset-[3.5%_2.75%] z-[5] border border-current/25" />
        <i className="absolute top-[4.5%] left-[2.75%] z-[6] text-[clamp(16px,1.8vw,26px)] leading-none font-light not-italic">
          +
        </i>
        <span className="absolute right-[2.75%] bottom-[4.5%] z-[6] size-[9px] bg-current" />
      </div>

      <div className="project-meta grid grid-cols-[40px_minmax(0,1fr)_minmax(212px,0.28fr)] gap-x-6 border-t-2 border-ink pt-4 max-[680px]:grid-cols-[28px_minmax(0,1fr)]">
        <span className="pt-1.5 text-[11px] tracking-[0.08em]">{project.number}</span>
        <motion.div className="project-main min-w-0" style={{ opacity: copyOpacity }}>
          <p className="project-type mb-2.5 flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.12em] uppercase">
            <i className="h-px w-6 shrink-0 bg-current not-italic" aria-hidden="true" />
            {project.type}
          </p>
          <h3 className="font-display mb-3 flex items-center gap-3 text-[clamp(44px,5.6vw,88px)] leading-[0.84] font-bold tracking-[-0.07em] max-[680px]:text-[clamp(40px,12vw,60px)]">
            {project.title}
            <motion.span
              className="hidden size-[0.42em] shrink-0 place-items-center border-2 border-current p-[0.09em] md:grid"
              aria-hidden="true"
              animate={reduced ? undefined : { x: [0, 4, 0], y: [0, -4, 0] }}
              transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowOut className="size-full" />
            </motion.span>
          </h3>
          <p className="mb-3.5 line-clamp-3 max-w-[640px] text-[15px] leading-[1.55] text-[#4c4d46] md:mb-3 md:[@media(max-height:820px)]:line-clamp-2">
            {project.note}
          </p>
          <dl className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-ink/15 py-2.5 text-[9px] tracking-[0.11em] uppercase md:mb-3.5 md:[@media(max-height:820px)]:py-2">
            {project.metrics.map(([key, value]) => (
              <div className="flex items-baseline gap-2" key={key}>
                <dt className="m-0 text-[#84857c]">{key}</dt>
                <dd className="m-0 font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={`Teknologi ${project.title}`}>
            {project.stack.map((item) => (
              <li
                className="border border-ink/25 px-2.5 py-1.5 text-[9px] font-medium tracking-[0.1em] uppercase transition-colors duration-200 group-hover/art:border-ink/50"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          className="project-aside flex flex-col text-[10px] font-medium tracking-[0.11em] uppercase max-[680px]:col-start-2 max-[680px]:mt-4"
          style={{ opacity: copyOpacity }}
        >
          <span className="mb-3 flex items-baseline justify-between gap-4 text-[#4c4d46]">
            Year
            <span className="text-ink">{project.year}</span>
          </span>
          <div className="mt-auto flex flex-col max-[680px]:mt-3">
            {project.demo && (
              <a
                className="group/live relative mb-2 flex min-h-11 items-center justify-between gap-3 overflow-hidden border-2 border-ink bg-ink px-2.5 font-semibold text-acid transition-colors duration-250 hover:bg-acid hover:text-ink"
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
                  Live demo
                </span>
                <motion.span
                  className="relative grid size-4 shrink-0 place-items-center"
                  aria-hidden="true"
                  animate={reduced ? undefined : { x: [0, 4, 0], y: [0, -4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowOut className="size-3.5" />
                </motion.span>
              </a>
            )}
            {project.links.map(([label, href], linkIndex) => (
              <a
                className="group/link flex min-h-11 items-center justify-between gap-3 border-t border-ink/35 transition-colors duration-250 hover:border-ink hover:bg-ink hover:text-acid"
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="flex items-center transition-[padding] duration-250 group-hover/link:pl-3">
                  <i className="mr-2.5 not-italic opacity-45">{String(linkIndex + 1).padStart(2, "0")}</i>
                  {label}
                </span>
                <motion.span
                  className="mr-2.5 grid size-4 shrink-0 place-items-center"
                  aria-hidden="true"
                  animate={reduced ? undefined : { x: [0, 4, 0], y: [0, -4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowOut className="size-3.5" />
                </motion.span>
              </a>
            ))}
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

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end end"] });

  const step = (1 - LEAD - TAIL) / Math.max(1, total - 1);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(total - 1, Math.max(0, Math.round((p - LEAD) / step)));
    setActive((current) => (current === next ? current : next));
  });

  return (
    <div className="project-pin-shell mt-8">
      <div
        ref={stageRef}
        className="project-track relative md:h-(--track-height)"
        style={{ "--track-height": `${(total + 0.5) * 100}vh` } as React.CSSProperties}
      >
        <div className="project-stage relative z-[1] bg-paper md:sticky md:top-0 md:isolate md:h-svh md:min-h-[700px] md:overflow-hidden">
          <div
            className="project-stage-progress absolute inset-x-0 top-[84px] z-20 hidden grid-cols-[auto_minmax(90px,220px)_auto] items-center gap-3 text-[10px] tracking-[0.12em] text-ink md:grid"
            aria-hidden="true"
          >
            <span className="project-stage-current">{String(active + 1).padStart(2, "0")}</span>
            <span className="relative h-px bg-ink/25">
              <motion.i className="absolute inset-0 origin-left bg-ink" style={{ scaleX: scrollYProgress }} />
            </span>
            <span>{String(total).padStart(2, "0")}</span>
          </div>

          <div className="project-list grid gap-[clamp(100px,12vw,190px)] pt-8 md:absolute md:inset-0 md:block md:pt-0 max-[680px]:gap-[98px]">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.number}
                project={project}
                index={index}
                total={total}
                progress={scrollYProgress}
                inert={stacked && index !== active}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
