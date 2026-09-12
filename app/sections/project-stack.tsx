"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { artThemes, copy, projects, utilityProjects, type Project, type UtilityProject } from "@/app/content";
import anistreamCover from "@/app/covers/anistream.webp";
import arunikaCover from "@/app/covers/arunika.webp";
import glowmarketCover from "@/app/covers/glowmarket.webp";
import aurumkalaCover from "@/app/covers/aurumkala.webp";
import roomlyCover from "@/app/covers/roomly.webp";
import siaCover from "@/app/covers/sia.webp";
import shopifyCCover from "@/app/covers/shopify-c.webp";
import tiketKilatCover from "@/app/covers/tiket-kilat.webp";
import anistreamSm from "@/app/covers/anistream-sm.webp";
import arunikaSm from "@/app/covers/arunika-sm.webp";
import glowmarketSm from "@/app/covers/glowmarket-sm.webp";
import aurumkalaSm from "@/app/covers/aurumkala-sm.webp";
import roomlySm from "@/app/covers/roomly-sm.webp";
import shopifyCSm from "@/app/covers/shopify-c-sm.webp";
import siaSm from "@/app/covers/sia-sm.webp";
import tiketKilatSm from "@/app/covers/tiket-kilat-sm.webp";
import { inViewport, reveal, ease, useMediaQuery } from "@/app/lib/motion";
import { useT, dual } from "@/app/lib/i18n";
import { PaperField } from "@/app/components/paper-field";
import { ArrowOut, Chevron, SocialIcon } from "@/app/components/tech-icons";

function bundledSrc(image: string | { src: string }) {
  return typeof image === "string" ? image : image.src;
}

const bundledCovers: Record<string, string> = {
  anistream: bundledSrc(anistreamCover),
  arunika: bundledSrc(arunikaCover),
  glowmarket: bundledSrc(glowmarketCover),
  aurumkala: bundledSrc(aurumkalaCover),
  roomly: bundledSrc(roomlyCover),
  sia: bundledSrc(siaCover),
  shopifyc: bundledSrc(shopifyCCover),
  tiketkilat: bundledSrc(tiketKilatCover),
};

/**
 * 700px-wide copies of the same covers, for the phone index.
 *
 * Those rows show a 62px thumbnail and, once opened, a 334px panel — but they
 * were pulling the full 1600px cards. On a phone, where the projects past the
 * featured three exist ONLY as index rows, that meant 417KB downloaded to
 * paint thumbnails. These come to 99KB for the same four.
 */
const smallCovers: Record<string, string> = {
  anistream: bundledSrc(anistreamSm),
  arunika: bundledSrc(arunikaSm),
  glowmarket: bundledSrc(glowmarketSm),
  aurumkala: bundledSrc(aurumkalaSm),
  roomly: bundledSrc(roomlySm),
  shopifyc: bundledSrc(shopifyCSm),
  sia: bundledSrc(siaSm),
  tiketkilat: bundledSrc(tiketKilatSm),
};

// Dashboard screenshots carry useful information all the way to their edges.
// Keep those frames intact and let an ambient duplicate fill any spare space.
//
// The console poster is deliberately absent: it is drawn at the art slot's own
// ~3.1 ratio, so it fills without help. Left in the set it was letterboxed and
// the ambient copies tiled either side of it — three visible console frames,
// the outer two sliced through the middle of the table.
const fullFrameCovers = new Set(["anistream", "arunika", "roomly", "glowmarket", "sia", "tiketkilat"]);

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
const STACK_TOP = 136;
/** How much lower each following card pins. This gap is the whole effect: it
 *  leaves the previous card's top edge showing, so the deck reads as a stack
 *  rather than as one card being replaced by another. */
const STACK_STEP = 20;
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
const DECK_INSET = STACK_TOP + STACK_PEEK_MAX * STACK_STEP + 24;

