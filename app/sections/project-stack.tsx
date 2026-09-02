"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { artThemes, copy, projects, utilityProjects, type Project, type UtilityProject } from "./content";
import anistreamCover from "./covers/anistream.webp";
import arunikaCover from "./covers/arunika.webp";
import glowmarketCover from "./covers/glowmarket.webp";
import goldPriceCover from "./covers/gold-price.webp";
import roomlyCover from "./covers/roomly.webp";
import siaCover from "./covers/sia.webp";
import { LatchedReveal, ease, useMediaQuery } from "./motion";
import { useT, dual } from "./i18n";
import { PaperField } from "./paper-field";
import { ArrowOut, Chevron, SocialIcon } from "./tech-icons";

function bundledSrc(image: string | { src: string }) {
  return typeof image === "string" ? image : image.src;
}

const bundledCovers: Record<string, string> = {
  anistream: bundledSrc(anistreamCover),
  arunika: bundledSrc(arunikaCover),
  glowmarket: bundledSrc(glowmarketCover),
  goldprice: bundledSrc(goldPriceCover),
  roomly: bundledSrc(roomlyCover),
  sia: bundledSrc(siaCover),
};

// Dashboard screenshots carry useful information all the way to their edges.
// Keep those frames intact and let an ambient duplicate fill any spare space.
const fullFrameCovers = new Set(["anistream", "arunika", "roomly", "glowmarket", "sia"]);

const fullFrameTints: Record<string, string> = {
  anistream: "bg-[#07070b]/58",
  arunika: "bg-[#1a110c]/52",
  roomly: "bg-[#081a31]/52",
  glowmarket: "bg-[#fff8ed]/42",
  sia: "bg-[#06172a]/62",
};

/**
 * Where the first card pins, clear of the fixed site header.
 */
const STACK_TOP = 104;
/** How much lower each following card pins. This gap is the whole effect: it
 *  leaves the previous card's top edge showing, so the deck reads as a stack
 *  rather than as one card being replaced by another. */
const STACK_STEP = 16;
/** Depth lift per card against the deck's perspective, in px. */
const STACK_LIFT = 12;
/**
 * How many card edges the deck ever shows.
 *
 * Without this the offset grows with every project, so each new one added
 * would push the deck further down the viewport and eat into the card's own
 * height. Capping it means the stack looks identical whether there are four
 * projects or fourteen — only the scroll gets longer.
 */
const STACK_PEEK_MAX = 3;
/**
 * Space a pinned card gives up: the deepest pin plus a little breathing room
 * at the bottom. A card is sized to the viewport minus this, which is what
 * guarantees its footer — metrics, stack chips, the live links — is on screen
 * rather than hanging below the fold.
 */
const DECK_INSET = STACK_TOP + STACK_PEEK_MAX * STACK_STEP + 26;

/**
 * Entrance cascade for a card's regions.
 *
 * Driven by `whileInView` — one state change per card, not a value recomputed
 * on every frame. The previous version scrubbed a dozen transforms per card
 * off a hand-rolled scroll sampler; this leaves the pinning to the browser and
 * spends JS only when a card first arrives.
 */
const deckStagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.085, delayChildren: 0.12 } },
};
const deckPiece: Variants = {
  hidden: { opacity: 0, y: 20 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};
const deckArt: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  shown: { opacity: 1, scale: 1, transition: { duration: 0.9, ease } },
};
const deckEdge: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: { duration: 0.75, ease } },
};

