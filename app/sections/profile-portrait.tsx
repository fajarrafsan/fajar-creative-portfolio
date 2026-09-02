"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  copy,
  profileAbout,
  profileHeadline,
  profileLocation,
  profileName,
  profilePhotoSrc,
  profileRole,
  profileSkills,
  profileStats,
} from "@/app/content";
import {
  Magnetic,
  ease,
  profileChip,
  profileChipParent,
  profileItem,
  profileParent,
  profileStat,
  profileStatParent,
  profileWord,
  useLatchedInView,
  useMediaQuery,
} from "@/app/lib/motion";
import { TechIcon } from "@/app/components/tech-icons";
import { useT } from "@/app/lib/i18n";

/**
 * Portrait entrance.
 *
 * Deliberately NOT driven by `staggerChildren` — the photo's clip-path wipe
 * and the four corner brackets need to land at specific moments relative to
 * each other (brackets snap in only once the wipe has visibly finished, not
 * at a fixed index-based offset), so every step below carries its own
 * explicit `delay` off a single shared timeline instead.
 *
 * The hover-tilt plate, the photo image, and the hover-shine sweep already
 * carry their own explicit `animate` for the pointer interaction — adding
 * variants to those too would fight that, so this entrance only touches the
 * frame, the corner marks, the badge, and the two text moments.
 */
const portraitWipe: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)", scale: 1.05 },
  shown: {
    clipPath: "inset(0 0% 0 0)",
    scale: 1,
    transition: {
      clipPath: { duration: 0.85, delay: 0.1, ease: [0.76, 0, 0.24, 1] },
      scale: { duration: 1.05, delay: 0.1, ease },
    },
  },
};

const portraitCorner: Variants = {
  hidden: { opacity: 0, scale: 0.35 },
  shown: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease, delay: 0.95 + index * 0.07 },
  }),
};

const portraitBadge: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: 1.05 } },
};

const portraitFigcaption: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(5px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease, delay: 1.3 } },
};

/** Shared horizon for PORTRAIT / ABOUT ME so the two columns start on one line. */
const columnLabel =
  "flex h-9 shrink-0 items-center justify-between text-[11px] tracking-[0.14em] uppercase text-ink/75";

function ColumnKicker({
  left,
  right,
  shown,
  reduced,
}: {
  left: string;
  right?: string;
  shown: boolean;
  reduced: boolean;
}) {
  return (
    <motion.div className={`${columnLabel} mb-5`} variants={profileItem} data-profile="kicker">
      <span className="flex min-w-0 items-center gap-2.5">
        <motion.i
          className="size-1.5 shrink-0 bg-acid"
          aria-hidden="true"
          initial={false}
          animate={{ scale: shown ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 16, delay: reduced ? 0 : 0.12 }}
        />
        <span className="overflow-hidden">
          <motion.span
            className="block"
            initial={false}
            animate={{ y: shown ? "0%" : "115%" }}
            transition={{ duration: reduced ? 0 : 0.5, ease }}
          >
            {left}
          </motion.span>
        </span>
      </span>
      {right ? (
        <span className="overflow-hidden font-mono text-ink/45">
          <motion.span
            className="block"
            initial={false}
            animate={{ y: shown ? "0%" : "-115%" }}
            transition={{ duration: reduced ? 0 : 0.5, ease, delay: reduced ? 0 : 0.06 }}
          >
            {right}
          </motion.span>
        </span>
      ) : (
        <motion.span
          className="h-px w-10 origin-right bg-ink/25"
          aria-hidden="true"
          initial={false}
          animate={{ scaleX: shown ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.55, ease, delay: reduced ? 0 : 0.18 }}
        />
      )}
    </motion.div>
  );
}

