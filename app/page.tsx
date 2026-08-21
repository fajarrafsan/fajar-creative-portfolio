"use client";

import { useEffect, useRef } from "react";
import type LenisType from "lenis";

const linkedInUrl = "https://www.linkedin.com/in/fajar-rafsan-80822b394/";
const githubUrl = "https://github.com/fajarrafsan02-bit";

const projects = [
  {
    number: "01",
    title: "ANISTREAM",
    type: "Full-stack streaming platform",
    year: "2026",
    note: "Platform streaming anime dengan katalog, multi-server player, jadwal mingguan, Google OAuth, wishlist, dan watch history.",
    stack: ["JavaScript", "REST API", "OAuth", "Service Layer"],
    variant: "anistream",
    mark: "ANI",
    links: [
      ["Front-end", "https://github.com/fajarrafsan02-bit/ANISTREASM-FE"],
      ["Back-end", "https://github.com/fajarrafsan02-bit/REST-API-ANISTREASM-BE"],
    ],
  },
  {
    number: "02",
    title: "ROOMLY",
    type: "Event-driven hotel booking",
    year: "2026",
    note: "Ekosistem reservasi hotel dengan React, microservices Spring Boot, RabbitMQ, JWT, Midtrans, dan invoice PDF.",
    stack: ["Spring Boot", "RabbitMQ", "Docker", "React + TypeScript"],
    variant: "roomly",
    mark: "RML",
    links: [
      ["Front-end", "https://github.com/fajarrafsan02-bit/RoomlyHotel"],
      ["Microservices API", "https://github.com/fajarrafsan02-bit/REST-API-Hotel-Booking"],
    ],
  },
  {
    number: "03",
    title: "GLOWMARKET",
    type: "Commerce & financial system",
    year: "2026",
    note: "E-commerce perhiasan dengan pembayaran Xendit, ongkir RajaOngkir, WebSocket chat, loyalty points, dan double-entry accounting.",
    stack: ["Spring Boot 4", "PostgreSQL", "WebSocket", "React 19"],
    variant: "glowmarket",
    mark: "GLW",
    links: [
      ["Front-end", "https://github.com/fajarrafsan02-bit/GLOWMARKET"],
      ["REST API", "https://github.com/fajarrafsan02-bit/REST-API-GLOWMARKET"],
    ],
  },
];

const capabilities = [
  ["01", "Java & Spring Boot", "RESTful API, clean service layer, JWT, dan backend yang mudah dikembangkan."],
  ["02", "Microservices", "Eureka, API Gateway, RabbitMQ, Docker, dan arsitektur event-driven."],
  ["03", "Data & performance", "PostgreSQL, MySQL, Redis, transaksi, caching, dan konsistensi data."],
  ["04", "Full-stack delivery", "React, TypeScript, Tailwind, integrasi payment, dan real-time features."],
];

