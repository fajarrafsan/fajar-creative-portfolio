"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { dual, useT } from "@/app/lib/i18n";

/**
 * Coverflow carousel.
 *
 * Adapted from the shadcn-flavoured original to this codebase: there is no
 * `cn()` helper, no `lucide-react`, and no shadcn colour tokens here — the
 * project has its own ink/acid/paper system and inline SVG icons — so those
 * three dependencies are inlined rather than installed, which would have
 * meant pulling shadcn infrastructure in for a single component.
 *
 * The cards are NOT square. Every slide is an A4-landscape certificate scan
 * (ratio ~1.414), so `aspectRatio` is a prop and the frame height is derived
 * from the card width instead of assuming 1:1 — a square card would letterbox
 * or crop every certificate.
 */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** Local stand-in for `cn` — the project joins class names inline elsewhere too. */
const clsx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length. Everything else is derived from it, so the rake scales. */
  cardWidth?: string;
  /** Optional mobile override, applied without a client-side media-query jump. */
  mobileCardWidth?: string;
  /** width / height. 1.414 is A4 landscape; 1 restores the original square. */
  aspectRatio?: number;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  /** Names the carousel for assistive tech. */
  label?: string;
  className?: string;
  cardClassName?: string;
  /** Fires when the centred slide changes, so a parent can mirror the state. */
  onSelect?: (index: number) => void;
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      className="size-5"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <>
          <path d="M20 12H5" className="origin-right transition-transform duration-300 group-hover/nav:scale-x-125" />
          <path d="M11 6 5 12l6 6" />
        </>
      ) : (
        <>
          <path d="M4 12h15" className="origin-left transition-transform duration-300 group-hover/nav:scale-x-125" />
          <path d="M13 6l6 6-6 6" />
        </>
      )}
    </svg>
  );
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(148px, 22vw, 260px)",
  mobileCardWidth,
  aspectRatio = 1.414,
  gap = 0.05,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  label = "Cover carousel",
  className,
  cardClassName,
  onSelect,
}: CoverflowCarouselProps) {
  const t = useT();
  const count = slides.length;
  const reduceMotion = useReducedMotion();
  const carouselId = React.useId().replace(/:/g, "");

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const paginationRailRef = React.useRef<HTMLDivElement>(null);
  const paginationRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  /** Where the current settle is headed. Stepping off `pos` instead would
      swallow a keypress that lands mid-flight, before the round-off moves. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
    moved: boolean;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    onSelect?.(selected);
  }, [onSelect, selected]);

  /** Nearest whole card, folded back into 0..count-1. */
  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  // Paint straight to the DOM. Sixty state updates a second would re-render
  // every card for numbers React never needs to see.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Fold the distance into the shorter way round the ring. This is the
      // whole looping mechanism — no cloned nodes, no shuffling the DOM.
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      // Both the tilt and the recession ease off as cards travel out —
      // doubling the distance adds only about half again as much of each.
      // A linear ramp folds the second card shut; this keeps it readable.
      const ramp = Math.pow(distance, falloff);
      // Capped short of edge-on so a far card never turns its back.
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // A card is teleported across the ring at exactly half a turn out, so it
      // has to be gone by then or the jump is visible.
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(30 - Math.round(distance));
      card.style.filter = `brightness(${Math.max(0.7, 1 - distance * 0.1)}) saturate(${Math.max(0.72, 1 - distance * 0.08)})`;
      // Only the centred card should take focus or a click.
      card.style.pointerEvents = distance < 0.5 ? "auto" : "none";
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      // Reduced motion still moves the carousel — it just arrives at once
      // instead of gliding, so the control stays usable.
      if (reduceMotion) {
        posRef.current = target;
        paint();
        return;
      }

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        // Exponential ease-out, not a spring. Swap in a spring only if the
        // settle needs overshoot.
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint, reduceMotion],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      // Take the shorter way round rather than unwinding the whole ring.
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  /** Arrow keys, attached to the real controls rather than a div. Focus any
      of the buttons and Left/Right step the carousel — no synthetic role and
      no tab stop that announces nothing to a screen reader. */
  const onArrowKeys = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      nudge(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nudge(1);
    }
  };

  const onPaginationKeys = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const previous = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const next = event.key === "ArrowRight" || event.key === "ArrowDown";
    const edge = event.key === "Home" || event.key === "End";
    if (!previous && !next && !edge) return;

    event.preventDefault();
    const destination = event.key === "Home"
      ? 0
      : event.key === "End"
        ? count - 1
        : (index + (previous ? -1 : 1) + count) % count;
    goTo(destination);
    paginationRefs.current[destination]?.focus();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    if (Math.abs(event.clientX - drag.x) > 3) drag.moved = true;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    // Cards per second, for the throw.
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    // Let a flick carry, but never more than two cards.
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  // Card width drives pitch, depth and perspective, so it is the only thing
  // worth measuring — and only when the box actually changes.
  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  React.useEffect(() => {
    const rail = paginationRailRef.current;
    const item = paginationRefs.current[selected];
    if (!rail || !item) return;
    rail.scrollTo({
      behavior: reduceMotion ? "auto" : "smooth",
      left: item.offsetLeft - (rail.clientWidth - item.clientWidth) / 2,
    });
  }, [reduceMotion, selected]);

  const active = slides[selected];

  return (
    <div
      className={clsx(
        "w-full [--cf-card:var(--cf-card-desktop)] max-[680px]:[--cf-card:var(--cf-card-mobile)]",
        className,
      )}
      style={{
        ["--cf-card-desktop" as string]: cardWidth,
        ["--cf-card-mobile" as string]: mobileCardWidth ?? cardWidth,
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className={clsx("grid min-w-0", showCaption && "min-[980px]:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.72fr)]")}>
        <div className="relative min-w-0 overflow-hidden bg-surface/55 min-[980px]:flex min-[980px]:items-center">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[70%] -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(216,255,62,0.1),transparent_68%)]" aria-hidden="true" />
          <span className="pointer-events-none absolute top-5 left-5 z-40 size-6 border-t border-l border-acid/70 max-[680px]:top-3 max-[680px]:left-3" aria-hidden="true" />
          <span className="pointer-events-none absolute right-5 bottom-5 z-40 size-6 border-r border-b border-acid/70 max-[680px]:right-3 max-[680px]:bottom-3" aria-hidden="true" />

          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative w-full cursor-grab overflow-hidden py-[clamp(30px,4vw,58px)] active:cursor-grabbing max-[360px]:py-5"
            style={{
              perspective: `calc(var(--cf-card) * ${perspective})`,
              // Horizontal drag is ours; the page keeps vertical scrolling.
              touchAction: "pan-y",
            }}
          >
            <div
              className="relative select-none"
              style={{
                height: `calc(var(--cf-card) / ${aspectRatio})`,
                transformStyle: "preserve-3d",
              }}
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.src}
                  id={`${carouselId}-slide-${index}`}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={t(dual(`${index + 1} dari ${count}`, `${index + 1} of ${count}`))}
                  aria-hidden={index !== selected}
                  className={clsx(
                    "absolute top-0 left-1/2 overflow-hidden bg-paper transition-[border-color,box-shadow,filter] duration-300 will-change-[transform,opacity]",
                    index === selected
                      ? "border border-acid/85 p-[3px] shadow-[0_34px_90px_rgba(0,0,0,0.58),0_0_0_1px_rgba(216,255,62,0.12)]"
                      : "border border-paper/20 p-0.5 shadow-[0_24px_62px_rgba(0,0,0,0.48)]",
                    cardClassName,
                  )}
                  style={{ width: "var(--cf-card)", aspectRatio: String(aspectRatio) }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    className="size-full select-none object-contain"
                  />
                  <span className={clsx("pointer-events-none absolute inset-2 border border-ink/10 transition-opacity duration-300", index === selected ? "opacity-100" : "opacity-0")} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {showCaption && active?.title && (
          <motion.div
            key={selected}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-full flex-col border-t border-paper/12 bg-ink/78 p-[clamp(20px,2.6vw,36px)] text-left min-[980px]:border-t-0 min-[980px]:border-l max-[360px]:p-4"
          >
            <div className="mb-[clamp(28px,3vw,44px)] flex items-center justify-between gap-4 border-b border-paper/12 pb-4 max-[360px]:mb-5 max-[360px]:pb-3">
              <p className="m-0 text-[12px] tracking-[0.14em] text-paper/55 uppercase">
                {t(dual("Sertifikat aktif", "Selected credential"))}
              </p>
              <p className="m-0 font-mono text-[13px] tabular-nums text-acid">
                {String(selected + 1).padStart(2, "0")} <span className="text-paper/55">/ {String(count).padStart(2, "0")}</span>
              </p>
            </div>

            {active.subtitle && (
              <p className="mb-3 flex items-center gap-2 text-[12px] tracking-[0.16em] text-acid uppercase">
                <span className="size-1.5 bg-acid" aria-hidden="true" />
                {active.subtitle}
              </p>
            )}
            <p className="font-display m-0 max-w-[18ch] text-[clamp(30px,3.1vw,46px)] leading-[0.98] font-[680] tracking-[-0.055em] text-paper max-[360px]:text-[24px]">
              {active.title}
            </p>

            {active.meta && active.meta.length > 0 && (
              <dl className="mt-[clamp(30px,3.4vw,48px)] border-t border-paper/12 max-[360px]:mt-5">
                {active.meta.map((row) => {
                  const score = (row.label.toLowerCase() === "nilai" || row.label.toLowerCase() === "score") && row.value !== "—";
                  return (
                    <div key={row.label} className="grid min-h-[58px] grid-cols-[92px_1fr] items-center gap-4 border-b border-paper/12 py-3 max-[360px]:min-h-12 max-[360px]:grid-cols-[70px_1fr] max-[360px]:gap-3 max-[360px]:py-2">
                      <dt className="text-[12px] tracking-[0.13em] text-paper/55 uppercase">{row.label}</dt>
                      <dd
                        className={clsx(
                          "m-0 font-mono tabular-nums",
                          score
                            ? "text-[clamp(32px,3.2vw,48px)] leading-none font-[600] text-acid max-[360px]:text-[28px]"
                            : "text-[14px] leading-[1.4] text-paper/85",
                        )}
                      >
                        {row.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}

            {showNavigation && (
              <div className="mt-auto grid grid-cols-[48px_minmax(0,1fr)_48px] gap-2 pt-8 max-[360px]:pt-5">
              <button
                type="button"
                aria-label={t(dual("Sertifikat sebelumnya", "Previous certificate"))}
                onClick={() => nudge(-1)}
                onKeyDown={onArrowKeys}
                className="group/nav grid size-12 cursor-pointer place-items-center border border-paper/20 text-paper transition-colors duration-200 hover:border-acid hover:bg-acid hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid"
              >
                <Arrow direction="left" />
              </button>
              <a
                href={active.src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-acid px-3 text-center text-[12px] font-[650] tracking-[0.1em] text-ink uppercase transition-colors duration-200 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid"
              >
                {t(dual("Lihat ukuran penuh", "View full size"))}
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="size-4 shrink-0" aria-hidden="true">
                  <path d="M7 3H3v4M13 3h4v4M17 13v4h-4M3 13v4h4" />
                </svg>
              </a>
              <button
                type="button"
                aria-label={t(dual("Sertifikat berikutnya", "Next certificate"))}
                onClick={() => nudge(1)}
                onKeyDown={onArrowKeys}
                className="group/nav grid size-12 cursor-pointer place-items-center border border-paper/20 text-paper transition-colors duration-200 hover:border-acid hover:bg-acid hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid"
              >
                <Arrow direction="right" />
              </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {showNavigation && !showCaption && (
        <div className="mt-4 flex justify-center gap-2">
          {(["left", "right"] as const).map((side) => (
            <button
              key={side}
              type="button"
              aria-label={side === "left" ? t(dual("Sertifikat sebelumnya", "Previous certificate")) : t(dual("Sertifikat berikutnya", "Next certificate"))}
              onClick={() => nudge(side === "left" ? -1 : 1)}
              onKeyDown={onArrowKeys}
              className="group/nav grid size-12 cursor-pointer place-items-center border border-paper/20 text-paper transition-colors duration-200 hover:border-acid hover:bg-acid hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid"
            >
              <Arrow direction={side} />
            </button>
          ))}
        </div>
      )}

      {showPagination && (
        <div
          ref={paginationRailRef}
          className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto border-t border-paper/12 px-2 pt-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={t(dual("Pilih sertifikat", "Choose a certificate"))}
        >
          {slides.map((slide, index) => {
            const isActive = index === selected;
            return (
              <button
                key={slide.src}
                ref={(node) => {
                  paginationRefs.current[index] = node;
                }}
                type="button"
                aria-controls={`${carouselId}-slide-${index}`}
                aria-label={t(dual(`Ke sertifikat ${index + 1}`, `Go to certificate ${index + 1}`))}
                aria-pressed={isActive}
                onClick={() => goTo(index)}
                onKeyDown={(event) => onPaginationKeys(event, index)}
                className={clsx(
                  "group/thumb relative w-[112px] shrink-0 snap-start cursor-pointer border p-1 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid max-[680px]:w-[96px] max-[360px]:w-[84px]",
                  isActive ? "border-acid bg-acid/8" : "border-paper/18 hover:border-paper/50",
                )}
              >
                <span className={clsx("absolute inset-x-0 -top-px h-0.5 transition-colors", isActive ? "bg-acid" : "bg-transparent")} aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.src} alt="" loading="lazy" decoding="async" className="aspect-[1.414] w-full object-cover opacity-72 transition-opacity duration-200 group-hover/thumb:opacity-100" />
                <span className="mt-2 flex items-center justify-between gap-2 px-0.5 pb-0.5 font-mono text-[12px] tabular-nums">
                  <span className={isActive ? "text-acid" : "text-paper/65"}>{String(index + 1).padStart(2, "0")}</span>
                  {slide.subtitle ? <span className="truncate text-[11px] text-paper/55 uppercase">{slide.subtitle}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
