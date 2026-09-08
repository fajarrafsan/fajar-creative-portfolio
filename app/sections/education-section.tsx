"use client";

import { motion } from "motion/react";
import { bootcamp, certificates, copy, education } from "@/app/content";
import { dual, useT } from "@/app/lib/i18n";
import { inViewport, ease, staggerChild, staggerParent } from "@/app/lib/motion";
import { ArrowOut } from "@/app/components/tech-icons";

/**
 * Education.
 *
 * Sits between the work timeline and the certificates on purpose. The degree,
 * the scholarship and the certificates are one story — the same PUB programme
 * paid for all three — but the portfolio used to scatter them across a
 * timeline row, a CV modal and a section subtitle, so a reader never joined
 * them up. This section states the degree, then hands off explicitly to the
 * certificates that came out of the bootcamp it funded.
 */
export function EducationSection() {
  const t = useT();

  return (
    <motion.section
      variants={staggerParent}
      initial="hidden"
      whileInView="shown"
      viewport={inViewport}
      className="education relative overflow-hidden bg-paper px-[3vw] py-[clamp(96px,11vw,170px)] text-ink max-[680px]:px-[18px] max-[420px]:px-3.5"
      id="education"
      aria-labelledby="education-title"
    >
      <motion.div variants={staggerChild} className="flex items-center gap-5 text-[11px] tracking-[0.1em] uppercase">
        <span className="grid size-[38px] shrink-0 place-items-center rounded-full border border-current">07</span>
        <p className="m-0">{t(copy.sectionEducation)}</p>
      </motion.div>

      <motion.div
        variants={staggerChild}
        className="mt-[clamp(56px,7vw,104px)] mb-[clamp(56px,6vw,88px)] grid grid-cols-[0.8fr_2fr] items-end gap-[5vw] max-[1000px]:grid-cols-1 max-[1000px]:gap-8 max-[360px]:mt-8 max-[360px]:mb-10 max-[360px]:gap-5"
      >
        <p className="m-0 text-[15px] leading-[1.5] text-[#4c4d46]">
          {t(copy.educationLead)
            .split("\n")
            .map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
        </p>
        <h2
          id="education-title"
          className="font-display m-0 text-[clamp(44px,6.9vw,106px)] leading-[0.88] font-[560] tracking-[-0.075em] max-[680px]:text-[clamp(38px,11.5vw,62px)] max-[420px]:text-[clamp(26px,8.4vw,34px)]"
        >
          {t(copy.educationTitle)}
          <br />
          <em className="stroke-text">{t(copy.educationTitleEm)}</em>
        </h2>
      </motion.div>

      <div className="grid grid-cols-[1.15fr_1fr] gap-[clamp(28px,3.5vw,56px)] max-[1000px]:grid-cols-1 max-[360px]:gap-5">
        {/* The degree itself, with the mark given the weight it earns. */}
        <motion.article variants={staggerChild} className="border-2 border-ink bg-paper-deep p-[clamp(24px,2.6vw,40px)] max-[360px]:p-4">
          <p className="m-0 text-[11px] tracking-[0.14em] text-[#6f7068] uppercase">{education.period}</p>
          <h3 className="font-display mt-3 mb-1 text-[clamp(28px,3.2vw,46px)] leading-[0.95] font-[620] tracking-[-0.05em] max-[360px]:text-[24px]">
            {t(education.program)}
          </h3>
          <p className="m-0 text-[13px] font-[560]">
            {education.place}
            <span className="text-[#6f7068]"> · {education.city}</span>
          </p>

          <div className="mt-[clamp(26px,3vw,42px)] flex flex-wrap items-end gap-x-[clamp(24px,3vw,44px)] gap-y-6 border-t border-ink/20 pt-[clamp(22px,2.4vw,34px)] max-[360px]:mt-5 max-[360px]:gap-y-4 max-[360px]:pt-4">
            <p className="m-0">
              <span className="font-display block text-[clamp(46px,5.6vw,78px)] leading-[0.82] font-[680] tracking-[-0.06em] tabular-nums max-[360px]:text-[40px]">
                {education.gpa}
              </span>
              <span className="mt-2 block text-[11px] tracking-[0.14em] text-[#6f7068] uppercase">
                {t(education.gpaLabel)} / {education.gpaScale}
              </span>
            </p>
            <p className="m-0">
              <span className="inline-flex items-center bg-acid px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase">
                {t(education.scholarship)}
              </span>
              <span className="mt-2.5 block max-w-[30ch] text-[13px] leading-[1.45] text-[#4c4d46]">
                {t(education.scholarshipNote)}
              </span>
            </p>
          </div>
        </motion.article>

        {/* The bootcamp, given the same weight as the degree — the scholarship
            paid for both, and this is the half that did the career switch. */}
        <motion.article variants={staggerChild} className="flex flex-col border-2 border-ink p-[clamp(24px,2.6vw,40px)] max-[360px]:p-4">
          <p className="m-0 text-[11px] tracking-[0.14em] text-[#6f7068] uppercase">
            {bootcamp.period} · {certificates.length} {t(dual("sertifikat", "certificates"))}
          </p>
          <h3 className="font-display mt-3 mb-1 text-[clamp(28px,3.2vw,46px)] leading-[0.95] font-[620] tracking-[-0.05em] max-[360px]:text-[24px]">
            {t(bootcamp.name)}
          </h3>
          <p className="m-0 text-[13px] font-[560]">
            {bootcamp.place}
            <span className="text-[#6f7068]"> · {bootcamp.city}</span>
          </p>

          <ol className="m-0 mt-[clamp(22px,2.4vw,32px)] list-none p-0">
            {bootcamp.path.map((step, index) => (
              <li
                className="grid grid-cols-[26px_78px_1fr] items-baseline gap-x-3 border-t border-ink/20 py-3 first:border-t-0 first:pt-0 max-[420px]:grid-cols-[26px_1fr]"
                key={t(step.title)}
              >
                <span className="font-mono text-[11px] text-ink/45 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[11px] tracking-[0.1em] text-[#6f7068] uppercase max-[420px]:col-start-2">
                  {t(step.period)}
                </span>
                <span className="max-[420px]:col-start-2">
                  <strong className="block text-[15px] leading-tight font-[620]">{t(step.title)}</strong>
                  <span className="mt-0.5 block text-[13px] leading-[1.4] text-[#4c4d46]">{t(step.detail)}</span>
                </span>
              </li>
            ))}
          </ol>
        </motion.article>
      </div>

      <div className="mt-[clamp(28px,3vw,44px)] grid grid-cols-[1.15fr_1fr] gap-[clamp(28px,3.5vw,56px)] max-[1000px]:grid-cols-1 max-[360px]:mt-6 max-[360px]:gap-5">
        <motion.p variants={staggerChild} className="m-0 text-[15px] leading-[1.6] text-[#3a3b36]">
          {t(education.note)}
        </motion.p>

        <motion.dl variants={staggerChild} className="m-0 grid grid-cols-2 gap-px bg-ink/15 max-[300px]:grid-cols-1">
          {education.facts.map((fact) => (
            <div className="bg-paper p-[clamp(16px,1.8vw,24px)] max-[360px]:p-3.5" key={t(fact.label)}>
              <dt className="text-[11px] tracking-[0.12em] text-[#6f7068] uppercase">{t(fact.label)}</dt>
              <dd className="font-display m-0 mt-2 text-[clamp(20px,2.1vw,30px)] leading-none font-[620] tracking-[-0.04em]">
                {t(fact.value)}
              </dd>
              <dd className="m-0 mt-2 text-[13px] leading-[1.4] text-[#4c4d46]">{t(fact.detail)}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Hands the reader to section 08, which is what the bootcamp produced. */}
      <motion.a
        variants={staggerChild}
        href="#certificates"
        data-cursor
        className="group/bridge mt-[clamp(34px,4vw,60px)] flex items-center justify-between gap-6 border-t border-ink py-[clamp(20px,2.2vw,30px)] transition-colors duration-250 hover:text-[#4c4d46] max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-4 max-[360px]:mt-6 max-[360px]:gap-3 max-[360px]:py-4"
      >
        <span className="max-w-[68ch] text-[clamp(15px,1.5vw,20px)] leading-[1.4]">{t(copy.educationBridge)}</span>
        <span className="flex shrink-0 items-center gap-3 text-[11px] font-medium tracking-[0.1em] uppercase">
          {t(copy.educationBridgeCta)}
          <motion.span
            className="grid size-9 shrink-0 place-items-center rounded-full border border-ink"
            whileHover={{ y: 2 }}
            transition={{ duration: 0.25, ease }}
            aria-hidden="true"
          >
            <ArrowOut className="size-3.5 rotate-135" />
          </motion.span>
        </span>
      </motion.a>
    </motion.section>
  );
}
