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
} from "motion/react";
import {
  profileAbout,
  profileLocation,
  profileName,
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
import { profilePhotoSrc } from "./profile-photo";
import { TechIcon } from "./tech-icons";

const headline = [
  { text: "Saya adalah", accent: false },
  { text: "Fullstack Developer.", accent: true },
];

export function ProfilePortrait() {
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
    <figure className="relative mx-auto w-full max-w-[400px] min-[1001px]:mx-0 min-[1001px]:sticky min-[1001px]:top-28">
      <div className="mb-3 flex items-center justify-between text-[10px] tracking-[0.12em] uppercase">
        <span>Portrait</span>
        <span className="font-mono">01 / FR</span>
      </div>

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
          className="relative aspect-[3/4] overflow-hidden border border-ink bg-[#cfcbbf] [transform-style:preserve-3d] will-change-transform"
          style={tilt ? { rotateX, rotateY } : undefined}
        >
          <motion.img
            src={profilePhotoSrc}
            alt={`Foto profil ${profileName}`}
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

          <span className="pointer-events-none absolute top-0 left-0 z-2 size-3.5 border-t-2 border-l-2 border-ink" aria-hidden="true" />
          <span className="pointer-events-none absolute top-0 right-0 z-2 size-3.5 border-t-2 border-r-2 border-ink" aria-hidden="true" />
          <span className="pointer-events-none absolute bottom-0 left-0 z-2 size-3.5 border-b-2 border-l-2 border-ink" aria-hidden="true" />
          <span className="pointer-events-none absolute right-0 bottom-0 z-2 size-3.5 border-r-2 border-b-2 border-ink" aria-hidden="true" />

          <div className="absolute inset-x-0 bottom-0 z-3 flex items-end justify-between gap-3 p-3.5 text-paper">
            <span className="inline-flex min-h-11 items-center gap-2 border border-paper/25 bg-ink/55 px-3 text-[10px] tracking-[0.12em] uppercase backdrop-blur-md">
              <i className="size-[7px] animate-pulse-dot rounded-full bg-acid shadow-[0_0_0_4px_rgba(216,255,62,0.18)] not-italic" aria-hidden="true" />
              Open to work
            </span>
          </div>
        </motion.div>
      </motion.div>

      <figcaption className="relative z-[1] mt-4 flex items-end justify-between gap-4 border-t border-ink/25 pt-3">
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
      </figcaption>
    </figure>
  );
}

export function ProfileCopy() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="manifesto-copy min-w-0"
      variants={profileParent}
      initial={reduced ? "shown" : "hidden"}
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      <motion.p className="eyebrow mb-5 text-[11px] tracking-[0.1em] uppercase" variants={profileItem}>
        Tentang saya
      </motion.p>

      <h2
        id="manifesto-title"
        className="font-display mb-7 max-w-[920px] text-[clamp(40px,5.2vw,82px)] leading-[0.92] font-[560] tracking-[-0.07em] max-[680px]:mb-6 max-[680px]:text-[clamp(36px,11vw,56px)]"
      >
        {headline.map((line, lineIndex) => (
          <span className="block overflow-hidden py-[0.04em] [perspective:700px]" key={line.text}>
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
                  <span className="relative z-[1]">{line.text}</span>
                </>
              ) : (
                line.text
              )}
            </motion.span>
          </span>
        ))}
      </h2>

      <motion.ul
        className="mb-8 flex list-none flex-wrap gap-2 p-0"
        variants={profileChipParent}
        aria-label="Keahlian utama"
      >
        {profileSkills.map((skill) => (
          <motion.li key={skill.id} variants={profileChip}>
            <span className="inline-flex min-h-11 items-center gap-2 border border-ink/20 px-3.5 text-[11px] tracking-[0.08em] uppercase transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-paper">
              <TechIcon name={skill.icon} className="size-3.5" />
              {skill.label}
            </span>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div className="flex max-w-[62ch] flex-col gap-5 text-[17px] leading-[1.65] text-[#3f4038] max-[680px]:text-base">
        {profileAbout.map((paragraph) => (
          <motion.p className="m-0" key={paragraph.slice(0, 48)} variants={profileItem}>
            {paragraph}
          </motion.p>
        ))}
      </motion.div>

      <motion.div
        className="profile-stats mt-[clamp(48px,6vw,80px)] grid grid-cols-4 border-t border-ink/25 pt-5 max-[680px]:grid-cols-2"
        variants={profileItem}
      >
        {profileStats.map(([value, label]) => (
          <ProfileStat key={label} value={value} label={label} />
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
      className="flex min-h-[150px] flex-col justify-between border-l border-ink/25 px-[18px] pt-2.5 max-[680px]:min-h-[112px] max-[680px]:px-3"
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease }}
    >
      <strong className="font-display text-[clamp(38px,4.6vw,72px)] leading-[0.8] tracking-[-0.08em] tabular-nums max-[680px]:text-[46px]">
        <motion.span>{display}</motion.span>
      </strong>
      <span className="text-[9px] leading-[1.4] tracking-[0.11em] uppercase">{label}</span>
    </motion.article>
  );
}
