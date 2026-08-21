"use client";

import { useEffect, useRef } from "react";
import type LenisType from "lenis";

const projects = [
  {
    number: "01",
    title: "Ruang Kota",
    type: "Brand experience",
    year: "2026",
    note: "Identitas digital untuk ruang publik yang hidup.",
    variant: "civic",
    mark: "RK",
  },
  {
    number: "02",
    title: "Nusa Living",
    type: "E-commerce",
    year: "2025",
    note: "Pengalaman belanja yang tenang, taktil, dan manusiawi.",
    variant: "nusa",
    mark: "NL",
  },
  {
    number: "03",
    title: "Suara Malam",
    type: "Culture platform",
    year: "2025",
    note: "Panggung interaktif untuk suara baru dari Indonesia.",
    variant: "suara",
    mark: "SM",
  },
  {
    number: "04",
    title: "Arus Finance",
    type: "Product design",
    year: "2024",
    note: "Data keuangan yang terasa ringan dan mudah dipahami.",
    variant: "arus",
    mark: "AF",
  },
];

const capabilities = [
  ["01", "Creative direction", "Strategi visual, konsep, dan bahasa merek"],
  ["02", "Web design", "Art direction, UI/UX, dan design system"],
  ["03", "Development", "Website responsif dengan interaksi yang halus"],
  ["04", "Motion", "Animasi antarmuka dan storytelling berbasis scroll"],
];

