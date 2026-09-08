"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import { certificateIssuer, certificates } from "@/app/content";
import { inViewport, certCounter, certFrame, LatchedReveal } from "@/app/lib/motion";
import { dual, useT } from "@/app/lib/i18n";

/**
 * Certificate wall.
 *
 * The carousel paints its own transforms every frame straight to the DOM, so
 * the scroll-entrance variants deliberately sit on the wrapper AROUND it and
 * never on the cards themselves — a Motion variant driving `transform` on a
 * card would fight the coverflow rake for the same property.
 */
export function CertificatesSection() {
  const [active, setActive] = useState(0);
  const t = useT();

  const slides = useMemo(
    () =>
      certificates.map((cert) => ({
        src: cert.src,
        alt: t(dual(`Sertifikat ${t(cert.title)}`, `${t(cert.title)} certificate`)),
        title: t(cert.title),
        subtitle: t(cert.topic),
        meta: [
          { label: t(dual("Nilai", "Score")), value: cert.score ?? "—" },
          { label: t(dual("Tanggal", "Date")), value: t(cert.date) },
          {
            label: cert.id === "instructor-java" ? t(dual("Peran", "Role")) : t(dual("Durasi", "Duration")),
            value: t(cert.sessions),
          },
        ],
      })),
    [t],
  );

  const current = certificates[active];

  return (
    <section
      className="certificates relative overflow-hidden border-t border-paper/12 bg-surface px-[3vw] py-[clamp(96px,11vw,170px)] text-paper max-[680px]:px-[18px] max-[420px]:px-3.5"
      id="certificates"
      aria-labelledby="certificates-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(240,239,232,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(240,239,232,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[38%] left-1/2 h-[min(680px,62vw)] w-[min(1100px,82vw)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(216,255,62,0.105),rgba(216,255,62,0.025)_38%,transparent_72%)] blur-2xl"
        aria-hidden="true"
      />

      <div className="relative">
        <LatchedReveal className="mb-[clamp(40px,5vw,64px)] grid grid-cols-[1fr_3.15fr] gap-[5vw] max-[1000px]:grid-cols-1">
          <div>
            <div className="flex items-center gap-5 text-[11px] tracking-[0.1em] uppercase">
              <span className="grid size-[38px] shrink-0 place-items-center rounded-full border border-current">08</span>
              <p className="m-0">{t(dual("Sertifikat", "Certificates"))}</p>
            </div>
          </div>

          <div className="max-[1000px]:mt-[52px] max-[360px]:mt-7">
            <h2
              id="certificates-title"
              className="font-display mb-5 max-w-[900px] text-[clamp(38px,5.2vw,76px)] leading-[0.95] font-[540] tracking-[-0.068em] max-[680px]:text-[clamp(34px,10.6vw,54px)] max-[360px]:mb-4 max-[360px]:text-[clamp(28px,9vw,32px)]"
            >
              {t(dual("Sepuluh sertifikat, satu jalur belajar.", "Ten certificates, one learning path."))}
            </h2>
            <p className="m-0 max-w-[590px] text-[16px] leading-[1.62] text-[#a7a99f] max-[360px]:text-[15px] max-[360px]:leading-[1.55]">
              {t(
                dual(
                  "Dari algoritma dan struktur data sampai back-end Java dan front-end React — semuanya dari ",
                  "From algorithms and data structures through to Java back-end and React front-end — all from ",
                ),
              )}
              <span className="text-paper">{certificateIssuer.org}</span>
              {t(dual(" di bawah ", " under the "))}
              {t(certificateIssuer.scheme)}, {t(certificateIssuer.campus)}.{" "}
              {t(
                dual(
                  "Satu di antaranya bukan sebagai peserta, tapi sebagai ",
                  "One of them is not as a participant, but as an ",
                ),
              )}
              <span className="text-acid">{t(dual("instruktur", "instructor"))}</span>.
            </p>
          </div>
        </LatchedReveal>

        {/* Live counter — reads as an index, and gives the carousel a heading
            that changes with it for anyone not watching the cards. */}
        <LatchedReveal className="mb-3 flex items-end justify-between gap-4">
          <p className="m-0 flex items-center gap-3 text-[12px] tracking-[0.12em] text-[#a7a99f] uppercase max-[520px]:max-w-[210px] max-[520px]:leading-[1.5]">
            <span className="h-px w-8 shrink-0 bg-acid" aria-hidden="true" />
            {t(dual("Geser, seret, atau pakai tombol panah", "Swipe, drag, or use the arrow buttons"))}
          </p>
          <p className="m-0 font-mono text-[clamp(20px,2.4vw,30px)] leading-none tabular-nums text-acid">
            <motion.span key={active} variants={certCounter} initial="hidden" animate="shown" className="inline-block">
              {String(active + 1).padStart(2, "0")}
            </motion.span>
            <span className="ml-1 text-[11px] tracking-[0.12em] text-paper/35">/ {String(certificates.length).padStart(2, "0")}</span>
          </p>
        </LatchedReveal>

        <motion.div
          variants={certFrame}
          initial="hidden"
          whileInView="shown"
          viewport={inViewport}
          className="relative overflow-hidden border border-paper/12 bg-ink/55 px-[clamp(8px,1.7vw,24px)] pt-4 pb-[clamp(18px,2.4vw,32px)] shadow-[0_36px_120px_rgba(0,0,0,0.28)] max-[360px]:pt-3 max-[360px]:pb-4"
        >
          <span className="absolute top-0 left-0 h-px w-[28%] bg-acid" aria-hidden="true" />
          <span className="absolute top-0 left-0 h-8 w-px bg-acid" aria-hidden="true" />
          <span className="absolute right-0 bottom-0 h-px w-[18%] bg-paper/25" aria-hidden="true" />
          <span className="absolute right-0 bottom-0 h-8 w-px bg-paper/25" aria-hidden="true" />

          <div className="flex items-center justify-between gap-4 px-2 pb-1 text-[12px] tracking-[0.14em] uppercase">
            <p className="m-0 text-paper/55">{t(dual("Arsip pembelajaran", "Learning archive"))}</p>
            <p className="m-0 font-mono tabular-nums text-paper/75">2024 — 2026</p>
          </div>

          <CoverflowCarousel
            slides={slides}
            onSelect={setActive}
            showCaption
            showPagination
            showNavigation
            aspectRatio={1.414}
            // CSS owns the breakpoint, so the document does not jump after
            // hydration and both sides meet at the same 430px width.
            cardWidth="clamp(430px, 46vw, 700px)"
            mobileCardWidth="min(calc(100vw - 64px), 400px)"
            rotate={14}
            depth={0.26}
            perspective={4}
            gap={-0.16}
            fade={0.24}
            label={t(dual("Galeri sertifikat pelatihan", "Training certificate gallery"))}
            className="mx-auto max-w-[1320px]"
          />
        </motion.div>

        <p className="sr-only" aria-live="polite">
          {current ? t(dual(`Menampilkan ${t(current.title)}, ${t(current.date)}`, `Showing ${t(current.title)}, ${t(current.date)}`)) : ""}
        </p>
      </div>
    </section>
  );
}