export function ProfilePortrait() {
  const t = useT();
  const rootRef = useRef<HTMLElement>(null);
  const { reduced, shown } = useLatchedInView(rootRef, {
    margin: "0px 0px -20% 0px",
    amount: 0.3,
  });
  const finePointer = useMediaQuery("(pointer: fine)");
  const tilt = finePointer && !reduced;
  const [hovered, setHovered] = useState(false);

  const rotateX = useSpring(0, { stiffness: 220, damping: 22, mass: 0.45 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 22, mass: 0.45 });
  const plateX = useTransform(rotateY, (value) => value * 0.55);
  const plateY = useTransform(rotateX, (value) => -value * 0.55);

  const track = (event: React.PointerEvent<HTMLElement>) => {
    if (!tilt) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width - 0.5;
    const py = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateY.set(px * 12);
    rotateX.set(-py * 9);
  };

  const release = () => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  };

  return (
    <motion.figure
      ref={rootRef}
      className="relative mx-auto flex h-full w-full max-w-[520px] min-w-0 flex-col min-[1001px]:mx-0 min-[1001px]:max-w-none"
      initial={shown ? false : reduced ? "shown" : "hidden"}
      animate={shown ? "shown" : "hidden"}
    >
      <ColumnKicker left={t(copy.portrait)} right="01 / FR" shown={shown} reduced={reduced} />

      <motion.div
        className="relative shrink-0 [perspective:1100px]"
        onPointerMove={track}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={release}
        data-cursor
      >
        <motion.span
          className="absolute top-3 left-3 size-full bg-acid"
          style={tilt ? { x: plateX, y: plateY } : undefined}
          animate={tilt ? undefined : { x: hovered ? 6 : 12, y: hovered ? 6 : 12 }}
          transition={{ duration: 0.28, ease }}
          aria-hidden="true"
        />

        <motion.div
          variants={portraitWipe}
          className="relative aspect-[3/4] overflow-hidden border border-ink bg-[#cfcbbf] [transform-style:preserve-3d] will-change-transform"
          style={tilt ? { rotateX, rotateY } : undefined}
        >
          <motion.img
            src={profilePhotoSrc}
            alt={t(copy.photoAlt)}
            width={760}
            height={1014}
            decoding="async"
            className="absolute inset-0 size-full object-cover object-[center_20%] will-change-transform"
            initial={false}
            animate={{
              scale: hovered && !reduced ? 1.08 : shown && !reduced ? 1.02 : 1,
            }}
            transition={{ duration: 0.55, ease }}
          />

          <span
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(11,13,12,0.38))]"
            aria-hidden="true"
          />
          <motion.span
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-paper/35 to-transparent skew-x-[-18deg]"
            animate={{ x: hovered && !reduced ? "220%" : "-80%" }}
            transition={{ duration: hovered ? 0.7 : 0, ease }}
            aria-hidden="true"
          />

          {shown && !reduced ? (
            <motion.span
              className="pointer-events-none absolute inset-y-0 z-1 w-1/4 bg-linear-to-r from-transparent via-acid/40 to-transparent"
              initial={{ x: "-50%", opacity: 0 }}
              animate={{ x: "320%", opacity: [0, 1, 0] }}
              transition={{ duration: 0.95, delay: 0.82, ease }}
              aria-hidden="true"
            />
          ) : null}

          <motion.span variants={portraitCorner} custom={0} className="pointer-events-none absolute top-0 left-0 z-2 size-3.5 border-t-2 border-l-2 border-ink" aria-hidden="true" />
          <motion.span variants={portraitCorner} custom={1} className="pointer-events-none absolute top-0 right-0 z-2 size-3.5 border-t-2 border-r-2 border-ink" aria-hidden="true" />
          <motion.span variants={portraitCorner} custom={2} className="pointer-events-none absolute bottom-0 left-0 z-2 size-3.5 border-b-2 border-l-2 border-ink" aria-hidden="true" />
          <motion.span variants={portraitCorner} custom={3} className="pointer-events-none absolute right-0 bottom-0 z-2 size-3.5 border-r-2 border-b-2 border-ink" aria-hidden="true" />

          <motion.div variants={portraitBadge} className="absolute inset-x-0 bottom-0 z-3 flex items-end justify-between gap-3 p-3.5 text-paper">
            <motion.span
              className="inline-flex min-h-11 items-center gap-2 border border-paper/25 bg-ink/55 px-3 text-[10px] tracking-[0.12em] uppercase backdrop-blur-md"
              animate={
                reduced
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 0 0 rgba(216,255,62,0)",
                        "0 0 0 8px rgba(216,255,62,0.14)",
                        "0 0 0 0 rgba(216,255,62,0)",
                      ],
                    }
              }
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            >
              <i className="size-[7px] animate-pulse-dot rounded-full bg-acid shadow-[0_0_0_4px_rgba(216,255,62,0.18)] not-italic" aria-hidden="true" />
              {t(copy.openToWork)}
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.figcaption
        variants={portraitFigcaption}
        className="relative z-[1] mt-5 flex min-h-[88px] shrink-0 items-end justify-between gap-4 border-t-2 border-ink pt-5 min-[1001px]:mt-auto min-[1001px]:min-h-[152px]"
        data-profile="foot"
      >
        <div>
          <strong className="font-display block text-[clamp(24px,2.2vw,32px)] leading-none font-[640] tracking-[-0.05em]">
            {profileName}
          </strong>
          <span className="mt-2 block text-[12px] tracking-[0.14em] uppercase text-ink/70">
            {profileRole}
          </span>
        </div>
        <span className="shrink-0 text-[11px] tracking-[0.14em] uppercase text-ink/60">
          {profileLocation}
        </span>
      </motion.figcaption>
    </motion.figure>
  );
}

