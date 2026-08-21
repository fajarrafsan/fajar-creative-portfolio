// Site content. Kept apart from the view layer so the copy, links, and stack
// lists can be edited without touching any animation code.

export const linkedInUrl = "https://www.linkedin.com/in/fajar-rafsan-80822b394/";
export const githubUrl = "https://github.com/fajarrafsan02-bit";
export const email = "fajar.rafsan02@gmail.com";

export const profileName = "Fajar Rafsan";
export const profileRole = "Fullstack Developer";
export const profileLocation = "Bandung, ID";
export const profilePhotoSrc = "/profile.jpg";

export const profileAbout = [
  "Saya merancang sistem ujung ke ujung: API Java/Spring yang andal di belakang, interface React 19 / TypeScript yang jelas di depan.",
  "Terbiasa bekerja mandiri maupun dalam tim dengan clean code, komunikasi teknis yang rapi, dan rasa ingin tahu yang tidak berhenti di satu layer.",
];

export const profileSkills = [
  { id: "java", label: "Java", icon: "java" },
  { id: "spring", label: "Spring", icon: "springboot" },
  { id: "react", label: "React 19", icon: "react" },
  { id: "typescript", label: "TypeScript", icon: "typescript" },
];

export const projects = [
  {
    number: "01",
    title: "ANISTREAM",
    type: "Streaming platform · Node & Redis",
    year: "2026",
    note: "Platform streaming anime dengan katalog, multi-server player, jadwal rilis mingguan, Google OAuth, wishlist, dan watch history. Backend Express memakai service layer dan cache Redis agar katalog tetap cepat.",
    stack: ["Node.js", "Express", "Redis", "React 19", "Google OAuth", "Vitest"],
    metrics: [
      ["API", "REST + service layer"],
      ["Cache", "Redis"],
      ["Auth", "Google OAuth"],
    ],
    variant: "anistream",
    mark: "ANI",
    demo: "https://anistreasm-fe-nine.vercel.app",
    links: [
      ["Front-end", "https://github.com/fajarrafsan02-bit/ANISTREASM-FE"],
      ["Back-end", "https://github.com/fajarrafsan02-bit/REST-API-ANISTREASM-BE"],
    ],
  },
  {
    number: "02",
    title: "ROOMLY",
    type: "Event-driven microservices",
    year: "2026",
    note: "Ekosistem reservasi hotel: Eureka service discovery, API gateway, RabbitMQ untuk event antar-service, JWT, pembayaran Midtrans, dan invoice PDF. Dashboard React 19 + TypeScript dengan analitik real-time dan dwibahasa ID/EN.",
    stack: ["Spring Boot", "Eureka", "RabbitMQ", "Docker", "PostgreSQL", "TypeScript"],
    metrics: [
      ["Pattern", "Event-driven"],
      ["Broker", "RabbitMQ"],
      ["Deploy", "Docker Compose"],
    ],
    variant: "roomly",
    mark: "RML",
    demo: null,
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
    note: "E-commerce perhiasan emas: pembayaran Xendit, ongkir RajaOngkir, chat real-time WebSocket/STOMP, poin loyalitas, dan pembukuan double-entry yang menjurnal setiap transaksi secara otomatis. Migrasi skema dikunci Flyway.",
    stack: ["Spring Boot 4", "PostgreSQL", "Flyway", "WebSocket", "Xendit", "React 19"],
    metrics: [
      ["Ledger", "Double-entry"],
      ["Realtime", "STOMP / WS"],
      ["Payments", "Xendit"],
    ],
    variant: "glowmarket",
    mark: "GLW",
    demo: "https://projek-react.vercel.app",
    links: [
      ["Front-end", "https://github.com/fajarrafsan02-bit/GLOWMARKET"],
      ["REST API", "https://github.com/fajarrafsan02-bit/REST-API-GLOWMARKET"],
    ],
  },
];

export const capabilities = [
  {
    number: "01",
    title: "Java & Spring Boot",
    detail: "RESTful API, clean service layer, Spring Security, JWT, dan backend yang mudah dikembangkan.",
    icons: ["java", "springboot"],
  },
  {
    number: "02",
    title: "Microservices",
    detail: "Eureka, API Gateway, RabbitMQ, Docker, dan arsitektur event-driven.",
    icons: ["docker", "rabbitmq"],
  },
  {
    number: "03",
    title: "Data & performance",
    detail: "PostgreSQL, MySQL, Redis, transaksi, migrasi Flyway, caching, dan konsistensi data.",
    icons: ["postgresql", "redis"],
  },
  {
    number: "04",
    title: "Full-stack delivery",
    detail: "React 19, TypeScript, Tailwind, integrasi payment gateway, dan fitur real-time.",
    icons: ["react", "typescript"],
  },
];

