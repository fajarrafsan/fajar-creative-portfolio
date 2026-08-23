"use client";

import { useEffect, useLayoutEffect, useRef, useState, type Ref } from "react";
import { MotionConfig, motion } from "motion/react";
import {
  capabilities,
  cvFile,
  email,
  experience,
  frontendArchitecture,
  githubUrl,
  linkedInUrl,
  marqueeBottom,
  marqueeTop,
  stackGroups,
} from "./content";
import {
  CursorGlow,
  Magnetic,
  ScrollProgress,
  SmoothScroll,
  contactCta,
  contactCtaParent,
  contactFoot,
  contactItem,
  contactLine,
  contactParent,
  contactRow,
  contactRowsParent,
  contactRule,
  heroChip,
  heroChipParent,
  heroLine,
  reveal,
  staggerChild,
  staggerParent,
  useHeroParallax,
} from "./motion";
import { HorizontalScrollSection } from "./horizontal-scroll-section";
import { HeroGraph } from "./hero-graph";
import { InkParticles } from "./ink-particles";
import { BackgroundPaths } from "../components/ui/background-paths";
import { ProfileCopy, ProfilePortrait } from "./profile-portrait";
import { ProjectStack } from "./project-stack";
import { SiteHeader } from "./site-header";
import { SystemGraph } from "./system-graph";
import { SocialIcon, TechIcon } from "./tech-icons";
import { CvPreview, openCvPreview } from "./cv-preview";
import { IntroGate, useIntroReady } from "./intro";

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.1em]">
      <span className="grid size-[38px] shrink-0 place-items-center rounded-full border border-current">
        {index}
      </span>
      <p className="m-0">{label}</p>
    </div>
  );
}

function MarqueeSequence({
  words,
  muted,
  seqRef,
}: {
  words: string[];
  muted: boolean;
  seqRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={seqRef} className="flex shrink-0 items-center">
      {words.map((word) => (
        <span className="flex shrink-0 items-center" key={word}>
          <span className="px-[2vw]">{word}</span>
          <i className={`text-[0.55em] not-italic ${muted ? "text-acid" : "text-java"}`} aria-hidden="true">
            ●
          </i>
        </span>
      ))}
    </div>
  );
}

/**
 * Seamless ticker: each half is filled until it is wider than the viewport,
 * then the track is duplicated. A -50% translate then lands on the same glyphs.
 */