function ProjectCard({
  project,
  index,
  stacked,
}: {
  project: Project;
  index: number;
  stacked: boolean;
}) {
  const translate = useT();
  const reduced = Boolean(useReducedMotion());
  const cover = bundledCovers[project.variant] ?? project.cover;
  const showFullFrame = fullFrameCovers.has(project.variant);

  return (
    <motion.article
      data-card-index={index}
      className="project-card group/art relative min-w-0 overflow-hidden border-2 border-ink bg-paper md:sticky md:grid md:grid-rows-[minmax(0,1fr)_auto] md:overflow-hidden"
      style={
        stacked
          ? {
              // The browser owns the pinning. There is no scroll listener and
              // no per-frame maths anywhere in this component any more.
              top: STACK_TOP + Math.min(index, STACK_PEEK_MAX) * STACK_STEP,
              // Sized to what is actually left of the viewport, so the card's
              // footer never falls below the fold. The image row flexes and
              // the meta row is `auto`, so the copy keeps its height and the
              // cover gives way instead.
              height: `calc(100svh - ${DECK_INSET}px)`,
              zIndex: index + 1,
              z: Math.min(index, STACK_PEEK_MAX) * STACK_LIFT,
              backfaceVisibility: "hidden",
            }
          : undefined
      }
      initial={reduced ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.25 }}
      variants={deckStagger}
    >
      {/* Acid top hairline on the active card — the focal edge of the deck. */}
      <motion.span
        className="pointer-events-none absolute inset-x-0 top-0 z-40 h-[3px] origin-left bg-acid"
        variants={deckEdge}
        aria-hidden="true"
      />
      <div
        className={`project-art relative h-[min(56vw,770px)] min-h-[520px] overflow-hidden md:h-full md:min-h-0 max-[680px]:h-[108vw] max-[680px]:min-h-0 max-[420px]:h-[100vw] ${artThemes[project.variant]}`}
        data-cursor
        aria-hidden="true"
      >
        <motion.div
          className={`project-art-motion absolute grid place-items-center transition-[filter] duration-300 will-change-transform group-hover/art:saturate-[1.1] ${
            cover ? "inset-0" : "-inset-[8%]"
          }`}
          variants={deckArt}
        >
          {cover ? (
            <>
              {showFullFrame ? (
                <>
                  <img
                    src={cover}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-45 blur-2xl"
                    style={{ objectPosition: project.coverPosition ?? "50% 50%" }}
                  />
                  <span className={`absolute inset-0 ${fullFrameTints[project.variant] ?? "bg-ink/55"}`} />
                  <div className="absolute inset-[5%_2.5%] grid grid-cols-[minmax(0,0.65fr)_minmax(0,1.5fr)_minmax(0,0.65fr)] gap-[clamp(6px,1vw,14px)] max-md:grid-cols-1">
                    <span className="relative overflow-hidden border border-current/20 bg-ink/20 max-md:hidden">
                      <img
                        src={cover}
                        alt=""
                        draggable={false}
                        className="pointer-events-none absolute inset-0 size-full object-cover object-left opacity-85"
                      />
                    </span>
                    <img
                      src={cover}
                      alt=""
                      draggable={false}
                      className="pointer-events-none relative size-full object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)]"
                    />
                    <span className="relative overflow-hidden border border-current/20 bg-ink/20 max-md:hidden">
                      <img
                        src={cover}
                        alt=""
                        draggable={false}
                        className="pointer-events-none absolute inset-0 size-full object-cover object-right opacity-85"
                      />
                    </span>
                  </div>
                </>
              ) : (
                <img
                  src={cover}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 size-full object-cover"
                  style={{ objectPosition: project.coverPosition ?? "50% 50%" }}
                />
              )}
              <span
                className={
                  project.variant === "glowmarket"
                    ? "absolute inset-0 bg-linear-to-t from-[#27180d]/20 via-transparent to-[#27180d]/8"
                    : project.variant === "sia"
                      ? "absolute inset-0 bg-linear-to-t from-[#12233a]/28 via-transparent to-[#12233a]/10"
                      : project.variant === "arunika"
                        ? "absolute inset-0 bg-linear-to-t from-[#1a110c]/32 via-transparent to-[#1a110c]/12"
                        : project.variant === "goldprice"
                          ? "absolute inset-0 bg-linear-to-t from-[#1c1810]/28 via-transparent to-[#1c1810]/10"
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
        <motion.div className="project-main">
          <motion.div
            className="project-copy-head"
            variants={deckPiece}
          >
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
          </motion.div>
          <motion.div
            className="project-copy-body"
            variants={deckPiece}
          >
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
          </motion.div>
        </motion.div>
        <motion.div className="project-aside" variants={deckPiece}>
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
    </motion.article>
  );
}

export function ProjectStack() {
  const total = projects.length;
  const [active, setActive] = useState(0);
  // Cards only take turns on the pinned desktop deck; on mobile every card is
  // on screen in flow and must stay reachable by keyboard.
  const stacked = useMediaQuery("(min-width: 768px)");
  const deckRef = useRef<HTMLDivElement>(null);

  /**
   * Which card currently owns the top of the deck.
   *
   * Read from an IntersectionObserver, not from scroll position. The stacking
   * itself is plain `position: sticky`, so there is no scroll progress to
   * sample — and sampling one purely to light up a progress indicator would
   * put JS back on every frame, which is the thing this rewrite removed.
   */
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const cards = deck.querySelectorAll<HTMLElement>("[data-card-index]");
    if (!cards.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const next = Number(entry.target.getAttribute("data-card-index"));
          setActive((current) => (current === next ? current : next));
        }
      },
      // A band across the upper part of the viewport: a card claims the deck
      // once its top has settled near where it pins.
      { rootMargin: "-12% 0px -60% 0px", threshold: 0 },
    );
    for (const card of cards) io.observe(card);
    return () => io.disconnect();
  }, [stacked]);

  const travelled = (active + 1) / total;

  return (
    <div className="project-pin-shell mt-8">
      <div className="hidden md:contents">
        <PaperField variant="work" />
      </div>

      <div
        className="project-deck-progress pointer-events-none sticky top-0 z-30 hidden grid-cols-[auto_minmax(120px,1fr)_auto_auto] items-center gap-4 bg-paper/85 py-5 text-[10px] tracking-[0.14em] text-ink uppercase backdrop-blur-sm md:grid"
        aria-hidden="true"
      >
        <span className="font-display text-[13px] font-semibold tracking-[0.08em] tabular-nums">
          {String(active + 1).padStart(2, "0")}
          <span className="mx-1.5 font-sans text-[10px] font-medium tracking-[0.14em] text-[#6f7068]">/</span>
          {String(total).padStart(2, "0")}
        </span>
        <span className="project-progress-rail">
          <motion.i
            className="project-progress-fill"
            style={{ originX: 0 }}
            animate={{ scaleX: travelled }}
            transition={{ duration: 0.5, ease }}
          />
          <motion.i
            className="project-progress-head"
            animate={{ left: `${(travelled * 100).toFixed(2)}%` }}
            transition={{ duration: 0.5, ease }}
          />
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

      {/* A block container with margins between cards, deliberately not a grid.
          A grid item's containing block is its own grid area, so each card
          could only stick within its own row and then let go — which left the
          tail padding below as dead space rather than dwell. As plain blocks
          every card shares the deck as its containing block, so the stack
          holds together and the tail is what keeps the last card pinned for a
          beat instead of flicking past. */}
      <div
        ref={deckRef}
        className="project-deck relative z-[1] space-y-[clamp(100px,12vw,190px)] pt-8 md:space-y-[clamp(48px,7vh,96px)] md:pt-2 max-[680px]:space-y-[98px]"
        style={{ perspective: "1200px" }}
      >
        {projects.map((project, index) => (
          <ProjectCard key={project.number} project={project} index={index} stacked={stacked} />
        ))}
        {/* The deck's tail, as a real box in flow rather than padding on the
            deck. A sticky element is constrained by its containing block, and
            for a block-level child that is the parent's CONTENT box — padding
            sits outside it. As padding this gave the last card no room to pin
            at all: it slid straight past while leaving 600px of empty deck
            behind it. In flow, it is what the last card pins against. */}
        <div aria-hidden="true" className="hidden md:block md:h-[58vh]" />
      </div>
    </div>
  );
}