// Repository count is the live figure from the public GitHub profile.
export const profileStats: Array<[string, string]> = [
  ["13", "Public repositories"],
  ["03", "Flagship systems"],
  ["02", "Teaching roles"],
  ["3.71", "IPK akhir"],
];

// Grouped so the grid reads as an engineer's stack, not a logo wall.
export const stackGroups = [
  {
    label: "Core back-end",
    items: [
      { icon: "java", name: "Java" },
      { icon: "springboot", name: "Spring Boot" },
      { icon: "spring", name: "Spring Security" },
      { icon: "jwt", name: "JWT" },
    ],
  },
  {
    label: "Data & messaging",
    items: [
      { icon: "postgresql", name: "PostgreSQL" },
      { icon: "mysql", name: "MySQL" },
      { icon: "redis", name: "Redis" },
      { icon: "rabbitmq", name: "RabbitMQ" },
    ],
  },
  {
    label: "Runtime & tooling",
    items: [
      { icon: "docker", name: "Docker" },
      { icon: "nodejs", name: "Node.js" },
      { icon: "express", name: "Express" },
      { icon: "git", name: "Git" },
    ],
  },
  {
    label: "Interface layer",
    items: [
      { icon: "react", name: "React" },
      { icon: "typescript", name: "TypeScript" },
      { icon: "javascript", name: "JavaScript" },
      { icon: "tailwind", name: "Tailwind" },
    ],
  },
];

export const experience = [
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

export const frontendArchitecture = {
  kicker: "Front-end architecture",
  heading: "Setiap layar punya state. Setiap aksi punya tujuan.",
  panels: [
    {
      number: "01",
      title: "Interface surface",
      nodeId: "views",
      icons: ["react", "javascript"],
      body: "Tiga SPA di GitHub: ANISTREAM-FE (katalog, multi-server player, Google OAuth), GLOWMARKET (katalog emas, checkout, admin), dan RoomlyHotel (dashboard reservasi dwibahasa). Satu pola: komponen yang jelas, state yang tidak bocor ke API.",
    },
    {
      number: "02",
      title: "Type & tooling",
      nodeId: "types",
      icons: ["typescript", "vite", "tailwind"],
      body: "RoomlyHotel ditulis TypeScript. GlowMarket dan ANISTREAM-FE memakai Vite + Tailwind v4. Tipe di klien mengikuti kontrak REST, bukan sebaliknya — UI tidak menebak bentuk data.",
    },
    {
      number: "03",
      title: "Auth di klien",
      nodeId: "auth",
      icons: ["jwt", "react"],
      body: "Google OAuth di ANISTREAM, JWT di Roomly dan GlowMarket. Token tinggal di browser; keputusan otorisasi tetap di gateway dan service Java. Front end hanya membawa identitas, tidak menghakimi hak akses.",
    },
    {
      number: "04",
      title: "Realtime UI",
      nodeId: "realtime",
      icons: ["websocket", "react"],
      body: "Chat WebSocket/STOMP di GlowMarket dan analitik live di Roomly. Event masuk, komponen berubah — tanpa reload. Subscription dipasang di batas layar, dilepas saat unmount.",
    },
    {
      number: "05",
      title: "Checkout & delivery",
      nodeId: "checkout",
      icons: ["card", "javascript"],
      body: "Xendit di GlowMarket, Midtrans di Roomly. Front end mengorkestrasi langkah bayar; jurnal, invoice, dan stok tetap di service. Yang tampil di UI hanya status yang sudah dikonfirmasi backend.",
    },
  ],
};

export const artThemes: Record<string, string> = {
  anistream: "bg-[#191e47] text-[#a894ff]",
  roomly: "bg-[#174846] text-acid",
  glowmarket: "bg-[#f06a3f] text-[#27180d]",
};


export type Project = (typeof projects)[number];

export const marqueeTop = ["JAVA", "SPRING BOOT", "REACT", "TYPESCRIPT", "POSTGRESQL", "REDIS"];
export const marqueeBottom = ["REST API", "MICROSERVICES", "TAILWIND", "JWT / OAUTH", "WEBSOCKET", "DOCKER"];
