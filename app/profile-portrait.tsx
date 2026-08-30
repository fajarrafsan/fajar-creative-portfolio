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
} from "./content";
import {
  ease,
  profileChip,
  profileChipParent,
  profileItem,
  profileParent,
  profileWord,
  useMediaQuery,
} from "./motion";
import { TechIcon } from "./tech-icons";
import { useT } from "./i18n";

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
const portraitEyebrow: Variants = {
  hidden: { opacity: 0, y: -8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

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

export function ProfilePortrait() {
  const t = useT();
  const reduced = useReducedMotion();
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
    rotateY.set(px * 9);
    rotateX.set(-py * 7);
  };

  const release = () => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  };

  return (
    <motion.figure
      className="relative mx-auto w-full max-w-[400px] min-[1001px]:mx-0 min-[1001px]:sticky min-[1001px]:top-28"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -20% 0px", amount: 0.3 }}
    >
      <motion.div
        variants={portraitEyebrow}
        className="mb-3 flex items-center justify-between text-[10px] tracking-[0.12em] uppercase"
      >
        <span>{t(copy.portrait)}</span>
        <span className="font-mono">01 / FR</span>
      </motion.div>

      <motion.div
        className="relative [perspective:1100px]"
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
            className="absolute inset-0 size-full object-cover object-[center_20%]"
            initial={false}
            animate={{
              scale: hovered && !reduced ? 1.06 : 1,
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

          <motion.span variants={portraitCorner} custom={0} className="pointer-events-none absolute top-0 left-0 z-2 size-3.5 border-t-2 border-l-2 border-ink" aria-hidden="true" />
          <motion.span variants={portraitCorner} custom={1} className="pointer-events-none absolute top-0 right-0 z-2 size-3.5 border-t-2 border-r-2 border-ink" aria-hidden="true" />
          <motion.span variants={portraitCorner} custom={2} className="pointer-events-none absolute bottom-0 left-0 z-2 size-3.5 border-b-2 border-l-2 border-ink" aria-hidden="true" />
          <motion.span variants={portraitCorner} custom={3} className="pointer-events-none absolute right-0 bottom-0 z-2 size-3.5 border-r-2 border-b-2 border-ink" aria-hidden="true" />

          <motion.div variants={portraitBadge} className="absolute inset-x-0 bottom-0 z-3 flex items-end justify-between gap-3 p-3.5 text-paper">
            <span className="inline-flex min-h-11 items-center gap-2 border border-paper/25 bg-ink/55 px-3 text-[10px] tracking-[0.12em] uppercase backdrop-blur-md">
              <i className="size-[7px] animate-pulse-dot rounded-full bg-acid shadow-[0_0_0_4px_rgba(216,255,62,0.18)] not-italic" aria-hidden="true" />
              {t(copy.openToWork)}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.figcaption
        variants={portraitFigcaption}
        className="relative z-[1] mt-4 flex items-end justify-between gap-4 border-t border-ink/25 pt-3"
      >
        <div>
          <strong className="font-display block text-[22px] leading-none font-[640] tracking-[-0.045em]">
            {profileName}
          </strong>
          <span className="mt-1.5 block text-[11px] tracking-[0.1em] uppercase">
            {profileRole}
          </span>
        </div>
        <span className="shrink-0 pb-0.5 text-[10px] tracking-[0.1em] uppercase">
          {profileLocation}
        </span>
      </motion.figcaption>
    </motion.figure>
  );
}

export function ProfileCopy() {
  const reduced = useReducedMotion();
  const t = useT();

  return (
    <motion.div
      className="manifesto-copy min-w-0"
      variants={profileParent}
      initial={reduced ? "shown" : "hidden"}
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -20% 0px", amount: 0.12 }}
    >
      <motion.p className="eyebrow mb-5 text-[11px] tracking-[0.1em] uppercase" variants={profileItem}>
        {t(copy.aboutMe)}
      </motion.p>

      <h2
        id="manifesto-title"
        className="font-display mb-7 max-w-[920px] text-[clamp(40px,5.2vw,82px)] leading-[0.92] font-[560] tracking-[-0.07em] max-[680px]:mb-6 max-[680px]:text-[clamp(32px,9.6vw,56px)] max-[420px]:text-[clamp(26px,8.2vw,32px)]"
      >
        {profileHeadline.map((line, lineIndex) => (
          <span className="block overflow-hidden py-[0.04em] [perspective:700px]" key={line.text.id}>
            <motion.span
              className={`relative isolate inline-block origin-bottom-left will-change-transform ${
                line.accent ? "text-ink" : ""
              }`}
              variants={profileWord}
              custom={lineIndex}
            >
              {line.accent ? (
                <>
                  <motion.span
                    className="absolute inset-x-[-0.06em] bottom-[0.08em] z-0 h-[0.32em] bg-acid"
                    initial={{ scaleX: reduced ? 1 : 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: reduced ? 0 : 0.65, ease, delay: reduced ? 0 : 0.42 }}
                    style={{ originX: 0 }}
                    aria-hidden="true"
                  />
                  <span className="relative z-[1]">{t(line.text)}</span>
                </>
              ) : (
                t(line.text)
              )}
            </motion.span>
          </span>
        ))}
      </h2>

      <motion.ul
        className="mb-8 flex list-none flex-wrap gap-2 p-0"
        variants={profileChipParent}
        aria-label={t(copy.skillsAria)}
      >
        {profileSkills.map((skill, index) => (
          <motion.li key={skill.id} variants={profileChip}>
            <span className="inline-flex min-h-11 items-center gap-2 border border-ink/20 px-3.5 text-[11px] tracking-[0.08em] uppercase transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-paper">
              <span className="font-mono text-[9px] tracking-[0.06em] opacity-45">{String(index + 1).padStart(2, "0")}</span>
              <TechIcon name={skill.icon} className="size-3.5" />
              {skill.label}
            </span>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div className="flex max-w-[62ch] flex-col gap-5 text-[17px] leading-[1.65] text-[#3f4038] max-[680px]:text-base">
        {t(profileAbout).map((paragraph) => (
          <motion.p className="m-0" key={paragraph.map((segment) => segment.text).join("").slice(0, 48)} variants={profileItem}>
            {paragraph.map((segment, index) => {
              if (!segment.tone) return <span key={index}>{segment.text}</span>;
              if (segment.tone === "java")
                return (
                  <strong key={index} className="profile-token profile-token-java font-semibold text-java">
                    {segment.text}
                  </strong>
                );
              if (segment.tone === "react")
                return (
                  <strong key={index} className="profile-token profile-token-react font-semibold text-ink">
                    {segment.text}
                  </strong>
                );
              if (segment.tone === "dim")
                return (
                  <span key={index} className="text-[#7d7f70]">
                    {segment.text}
                  </span>
                );
              return (
                <strong key={index} className="font-medium text-ink">
                  {segment.text}
                </strong>
              );
            })}
          </motion.p>
        ))}
      </motion.div>

      <motion.div
        className="profile-stats mt-[clamp(48px,6vw,80px)] grid grid-cols-4 border-t border-ink/25 pt-5 max-[680px]:grid-cols-2"
        variants={profileItem}
      >
        {profileStats.map((stat) => (
          <ProfileStat key={stat.value} value={stat.value} label={t(stat.label)} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
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
    const controls = animate(motionValue, target, { duration: 1.15, ease });
    return () => controls.stop();
  }, [inView, motionValue, reduced, target]);

  return (
    <motion.article
      ref={ref}
      className="flex min-h-[150px] flex-col justify-between border-l border-ink/25 px-[18px] pt-2.5 max-[680px]:min-h-[112px] max-[680px]:px-3 max-[420px]:min-h-[96px] max-[420px]:px-2.5"
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease }}
    >
      <strong className="font-display text-[clamp(38px,4.6vw,72px)] leading-[0.8] tracking-[-0.08em] tabular-nums max-[680px]:text-[46px] max-[420px]:text-[36px]">
        <motion.span>{display}</motion.span>
      </strong>
      <span className="text-[9px] leading-[1.4] tracking-[0.11em] uppercase">{label}</span>
    </motion.article>
  );
}
