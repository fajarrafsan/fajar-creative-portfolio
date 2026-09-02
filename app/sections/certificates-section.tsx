"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import { certificateIssuer, certificates } from "@/app/content";
import { certCounter, certFrame, certParent, certItem, useMediaQuery } from "@/app/lib/motion";
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
  const compact = useMediaQuery("(max-width: 680px)");
  const t = useT();

  const slides = useMemo(
    () =>
      certificates.map((cert) => ({
        src: cert.src,
        alt: t(dual(`Sertifikat ${t(cert.title)}`, `${t(cert.title)} certificate`)),
        title: t(cert.title),
        subtitle: t(cert.topic),
        meta: [
          ...(cert.score ? [{ label: t(dual("Nilai", "Score")), value: cert.score }] : []),
          { label: t(dual("Tanggal", "Date")), value: t(cert.date) },
          { label: t(dual("Durasi", "Duration")), value: t(cert.sessions) },
        ],
      })),
    [t],
  );

  const current = certificates[active];

  return (
    <motion.section
      variants={certParent}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -15% 0px" }}
      className="certificates relative overflow-hidden border-t border-paper/12 bg-surface px-[3vw] py-[clamp(96px,11vw,170px)] text-paper max-[680px]:px-[18px] max-[420px]:px-3.5"
      id="certificates"
      aria-labelledby="certificates-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(240,239,232,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(240,239,232,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-[clamp(40px,5vw,64px)] grid grid-cols-[1fr_3.15fr] gap-[5vw] max-[1000px]:grid-cols-1">
          <motion.div variants={certItem}>
            <div className="flex items-center gap-5 text-[11px] tracking-[0.1em] uppercase">
              <span className="grid size-[38px] shrink-0 place-items-center rounded-full border border-current">07</span>
              <p className="m-0">{t(dual("Sertifikat", "Certificates"))}</p>
            </div>
          </motion.div>

          <div className="max-[1000px]:mt-[52px]">
            <motion.h2
              variants={certItem}
              id="certificates-title"
              className="font-display mb-5 max-w-[900px] text-[clamp(40px,5vw,82px)] leading-[0.95] font-[540] tracking-[-0.068em] max-[680px]:text-[clamp(34px,10.5vw,52px)]"
            >
              {t(dual("Sepuluh sertifikat, satu jalur belajar.", "Ten certificates, one learning path."))}
            </motion.h2>
            <motion.p variants={certItem} className="m-0 max-w-[560px] text-[15px] leading-[1.55] text-[#a7a99f]">
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
            </motion.p>
          </div>
        </div>

        {/* Live counter — reads as an index, and gives the carousel a heading
            that changes with it for anyone not watching the cards. */}
        <motion.div
          variants={certItem}
          className="mb-2 flex items-end justify-between gap-4 border-b border-paper/12 pb-4"
        >
          <p className="m-0 text-[11px] tracking-[0.12em] text-[#8d8f85] uppercase">
            {t(dual("Geser, seret, atau pakai tombol panah", "Swipe, drag, or use the arrow buttons"))}
          </p>
          <p className="m-0 font-mono text-[clamp(20px,2.4vw,30px)] leading-none tabular-nums text-acid">
            <motion.span key={active} variants={certCounter} initial="hidden" animate="shown" className="inline-block">
              {String(active + 1).padStart(2, "0")}
            </motion.span>
            <span className="ml-1 text-[11px] tracking-[0.12em] text-paper/35">/ {String(certificates.length).padStart(2, "0")}</span>
          </p>
        </motion.div>

        <motion.div variants={certFrame}>
          <CoverflowCarousel
            slides={slides}
            onSelect={setActive}
            showCaption
            showPagination
            showNavigation
            aspectRatio={1.414}
            // Wider than the component default: these are dense A4 scans, and
            // at the stock 260px cap the certificate text is unreadable.
            cardWidth={compact ? "min(78vw, 340px)" : "clamp(300px, 34vw, 520px)"}
            rotate={38}
            depth={0.52}
            perspective={2.6}
            fade={0.16}
            label={t(dual("Galeri sertifikat pelatihan", "Training certificate gallery"))}
            className="max-w-[1200px] mx-auto"
          />
        </motion.div>

        <motion.p variants={certItem} className="sr-only" aria-live="polite">
          {current ? t(dual(`Menampilkan ${t(current.title)}, ${t(current.date)}`, `Showing ${t(current.title)}, ${t(current.date)}`)) : ""}
        </motion.p>
      </div>
    </motion.section>
  );
}