const experience = [
  {
    period: "JAN 2026 — SEKARANG",
    role: "Java Fundamentals Instructor",
    place: "Universitas Nasional Pasim",
    detail: "Memimpin kelas Java fundamental, OOP, live coding, debugging, serta proyek mini terstruktur.",
  },
  {
    period: "SEP 2025 — AGU 2026",
    role: "Accounting Assistant",
    place: "Universitas Nasional Pasim",
    detail: "Mengajar kelas responsi akuntansi, menyusun materi, studi kasus, dan evaluasi untuk mahasiswa.",
  },
  {
    period: "2023 — 2026",
    role: "S1 Akuntansi · IPK 3.71",
    place: "Universitas Nasional Pasim",
    detail: "Memperdalam software engineering melalui pelatihan intensif Java Backend Development.",
  },
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
    const listenerCleanups: Array<() => void> = [];

    const moveCursor = (event: PointerEvent) => {
      if (!cursor) return;
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };

    if (finePointer && cursor) {
      window.addEventListener("pointermove", moveCursor, { passive: true });
      root.classList.add("has-custom-cursor");
      root.querySelectorAll<HTMLElement>("[data-cursor]").forEach((element) => {
        const enter = () => cursor.classList.add("is-active");
        const leave = () => cursor.classList.remove("is-active");
        element.addEventListener("pointerenter", enter);
        element.addEventListener("pointerleave", leave);
        listenerCleanups.push(() => {
          element.removeEventListener("pointerenter", enter);
          element.removeEventListener("pointerleave", leave);
        });
      });
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
            duration: 1.05,
            smoothWheel: true,
            wheelMultiplier: 0.92,
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
              duration: 1.05,
              stagger: 0.09,
              ease: "power4.out",
              delay: 0.08,
            });
            gsap.from(".hero-meta, .hero-foot", {
              opacity: 0,
              y: 20,
              duration: 0.65,
              stagger: 0.1,
              ease: "power3.out",
              delay: 0.48,
            });

            gsap.to(".hero-system", {
              rotate: 72,
              yPercent: 24,
              scale: 1.08,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            });
            gsap.to(".hero-grid", {
              backgroundPosition: "8vw 10vw",
              ease: "none",
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: 1.2,
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
                y: 48,
                duration: 0.72,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: element,
                  start: "top 87%",
                  once: true,
                },
              });
            });

            gsap.utils.toArray<HTMLElement>(".project-card").forEach((card) => {
              const art = card.querySelector(".project-art-motion");
              if (!art) return;
              gsap.fromTo(
                art,
                { yPercent: -7, rotate: -1 },
                {
                  yPercent: 7,
                  rotate: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: card,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.85,
                  },
                },
              );
            });

            gsap.matchMedia().add("(min-width: 1001px)", () => {
              const projectCards = gsap.utils.toArray<HTMLElement>(".project-card");

              projectCards.slice(0, -1).forEach((card, index) => {
                const nextCard = projectCards[index + 1];

                gsap.to(card, {
                  scale: 0.96 + index * 0.01,
                  filter: "brightness(0.78) saturate(0.82)",
                  ease: "none",
                  scrollTrigger: {
                    trigger: nextCard,
                    start: "top 82%",
                    end: `top ${100 + index * 12}px`,
                    scrub: 0.85,
                    invalidateOnRefresh: true,
                  },
                });
              });
            });

            const graphTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: ".graph-frame",
                start: "top 82%",
                end: "bottom 34%",
                scrub: 0.75,
              },
            });
            graphTimeline
              .from(".graph-core", { scale: 0.7, opacity: 0, ease: "power3.out" })
              .from(".graph-route", { scaleX: 0, transformOrigin: "left center", stagger: 0.06 }, "<0.08")
              .from(".graph-node", { scale: 0.82, opacity: 0, stagger: 0.06, ease: "power3.out" }, "<0.04")
              .to(".graph-orbit", { rotate: 80, ease: "none" }, 0);

            gsap.from(".capability-row", {
              xPercent: -6,
              opacity: 0,
              stagger: 0.07,
              duration: 0.72,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ".capabilities-list",
                start: "top 78%",
                once: true,
              },
            });

            root.querySelectorAll<HTMLElement>(".magnetic").forEach((element) => {
              const xTo = gsap.quickTo(element, "x", { duration: 0.38, ease: "elastic.out(1, 0.4)" });
              const yTo = gsap.quickTo(element, "y", { duration: 0.38, ease: "elastic.out(1, 0.4)" });
              const move = (event: PointerEvent) => {
                const bounds = element.getBoundingClientRect();
                xTo((event.clientX - bounds.left - bounds.width / 2) * 0.2);
                yTo((event.clientY - bounds.top - bounds.height / 2) * 0.2);
              };
              const reset = () => {
                xTo(0);
                yTo(0);
              };
              element.addEventListener("pointermove", move);
              element.addEventListener("pointerleave", reset);
              listenerCleanups.push(() => {
                element.removeEventListener("pointermove", move);
                element.removeEventListener("pointerleave", reset);
              });
            });
          }, root);

          ScrollTrigger.refresh();
        },
      );
    }

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", moveCursor);
      listenerCleanups.forEach((cleanup) => cleanup());
      cancelAnimationFrame(animationFrame);
      lenisInstance?.destroy();
      gsapContext?.revert();
    };
  }, []);

  return (
    <main ref={rootRef}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-glow" ref={cursorRef} aria-hidden="true">
        <span>VIEW</span>
      </div>

      <header className="site-nav">
        <a className="brand magnetic" href="#top" aria-label="Fajar Rafsan — kembali ke atas">
          F<span aria-hidden="true">/</span>R
        </a>
        <p className="nav-location">Java Back-End Engineer<br />Bandung, ID</p>
        <nav aria-label="Navigasi utama">
          <a href="#work">Projects</a>
          <a href="#profile">Profile</a>
          <a href="#stack">Stack</a>
          <a className="nav-cta magnetic" href={linkedInUrl} target="_blank" rel="noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-system" aria-hidden="true">
          <span className="system-ring system-ring-one" />
          <span className="system-ring system-ring-two" />
          <span className="system-axis system-axis-x" />
          <span className="system-axis system-axis-y" />
          <span className="system-node system-node-one" />
          <span className="system-node system-node-two" />
          <span className="system-node system-node-three" />
          <span className="system-packet system-packet-one" />
          <span className="system-packet system-packet-two" />
          <strong>JAVA</strong>
        </div>

        <div className="hero-meta">
          <div className="hero-kicker">
            <span className="status-dot" aria-hidden="true" />
            Open for backend opportunities
          </div>
          <p>Spring Boot / Microservices / API<br />© 2026</p>
        </div>

        <h1 id="hero-title">
          <span className="word-mask"><span className="hero-word">JAVA</span></span>
          <span className="word-mask hero-indent"><span className="hero-word">BACK-END</span></span>
          <span className="word-mask"><span className="hero-word">ENGINEER.</span></span>
        </h1>

        <div className="hero-foot">
          <p>Saya Fajar Rafsan. Saya merancang backend yang reliable, data yang konsisten, dan sistem yang siap tumbuh.</p>
          <a className="circle-link magnetic" href="#work" aria-label="Gulir ke proyek pilihan">
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="marquee-band" aria-label="Teknologi utama">
        <div className="marquee-track">
          <span>JAVA</span><i>●</i><span>SPRING BOOT</span><i>●</i><span>MICROSERVICES</span><i>●</i><span>POSTGRESQL</span><i>●</i><span>REDIS</span><i>●</i><span>RABBITMQ</span><i>●</i>
          <span aria-hidden="true">JAVA</span><i aria-hidden="true">●</i><span aria-hidden="true">SPRING BOOT</span><i aria-hidden="true">●</i><span aria-hidden="true">MICROSERVICES</span><i aria-hidden="true">●</i><span aria-hidden="true">POSTGRESQL</span><i aria-hidden="true">●</i><span aria-hidden="true">REDIS</span><i aria-hidden="true">●</i><span aria-hidden="true">RABBITMQ</span><i aria-hidden="true">●</i>
        </div>
      </section>

      <section className="manifesto" id="profile" aria-labelledby="manifesto-title">
        <div className="section-label" data-reveal>
          <span>01</span>
          <p>Profile</p>
        </div>
        <div className="manifesto-copy" data-reveal>
          <p className="eyebrow">Back-end is where trust is built.</p>
          <h2 id="manifesto-title">Saya membangun sistem yang <em>bersih, terukur,</em> dan dapat diandalkan saat kompleksitas meningkat.</h2>
        </div>
        <div className="profile-summary" data-reveal>
          <p>Java Back-End Engineer dengan fokus pada Spring Boot, REST API, microservices, database, caching, dan integrasi layanan nyata.</p>
          <div className="profile-stats">
            <article><strong>13</strong><span>Public repositories</span></article>
            <article><strong>03</strong><span>Flagship systems</span></article>
            <article><strong>02</strong><span>Teaching roles</span></article>
          </div>
        </div>
      </section>

      <section className="system-showcase" id="architecture" aria-labelledby="system-title">
        <div className="system-copy">
          <div className="section-label on-dark">
            <span>02</span>
            <p>Motion architecture</p>
          </div>
          <p className="eyebrow">Systems in motion</p>
          <h2 id="system-title">Setiap request punya jalur. Setiap event punya tujuan.</h2>
          <p className="system-description">Visualisasi cara saya memikirkan backend: modular, observable, dan terhubung tanpa kehilangan batas tanggung jawab.</p>
        </div>

        <div className="graph-frame" aria-label="Diagram animasi arsitektur microservices">
          <div className="graph-grid" aria-hidden="true" />
          <span className="graph-route route-a" aria-hidden="true" />
          <span className="graph-route route-b" aria-hidden="true" />
          <span className="graph-route route-c" aria-hidden="true" />
          <span className="graph-route route-d" aria-hidden="true" />
          <span className="graph-orbit" aria-hidden="true"><i /><i /><i /></span>
          <div className="graph-core">
            <small>Core</small>
            <strong>SPRING</strong>
            <span>BOOT</span>
          </div>
          <div className="graph-node node-gateway"><span>01</span><strong>Gateway</strong><small>Route & secure</small></div>
          <div className="graph-node node-auth"><span>02</span><strong>Auth</strong><small>JWT / OAuth</small></div>
          <div className="graph-node node-service"><span>03</span><strong>Service</strong><small>Business logic</small></div>
          <div className="graph-node node-data"><span>04</span><strong>Data</strong><small>SQL / Redis</small></div>
          <div className="graph-node node-event"><span>05</span><strong>Events</strong><small>RabbitMQ</small></div>
          <span className="data-packet packet-a" aria-hidden="true" />
          <span className="data-packet packet-b" aria-hidden="true" />
          <span className="data-packet packet-c" aria-hidden="true" />
        </div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        <div className="section-heading" data-reveal>
          <div>
            <span>03</span>
            <p>Selected repositories / 2026</p>
          </div>
          <h2 id="work-title">Built systems</h2>
        </div>

        <div className="project-list">
          {projects.map((project) => (
            <article className="project-card" key={project.number} data-cursor>
              <div className={`project-art project-art--${project.variant}`} aria-hidden="true">
                <div className="project-art-motion">
                  <span className="art-line art-line-a" />
                  <span className="art-line art-line-b" />
                  <span className="art-disc" />
                  <span className="art-window art-window-one" />
                  <span className="art-window art-window-two" />
                  <strong>{project.mark}</strong>
                  <small>{project.type}</small>
                </div>
              </div>
              <div className="project-meta">
                <span>{project.number}</span>
                <div className="project-main">
                  <p className="project-type">{project.type}</p>
                  <h3>{project.title}</h3>
                  <p>{project.note}</p>
                  <ul aria-label={`Teknologi ${project.title}`}>
                    {project.stack.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="project-aside">
                  <span>{project.year}</span>
                  {project.links.map(([label, href]) => (
                    <a key={href} href={href} target="_blank" rel="noreferrer">
                      {label} <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="capabilities" id="stack" aria-labelledby="capabilities-title">
        <div className="capabilities-intro" data-reveal>
          <div className="section-label on-dark">
            <span>04</span>
            <p>Core stack</p>
          </div>
          <h2 id="capabilities-title">Dari endpoint pertama sampai sistem siap menghadapi traffic nyata.</h2>
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

      <section className="experience" aria-labelledby="experience-title">
        <div className="section-label" data-reveal>
          <span>05</span>
          <p>Experience & education</p>
        </div>
        <div className="experience-heading" data-reveal>
          <p>Accounting trained my precision.<br />Engineering gave it a system.</p>
          <h2 id="experience-title">Belajar dalam.<br /><em>Mengajar kembali.</em></h2>
        </div>
        <div className="experience-list">
          {experience.map((item, index) => (
            <article key={item.role} data-reveal>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item.period}</p>
              <div>
                <h3>{item.role}</h3>
                <strong>{item.place}</strong>
              </div>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <div className="contact-top">
          <div className="section-label">
            <span>06</span>
            <p>Connect</p>
          </div>
          <p>Terbuka untuk kesempatan Java back-end, kolaborasi produk, dan diskusi sistem.</p>
        </div>
        <h2 id="contact-title">LET&apos;S BUILD<br /><em>RELIABLE.</em></h2>
        <div className="social-links">
          <a className="contact-link magnetic" href={linkedInUrl} target="_blank" rel="noreferrer">
            <span>LinkedIn</span><span aria-hidden="true">↗</span>
          </a>
          <a className="contact-link magnetic" href={githubUrl} target="_blank" rel="noreferrer">
            <span>GitHub</span><span aria-hidden="true">↗</span>
          </a>
        </div>
        <footer>
          <p>© 2026 Fajar Rafsan. Java Back-End Engineer.</p>
          <a href="#top">Kembali ke atas ↑</a>
        </footer>
      </section>
    </main>
  );
}
