"use client";

import * as React from "react";
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

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
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

  const reduced = React.useRef(false);
  React.useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

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
      card.style.zIndex = String(100 - Math.round(distance));
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
      if (reduced.current) {
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
    [indexAt, paint],
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

  const active = slides[selected];

  return (
    <div
      className={clsx("w-full", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          // Vertical padding keeps the drop shadows clear of the overflow clip.
          className="cursor-grab overflow-hidden py-10 active:cursor-grabbing"
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
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={t(dual(`${index + 1} dari ${count}`, `${index + 1} of ${count}`))}
                aria-hidden={index !== selected}
                className={clsx(
                  "absolute top-0 left-1/2 overflow-hidden bg-ink shadow-[0_28px_70px_rgba(0,0,0,0.6)] transition-[border-color,box-shadow] duration-300 will-change-transform",
                  index === selected
                    ? "border-2 border-acid shadow-[0_28px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(216,255,62,0.25),0_0_60px_rgba(216,255,62,0.18)]"
                    : "border border-paper/15",
                  cardClassName,
                )}
                style={{ width: "var(--cf-card)", aspectRatio: String(aspectRatio) }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  // The centred card and its first neighbour carry the section
                  // visually, so they load eagerly; lazy-loading them means the
                  // hero of the section pops in after the reader arrives. The
                  // remaining eight stay lazy so the page still starts cheap.
                  loading={index < 2 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                  className="size-full select-none object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            {(["left", "right"] as const).map((side) => (
              <button
                key={side}
                type="button"
                aria-label={side === "left" ? t(dual("Sertifikat sebelumnya", "Previous certificate")) : t(dual("Sertifikat berikutnya", "Next certificate"))}
                onClick={() => nudge(side === "left" ? -1 : 1)}
                onKeyDown={onArrowKeys}
                className={clsx(
                  "group/nav absolute top-1/2 z-[200] grid size-14 -translate-y-1/2 place-items-center rounded-full text-paper transition-colors duration-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid max-[680px]:size-12",
                  side === "left" ? "left-1 max-[680px]:left-0" : "right-1 max-[680px]:right-0",
                )}
              >
                {/* Glass base — keeps the arrow legible over a bright scan. */}
                <span className="absolute inset-0 rounded-full border border-paper/20 bg-ink/55 backdrop-blur-md transition-colors duration-300 group-hover/nav:border-acid" />
                {/* Acid disc that irises open from the centre on hover. */}
                <span className="absolute inset-0 scale-0 rounded-full bg-acid transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nav:scale-100" />
                <span className="relative">
                  <Arrow direction={side} />
                </span>
              </button>
            ))}
          </>
        )}
      </div>

      {showCaption && active?.title && (
        // Keyed on `selected` so the whole caption remounts per slide — the
        // text swaps cleanly instead of morphing mid-word between two titles.
        <div key={selected} className="mt-6 flex flex-col items-center px-6 text-center">
          {active.subtitle && (
            <p className="mb-3 inline-flex items-center gap-2 border border-acid/25 px-3 py-1 text-[10px] tracking-[0.16em] text-acid/90 uppercase">
              {active.subtitle}
            </p>
          )}
          <p className="font-display m-0 max-w-[22ch] text-[clamp(22px,2.6vw,36px)] leading-[1.05] font-[680] tracking-[-0.04em] text-paper">
            {active.title}
          </p>
          {active.meta && active.meta.length > 0 && (
            <dl className="mt-6 flex flex-wrap items-start justify-center gap-x-10 gap-y-4">
              {active.meta.map((row) => {
                const score = row.label.toLowerCase() === "nilai" || row.label.toLowerCase() === "score";
                return (
                  <div key={row.label} className="flex min-w-[86px] flex-col items-center gap-1.5">
                    <dt className="text-[9px] tracking-[0.16em] text-[#7f8177] uppercase">{row.label}</dt>
                    <dd
                      className={clsx(
                        "m-0 font-mono tabular-nums",
                        // The mark is the number people scan for, so it gets
                        // display scale; dates and duration stay supporting text.
                        score
                          ? "text-[clamp(26px,3vw,40px)] leading-none font-[600] text-acid"
                          : "text-[13px] leading-snug text-paper/80",
                      )}
                    >
                      {row.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
      )}

      {showPagination && (
        // A rail of ticks, not dots: with ten slides, dots read as decoration
        // and give no sense of position. Each tick is a full-height 44px hit
        // area with a hairline inside it, so the row stays quiet while every
        // target still meets the touch minimum.
        <div
          className="mx-auto mt-7 flex w-full max-w-[520px] items-stretch justify-center gap-px px-1"
          role="tablist"
          aria-label={t(dual("Pilih sertifikat", "Choose a certificate"))}
        >
          {slides.map((slide, index) => {
            const active = index === selected;
            return (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-label={t(dual(`Ke sertifikat ${index + 1}`, `Go to certificate ${index + 1}`))}
                aria-selected={active}
                onClick={() => goTo(index)}
                onKeyDown={onArrowKeys}
                // `flex-1` so the ten ticks split whatever width is going,
                // which is the widest each target can be while still showing
                // all ten. Ten 44px targets need 440px and simply do not fit a
                // 375px screen, so the rail is deliberately the SECONDARY
                // control here: the 48px arrow buttons and the swipe gesture
                // both stay comfortably above the touch minimum.
                className="group/tick relative grid h-11 min-w-0 flex-1 place-items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid"
              >
                <span
                  className={clsx(
                    "block w-full origin-bottom transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    active
                      ? "h-3.5 bg-acid"
                      : "h-1 bg-paper/20 group-hover/tick:h-2 group-hover/tick:bg-paper/50",
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