/**
 * Entrance cascade for a card's regions.
 *
 * Driven by `whileInView` — one state change per card, not a value recomputed
 * on every frame. The previous version scrubbed a dozen transforms per card
 * off a hand-rolled scroll sampler; this leaves the pinning to the browser and
 * spends JS only when a card first arrives.
 */
const deckStagger: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.54, ease, staggerChildren: 0.055, delayChildren: 0.08 },
  },
};

// A sticky card needs to start assembling before it reaches its pin line.
// This still fires inside the screen, but is intentionally shallower than the
// general content trigger because the card itself is almost a viewport tall.
const deckViewport = { once: true, margin: "0px 0px -4% 0px", amount: 0.06 } as const;
const deckPiece: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};
const deckArt: Variants = {
  hidden: { opacity: 0, scale: 1.025 },
  shown: { opacity: 1, scale: 1, transition: { duration: 0.68, ease } },
};
const deckEdge: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: { duration: 0.62, ease } },
};

type ProjectCardState = "past" | "active" | "future" | "static";

function ProjectCard({
  project,
  index,
  stacked,
  state,
}: {
  project: Project;
  index: number;
  stacked: boolean;
  state: ProjectCardState;
}) {
  const translate = useT();
  const reduced = Boolean(useReducedMotion());
  const cover = bundledCovers[project.variant] ?? project.cover;
  const showFullFrame = fullFrameCovers.has(project.variant);
  const projectHref = project.demo ?? project.links.at(0)?.[1];
  const destinationLabel = project.demo ? translate(copy.projectLiveStatus) : translate(copy.projectSourceStatus);

  return (
    <motion.article
      data-card-index={index}
      data-project-state={state}
      className={`project-card group/art relative min-w-0 overflow-hidden border-2 border-ink bg-paper ${
        stacked ? "sticky grid grid-rows-[minmax(0,1fr)_auto]" : ""
      }`}
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
              height: `min(780px, calc(100svh - ${DECK_INSET}px))`,
              zIndex: index + 1,
              z: Math.min(index, STACK_PEEK_MAX) * STACK_LIFT,
              backfaceVisibility: "hidden",
            }
          : undefined
      }
      initial={reduced ? false : stacked ? "hidden" : reveal.initial}
      whileInView={stacked ? "shown" : reveal.whileInView}
      viewport={stacked ? deckViewport : inViewport}
      variants={stacked ? deckStagger : undefined}
      transition={stacked ? undefined : reveal.transition}
    >
      {/* Acid top hairline on the active card — the focal edge of the deck. */}
      <motion.span
        className="project-active-edge pointer-events-none absolute inset-x-0 top-0 z-40 h-[3px] origin-left bg-acid"
        variants={deckEdge}
        aria-hidden="true"
      />
      {/* The artwork used to be taller than wide on a phone (108vw). With the
          description no longer clamped there, that pushed each card past 1.2
          screens — one card could never be seen whole. A landscape crop reads
          the cover just as well and hands the height back to the words. */}
      <a
        className={`project-art relative block h-[min(56vw,770px)] min-h-[520px] touch-manipulation overflow-hidden md:h-full md:min-h-0 max-[767px]:h-[clamp(220px,72vw,310px)] max-[767px]:min-h-0 max-[360px]:h-[clamp(188px,64vw,216px)] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-acid ${artThemes[project.variant]}`}
        href={projectHref}
        target={projectHref ? "_blank" : undefined}
        rel={projectHref ? "noreferrer" : undefined}
        aria-label={translate(
          dual(
            `Buka ${project.title} — ${project.demo ? "demo live" : "repositori"} di tab baru`,
            `Open ${project.title} — ${project.demo ? "live demo" : "repository"} in a new tab`,
          ),
        )}
        data-cursor={projectHref ? "" : undefined}
      >
        <motion.div
          className={`project-art-motion absolute grid place-items-center ${
            cover ? "inset-0" : "-inset-[8%]"
          }`}
          variants={deckArt}
        >
          <div className="project-art-media absolute inset-0 grid place-items-center">
            {cover ? (
              <>
              {showFullFrame ? (
                <>
                  <img
                    src={cover} loading="lazy"
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-45 blur-2xl"
                    style={{ objectPosition: project.coverPosition ?? "50% 50%" }}
                  />
                  <span className={`absolute inset-0 ${fullFrameTints[project.variant] ?? "bg-ink/55"}`} />
                  <div className="absolute inset-[5%_2.5%] grid grid-cols-[minmax(0,0.65fr)_minmax(0,1.5fr)_minmax(0,0.65fr)] gap-[clamp(6px,1vw,14px)] max-md:grid-cols-1">
                    <span className="relative overflow-hidden border border-current/20 bg-ink/20 max-md:hidden">
                      <img
                        src={cover} loading="lazy"
                        alt=""
                        draggable={false}
                        className="pointer-events-none absolute inset-0 size-full object-cover object-left opacity-85"
                      />
                    </span>
                    <img
                      src={cover} loading="lazy"
                      alt=""
                      draggable={false}
                      className="pointer-events-none relative size-full object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)]"
                    />
                    <span className="relative overflow-hidden border border-current/20 bg-ink/20 max-md:hidden">
                      <img
                        src={cover} loading="lazy"
                        alt=""
                        draggable={false}
                        className="pointer-events-none absolute inset-0 size-full object-cover object-right opacity-85"
                      />
                    </span>
                  </div>
                </>
              ) : (
                <img
                  src={cover} loading="lazy"
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
                        : project.variant === "aurumkala"
                          ? "absolute inset-0 bg-linear-to-t from-[#071426]/30 via-transparent to-[#071426]/10"
                          : "absolute inset-0 bg-linear-to-t from-ink/42 via-ink/8 to-ink/14"
                }
              />
              {project.variant === "anistream" && (
                <>
                  <motion.span
                    className="project-art-affordance absolute top-1/2 left-[3.5%] z-[4] grid size-12 place-items-center rounded-full border border-paper/35 bg-ink/70 text-paper max-[680px]:size-10"
                    style={{ y: "-50%" }}
                    animate={reduced ? undefined : { x: [0, -8, 0] }}
                    transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Chevron dir="left" className="size-5 max-[680px]:size-4" />
                  </motion.span>
                  <motion.span
                    className="project-art-affordance absolute top-1/2 right-[3.5%] z-[4] grid size-12 place-items-center rounded-full bg-[#e11d2e] text-paper max-[680px]:size-10"
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
          </div>
        </motion.div>
        <span className="project-viewport-rail pointer-events-none absolute inset-x-[2%] top-[2.5%] z-[9] flex min-h-8 items-center border border-paper/20 bg-ink/88 px-3 font-mono text-[10px] tracking-[0.11em] text-paper uppercase backdrop-blur-md max-[480px]:inset-x-[3%] max-[480px]:min-h-7 max-[480px]:px-2 max-[480px]:text-[9px]">
          <span className="flex shrink-0 items-center gap-2 text-acid">
            <i className="size-1.5 bg-current not-italic" aria-hidden="true" />
            {translate(copy.projectCase)} {project.number}
          </span>
          <span className="mx-3 h-px min-w-4 flex-1 bg-paper/20 max-[480px]:mx-2" aria-hidden="true" />
          <span className="max-w-[34ch] truncate text-paper/60 max-[680px]:hidden">{translate(project.type)}</span>
          <span className="mx-3 h-3 w-px shrink-0 bg-paper/20 max-[680px]:hidden" aria-hidden="true" />
          <span className="shrink-0 text-paper">
            {destinationLabel} · {String(index + 1).padStart(2, "0")}/{String(projects.length).padStart(2, "0")}
          </span>
        </span>
        <span className="pointer-events-none absolute inset-[2.5%_2%] z-[5] border border-current/20" />
        <i className="absolute top-[3.5%] left-[2%] z-[6] text-[clamp(15px,1.6vw,22px)] leading-none font-light not-italic">
          +
        </i>
        <span className="project-view-mark pointer-events-none absolute right-[2%] bottom-[3.5%] z-[9] grid size-10 place-items-center border border-paper/25 bg-ink/88 text-acid backdrop-blur-md max-[480px]:right-[3%] max-[480px]:size-9" aria-hidden="true">
          <ArrowOut className="size-4" />
        </span>
      </a>

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
              {project.metrics.map(([label, value], metricIndex) => (
                <li className="project-metric" key={typeof label === "string" ? label : label.en} data-metric-index={metricIndex}>
                  <span className="project-metric-label">{translate(label)}</span>
                  <strong className="project-metric-value">{translate(value)}</strong>
                </li>
              ))}
            </ul>
            <ul className="project-stack-list" aria-label={translate(dual(`Teknologi ${project.title}`, `${project.title} technologies`))}>
              {project.stack.map((item, stackIndex) => (
                <li
                  className={`project-tech ${stackIndex < 2 ? "project-tech--primary" : ""}`}
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
                className="group/live relative mb-2 flex min-h-11 items-center justify-between gap-3 overflow-hidden border-2 border-ink bg-ink px-3.5 text-[13px] font-semibold tracking-[0.12em] text-acid uppercase transition-colors duration-250 hover:bg-acid hover:text-ink focus-visible:bg-acid focus-visible:text-ink"
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
                  <span className="sr-only"> — {translate(copy.opensNewTab)}</span>
                </span>
                <span
                  className="relative grid size-4 shrink-0 place-items-center transition-transform duration-250 group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5"
                  aria-hidden="true"
                >
                  <ArrowOut className="size-3.5" />
                </span>
              </a>
            )}
            {/* Not every project has somewhere to point at: the C storefront
                lives only on disk. Rendering the container regardless left a
                stray empty box in the aside. */}
            {project.links.length > 0 ? (
            <div className="project-source">
              {project.links.map(([label, href], linkIndex) => {
                const github = href.includes("github.com");
                return (
                  <a
                    className="group/link flex min-h-11 items-center justify-between gap-3 border-t border-ink/30 px-2.5 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors duration-250 first:border-t-0 hover:bg-ink hover:text-acid focus-visible:bg-ink focus-visible:text-acid"
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
                      <span className="sr-only"> — {translate(copy.opensNewTab)}</span>
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
            ) : null}
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}

/**
 * How many projects lead the phone layout as full cards.
 *
 * The rest become an index. A full card costs 1.19 screens of scroll on a
 * phone, so a growing list turned the section into a marathon — seven projects
 * already ran to 9.3 screens and twenty would reach nearly 25. The first few
 * cards are what establish the work; past that a reader wants to scan, not
 * keep swiping through the same layout.
 */
const PHONE_FEATURED = 3;

/** One project as a scannable row that opens in place. Phones only. */
function ProjectIndexRow({ project }: { project: Project }) {
  const translate = useT();
  const reduced = Boolean(useReducedMotion());
  const [open, setOpen] = useState(false);
  const panelId = `project-index-${project.number}`;
  const triggerId = `${panelId}-trigger`;
  const cover = smallCovers[project.variant] ?? bundledCovers[project.variant] ?? project.cover;

  return (
    <motion.li
      className="project-index-row border-b border-ink/20"
      data-open={open ? "true" : "false"}
      {...reveal}
      initial={reduced ? false : reveal.initial}
    >
      <button
        id={triggerId}
        type="button"
        className="group/index flex min-h-16 w-full touch-manipulation cursor-pointer items-center gap-4 px-2 py-4 text-left transition-colors duration-200 hover:bg-acid/18 focus-visible:bg-acid/18 active:bg-acid/28 max-[360px]:gap-2.5 max-[360px]:px-0 max-[360px]:py-2.5"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-mono text-[11px] tabular-nums text-[#686960]">{project.number}</span>
        {/* The cover still earns its place at thumbnail size: it is what makes
            a row recognisable at a glance rather than a line of text. */}
        <span
          className={`relative block h-11 w-16 shrink-0 overflow-hidden border border-ink/20 max-[360px]:w-14 ${artThemes[project.variant] ?? ""}`}
          aria-hidden="true"
        >
          {cover ? (
            <img src={cover} alt="" loading="lazy" draggable={false} className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="font-display absolute inset-0 grid place-items-center text-[11px] font-[760] tracking-[-0.04em]">
              {project.mark}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="font-display block truncate text-[20px] leading-none font-[680] tracking-[-0.04em] max-[360px]:text-[18px]">
            {project.title}
          </strong>
          {/* Year first, type second. The thumbnail took width off this line
              and it now truncates — with the type leading, the year was the
              part that disappeared, which is the half a reader actually scans
              for. Reversed, the truncation only ever eats the tail. */}
          <span className="mt-1.5 block truncate text-[11px] tracking-[0.08em] text-[#686960] uppercase">
            {project.year} · {translate(project.type)}
          </span>
        </span>
        <span
          className={`grid size-8 shrink-0 place-items-center border border-ink/30 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
          aria-hidden="true"
        >
          <span className="relative block size-3">
            <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-ink" />
            <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-ink" />
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-5">
              {cover ? (
                <span
                  className={`relative mb-4 block aspect-[16/10] overflow-hidden border border-ink/20 ${artThemes[project.variant] ?? ""}`}
                >
                  <img
                    src={cover}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className={`absolute inset-0 size-full ${fullFrameCovers.has(project.variant) ? "object-contain" : "object-cover"}`}
                  />
                </span>
              ) : null}
              <p className="m-0 text-[15px] leading-[1.55] text-[#3a3b36]">{translate(project.note)}</p>
              <ul className="project-metrics mt-4">
                {project.metrics.map(([label, value]) => (
                  <li className="project-metric" key={typeof label === "string" ? label : label.en}>
                    <span className="project-metric-label">{translate(label)}</span>
                    <strong className="project-metric-value">{translate(value)}</strong>
                  </li>
                ))}
              </ul>
              <ul className="mt-3.5 mb-0 flex list-none flex-wrap gap-1.5 p-0">
                {project.stack.map((item, stackIndex) => (
                  <li className={`project-tech ${stackIndex < 2 ? "project-tech--primary" : ""}`} key={item}>
                    {item}
                  </li>
                ))}
              </ul>
              {project.demo || project.links.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.demo ? (
                    <a
                      className="inline-flex min-h-11 items-center gap-2 border border-ink bg-ink px-3.5 text-[11px] tracking-[0.1em] text-acid uppercase"
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Demo <ArrowOut className="size-3" />
                      <span className="sr-only"> — {translate(copy.opensNewTab)}</span>
                    </a>
                  ) : null}
                  {project.links.map(([label, href]) => (
                    <a
                      className="inline-flex min-h-11 items-center gap-2 border border-ink/30 px-3.5 text-[11px] tracking-[0.1em] uppercase"
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <SocialIcon name="github" className="size-3.5 opacity-70" />
                      {label}
                      <span className="sr-only"> — {translate(copy.opensNewTab)}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

export function ProjectStack() {
  const t = useT();
  const total = projects.length;
  const [active, setActive] = useState(0);
  // Cards only take turns on the pinned desktop deck; on mobile every card is
  // on screen in flow and must stay reachable by keyboard.
  const stacked = useMediaQuery("(min-width: 1024px) and (min-height: 680px) and (hover: hover) and (pointer: fine)");
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
    if (!stacked) return;
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
    <div className="project-pin-shell mt-5 md:mt-8">
      <div className="hidden md:contents">
        <PaperField variant="work" />
      </div>

      {stacked ? (
        <div
          className="project-deck-progress pointer-events-none sticky top-[76px] z-30 grid min-h-11 grid-cols-[auto_minmax(120px,1fr)_auto_auto] items-center gap-4 border-y border-ink/12 bg-paper/95 py-3 text-[11px] tracking-[0.14em] text-ink uppercase shadow-[0_12px_22px_-20px_rgba(11,13,12,0.42)]"
          aria-hidden="true"
        >
          <span className="font-display text-[13px] font-semibold tracking-[0.08em] tabular-nums">
            {String(active + 1).padStart(2, "0")}
            <span className="mx-1.5 font-sans text-[11px] font-medium tracking-[0.14em] text-[#686960]">/</span>
            {String(total).padStart(2, "0")}
          </span>
          <span className="project-progress-rail">
            <motion.i
              className="project-progress-fill"
              style={{ originX: 0 }}
              animate={{ scaleX: travelled }}
              transition={{ duration: 0.42, ease }}
            />
            <motion.i
              className="project-progress-head"
              animate={{ left: `${(travelled * 100).toFixed(2)}%` }}
              transition={{ duration: 0.42, ease }}
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
      ) : null}

      {/* A block container with margins between cards, deliberately not a grid.
          A grid item's containing block is its own grid area, so each card
          could only stick within its own row and then let go — which left the
          tail padding below as dead space rather than dwell. As plain blocks
          every card shares the deck as its containing block, so the stack
          holds together and the tail is what keeps the last card pinned for a
          beat instead of flicking past. */}
      <div
        ref={deckRef}
        className="project-deck relative z-[1] space-y-[clamp(52px,14vw,68px)] pt-0 lg:space-y-[clamp(48px,7vh,96px)] lg:pt-2 max-[360px]:space-y-9"
        style={{ perspective: "1200px" }}
      >
        {(stacked ? projects : projects.slice(0, PHONE_FEATURED)).map((project, index) => (
          // The server renders the flow layout first; the media query then
          // upgrades a capable desktop to the sticky deck. Those modes use
          // different animation contracts, so they cannot reuse Motion's
          // once-only observer. The mode key gives the deck a fresh cycle.
          <ProjectCard
            key={`${stacked ? "deck" : "flow"}-${project.number}`}
            project={project}
            index={index}
            stacked={stacked}
            state={stacked ? (index < active ? "past" : index === active ? "active" : "future") : "static"}
          />
        ))}

        {!stacked && projects.length > PHONE_FEATURED ? (
          <section aria-label={t(copy.workIndexLabel)}>
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
              <h3 className="m-0 text-[11px] font-semibold tracking-[0.12em] uppercase">
                {t(copy.workIndexLabel)}
              </h3>
              <span className="text-[11px] tracking-[0.1em] text-[#686960] uppercase">
                {t(copy.workIndexHint)}
              </span>
            </div>
            <ul className="m-0 list-none p-0">
              {projects.slice(PHONE_FEATURED).map((project) => (
                <ProjectIndexRow key={project.number} project={project} />
              ))}
            </ul>
          </section>
        ) : null}
        {/* The deck's tail, as a real box in flow rather than padding on the
            deck. A sticky element is constrained by its containing block, and
            for a block-level child that is the parent's CONTENT box — padding
            sits outside it. As padding this gave the last card no room to pin
            at all: it slid straight past while leaving 600px of empty deck
            behind it. In flow, it is what the last card pins against. */}
        {stacked ? <div aria-hidden="true" className="h-[58vh]" /> : null}
      </div>
    </div>
  );
}

function UtilityProjectCard({ project }: { project: UtilityProject }) {
  const translate = useT();
  const cover = bundledCovers[project.variant] ?? project.cover;
  const smallCover = smallCovers[project.variant] ?? cover;
  const responsiveCover = smallCover !== cover ? `${smallCover} 700w, ${cover} 1600w` : undefined;
  const aurumkala = project.variant === "aurumkala";

  return (
    <motion.article
      className="utility-card group/art relative z-[1] grid min-w-0 overflow-hidden border-2 border-ink bg-paper md:grid-cols-[minmax(300px,0.72fr)_minmax(0,1fr)]"
      {...reveal}
    >
      <div
        className={`relative h-[clamp(190px,56vw,250px)] min-h-0 overflow-hidden md:h-full md:min-h-[240px] max-[360px]:h-[clamp(164px,52vw,184px)] ${artThemes[project.variant]}`}
        aria-hidden="true"
      >
        {cover ? (
          <>
            <img
              src={cover}
              srcSet={responsiveCover}
              sizes="(max-width: 767px) 100vw, 42vw"
              loading="lazy"
              decoding="async"
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full scale-110 object-cover object-center opacity-50 blur-2xl"
            />
            <span className={`absolute inset-0 ${aurumkala ? "bg-[#071426]/58" : "bg-[#f4f1e8]/62"}`} />
            <img
              src={cover}
              srcSet={responsiveCover}
              sizes="(max-width: 767px) 100vw, 42vw"
              loading="lazy"
              decoding="async"
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full object-contain object-center p-[2.5%] drop-shadow-[0_12px_30px_rgba(2,8,20,0.42)] transition-transform duration-700 ease-out group-hover/art:scale-[1.015] motion-reduce:transform-none"
            />
            <span className={`absolute inset-0 bg-linear-to-t ${aurumkala ? "from-[#071426]/36 via-transparent to-[#f59e0b]/6" : "from-[#1c1810]/30 via-transparent to-[#1c1810]/8"}`} />
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

        <p className="m-0 text-[15px] leading-[1.55] text-[#3a3b36] max-[420px]:text-[15px]">{translate(project.note)}</p>

        <ul className="project-metrics">
          {project.metrics.map(([label, value]) => (
            <li className="project-metric" key={typeof label === "string" ? label : label.en}>
              <span className="project-metric-label">{translate(label)}</span>
              <strong className="project-metric-value">{translate(value)}</strong>
            </li>
          ))}
        </ul>

        <ul className="project-stack-list" aria-label={translate(dual(`Teknologi ${project.title}`, `${project.title} technologies`))}>
          {project.stack.map((item, stackIndex) => (
            <li
              className={`project-tech ${stackIndex < 2 ? "project-tech--primary" : ""}`}
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-2 min-[520px]:flex-row">
          {project.demo ? (
            <a
              className="group/live relative inline-flex min-h-11 flex-1 items-center justify-between gap-3 overflow-hidden border-2 border-ink bg-ink px-3.5 text-[13px] font-semibold tracking-[0.12em] text-acid uppercase transition-colors duration-250 hover:bg-acid hover:text-ink focus-visible:bg-acid focus-visible:text-ink"
              href={project.demo}
              target="_blank"
              rel="noreferrer"
            >
              <span className="relative flex items-center gap-2">
                <i className="size-[7px] shrink-0 animate-pulse-dot rounded-full bg-current not-italic" aria-hidden="true" />
                {translate(copy.liveDemo)}
                <span className="sr-only"> — {translate(copy.opensNewTab)}</span>
              </span>
              <ArrowOut className="size-3.5 shrink-0" />
            </a>
          ) : null}
          <div className="project-source flex-1">
            {project.links.map(([label, href], linkIndex) => {
              const github = href.includes("github.com");
              return (
                <a
                  className="group/link flex min-h-11 items-center justify-between gap-3 px-2.5 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors duration-250 hover:bg-ink hover:text-acid focus-visible:bg-ink focus-visible:text-acid"
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
                    <span className="sr-only"> — {translate(copy.opensNewTab)}</span>
                  </span>
                  <ArrowOut className="size-3.5 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function UtilityProjects() {
  return (
    <div className="relative z-[1] mt-[clamp(36px,5vw,64px)]">
      <div className="flex flex-col gap-5">
        {utilityProjects.map((project) => (
          <UtilityProjectCard key={project.number} project={project} />
        ))}
      </div>
    </div>
  );
}