function UtilityProjectCard({ project }: { project: UtilityProject }) {
  const translate = useT();
  const cover = bundledCovers[project.variant] ?? project.cover;

  return (
    <article className="utility-card group/art relative z-[1] grid min-w-0 overflow-hidden border-2 border-ink bg-paper md:grid-cols-[minmax(220px,0.38fr)_minmax(0,1fr)]">
      <div
        className={`relative h-[min(42vw,280px)] min-h-[200px] overflow-hidden md:h-full md:min-h-[240px] max-[420px]:h-[56vw] max-[420px]:min-h-[180px] ${artThemes[project.variant]}`}
        aria-hidden="true"
      >
        {cover ? (
          <>
            <img
              src={cover}
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full scale-110 object-cover object-center opacity-45 blur-xl"
            />
            <span className="absolute inset-0 bg-[#f4f1e8]/62" />
            <img
              src={cover}
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full object-contain object-center p-[2.5%] drop-shadow-[0_8px_22px_rgba(28,24,16,0.2)]"
            />
            <span className="absolute inset-0 bg-linear-to-t from-[#1c1810]/30 via-transparent to-[#1c1810]/8" />
          </>
        ) : null}
        <span className="pointer-events-none absolute inset-[2.5%_2%] z-[5] border border-current/20" />
      </div>

      <div className="flex min-w-0 flex-col gap-4 p-5 max-[420px]:p-4">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="min-w-0">
            <div className="project-kicker">
              <span className="inline-flex min-h-7 items-center border border-ink/25 px-2 text-[9px] font-semibold tracking-[0.14em] uppercase">
                {translate(copy.utilityEyebrow)}
              </span>
              <span className="project-number">{project.number}</span>
              <span className="project-kicker-rule" aria-hidden="true" />
              <span className="min-w-0">{translate(project.type)}</span>
            </div>
            <h3 className="font-display m-0 text-[clamp(28px,6vw,40px)] leading-[0.9] font-bold tracking-[-0.06em] max-[420px]:text-[clamp(24px,8vw,32px)]">
              {project.title}
            </h3>
          </div>
          <div className="project-year shrink-0 md:pt-1">
            <span>{translate(copy.year)}</span>
            <span className="project-year-value">{project.year}</span>
          </div>
        </div>

        <p className="m-0 text-[15px] leading-[1.55] text-[#3a3b36] max-[420px]:text-sm">{translate(project.note)}</p>

        <ul className="project-metrics !border-0 !pt-0">
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
              className="border border-ink/25 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.12em] whitespace-nowrap uppercase"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-2 min-[520px]:flex-row">
          {project.demo ? (
            <a
              className="group/live relative inline-flex min-h-11 flex-1 items-center justify-between gap-3 overflow-hidden border-2 border-ink bg-ink px-3.5 font-semibold tracking-[0.12em] text-acid uppercase transition-colors duration-250 hover:bg-acid hover:text-ink focus-visible:bg-acid focus-visible:text-ink"
              href={project.demo}
              target="_blank"
              rel="noreferrer"
            >
              <span className="relative flex items-center gap-2">
                <i className="size-[7px] shrink-0 animate-pulse-dot rounded-full bg-current not-italic" aria-hidden="true" />
                {translate(copy.liveDemo)}
              </span>
              <ArrowOut className="size-3.5 shrink-0" />
            </a>
          ) : null}
          <div className="project-source flex-1">
            {project.links.map(([label, href], linkIndex) => {
              const github = href.includes("github.com");
              return (
                <a
                  className="group/link flex min-h-11 items-center justify-between gap-3 px-2.5 text-[10px] font-medium tracking-[0.12em] uppercase transition-colors duration-250 hover:bg-ink hover:text-acid focus-visible:bg-ink focus-visible:text-acid"
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
                  <ArrowOut className="size-3.5 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

export function UtilityProjects() {
  return (
    <LatchedReveal className="relative z-[1] mt-[clamp(36px,5vw,64px)]">
      <div className="flex flex-col gap-5">
        {utilityProjects.map((project) => (
          <UtilityProjectCard key={project.number} project={project} />
        ))}
      </div>
    </LatchedReveal>
  );
}
