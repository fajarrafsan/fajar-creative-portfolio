# Fajar Rafsan — Portfolio

Situs portofolio fullstack developer: API Java/Spring Boot di belakang, interface React/TypeScript di depan.

## Stack

- [vinext](https://github.com/cloudflare/vinext) (Vite + React 19 RSC) di atas Cloudflare Workers
- Tailwind CSS v4 via `@tailwindcss/postcss`
- [Motion](https://motion.dev) untuk animasi, [Lenis](https://lenis.darkroom.engineering) untuk smooth scrolling
- Font self-hosted di `public/fonts`, dideklarasikan di `app/fonts.css`

## Struktur

```
app/
  page.tsx                       Halaman utama: hero, marquee, profile, work, stack, experience, contact
  layout.tsx                     Metadata SEO, JSON-LD, preload font, failsafe reveal
  content.ts                     Seluruh konten/copy, dipisah dari view layer
  motion.tsx                     Varian animasi bersama + SmoothScroll, ScrollProgress, CursorGlow, Magnetic
  site-header.tsx                Navigasi fixed + scroll spy + menu mobile
  hero-graph.tsx                 Diagram hero interaktif (tilt 3D mengikuti pointer)
  system-graph.tsx               Diagram arsitektur backend & frontend (SVG + node HTML)
  horizontal-scroll-section.tsx  Section front-end architecture (mode pin / swipe / stack)
  project-stack.tsx              Kartu proyek dengan stacked-scroll murni berbasis scroll progress
  profile-portrait.tsx           Foto profil tilt 3D + copy + stats counter
  tech-icons.tsx                 Ikon brand SVG inline (Simple Icons, CC0)
worker/index.ts                  Entry Cloudflare Worker (vinext + image optimization)
```

## Perintah

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # verifikasi production build
npm run start    # jalankan hasil build
npm run lint     # eslint
```

Node.js >= 22.13.0.