export function ProfileCopy() {
  const t = useT();
  const rootRef = useRef<HTMLDivElement>(null);
  const { reduced, shown } = useLatchedInView(rootRef, {
    margin: "0px 0px -20% 0px",
    amount: 0.12,
  });

  return (
    <motion.div
      ref={rootRef}
      className="manifesto-copy flex h-full min-w-0 flex-col"
      variants={profileParent}
      initial={shown ? false : reduced ? "shown" : "hidden"}
      animate={shown ? "shown" : "hidden"}
    >
      <ColumnKicker left={t(copy.aboutMe)} shown={shown} reduced={reduced} />

      <h2
        id="manifesto-title"
        className="font-display mb-8 text-[clamp(42px,5.6vw,88px)] leading-[0.9] font-[560] tracking-[-0.068em] max-[680px]:mb-6 max-[680px]:text-[clamp(36px,11vw,58px)] max-[420px]:text-[clamp(32px,9.6vw,44px)]"
      >
        {profileHeadline.map((line, lineIndex) => {
          const text = t(line.text);
          return (
            <span className="block overflow-hidden pt-[0.04em] pb-[0.12em] [perspective:800px]" key={lineIndex}>
              {line.accent ? (
                <span className="relative isolate inline-block">
                  <motion.span
                    className="absolute inset-x-[-0.04em] bottom-[0.06em] z-0 h-[0.3em] origin-left bg-acid"
                    initial={false}
                    animate={{ scaleX: shown ? 1 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.75, ease, delay: reduced || !shown ? 0 : 0.42 }}
                    aria-hidden="true"
                  />
                  {Array.from(text).map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      className="relative z-[1] inline-block will-change-transform"
                      initial={shown || reduced ? false : { y: "110%", opacity: 0 }}
                      animate={shown ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
                      transition={{
                        duration: reduced ? 0 : 0.5,
                        ease,
                        delay: reduced ? 0 : 0.1 + charIndex * 0.018,
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </span>
              ) : (
                <motion.span className="inline-block origin-bottom-left" variants={profileWord} custom={lineIndex}>
                  {text}
                </motion.span>
              )}
            </span>
          );
        })}
      </h2>

      <motion.ul
        className="mb-8 flex list-none flex-wrap gap-2.5 p-0 max-[680px]:mb-7"
        variants={profileChipParent}
        aria-label={t(copy.skillsAria)}
      >
        {profileSkills.map((skill, index) => (
          <motion.li key={skill.id} variants={profileChip}>
            <Magnetic strength={0.28}>
              <motion.span
                className="inline-flex min-h-11 items-center gap-2.5 border border-ink/25 bg-paper px-3.5 text-[12px] tracking-[0.1em] uppercase will-change-transform"
                whileHover={
                  reduced
                    ? undefined
                    : { y: -4, backgroundColor: "#0b0d0c", color: "#f0efe8", borderColor: "#d8ff3e" }
                }
                transition={{ duration: 0.22, ease }}
              >
                <span className="font-mono text-[10px] tracking-[0.06em] opacity-45">{String(index + 1).padStart(2, "0")}</span>
                <TechIcon name={skill.icon} className="size-4" />
                {skill.label}
              </motion.span>
            </Magnetic>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div className="flex max-w-[58ch] flex-col gap-5 text-[18px] leading-[1.65] text-[#3f4038] max-[680px]:text-[16.5px] max-[680px]:leading-[1.62]">
        {t(profileAbout).map((paragraph, paragraphIndex) => (
          <motion.p className="m-0" key={paragraphIndex} variants={profileItem}>
            {paragraph.map((segment, index) => {
              if (segment.tone === "java" || segment.tone === "react")
                return (
                  <motion.strong
                    key={index}
                    className={`profile-token font-semibold ${segment.tone === "java" ? "profile-token-java" : "profile-token-react"}`}
                    initial={false}
                    animate={{ backgroundSize: shown ? "100% 44%" : "0% 44%" }}
                    transition={{
                      duration: reduced ? 0 : 0.7,
                      ease,
                      delay: reduced ? 0 : 0.28 + paragraphIndex * 0.12 + index * 0.08,
                    }}
                  >
                    {segment.text}
                  </motion.strong>
                );
              if (segment.tone === "strong")
                return (
                  <strong key={index} className="font-semibold text-ink">
                    {segment.text}
                  </strong>
                );
              return <span key={index}>{segment.text}</span>;
            })}
          </motion.p>
        ))}
      </motion.div>

      <motion.div
        className="profile-stats mt-10 grid min-h-[120px] grid-cols-4 border-t-2 border-ink pt-5 min-[1001px]:mt-auto min-[1001px]:min-h-[152px] max-[680px]:mt-10 max-[680px]:grid-cols-2 max-[680px]:min-h-0"
        data-profile="foot"
        variants={profileStatParent}
      >
        {profileStats.map((stat) => (
          <ProfileStat key={stat.value} value={stat.value} label={t(stat.label)} reduced={reduced} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function ProfileStat({
  value,
  label,
  reduced: reducedMotion,
}: {
  value: string;
  label: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion() || reducedMotion;
  const decimals = (value.split(".")[1] ?? "").length;
  const padded = /^0\d+$/.test(value);
  const target = Number(value);
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) => {
    if (decimals) return latest.toFixed(decimals);
    const rounded = Math.round(latest);
    return padded ? String(rounded).padStart(value.length, "0") : String(rounded);
  });

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      motionValue.set(target);
      return;
    }
    const controls = animate(motionValue, target, { duration: 1.2, ease });
    return () => controls.stop();
  }, [inView, motionValue, reduced, target]);

  return (
    <motion.article
      ref={ref}
      variants={profileStat}
      className="relative flex min-h-0 flex-col justify-between border-l border-ink/25 px-[18px] pt-2.5 max-[680px]:min-h-[108px] max-[680px]:px-3 max-[680px]:py-3.5 max-[680px]:first:pl-3 max-[420px]:min-h-[96px] max-[680px]:odd:border-l-0 max-[680px]:even:border-l max-[680px]:[&:nth-child(n+3)]:border-t max-[680px]:[&:nth-child(n+3)]:border-ink/25 max-[680px]:[&:nth-child(n+3)]:pt-4 first:border-l-0 first:pl-0"
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ duration: 0.22, ease }}
    >
      <motion.span
        className="pointer-events-none absolute top-2 right-2 size-2 border-t border-r border-ink"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.4 }}
        transition={{ duration: reduced ? 0 : 0.35, ease, delay: reduced ? 0 : 0.2 }}
      />
      <strong className="font-display text-[clamp(42px,4.8vw,76px)] leading-[0.8] tracking-[-0.08em] tabular-nums max-[680px]:text-[48px] max-[420px]:text-[40px]">
        <motion.span>{display}</motion.span>
      </strong>
      <span className="text-[10px] leading-[1.35] tracking-[0.12em] uppercase text-ink/70">{label}</span>
      <motion.span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-acid"
        aria-hidden="true"
        initial={false}
        animate={{ scaleX: inView ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.2, ease }}
      />
    </motion.article>
  );
}