export default function Home() {
  const rootRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let disposed = false;
    let animationFrame = 0;
    let lenisInstance: LenisType | undefined;
    let gsapContext: { revert: () => void } | undefined;

    const moveCursor = (event: PointerEvent) => {
      if (!cursor) return;
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };

    if (finePointer && cursor) {
      window.addEventListener("pointermove", moveCursor, { passive: true });
      root.classList.add("has-custom-cursor");
    }

    if (!reduceMotion) {
      Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]).then(
        ([gsapModule, scrollModule, lenisModule]) => {
          if (disposed) return;

          const gsap = gsapModule.gsap;
          const ScrollTrigger = scrollModule.ScrollTrigger;
          const Lenis = lenisModule.default;
          gsap.registerPlugin(ScrollTrigger);

          const lenis = new Lenis({
            duration: 1.1,
            smoothWheel: true,
            wheelMultiplier: 0.9,
          });
          lenisInstance = lenis;
          lenis.on("scroll", ScrollTrigger.update);

          const raf = (time: number) => {
            lenis.raf(time);
            animationFrame = requestAnimationFrame(raf);
          };
          animationFrame = requestAnimationFrame(raf);

          gsapContext = gsap.context(() => {
            gsap.from(".hero-word", {
              yPercent: 112,
              rotate: 2,
              duration: 1.15,
              stagger: 0.1,
              ease: "power4.out",
              delay: 0.12,
            });
            gsap.from(".hero-meta, .hero-foot", {
              opacity: 0,
              y: 24,
              duration: 0.8,
              stagger: 0.12,
              ease: "power3.out",
              delay: 0.55,
            });
            gsap.to(".hero-orbit", {
              rotate: 90,
              yPercent: 28,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            });
            gsap.to(".scroll-progress", {
              scaleX: 1,
              transformOrigin: "left center",
              ease: "none",
              scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
            });

            gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
              gsap.from(element, {
                opacity: 0,
                y: 72,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: element,
                  start: "top 86%",
                  once: true,
                },
              });
            });

            gsap.utils.toArray<HTMLElement>(".project-card").forEach((card) => {
              const art = card.querySelector(".art-inner");
              if (!art) return;
              gsap.fromTo(
                art,
                { yPercent: -6, rotate: -1.5 },
                {
                  yPercent: 6,
                  rotate: 1.5,
                  ease: "none",
                  scrollTrigger: {
                    trigger: card,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.8,
                  },
                },
              );
            });

            gsap.from(".capability-row", {
              xPercent: -8,
              opacity: 0,
              stagger: 0.08,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ".capabilities-list",
                start: "top 76%",
                once: true,
              },
            });
          }, root);

          ScrollTrigger.refresh();
        },
      );
    }

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", moveCursor);
      cancelAnimationFrame(animationFrame);
      lenisInstance?.destroy();
      gsapContext?.revert();
    };
  }, []);

  return (
    <main ref={rootRef}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-glow" ref={cursorRef} aria-hidden="true" />

      <header className="site-nav">
        <a className="brand magnetic" href="#top" aria-label="Fajar — kembali ke atas">
          F<span aria-hidden="true">/</span>JR
        </a>
        <p className="nav-location">Creative developer<br />Jakarta, ID</p>
        <nav aria-label="Navigasi utama">
          <a href="#work">Karya</a>
          <a href="#about">Tentang</a>
          <a className="nav-cta" href="#contact">Mulai proyek <span aria-hidden="true">↘</span></a>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-orbit" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="hero-meta">
          <div className="hero-kicker">
            <span className="status-dot" aria-hidden="true" />
            Tersedia untuk proyek pilihan
          </div>
          <p>Design / Code / Motion<br />© 2026</p>
        </div>
        <h1 id="hero-title">
          <span className="word-mask"><span className="hero-word">IDE YANG</span></span>
          <span className="word-mask hero-indent"><span className="hero-word">BERGERAK</span></span>
          <span className="word-mask"><span className="hero-word">JADI NYATA.</span></span>
        </h1>
        <div className="hero-foot">
          <p>Portofolio Fajar — merancang identitas, antarmuka, dan pengalaman digital yang punya ritme.</p>
          <a className="circle-link magnetic" href="#work" aria-label="Gulir ke proyek pilihan">
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="marquee-band" aria-label="Layanan utama">
        <div className="marquee-track">
          <span>CREATIVE DEVELOPMENT</span><i>✦</i><span>INTERACTION DESIGN</span><i>✦</i><span>DIGITAL EXPERIENCES</span><i>✦</i>
          <span aria-hidden="true">CREATIVE DEVELOPMENT</span><i aria-hidden="true">✦</i><span aria-hidden="true">INTERACTION DESIGN</span><i aria-hidden="true">✦</i><span aria-hidden="true">DIGITAL EXPERIENCES</span><i aria-hidden="true">✦</i>
        </div>
      </section>

      <section className="manifesto" id="about" aria-labelledby="manifesto-title">
        <div className="section-label" data-reveal>
          <span>01</span>
          <p>Tentang pendekatan</p>
        </div>
        <div className="manifesto-copy" data-reveal>
          <p className="eyebrow">Bukan sekadar terlihat bagus.</p>
          <h2 id="manifesto-title">Saya membuat pengalaman digital yang <em>jelas, berkarakter,</em> dan menyenangkan untuk dijelajahi.</h2>
        </div>
        <div className="manifesto-note" data-reveal>
          <p>Berangkat dari strategi, dibentuk lewat desain, lalu dihidupkan dengan kode dan motion.</p>
          <span>01 — 04</span>
        </div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        <div className="section-heading" data-reveal>
          <div>
            <span>02</span>
            <p>Proyek pilihan / 2024—2026</p>
          </div>
          <h2 id="work-title">Selected work</h2>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.number} data-reveal>
              <div className={`project-art project-art--${project.variant}`} aria-hidden="true">
                <div className="art-inner">
                  <span className="art-line art-line-a" />
                  <span className="art-line art-line-b" />
                  <span className="art-disc" />
                  <strong>{project.mark}</strong>
                  <small>{project.type}</small>
                </div>
              </div>
              <div className="project-meta">
                <span>{project.number}</span>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.note}</p>
                </div>
                <div className="project-aside">
                  <span>{project.type}</span>
                  <span>{project.year}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="capabilities" aria-labelledby="capabilities-title">
        <div className="capabilities-intro" data-reveal>
          <div className="section-label on-dark">
            <span>03</span>
            <p>Yang saya kerjakan</p>
          </div>
          <h2 id="capabilities-title">Dari percikan pertama sampai produk siap bertemu dunia.</h2>
        </div>
        <div className="capabilities-list">
          {capabilities.map(([number, title, detail]) => (
            <article className="capability-row" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
              <i aria-hidden="true">↗</i>
            </article>
          ))}
        </div>
      </section>

      <section className="process" aria-labelledby="process-title">
        <div className="section-label" data-reveal>
          <span>04</span>
          <p>Cara bekerja</p>
        </div>
        <h2 id="process-title" data-reveal>Strategis di awal.<br /><em>Eksperimental</em> di tengah.<br />Presisi sampai akhir.</h2>
        <div className="process-grid">
          <article data-reveal>
            <span>01 / Discover</span>
            <h3>Mencari inti</h3>
            <p>Memahami tujuan, audiens, konteks, dan hal yang membuat proyek ini berbeda.</p>
          </article>
          <article data-reveal>
            <span>02 / Shape</span>
            <h3>Membentuk sistem</h3>
            <p>Menyusun arah visual dan interaksi menjadi sistem yang konsisten dan fleksibel.</p>
          </article>
          <article data-reveal>
            <span>03 / Move</span>
            <h3>Menghidupkan detail</h3>
            <p>Menerjemahkan desain menjadi pengalaman cepat, responsif, dan penuh karakter.</p>
          </article>
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <div className="contact-top">
          <div className="section-label">
            <span>05</span>
            <p>Kontak</p>
          </div>
          <p>Punya ide, peluncuran baru, atau sekadar ingin berdiskusi?</p>
        </div>
        <h2 id="contact-title">LET&apos;S MAKE<br /><em>IT MOVE.</em></h2>
        <a className="contact-link magnetic" href="mailto:hello@fajar.studio">
          <span>Mulai percakapan</span>
          <span aria-hidden="true">↗</span>
        </a>
        <footer>
          <p>© 2026 Fajar. All good things in motion.</p>
          <a href="#top">Kembali ke atas ↑</a>
        </footer>
      </section>
    </main>
  );
}