function MarqueeTrack({
  words,
  reverse = false,
  muted = false,
}: {
  words: string[];
  reverse?: boolean;
  muted?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLDivElement>(null);
  const [loops, setLoops] = useState(4);
  const size = muted
    ? "text-[clamp(11px,1.05vw,15px)] font-[620] tracking-[0.12em]"
    : "text-[clamp(18px,2vw,31px)] font-[760] tracking-[-0.04em]";

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const sequence = seqRef.current;
    if (!viewport || !sequence) return;

    const update = () => {
      const seqWidth = sequence.getBoundingClientRect().width;
      const viewWidth = viewport.getBoundingClientRect().width;
      if (seqWidth < 1 || viewWidth < 1) return;
      setLoops(Math.max(2, Math.ceil(viewWidth / seqWidth) + 1));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    observer.observe(sequence);
    void document.fonts?.ready.then(update);
    return () => observer.disconnect();
  }, [words, muted]);

  return (
    <div ref={viewportRef} className="overflow-hidden">
      <div
        className={`marquee-track font-display flex w-max items-center whitespace-nowrap will-change-transform ${size} ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {[0, 1].map((copy) => (
          <div className="flex shrink-0 items-center" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {Array.from({ length: loops }, (_, index) => (
              <MarqueeSequence
                key={index}
                words={words}
                muted={muted}
                seqRef={copy === 0 && index === 0 ? seqRef : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (insecure origin, denied permission); the
      // mailto fallback below still gets the visitor where they need to go.
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <Magnetic className="max-[420px]:w-full">
      <button
        type="button"
        onClick={copy}
        data-cursor
        className="group/copy inline-flex min-h-12 w-full max-w-full cursor-pointer items-center justify-center gap-3 border border-ink/35 px-5 text-[12px] tracking-[0.08em] uppercase transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-acid max-[420px]:justify-between max-[420px]:px-3"
      >
        <span className="font-mono min-w-0 truncate normal-case tracking-normal">{email}</span>
        <span aria-hidden="true" className="text-[11px] opacity-60 transition-opacity duration-200 group-hover/copy:opacity-100">
          {copied ? "tersalin" : "salin"}
        </span>
        <span className="sr-only" role="status">
          {copied ? "Alamat email tersalin ke papan klip" : ""}
        </span>
      </button>
    </Magnetic>
  );
}

export default function Home() {
  // `reducedMotion="user"` makes every motion.* element below drop its
  // transform animations (keeping opacity) when the OS asks for reduced
  // motion. Without it the amplified hero entrance would play regardless.
  return (
    <MotionConfig reducedMotion="user">
      <IntroGate>
        <Portfolio />
      </IntroGate>
    </MotionConfig>
  );
}

function Portfolio() {
  const heroRef = useRef<HTMLElement>(null);
  const { gridY, systemRotate, systemY } = useHeroParallax(heroRef);
  const introReady = useIntroReady();

  return (
    <main className="relative min-w-0 overflow-x-clip bg-ink font-sans text-paper">
      <SmoothScroll />
      <ScrollProgress />
      <CursorGlow />
      <div className="grain" aria-hidden="true" />

      <SiteHeader />
      <CvPreview />

      <section ref={heroRef} className="hero relative isolate flex min-h-svh flex-col justify-end overflow-x-clip px-[3vw] pt-33 pb-7 max-[1000px]:pt-[110px] max-[680px]:min-h-[900px] max-[680px]:px-[18px] max-[680px]:pt-[102px] max-[680px]:pb-6 max-[420px]:min-h-svh max-[420px]:px-3.5 max-[420px]:pt-[92px] max-[420px]:pb-5" id="top" aria-labelledby="hero-title">
        <div className="pointer-events-none absolute inset-0 -z-[2] overflow-hidden" aria-hidden="true">
          <motion.div
            className="hero-grid absolute inset-x-0 -inset-y-[15%] will-change-transform bg-[image:linear-gradient(rgba(240,239,232,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(240,239,232,0.25)_1px,transparent_1px)] bg-[size:25vw_25vw] max-[1000px]:bg-[size:50vw_50vw]"
            style={{ y: gridY }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <BackgroundPaths active={introReady} />
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_78%_18%,rgba(216,255,62,0.1),transparent_32%)]" aria-hidden="true" />
        <HeroGraph rotate={systemRotate} y={systemY} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: introReady ? 0.06 : 0 }}
          className="hero-meta relative z-[1] mb-[clamp(28px,4vh,54px)] flex items-end justify-between text-[11px] tracking-[0.09em] uppercase max-[680px]:items-start max-[680px]:mb-auto max-[420px]:flex-col max-[420px]:items-start max-[420px]:gap-3">
          <div className="hero-kicker flex items-center gap-3 max-[680px]:max-w-[200px] max-[680px]:leading-[1.35] max-[420px]:max-w-none">
            <span className="status-dot size-[9px] animate-pulse-dot rounded-full bg-acid shadow-[0_0_0_5px_rgba(216,255,62,0.13)]" aria-hidden="true" />
            Open for fullstack opportunities
          </div>
          <p className="m-0 text-right leading-[1.35] max-[420px]:text-left">Java · Spring · React · TypeScript<br />© 2026</p>
        </motion.div>

        <h1 id="hero-title" className="font-display relative z-[1] m-0 text-[clamp(66px,11.4vw,182px)] leading-[0.77] font-[770] tracking-[-0.086em] uppercase [text-shadow:0_0_28px_rgba(11,13,12,0.8)] max-[1000px]:text-[clamp(62px,16.4vw,126px)] max-[1000px]:leading-[0.79] max-[680px]:text-[clamp(48px,15.2vw,91px)] max-[420px]:text-[clamp(38px,12vw,48px)]">
          {[
            ["FULL", "block overflow-hidden pr-[0.08em]"],
            ["STACK", "block overflow-hidden pr-[0.08em] pl-[13.7vw] text-acid max-[1000px]:pl-[7vw] max-[420px]:pl-[4vw]"],
            ["DEVELOPER.", "block overflow-hidden pr-[0.08em]"],
          ].map(([word, maskClass], index) => (
            <span className={maskClass} key={word}>
              <motion.span
                className="hero-word block origin-bottom-left will-change-transform"
                variants={heroLine}
                custom={index}
                initial="hidden"
                animate={introReady ? "shown" : "hidden"}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: introReady ? 0.58 : 0 }}
          className="hero-foot relative z-[1] mt-[clamp(30px,4vh,50px)] flex items-end justify-between gap-6 border-t border-paper/25 pt-4.5 max-[680px]:items-stretch max-[680px]:gap-5 max-[420px]:mt-7 max-[420px]:flex-col max-[420px]:pt-5 max-[420px]:pb-1">
          <div className="relative min-w-0 w-full">
            <span className="pointer-events-none absolute -inset-x-3 -inset-y-4 -z-[1] bg-[linear-gradient(90deg,var(--color-ink)_0%,var(--color-ink)_62%,transparent_100%)] max-[680px]:-inset-x-2 max-[420px]:inset-x-[-6px] max-[420px]:bg-[linear-gradient(to_top,var(--color-ink)_0%,var(--color-ink)_78%,transparent_100%)]" aria-hidden="true" />
            <p className="mb-5 max-w-[640px] text-[clamp(17px,1.55vw,25px)] leading-[1.3] tracking-[-0.026em] text-paper/85 [text-shadow:0_1px_16px_rgba(11,13,12,0.9)] max-[680px]:max-w-[82%] max-[680px]:text-base max-[420px]:mb-4 max-[420px]:max-w-none max-[420px]:text-[15px] max-[420px]:leading-[1.45]">
              <strong className="hero-lede-name font-[750] tracking-[-0.03em] text-paper">Saya Fajar Rafsan.</strong>{" "}
              Fullstack developer: <em className="hero-lede-token font-semibold text-acid not-italic">API Java</em> yang andal{" "}
              <span className="text-paper/50">di belakang,</span> <em className="hero-lede-token font-semibold text-acid not-italic">interface React</em> yang jelas{" "}
              <span className="text-paper/50">di depan.</span>
            </p>
            <motion.div
              variants={heroChipParent}
              initial="hidden"
              animate={introReady ? "shown" : "hidden"}
              className="mb-5 grid grid-cols-2 gap-2 min-[681px]:mb-5 min-[681px]:flex min-[681px]:flex-wrap min-[681px]:items-center max-[420px]:mb-4"
              aria-label="Stack utama"
            >
              {[
                ["java", "Java"],
                ["springboot", "Spring"],
                ["react", "React"],
                ["typescript", "TypeScript"],
              ].map(([icon, label]) => (
                <motion.span
                  key={label}
                  variants={heroChip}
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-paper/25 bg-ink px-3 text-[10px] tracking-[0.1em] uppercase will-change-transform min-[681px]:justify-start"
                >
                  <TechIcon name={icon} className="size-3.5 shrink-0 text-acid" />
                  {label}
                </motion.span>
              ))}
            </motion.div>
            <div className="flex flex-col gap-2.5 text-[11px] tracking-[0.09em] uppercase min-[681px]:flex-row min-[681px]:flex-wrap min-[681px]:items-center min-[681px]:gap-3">
              <Magnetic className="w-full min-[681px]:w-auto [&_a]:w-full">
                <a
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-acid bg-acid px-5 text-ink transition-colors duration-200 hover:bg-ink hover:text-acid min-[681px]:w-auto"
                  href="#work"
                  data-cursor
                >
                  Lihat proyek <span aria-hidden="true">↓</span>
                </a>
              </Magnetic>
              <div className="grid grid-cols-2 gap-2.5 min-[681px]:contents">
                <Magnetic className="w-full min-[681px]:w-auto [&_button]:w-full">
                  <button
                    type="button"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-paper/35 bg-ink px-5 transition-colors duration-200 hover:border-paper hover:bg-paper hover:text-ink min-[681px]:w-auto"
                    onClick={openCvPreview}
                    data-cursor
                  >
                    Lihat CV
                  </button>
                </Magnetic>
                <Magnetic className="w-full min-[681px]:w-auto [&_a]:w-full">
                  <a
                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-paper/35 bg-ink px-5 transition-colors duration-200 hover:border-paper hover:bg-paper hover:text-ink min-[681px]:w-auto"
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor
                  >
                    <SocialIcon name="github" className="size-3.5" /> GitHub <span aria-hidden="true">↗</span>
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>
          <Magnetic className="max-[680px]:hidden">
            <a className="circle-link grid size-[62px] shrink-0 place-items-center rounded-full border border-paper bg-ink text-[22px] transition-colors duration-250 hover:bg-acid hover:text-ink focus-visible:bg-acid focus-visible:text-ink" href="#work" aria-label="Gulir ke proyek pilihan">
              <span aria-hidden="true">↓</span>
            </a>
          </Magnetic>
        </motion.div>
      </section>

      <section className="overflow-hidden border-y border-ink bg-acid text-ink" aria-label="Teknologi utama">
        <div className="border-b border-ink/15 pt-[18px] pb-4">
          <MarqueeTrack words={marqueeTop} />
        </div>
        <div className="bg-ink pt-3.5 pb-3 text-paper" aria-hidden="true">
          <MarqueeTrack words={marqueeBottom} reverse muted />
        </div>
      </section>

      <section className="manifesto relative overflow-hidden bg-paper px-[3vw] py-[clamp(98px,13vw,210px)] text-ink max-[680px]:px-[18px] max-[680px]:pt-[92px] max-[680px]:pb-[110px] max-[420px]:px-3.5" id="profile" aria-labelledby="manifesto-title">
        <div
          className="pointer-events-none absolute -top-[18%] -left-[12%] size-[min(720px,58vw)] rounded-full bg-[radial-gradient(circle,rgba(216,255,62,0.16),transparent_68%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[8%] bottom-[-12%] size-[min(520px,40vw)] rounded-full bg-[radial-gradient(circle,rgba(255,97,60,0.1),transparent_70%)]"
          aria-hidden="true"
        />
        <motion.div className="relative mb-[clamp(52px,7vw,96px)]" {...reveal}>
          <SectionLabel index="01" label="Profile" />
        </motion.div>

        <div className="relative grid grid-cols-[minmax(240px,0.78fr)_minmax(0,1.55fr)] items-start gap-x-[5vw] gap-y-14 max-[1000px]:grid-cols-1">
          {/* ProfilePortrait stages its own multi-part entrance (wipe, corner
              marks, badge, caption) — wrapping it in the generic `reveal`
              fade would just add a second, conflicting fade on top. */}
          <ProfilePortrait />
          <ProfileCopy />
        </div>
      </section>

      <section className="system-showcase relative grid grid-cols-[0.82fr_1.18fr] items-center gap-[5vw] overflow-hidden bg-ink bg-[image:radial-gradient(circle_at_70%_50%,rgba(57,124,255,0.12),transparent_34%)] px-[3vw] py-[clamp(110px,11vw,176px)] min-[1001px]:max-[1200px]:grid-cols-[minmax(0,0.9fr)_minmax(500px,1.1fr)] min-[1001px]:max-[1200px]:gap-[3vw] max-[1000px]:grid-cols-1 max-[1000px]:py-[110px] max-[680px]:px-[18px] max-[420px]:px-3.5 max-[420px]:py-16" id="architecture" aria-labelledby="system-title">
        <InkParticles className="z-0" />
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.65, margin: "0px 0px -150px 0px" }}
          className="system-copy relative z-[5]"
        >
          <motion.div variants={staggerChild}>
            <SectionLabel index="02" label="Motion architecture" />
          </motion.div>
          <motion.p variants={staggerChild} className="eyebrow mt-[70px] mb-5 text-[11px] tracking-[0.1em] text-acid uppercase min-[1001px]:max-[1200px]:mt-12 max-[680px]:mt-[52px]">Backend in motion</motion.p>
          <motion.h2 variants={staggerChild} id="system-title" className="font-display mb-7 max-w-[670px] text-[clamp(46px,5.4vw,88px)] leading-[0.93] font-[560] tracking-[-0.066em] min-[1001px]:max-[1200px]:text-[clamp(44px,4.8vw,62px)] max-[1000px]:max-w-[850px] max-[680px]:text-[clamp(44px,13vw,68px)] max-[420px]:text-[clamp(32px,10vw,44px)]">
            Setiap <span className="text-acid">request</span> punya jalur. Setiap <span className="text-acid">event</span> punya tujuan.
          </motion.h2>
          <motion.p variants={staggerChild} className="system-description mb-0 max-w-[480px] leading-[1.5] text-[#aeb0a8]">
            Visualisasi cara saya memikirkan backend: <em className="hero-lede-token font-medium text-paper not-italic">modular</em>,{" "}
            <em className="hero-lede-token font-medium text-paper not-italic">observable</em>, dan{" "}
            <em className="hero-lede-token font-medium text-paper not-italic">terhubung</em> tanpa kehilangan batas tanggung jawab.
          </motion.p>
        </motion.div>

        <SystemGraph />
      </section>

      <HorizontalScrollSection
        id="frontend"
        kicker={frontendArchitecture.kicker}
        heading={frontendArchitecture.heading}
        panels={frontendArchitecture.panels}
      />

      <section className="work-section bg-paper px-[3vw] py-[clamp(96px,11vw,180px)] text-ink max-[680px]:px-[18px] max-[420px]:px-3.5" id="work" aria-labelledby="work-title">
        <motion.div className="section-heading flex items-end justify-between gap-8 border-b border-ink pb-7 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-[52px]" {...reveal}>
          <div className="flex items-center gap-4.5 pb-1 text-[11px] tracking-[0.1em] uppercase">
            <span className="grid size-[38px] place-items-center rounded-full border border-ink">03</span>
            <p className="m-0">Selected repositories / 2026</p>
          </div>
          <h2 id="work-title" className="font-display m-0 text-[clamp(52px,8vw,132px)] leading-[0.76] font-[650] tracking-[-0.08em] max-[680px]:text-[clamp(48px,15vw,84px)] max-[420px]:text-[clamp(36px,11.4vw,48px)]">Built systems</h2>
        </motion.div>

        <ProjectStack />
      </section>

      <section className="capabilities relative overflow-hidden bg-ink px-[3vw] py-[clamp(100px,12vw,190px)] text-paper max-[680px]:px-[18px] max-[420px]:px-3.5" id="stack" aria-labelledby="capabilities-title">
        <div
          className="pointer-events-none absolute -top-[20%] right-[-8%] size-[min(640px,50vw)] rounded-full bg-[radial-gradient(circle,rgba(216,255,62,0.1),transparent_68%)]"
          aria-hidden="true"
        />
        <motion.div className="relative mb-[clamp(56px,7vw,96px)] grid grid-cols-[1fr_2.4fr] items-end gap-[5vw] max-[1000px]:grid-cols-1" {...reveal}>
          <SectionLabel index="04" label="Core stack" />
          <div className="max-[1000px]:mt-10">
            <h2 id="capabilities-title" className="font-display mb-4 max-w-[18ch] text-[clamp(40px,5vw,72px)] leading-[0.94] font-[540] tracking-[-0.07em] max-[680px]:text-[clamp(36px,11vw,54px)] max-[420px]:text-[clamp(30px,9.4vw,36px)]">
              Dari endpoint pertama sampai layar.
            </h2>
            <p className="m-0 max-w-[46ch] text-[15px] leading-[1.55] text-[#a7a99f]">
              Empat lapisan yang saya pakai membangun sistem: service, data, jaringan service, dan interface.
            </p>
          </div>
        </motion.div>
        <motion.div
          className="relative grid grid-cols-2 gap-4 max-[720px]:grid-cols-1"
          variants={staggerParent}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: "0px 0px -18% 0px" }}
        >
          {capabilities.map((item) => (
            <motion.article
              variants={staggerChild}
              className="group/cap flex min-h-[240px] flex-col justify-between border border-paper/12 bg-ink-soft/80 p-6 transition-colors duration-200 hover:border-acid max-[680px]:min-h-[220px] max-[680px]:p-5 max-[420px]:min-h-0 max-[420px]:p-4"
              key={item.number}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[11px] tracking-[0.16em] text-acid">{item.number}</span>
                <span className="flex gap-2" aria-hidden="true">
                  {item.icons.map((icon) => (
                    <span
                      key={icon}
                      className="grid size-11 place-items-center border border-paper/15 text-[#9ea090] transition-colors duration-200 group-hover/cap:border-acid/40 group-hover/cap:text-acid"
                    >
                      <TechIcon name={icon} className="size-[18px]" />
                    </span>
                  ))}
                </span>
              </div>
              <div>
                <h3 className="mt-10 mb-3 text-[clamp(26px,2.6vw,36px)] leading-[1.05] font-[590] tracking-[-0.05em] max-[420px]:mt-8 max-[420px]:text-[22px]">
                  {item.title}
                </h3>
                <p className="m-0 max-w-[46ch] text-sm leading-[1.5] text-[#a7a99f]">{item.detail}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section
        className="toolchain relative overflow-hidden border-t border-paper/10 bg-surface px-[3vw] py-[clamp(96px,11vw,170px)] text-paper max-[680px]:px-[18px] max-[420px]:px-3.5"
        id="tech"
        aria-labelledby="toolchain-title"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(240,239,232,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(240,239,232,0.04)_1px,transparent_1px)] bg-[size:72px_72px]"
          aria-hidden="true"
        />
        <div className="relative">
          <motion.div className="mb-[clamp(52px,6.5vw,88px)] grid grid-cols-[1fr_2.4fr] items-end gap-[5vw] max-[1000px]:grid-cols-1" {...reveal}>
            <SectionLabel index="05" label="Toolchain" />
            <div className="max-[1000px]:mt-10">
              <h2
                id="toolchain-title"
                className="font-display mb-4 max-w-[16ch] text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-[540] tracking-[-0.068em] max-[680px]:text-[clamp(34px,10.5vw,52px)] max-[420px]:text-[clamp(28px,8.8vw,34px)]"
              >
                Alat yang saya pakai setiap hari.
              </h2>
              <p className="m-0 max-w-[52ch] text-[15px] leading-[1.55] text-[#a7a99f]">
                Bukan daftar semua yang pernah saya sentuh — hanya yang benar-benar dipakai di ketiga sistem di atas.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1"
            variants={staggerParent}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: "0px 0px -16% 0px" }}
          >
            {stackGroups.map((group, index) => (
              <motion.div
                className="flex flex-col border border-paper/12 bg-ink p-5 max-[680px]:p-4"
                key={group.label}
                variants={staggerChild}
              >
                <p className="mb-5 flex items-center justify-between gap-3 text-[10px] tracking-[0.12em] text-[#8d8f85] uppercase">
                  <span className="flex items-center gap-2.5">
                    <i className="h-px w-5 shrink-0 bg-acid not-italic" aria-hidden="true" />
                    {group.label}
                  </span>
                  <span className="font-mono text-acid/80">{String(index + 1).padStart(2, "0")}</span>
                </p>
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <span className="group/tech flex min-h-11 items-center gap-3 px-1 transition-colors duration-200 hover:text-acid">
                        <span className="grid size-11 shrink-0 place-items-center border border-paper/15 text-[#8a8c82] transition-colors duration-200 group-hover/tech:border-acid group-hover/tech:bg-acid group-hover/tech:text-ink">
                          <TechIcon name={item.icon} className="size-[18px]" />
                        </span>
                        <span className="text-[15px] tracking-[-0.015em]">{item.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="experience bg-paper-deep px-[3vw] py-[clamp(100px,12vw,190px)] text-ink max-[680px]:px-[18px] max-[420px]:px-3.5" id="experience" aria-labelledby="experience-title">
        <motion.div {...reveal}>
          <SectionLabel index="06" label="Experience & education" />
        </motion.div>
        <motion.div className="experience-heading mt-[clamp(62px,8vw,120px)] mb-[clamp(92px,10vw,150px)] grid grid-cols-[0.8fr_2fr] items-end gap-[5vw] max-[1000px]:grid-cols-1" {...reveal}>
          <p className="mb-2 text-sm leading-[1.5]">Accounting trained my precision.<br />Engineering gave it a system.</p>
          <h2 id="experience-title" className="font-display m-0 text-[clamp(50px,7.6vw,122px)] leading-[0.86] font-[560] tracking-[-0.075em] max-[680px]:text-[clamp(40px,12.4vw,72px)] max-[420px]:text-[clamp(26px,8.1vw,32px)]">Belajar dalam.<br /><em className="stroke-text">Mengajar kembali.</em></h2>
        </motion.div>
        <div className="experience-list border-t border-ink">
          {experience.map((item, index) => (
            <motion.article className="grid min-h-[180px] grid-cols-[50px_0.6fr_1fr_1fr] items-start gap-[22px] border-b border-ink/25 py-[22px] max-[1000px]:grid-cols-[42px_0.65fr_1.1fr] max-[680px]:grid-cols-[30px_1fr] max-[680px]:gap-4 max-[680px]:py-[26px]" key={item.role} {...reveal}>
              <span className="text-[10px] tracking-[0.1em] uppercase">{String(index + 1).padStart(2, "0")}</span>
              <p className="text-[10px] tracking-[0.1em] uppercase max-[680px]:col-start-2">{item.period}</p>
              <div className="max-[680px]:col-start-2">
                <h3 className="mb-2 text-[clamp(25px,2.5vw,40px)] leading-none tracking-[-0.05em] max-[420px]:text-[22px] max-[420px]:leading-snug">{item.role}</h3>
                <strong className="text-xs font-[560]">{item.place}</strong>
              </div>
              <p className="mb-0 max-w-[420px] text-sm leading-[1.48] text-[#4c4d46] max-[1000px]:col-start-3 max-[680px]:col-start-2">{item.detail}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <motion.section
        variants={contactParent}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.3 }}
        className="contact relative flex min-h-svh flex-col justify-between overflow-hidden bg-acid px-[3vw] pt-10 pb-[22px] text-ink max-[680px]:min-h-[820px] max-[680px]:px-[18px] max-[680px]:pt-[30px] max-[420px]:min-h-svh max-[420px]:px-3.5"
        id="contact"
        aria-labelledby="contact-title"
      >
        <div className="absolute -top-[10vw] -right-[8vw] aspect-square w-[48vw] animate-contact-ring rounded-full border border-ink/25 shadow-[inset_0_0_0_8vw_rgba(11,13,12,0.04),inset_0_0_0_16vw_rgba(11,13,12,0.04)]" aria-hidden="true" />
        <div className="contact-top relative z-[1] flex items-start justify-between gap-[30px] max-[680px]:flex-col">
          <motion.div variants={contactItem}>
            <SectionLabel index="07" label="Connect" />
          </motion.div>
          <motion.p variants={contactItem} className="m-0 max-w-[480px] text-[clamp(17px,1.5vw,23px)] leading-[1.28]">
            Terbuka untuk kesempatan fullstack, kolaborasi produk, dan diskusi sistem ujung ke ujung.
          </motion.p>
        </div>
        <h2
          id="contact-title"
          className="font-display relative z-[1] my-auto mb-[4vw] text-[clamp(74px,14.2vw,218px)] leading-[0.69] font-[780] tracking-[-0.09em] max-[680px]:text-[clamp(56px,16.5vw,105px)] max-[680px]:leading-[0.72] max-[420px]:text-[clamp(42px,13.2vw,56px)]"
        >
          {/* Each line rides up out of its own overflow mask. The padding on
              the mask is what keeps the outlined "RELIABLE." from having its
              stroke shaved off at the top and bottom edges. */}
          <span className="block overflow-hidden py-[0.08em]">
            <motion.span variants={contactLine} custom={0} className="block origin-bottom-left will-change-transform">
              LET&apos;S BUILD
            </motion.span>
          </span>
          <span className="block overflow-hidden py-[0.08em]">
            <motion.span variants={contactLine} custom={1} className="block origin-bottom-left will-change-transform">
              <em className="stroke-text">RELIABLE.</em>
            </motion.span>
          </span>
        </h2>
        {/* The entrance variant sits on a wrapper around each Magnetic, never
            on the Magnetic itself: Magnetic drives its own `x`/`y` for the
            pointer pull, and a variant's `y` would silently win over that
            style once mounted, killing the magnetic effect. */}
        <motion.div
          variants={contactCtaParent}
          className="relative z-[1] mb-6 flex flex-wrap items-center gap-3 max-[680px]:mb-5 max-[420px]:flex-col max-[420px]:items-stretch"
        >
          <motion.div variants={contactCta} className="max-[420px]:w-full">
            <Magnetic className="max-[420px]:w-full [&_a]:w-full">
              <a
                className="inline-flex min-h-12 items-center justify-center gap-3 border border-ink bg-ink px-5 text-[12px] tracking-[0.08em] text-acid uppercase transition-colors duration-200 hover:bg-transparent hover:text-ink"
                href={`mailto:${email}?subject=Peluang%20Fullstack`}
                data-cursor
              >
                Kirim email <span aria-hidden="true">↗</span>
              </a>
            </Magnetic>
          </motion.div>
          <motion.div variants={contactCta} className="max-[420px]:w-full">
            <CopyEmail />
          </motion.div>
          <motion.div variants={contactCta} className="max-[420px]:w-full">
            <Magnetic className="max-[420px]:w-full [&_a]:w-full">
              <a
                className="inline-flex min-h-12 items-center justify-center gap-3 border border-ink px-5 text-[12px] tracking-[0.08em] uppercase transition-colors duration-200 hover:bg-ink hover:text-acid"
                href={cvFile.href}
                download={cvFile.download}
                data-cursor
              >
                Unduh CV <span aria-hidden="true">↓</span>
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>
        {/* The top and bottom hairlines are real elements rather than a
            `border-y` so each can draw itself across before the rows land —
            a border cannot be scaled independently of its own box. */}
        <motion.div variants={contactRowsParent} className="social-links relative z-[1] grid grid-cols-2 max-[680px]:grid-cols-1">
          <motion.span variants={contactRule} className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px origin-left bg-ink" aria-hidden="true" />
          <motion.span variants={contactRule} className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-px origin-left bg-ink" aria-hidden="true" />
          <motion.a variants={contactRow} className="contact-link flex min-h-[86px] items-center justify-between px-[22px] text-[clamp(20px,2vw,31px)] tracking-[-0.035em] transition-[background-color,color,padding] duration-250 hover:bg-ink hover:px-[34px] hover:text-acid max-[680px]:min-h-[72px] max-[680px]:px-0 max-[680px]:hover:px-3.5" href={linkedInUrl} target="_blank" rel="noreferrer">
            <span className="flex items-center gap-4"><SocialIcon name="linkedin" className="size-[0.8em] shrink-0" />LinkedIn</span><span aria-hidden="true">↗</span>
          </motion.a>
          <motion.a variants={contactRow} className="contact-link flex min-h-[86px] items-center justify-between border-l border-ink px-[22px] text-[clamp(20px,2vw,31px)] tracking-[-0.035em] transition-[background-color,color,padding] duration-250 hover:bg-ink hover:px-[34px] hover:text-acid max-[680px]:min-h-[72px] max-[680px]:border-l-0 max-[680px]:border-t max-[680px]:px-0 max-[680px]:hover:px-3.5" href={githubUrl} target="_blank" rel="noreferrer">
            <span className="flex items-center gap-4"><SocialIcon name="github" className="size-[0.8em] shrink-0" />GitHub</span><span aria-hidden="true">↗</span>
          </motion.a>
        </motion.div>
        <motion.footer
          variants={contactFoot}
          className="relative z-[1] flex justify-between gap-6 pt-5 text-[10px] tracking-[0.1em] uppercase max-[680px]:items-end max-[420px]:flex-col max-[420px]:items-start max-[420px]:gap-3"
        >
          <p className="m-0 max-[680px]:max-w-[210px] max-[680px]:leading-[1.45] max-[420px]:max-w-none">© 2026 Fajar Rafsan. Fullstack Developer.</p>
          <a className="-my-[15px] inline-flex min-h-11 shrink-0 items-center py-[15px] transition-opacity duration-200 hover:opacity-60" href="#top">Kembali ke atas ↑</a>
        </motion.footer>
      </motion.section>
    </main>
  );
}
