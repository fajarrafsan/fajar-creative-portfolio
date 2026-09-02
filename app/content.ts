// Site content. Kept apart from the view layer so the copy, links, and stack
// lists can be edited without touching any animation code.

import { dual } from "@/app/lib/i18n";

export const linkedInUrl = "https://www.linkedin.com/in/fajar-rafsan-80822b394/";
export const githubUrl = "https://github.com/fajarrafsan";
export const email = "fajar.rafsan02@gmail.com";

export const profileName = "Fajar Rafsan";
export const profileRole = "Fullstack Developer";
export const profileLocation = "Bandung, ID";
export const profilePhotoSrc = "/profile.jpeg";

export type AboutTone = "java" | "react" | "strong";

export type AboutSegment = {
  text: string;
  /** Visual emphasis for one phrase; omitted = plain body text. */
  tone?: AboutTone;
};

/** Each paragraph is a list of segments so the view can highlight phrases
    without this file ever having to know about CSS classes. */
export const profileAbout = dual<AboutSegment[][]>(
  [
    [
      { text: "Saya merancang sistem ujung ke ujung: " },
      { text: "API Java/Spring", tone: "java" },
      { text: " yang andal di belakang, " },
      { text: "interface React 19 / TypeScript", tone: "react" },
      { text: " yang jelas di depan." },
    ],
    [
      { text: "Mandiri atau dalam tim — " },
      { text: "clean code", tone: "strong" },
      { text: ", " },
      { text: "komunikasi teknis yang rapi", tone: "strong" },
      { text: ", dan " },
      { text: "rasa ingin tahu", tone: "strong" },
      { text: " yang tidak berhenti di satu layer." },
    ],
  ],
  [
    [
      { text: "I design systems end to end: reliable " },
      { text: "Java/Spring APIs", tone: "java" },
      { text: " behind a clear " },
      { text: "React 19 / TypeScript interface", tone: "react" },
      { text: "." },
    ],
    [
      { text: "Independent or in a team — " },
      { text: "clean code", tone: "strong" },
      { text: ", " },
      { text: "tidy technical communication", tone: "strong" },
      { text: ", and " },
      { text: "curiosity", tone: "strong" },
      { text: " that does not stop at one layer." },
    ],
  ],
);

export const profileSkills = [
  { id: "java", label: "Java", icon: "java" },
  { id: "spring", label: "Spring", icon: "springboot" },
  { id: "react", label: "React 19", icon: "react" },
  { id: "typescript", label: "TypeScript", icon: "typescript" },
];

export const profileHeadline = [
  { text: dual("Saya adalah", "I am a"), accent: false },
  { text: dual("Fullstack Developer.", "Fullstack Developer."), accent: true },
];

/**
 * UI chrome: buttons, section labels, aria names, and headings that are not
 * facts about a project. Kept as Dual pairs so ID and EN stay side by side.
 */
export const copy = {
  skipToContent: dual("Lompat ke konten utama", "Skip to main content"),
  brandHome: dual("Fajar Rafsan — kembali ke atas", "Fajar Rafsan — back to top"),
  brandRole: dual("Fullstack · Bandung", "Fullstack · Bandung"),
  available: dual("Tersedia", "Available"),
  availableBandung: dual("Tersedia · Bandung & Jakarta", "Available · Bandung & Jakarta"),
  availability: dual(
    "Terbuka untuk magang dan junior · Bandung & Jakarta · remote / hybrid",
    "Open to intern and junior roles · Bandung & Jakarta · remote / hybrid",
  ),
  viewCv: dual("Lihat CV", "View CV"),
  mobileNav: dual("Navigasi", "Navigation"),
  portrait: dual("Potret", "Portrait"),
  openToWork: dual("Terbuka untuk kerja", "Open to work"),
  photoAlt: dual(`Foto profil ${profileName}`, `Profile photo of ${profileName}`),
  aboutMe: dual("Tentang saya", "About me"),
  skillsAria: dual("Keahlian utama", "Core skills"),
  heroStackAria: dual("Stack utama", "Primary stack"),
  viewProjects: dual("Lihat proyek", "View projects"),
  scrollToProjects: dual("Gulir ke proyek pilihan", "Scroll to selected projects"),
  marqueeAria: dual("Teknologi utama", "Core technologies"),
  sectionProfile: dual("Profil", "Profile"),
  sectionArchitecture: dual("Arsitektur gerak", "Motion architecture"),
  architectureEyebrow: dual("Backend bergerak", "Backend in motion"),
  sectionWork: dual("Repositori pilihan / 2026", "Selected repositories / 2026"),
  workTitle: dual("Sistem yang dibangun", "Built systems"),
  sectionStack: dual("Inti stack", "Core stack"),
  capabilitiesTitle: dual("Dari endpoint pertama sampai layar.", "From the first endpoint to the screen."),
  capabilitiesBody: dual(
    "Empat lapisan yang saya pakai membangun sistem: service, data, jaringan service, dan interface.",
    "Four layers I use to build systems: services, data, the service network, and the interface.",
  ),
  sectionToolchain: dual("Perangkat kerja", "Toolchain"),
  toolchainTitle: dual("Alat yang saya pakai setiap hari.", "The tools I use every day."),
  toolchainBody: dual(
    "Bukan daftar semua yang pernah saya sentuh — hanya yang benar-benar dipakai di sistem-sistem di atas.",
    "Not a list of everything I have ever touched — only what is actually used in the systems above.",
  ),
  toolchainNote: dual(
    "Di luar daftar harian: C dari pelatihan algoritma, Postman untuk uji API, dan Git Flow untuk alur cabang.",
    "Outside the daily set: C from algorithm training, Postman for API checks, and Git Flow for branch workflow.",
  ),
  utilityEyebrow: dual("Utilitas", "Utility"),
  sectionExperience: dual("Pengalaman & pendidikan", "Experience & education"),
  experienceLead: dual(
    "Akuntansi melatih ketelitian saya.\nRekayasa memberinya sistem.",
    "Accounting trained my precision.\nEngineering gave it a system.",
  ),
  experienceTitle: dual("Belajar dalam.", "Learn deeply."),
  experienceTitleEm: dual("Mengajar kembali.", "Teach it back."),
  sectionConnect: dual("Terhubung", "Connect"),
  contactBlurb: dual(
    "Terbuka untuk kesempatan fullstack, kolaborasi produk, dan diskusi sistem ujung ke ujung.",
    "Open to fullstack opportunities, product collaboration, and end-to-end systems conversations.",
  ),
  contactLine1: dual("MARI BANGUN", "LET'S BUILD"),
  contactLine2: dual("ANDAL.", "RELIABLE."),
  sendEmail: dual("Kirim email", "Send email"),
  mailSubject: dual("Peluang Fullstack", "Fullstack opportunity"),
  downloadCv: dual("Unduh CV lengkap", "Download full CV"),
  footer: dual("© 2026 Fajar Rafsan. Fullstack Developer.", "© 2026 Fajar Rafsan. Fullstack Developer."),
  backToTop: dual("Kembali ke atas ↑", "Back to top ↑"),
  copyEmail: dual("salin", "copy"),
  copiedEmail: dual("tersalin", "copied"),
  copiedStatus: dual("Alamat email tersalin ke papan klip", "Email address copied to the clipboard"),
  year: dual("Tahun", "Year"),
  liveDemo: dual("Demo live", "Live demo"),
  cursorView: dual("Lihat", "View"),
  panelTechAria: dual("Teknologi pada panel ini", "Technologies on this panel"),
  graphCore: dual("Inti", "Core"),
  introAria: dual("Memuat. Lihat karya.", "Loading. See work."),
  introIndex: dual("Indeks 01", "Index 01"),
  introLoading: dual("Memuat", "Loading"),
  introKicker: dual("Karya pilihan · 2026", "Selected work · 2026"),
  introSee: dual("LIHAT", "SEE"),
  introWork: dual("KARYA", "WORK"),
  introSr: dual("Lihat karya.", "See work."),
  introByline: dual(
    "Fajar Rafsan — fullstack, Java & React. Bandung.",
    "Fajar Rafsan — fullstack, Java & React. Bandung.",
  ),
  heroLede: dual(
    [
      { kind: "name" as const, text: "Saya Fajar Rafsan." },
      { text: " Fullstack developer: " },
      { kind: "token" as const, text: "API Java" },
      { text: " yang andal " },
      { kind: "dim" as const, text: "di belakang," },
      { text: " " },
      { kind: "token" as const, text: "interface React" },
      { text: " yang jelas " },
      { kind: "dim" as const, text: "di depan." },
    ],
    [
      { kind: "name" as const, text: "I'm Fajar Rafsan." },
      { text: " Fullstack developer: reliable " },
      { kind: "token" as const, text: "Java APIs" },
      { text: " " },
      { kind: "dim" as const, text: "behind," },
      { text: " a clear " },
      { kind: "token" as const, text: "React interface" },
      { text: " " },
      { kind: "dim" as const, text: "in front." },
    ],
  ),
  architectureHeading: dual(
    [
      [
        { text: "Setiap " },
        { text: "request", tone: "acid" as const },
        { text: " punya jalur.", wrap: "sm" as const },
      ],
      [
        { text: "Setiap " },
        { text: "event", tone: "acid" as const },
        { text: " punya tujuan.", wrap: "sm" as const },
      ],
    ],
    [
      [
        { text: "Every " },
        { text: "request", tone: "acid" as const },
        { text: " has a path.", wrap: "sm" as const },
      ],
      [
        { text: "Every " },
        { text: "event", tone: "acid" as const },
        { text: " has a destination.", wrap: "sm" as const },
      ],
    ],
  ),
  architectureBody: dual(
    [
      { text: "Begini saya merancang backend: " },
      { text: "modular", tone: "strong" as const },
      { text: ", " },
      { text: "observable", tone: "strong" as const },
      { text: ", dan " },
      { text: "terhubung", tone: "strong" as const },
      { text: " — batas tanggung jawab tetap jelas." },
    ],
    [
      { text: "How I design backends: " },
      { text: "modular", tone: "strong" as const },
      { text: ", " },
      { text: "observable", tone: "strong" as const },
      { text: ", and " },
      { text: "connected", tone: "strong" as const },
      { text: " — the boundaries of responsibility stay clear." },
    ],
  ),
  architectureMeta: dual(
    [
      { value: "08", label: "node" },
      { value: "Spring Boot", label: "inti" },
      { value: "HTTPS", label: "ke AMQP" },
    ],
    [
      { value: "08", label: "nodes" },
      { value: "Spring Boot", label: "core" },
      { value: "HTTPS", label: "to AMQP" },
    ],
  ),
  backendGraphAria: dual(
    "Diagram arsitektur: klien, gateway, autentikasi, service, data, cache, events, dan pembayaran mengelilingi inti Spring Boot",
    "Architecture diagram: client, gateway, auth, service, data, cache, events, and payments around a Spring Boot core",
  ),
  frontendGraphAria: dual(
    "Diagram arsitektur front-end: views, komponen, tipe, styling, bundler, auth, realtime, dan checkout mengelilingi inti Front End",
    "Front-end architecture diagram: views, components, types, styling, bundler, auth, realtime, and checkout around a Front End core",
  ),
};

export const projects = [
  {
    number: "01",
    title: "ANISTREAM",
    type: dual("Platform streaming · Node & Redis", "Streaming platform · Node & Redis"),
    year: "2026",
    note: dual(
      "Platform streaming anime dengan katalog, multi-server player, jadwal rilis mingguan, Google OAuth, wishlist, dan watch history. Backend Express memakai service layer dan cache Redis agar katalog tetap cepat.",
      "An anime streaming platform with a catalogue, multi-server player, weekly release schedule, Google OAuth, wishlist, and watch history. The Express backend uses a service layer and Redis caching to keep the catalogue fast.",
    ),
    stack: ["Node.js", "Express", "Redis", "React 19", "Google OAuth", "Vitest"],
    metrics: [
      ["API", "REST + service layer"],
      ["Cache", "Redis"],
      ["Auth", "Google OAuth"],
    ],
    variant: "anistream",
    mark: "ANI",
    cover: "/projects/anistream.webp",
    coverPosition: "50% 50%",
    demo: "https://anistreasm-fe-nine.vercel.app",
    links: [
      ["Front-end", "https://github.com/fajarrafsan/ANISTREAM-FE"],
      ["Back-end", "https://github.com/fajarrafsan/REST-API-ANISTREASM-BE"],
    ],
  },
  {
    number: "02",
    title: "ARUNIKA",
    type: dual("Landing kopi specialty · HTML murni", "Specialty coffee landing · vanilla HTML"),
    year: "2026",
    note: dual(
      "Landing page statis untuk brand kopi specialty Arunika: katalog minuman dan biji dari origin Indonesia, filter produk, kartu tilt 3D, dan cerita bean-to-cup. HTML, CSS, dan JavaScript murni — tanpa framework, responsif sampai 320px.",
      "A static landing page for the specialty coffee brand Arunika: drinks and beans from Indonesian origins, product filters, 3D tilt cards, and a bean-to-cup story. Plain HTML, CSS, and JavaScript — no framework, responsive down to 320px.",
    ),
    stack: ["HTML5", "CSS3", "JavaScript", "Motion"],
    metrics: [
      ["Pattern", dual("Statis", "Static")],
      ["Motion", "Motion"],
      ["Deploy", "Vercel"],
    ],
    variant: "arunika",
    mark: "ARU",
    cover: "/projects/arunika.webp",
    coverPosition: "50% 50%",
    demo: "https://arunika-livid.vercel.app",
    links: [
      ["Repository", "https://github.com/fajarrafsan/ARUNIKA"],
    ],
  },
  {
    number: "03",
    title: "ROOMLY",
    type: dual("Microservices event-driven", "Event-driven microservices"),
    year: "2026",
    note: dual(
      "Ekosistem reservasi hotel: Eureka service discovery, API gateway, RabbitMQ untuk event antar-service, JWT, pembayaran Midtrans, dan invoice PDF. Dashboard React 19 + TypeScript dengan analitik real-time dan dwibahasa ID/EN.",
      "A hotel reservation ecosystem: Eureka service discovery, an API gateway, RabbitMQ for inter-service events, JWT, Midtrans payments, and PDF invoices. A React 19 + TypeScript dashboard with real-time analytics, bilingual ID/EN.",
    ),
    stack: ["Spring Boot", "Eureka", "Hibernate", "RabbitMQ", "Docker", "PostgreSQL", "TypeScript"],
    metrics: [
      ["Pattern", "Event-driven"],
      ["Broker", "RabbitMQ"],
      ["Deploy", "Docker Compose"],
    ],
    variant: "roomly",
    mark: "RML",
    cover: "/projects/roomly.webp",
    coverPosition: "50% 50%",
    demo: null,
    links: [
      ["Front-end", "https://github.com/fajarrafsan/RoomlyHotel"],
      ["Microservices API", "https://github.com/fajarrafsan/REST-API-Hotel-Booking"],
    ],
  },
  {
    number: "04",
    title: "GLOWMARKET",
    type: dual("Sistem commerce & keuangan", "Commerce & financial system"),
    year: "2026",
    note: dual(
      "E-commerce perhiasan emas: pembayaran Xendit, ongkir RajaOngkir, chat real-time WebSocket/STOMP, poin loyalitas, dan pembukuan double-entry yang menjurnal setiap transaksi secara otomatis. Migrasi skema dikunci Flyway.",
      "A gold jewellery e-commerce build: Xendit payments, RajaOngkir shipping rates, real-time WebSocket/STOMP chat, loyalty points, and double-entry bookkeeping that journals every transaction automatically. Schema migrations are pinned with Flyway.",
    ),
    stack: ["Spring Boot 4", "PostgreSQL", "Hibernate", "Swagger", "Flyway", "WebSocket", "Xendit", "React 19"],
    metrics: [
      ["Ledger", "Double-entry"],
      ["Realtime", "STOMP / WS"],
      ["Payments", "Xendit"],
    ],
    variant: "glowmarket",
    mark: "GLW",
    cover: "/projects/glowmarket.webp",
    coverPosition: "50% 50%",
    demo: "https://projek-react.vercel.app",
    links: [
      ["Front-end", "https://github.com/fajarrafsan/GLOWMARKET"],
      ["REST API", "https://github.com/fajarrafsan/REST-API-GLOWMARKET"],
    ],
  },
  {
    number: "05",
    title: "SIA",
    type: dual("Sistem informasi akuntansi", "Accounting information system"),
    year: "2024",
    note: dual(
      "Sistem Informasi Akuntansi untuk mendigitalkan pencatatan keuangan — jurnal, buku besar, dan laporan. Dibangun server-rendered dengan Thymeleaf, dan logika bisnisnya langsung memakai latar belakang akuntansi saya.",
      "An accounting information system that digitises financial records — journals, ledgers, and reports. Server-rendered with Thymeleaf, with business logic drawn straight from my accounting background.",
    ),
    stack: ["Java", "Spring Boot", "Hibernate", "Spring Security", "Thymeleaf", "MySQL"],
    metrics: [
      ["Domain", dual("Akuntansi", "Accounting")],
      ["Render", "Server-side"],
      ["Auth", "Spring Security"],
    ],
    variant: "sia",
    mark: "SIA",
    cover: "/projects/sia.webp",
    coverPosition: "50% 50%",
    // Render's free tier sleeps, so the first visit can sit on a cold start
    // for up to a minute before the app answers.
    demo: "https://sia-sistem-informasi-akuntansi.onrender.com/",
    links: [
      ["Repository", "https://github.com/fajarrafsan/SIA-SISTEM_INFORMASI_AKUNTANSI"],
    ],
  },
];

/**
 * Smaller public utilities. Kept off `projects` so the flagship stack, the
 * "05 systems" stat, and "Tiga SPA" copy stay accurate.
 */
export const utilityProjects = [
  {
    number: "06",
    title: "Gold-Price-Manager",
    type: dual("Utilitas harga emas · Express", "Gold-price utility · Express"),
    year: "2025",
    note: dual(
      "Utilitas harga emas: input 24K, rasio 22K/18K otomatis, dan riwayat perubahan. UI HTML + Tailwind, API Express di memori — bukan platform commerce.",
      "A gold-price utility: 24K input, automatic 22K/18K ratios, and a change log. HTML + Tailwind UI with an in-memory Express API — not a commerce platform.",
    ),
    stack: ["HTML5", "JavaScript", "Express", "Tailwind", "Node.js"],
    metrics: [
      ["Pattern", dual("Utilitas", "Utility")],
      ["Karat", "24K · 22K · 18K"],
      ["Deploy", "GitHub Pages"],
    ],
    variant: "goldprice",
    mark: "GPM",
    cover: "/projects/gold-price.webp",
    coverPosition: "50% 50%",
    demo: "https://fajarrafsan.github.io/Gold-Price-Manager/",
    links: [
      ["Repository", "https://github.com/fajarrafsan/Gold-Price-Manager"],
    ],
  },
];

export type UtilityProject = (typeof utilityProjects)[number];

export const capabilities = [
  {
    number: "01",
    title: dual("Java & Spring Boot", "Java & Spring Boot"),
    detail: dual(
      "RESTful API, clean service layer, Spring Security, JWT, dan backend yang mudah dikembangkan.",
      "RESTful APIs, a clean service layer, Spring Security, JWT, and a backend that stays easy to extend.",
    ),
    icons: ["java", "springboot"],
  },
  {
    number: "02",
    title: dual("Microservices", "Microservices"),
    detail: dual(
      "Eureka, API Gateway, RabbitMQ, Docker, dan arsitektur event-driven.",
      "Eureka, API Gateway, RabbitMQ, Docker, and an event-driven architecture.",
    ),
    icons: ["docker", "rabbitmq"],
  },
  {
    number: "03",
    title: dual("Data & performa", "Data & performance"),
    detail: dual(
      "PostgreSQL, MySQL, Redis, transaksi, migrasi Flyway, caching, dan konsistensi data.",
      "PostgreSQL, MySQL, Redis, transactions, Flyway migrations, caching, and data consistency.",
    ),
    icons: ["postgresql", "redis"],
  },
  {
    number: "04",
    title: dual("Full-stack delivery", "Full-stack delivery"),
    detail: dual(
      "React 19, TypeScript, Tailwind, integrasi payment gateway, dan fitur real-time.",
      "React 19, TypeScript, Tailwind, payment gateway integration, and real-time features.",
    ),
    icons: ["react", "typescript"],
  },
];

// Repository count is the live figure from the public GitHub profile.
export const profileStats = [
  { value: "16", label: dual("Repositori publik", "Public repositories") },
  { value: "05", label: dual("Sistem unggulan", "Flagship systems") },
  { value: "10", label: dual("Sertifikat pelatihan", "Training certificates") },
  { value: "3.64", label: dual("IPK", "GPA") },
];

// Grouped so the grid reads as an engineer's stack, not a logo wall.
export const stackGroups = [
  {
    label: dual("Inti back-end", "Core back-end"),
    items: [
      { icon: "java", name: "Java" },
      { icon: "springboot", name: "Spring Boot" },
      { icon: "spring", name: "Spring Security" },
      { icon: "jwt", name: "JWT" },
    ],
  },
  {
    label: dual("Data & messaging", "Data & messaging"),
    items: [
      { icon: "postgresql", name: "PostgreSQL" },
      { icon: "mysql", name: "MySQL" },
      { icon: "redis", name: "Redis" },
      { icon: "rabbitmq", name: "RabbitMQ" },
    ],
  },
  {
    label: dual("Runtime & tooling", "Runtime & tooling"),
    items: [
      { icon: "docker", name: "Docker" },
      { icon: "nodejs", name: "Node.js" },
      { icon: "express", name: "Express" },
      { icon: "git", name: "Git" },
    ],
  },
  {
    label: dual("Lapisan antarmuka", "Interface layer"),
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
    period: dual("SEP 2025 — DES 2025", "SEP 2025 — DEC 2025"),
    role: dual("Instruktur Pemrograman Java", "Java Programming Instructor"),
    place: "Universitas Nasional Pasim",
    detail: dual(
      "Mengajar bootcamp Java untuk 30+ mahasiswa: fundamental, OOP, dan arsitektur Web MVC, sampai mereka membangun aplikasi web Thymeleaf sendiri.",
      "Taught a Java bootcamp to 30+ students: fundamentals, OOP, and Web MVC architecture, through to building their own Thymeleaf web apps.",
    ),
  },
  {
    period: dual("SEP 2024 — JUN 2026", "SEP 2024 — JUN 2026"),
    role: dual("Asisten Dosen Akuntansi", "Accounting Teaching Assistant"),
    place: "Universitas Nasional Pasim",
    detail: dual(
      "Mendampingi kelas akuntansi: struktur buku besar, logika transaksi, serta penilaian tugas dan ujian.",
      "Supported accounting classes: ledger structure, transactional logic, and grading assignments and exams.",
    ),
  },
  {
    period: dual("2023 — 2026", "2023 — 2026"),
    role: dual("S1 Akuntansi · IPK 3.64", "BSc Accounting · GPA 3.64"),
    place: "Universitas Nasional Pasim",
    detail: dual(
      "Penerima Beasiswa Penuh PUB, sekaligus menempuh 2+ tahun bootcamp pemrograman yang didanai beasiswa tersebut.",
      "Full PUB Scholarship recipient, alongside 2+ years of the programming bootcamp that scholarship funded.",
    ),
  },
];

export const cvFile = {
  href: "/cv/Fajar_Rafsan_Tanjung.pdf",
  download: "Fajar_Rafsan_Tanjung.pdf",
  filename: "FAJAR_RAFSAN_TANJUNG.PDF",
};

export const cvPhone = "0812-8619-6886";
export const cvPhoneTel = "+6281286196886";

/** Preview chrome and the HRD download prompt. Facts live in `cvDocument`. */
export const cvPreviewCta = {
  label: dual("Unduh CV lengkap", "Download full CV"),
  header: dual("Unduh PDF", "Download PDF"),
  close: dual("Tutup", "Close"),
  closeAria: dual("Tutup pratinjau CV", "Close CV preview"),
  support: dual(
    "Silakan tinjau dokumen PDF untuk rincian pengalaman, proyek, dan kualifikasi.",
    "Please review the PDF for details of experience, projects, and qualifications.",
  ),
  skills: dual("Keahlian & penguasaan teknologi", "Skills & technical proficiency"),
  jobs: dual("Pengalaman kerja", "Work experience"),
  education: dual("Pendidikan", "Education"),
  achievements: dual("Pencapaian", "Achievements"),
  projects: dual("Proyek pilihan", "Selected projects"),
};

export const cvDocument = {
  name: "Fajar Rafsan Tanjung",
  role: dual(
    "Junior Backend, Frontend & Full-Stack Developer",
    "Junior Backend, Frontend & Full-Stack Developer",
  ),
  location: "Bandung, Indonesia",
  summary: dual(
    "Fresh graduate Akuntansi dengan lebih dari dua tahun pelatihan bootcamp pemrograman yang didanai beasiswa universitas, berfokus pada pengembangan full-stack dengan Java Spring Boot dan React.js. Berpengalaman membangun REST API, autentikasi JWT, basis data relasional, microservices, dan aplikasi web ujung ke ujung. Latar belakang akuntansi menunjang ketelitian, penalaran transaksional, dan integritas data. Saat ini mencari peluang entry-level sebagai Backend, Frontend, atau Full-Stack Developer.",
    "Accounting fresh graduate with more than two years of university-scholarship-funded programming bootcamp training, focused on full-stack development with Java Spring Boot and React.js. Experienced building REST APIs, JWT authentication, relational databases, microservices, and end-to-end web applications. An accounting background supports care, transactional reasoning, and data integrity. Currently seeking entry-level opportunities as a Backend, Frontend, or Full-Stack Developer.",
  ),
  skills: [
    {
      title: "Backend",
      items: [
        "Java, Spring Boot, Spring Security",
        "Spring Cloud (Eureka, API Gateway)",
        "Payment Gateway, RabbitMQ, Redis, WebSocket",
        "Node.js, Express.js, REST API, JWT",
        "OOP, MVC, SOLID, Dependency Injection",
        "Exception Handling, Service Layer, Repository Pattern",
      ],
    },
    {
      title: "Frontend",
      items: [
        "React, TypeScript, JavaScript, HTML5",
        "Tailwind CSS, Thymeleaf, Framer Motion",
        "Vite, Responsive Design",
      ],
    },
    {
      title: dual("Basis data, perkakas & fundamental", "Database, tools & fundamentals"),
      items: [
        "MySQL, PostgreSQL, Hibernate ORM",
        "Relational Schema Design",
        "Git, GitHub, Git Flow, Swagger/OpenAPI, Postman",
        "API Testing, Unit Testing, JSON",
        "Algorithms, Data Structures, Clean Code, C",
        dual("Indonesia (Asli), Inggris (Dasar)", "Indonesian (Native), English (Basic)"),
      ],
    },
  ],
  jobs: [
    {
      role: dual("Instruktur Pemrograman Java", "Java Programming Instructor"),
      place: "Universitas Nasional Pasim · Bandung",
      period: dual("Sep 2025 — Des 2025", "Sep 2025 — Dec 2025"),
      summary: dual(
        "Mengajar bootcamp pemrograman Java untuk 30+ mahasiswa: Java Fundamentals, OOP, dan arsitektur Web MVC.",
        "Taught a Java programming bootcamp to 30+ students: Java Fundamentals, OOP, and Web MVC architecture.",
      ),
      bullets: [
        dual(
          "Menyampaikan modul Java Fundamentals, Object-Oriented Programming (OOP), dan arsitektur Web MVC.",
          "Delivered Java Fundamentals, Object-Oriented Programming (OOP), and Web MVC architecture modules.",
        ),
        dual(
          "Mendampingi jalur belajar terstruktur — dari kuliah konseptual dan kuis berkala hingga bimbingan membangun aplikasi web Thymeleaf.",
          "Accompanied a structured learning path — from conceptual lectures and periodic quizzes through to guidance building Thymeleaf web apps.",
        ),
        dual(
          "Menilai proyek akhir mahasiswa melalui sesi presentasi dan tinjauan kode.",
          "Assessed students' final projects through presentation sessions and code review.",
        ),
      ],
    },
    {
      role: dual("Asisten Dosen Akuntansi", "Accounting Teaching Assistant"),
      place: "Universitas Nasional Pasim · Bandung",
      period: dual("Sep 2024 — Jun 2026", "Sep 2024 — Jun 2026"),
      summary: dual(
        "Mendampingi kuliah akuntansi: konsep keuangan, struktur buku besar, dan logika transaksional.",
        "Supported accounting lectures: financial concepts, ledger structure, and transactional logic.",
      ),
      bullets: [
        dual(
          "Membantu dosen memfasilitasi mata kuliah akuntansi, termasuk konsep keuangan, struktur buku besar, dan logika transaksi.",
          "Helped the lecturer facilitate accounting courses, including financial concepts, ledger structure, and transaction logic.",
        ),
        dual(
          "Menilai tugas dan ujian dengan ketelitian tinggi agar pemrosesan data keuangan tetap akurat.",
          "Graded assignments and exams with high care so financial data processing stayed accurate.",
        ),
        dual(
          "Membimbing mahasiswa pada prinsip akuntansi dasar, sekaligus mengasah komunikasi teknis dan pemecahan masalah.",
          "Guided students on basic accounting principles, while sharpening technical communication and problem-solving.",
        ),
      ],
    },
  ],
  education: {
    program: dual("S1 Akuntansi (Accounting)", "BSc Accounting"),
    place: "Universitas Nasional Pasim · Bandung",
    detail: dual(
      "IPK 3,64 / 4,00 · Penerima Beasiswa Penuh PUB 2023–2026",
      "GPA 3.64 / 4.00 · Full PUB Scholarship recipient 2023–2026",
    ),
    period: dual("2023 — 2026 (Expected)", "2023 — 2026 (Expected)"),
    note: dual(
      "Latar belakang akuntansi memberi fondasi logika transaksional, ketelitian, dan integritas data — yang relevan untuk merancang basis data relasional, membangun backend yang andal, dan menuliskan logika bisnis yang tepat.",
      "An accounting background gives a foundation in transactional logic, care, and data integrity — relevant to designing relational databases, building a reliable backend, and writing precise business logic.",
    ),
  },
  achievements: [
    dual(
      "Penerima Beasiswa Penuh PUB — diseleksi melalui proses seleksi beasiswa nasional yang kompetitif.",
      "Full PUB Scholarship recipient — selected through a competitive national scholarship process.",
    ),
    dual(
      "Instruktur akademik & asisten dosen — dipercaya universitas untuk mendampingi kuliah Akuntansi dan membimbing 30+ mahasiswa pada bootcamp Java.",
      "Academic instructor & teaching assistant — trusted by the university to support Accounting lectures and mentor 30+ students on the Java bootcamp.",
    ),
  ],
  projects: [
    {
      title: "RoomlyHotel",
      stack: "Java · Spring Boot · React.js · Spring Cloud · MySQL · RabbitMQ · Redis · JWT",
      year: "2026",
      detail: dual(
        "Platform pemesanan hotel full-stack berbasis microservices: Spring Cloud (Eureka & API Gateway), 20+ REST API, JWT & RBAC, RabbitMQ, Redis, dan Payment Gateway.",
        "A full-stack hotel booking platform on microservices: Spring Cloud (Eureka & API Gateway), 20+ REST APIs, JWT & RBAC, RabbitMQ, Redis, and a Payment Gateway.",
      ),
    },
    {
      title: "AniStream",
      stack: "Node.js · Express.js · React.js · Tailwind CSS · MySQL · REST API · JWT",
      year: "2026",
      detail: dual(
        "Platform media full-stack terpisah: REST API Node.js/Express dengan JWT, frontend React.js & Tailwind CSS, serta skema relasional untuk profil, metadata konten, dan riwayat interaksi.",
        "A split full-stack media platform: a Node.js/Express REST API with JWT, a React.js & Tailwind CSS frontend, and a relational schema for profiles, content metadata, and interaction history.",
      ),
    },
    {
      title: "GlowMarket",
      stack: "Java · Spring Boot · React.js · Tailwind CSS · MySQL · REST API · JWT",
      year: "2025",
      detail: dual(
        "E-commerce full-stack: REST API Java Spring Boot, UI React.js & Tailwind CSS, JWT & RBAC (Admin & Customer), CRUD katalog, kategori, keranjang, dan integritas data transaksional.",
        "A full-stack e-commerce build: a Java Spring Boot REST API, a React.js & Tailwind CSS UI, JWT & RBAC (Admin & Customer), catalogue CRUD, categories, cart, and transactional data integrity.",
      ),
    },
    {
      title: "SIA",
      stack: "Java · Spring Boot · MySQL · Thymeleaf · Spring Security",
      year: "2024",
      detail: dual(
        "Sistem Informasi Akuntansi untuk mendigitalkan pencatatan keuangan, dengan logika bisnis yang bersumber dari latar belakang akuntansi.",
        "An accounting information system to digitise financial records, with business logic drawn from an accounting background.",
      ),
    },
  ],
};

/** Inline emphasis vocabulary for long-form copy: "acid" marks the one
    punchline per paragraph, "strong" lifts names/entities, "dim" recedes
    connective phrases. Omitted tone = plain body text. */
export type RichTone = "acid" | "strong" | "dim";

export type RichSegment = {
  text: string;
  tone?: RichTone;
  wrap?: "sm";
};

export type RichText = RichSegment[];

export const frontendArchitecture = {
  kicker: dual("Arsitektur front-end", "Front-end architecture"),
  heading: dual(
    [
      [
        { text: "Setiap " },
        { text: "layar", tone: "acid" as const },
        { text: " punya state.", wrap: "sm" as const },
      ],
      [
        { text: "Setiap " },
        { text: "aksi", tone: "acid" as const },
        { text: " punya tujuan.", wrap: "sm" as const },
      ],
    ],
    [
      [
        { text: "Every " },
        { text: "screen", tone: "acid" as const },
        { text: " has state.", wrap: "sm" as const },
      ],
      [
        { text: "Every " },
        { text: "action", tone: "acid" as const },
        { text: " has a destination.", wrap: "sm" as const },
      ],
    ],
  ),
  panels: [
    {
      number: "01",
      title: dual("Interface surface", "Interface surface"),
      nodeId: "views",
      icons: ["react", "javascript"],
      body: dual<RichText>(
        [
          { text: "Tiga SPA di GitHub: " },
          { text: "ANISTREAM-FE", tone: "strong" },
          { text: " (katalog, multi-server player, Google OAuth), " },
          { text: "GLOWMARKET", tone: "strong" },
          { text: " (katalog emas, checkout, admin), dan " },
          { text: "RoomlyHotel", tone: "strong" },
          { text: " (dashboard reservasi dwibahasa). Satu pola: " },
          { text: "komponen yang jelas, state yang tidak bocor ke API.", tone: "acid" },
        ],
        [
          { text: "Three SPAs on GitHub: " },
          { text: "ANISTREAM-FE", tone: "strong" },
          { text: " (catalogue, multi-server player, Google OAuth), " },
          { text: "GLOWMARKET", tone: "strong" },
          { text: " (gold catalogue, checkout, admin), and " },
          { text: "RoomlyHotel", tone: "strong" },
          { text: " (bilingual reservation dashboard). One pattern: " },
          { text: "components that are clear, state that does not leak into the API.", tone: "acid" },
        ],
      ),
    },
    {
      number: "02",
      title: dual("Type & tooling", "Type & tooling"),
      nodeId: "types",
      icons: ["typescript", "vite", "tailwind"],
      body: dual<RichText>(
        [
          { text: "RoomlyHotel", tone: "strong" },
          { text: " ditulis TypeScript. " },
          { text: "GlowMarket", tone: "strong" },
          { text: " dan " },
          { text: "ANISTREAM-FE", tone: "strong" },
          { text: " memakai Vite + Tailwind v4. Tipe di klien mengikuti kontrak REST, bukan sebaliknya — " },
          { text: "UI tidak menebak bentuk data.", tone: "acid" },
        ],
        [
          { text: "RoomlyHotel", tone: "strong" },
          { text: " is written in TypeScript. " },
          { text: "GlowMarket", tone: "strong" },
          { text: " and " },
          { text: "ANISTREAM-FE", tone: "strong" },
          { text: " use Vite + Tailwind v4. Types on the client follow the REST contract, not the other way around — " },
          { text: "the UI does not guess the shape of the data.", tone: "acid" },
        ],
      ),
    },
    {
      number: "03",
      title: dual("Auth di klien", "Auth on the client"),
      nodeId: "auth",
      icons: ["jwt", "react"],
      body: dual<RichText>(
        [
          { text: "Google OAuth di " },
          { text: "ANISTREAM", tone: "strong" },
          { text: ", JWT di " },
          { text: "Roomly", tone: "strong" },
          { text: " dan " },
          { text: "GlowMarket", tone: "strong" },
          { text: ". Token tinggal di browser; keputusan otorisasi tetap di gateway dan service Java. " },
          { text: "Front end hanya membawa identitas, tidak menghakimi hak akses.", tone: "acid" },
        ],
        [
          { text: "Google OAuth on " },
          { text: "ANISTREAM", tone: "strong" },
          { text: ", JWT on " },
          { text: "Roomly", tone: "strong" },
          { text: " and " },
          { text: "GlowMarket", tone: "strong" },
          { text: ". Tokens live in the browser; authorization decisions stay at the gateway and the Java services. " },
          { text: "The front end only carries identity, it does not judge access rights.", tone: "acid" },
        ],
      ),
    },
    {
      number: "04",
      title: dual("Realtime UI", "Realtime UI"),
      nodeId: "realtime",
      icons: ["websocket", "react"],
      body: dual<RichText>(
        [
          { text: "Chat WebSocket/STOMP di " },
          { text: "GlowMarket", tone: "strong" },
          { text: " dan analitik live di " },
          { text: "Roomly", tone: "strong" },
          { text: ". " },
          { text: "Event masuk, komponen berubah — tanpa reload.", tone: "acid" },
          { text: " Subscription dipasang di batas layar, dilepas saat unmount." },
        ],
        [
          { text: "WebSocket/STOMP chat on " },
          { text: "GlowMarket", tone: "strong" },
          { text: " and live analytics on " },
          { text: "Roomly", tone: "strong" },
          { text: ". " },
          { text: "Events arrive, components change — no reload.", tone: "acid" },
          { text: " Subscriptions are attached at the screen boundary, released on unmount." },
        ],
      ),
    },
    {
      number: "05",
      title: dual("Checkout & delivery", "Checkout & delivery"),
      nodeId: "checkout",
      icons: ["card", "javascript"],
      body: dual<RichText>(
        [
          { text: "Xendit", tone: "strong" },
          { text: " di " },
          { text: "GlowMarket", tone: "strong" },
          { text: ", " },
          { text: "Midtrans", tone: "strong" },
          { text: " di " },
          { text: "Roomly", tone: "strong" },
          { text: ". Front end mengorkestrasi langkah bayar; jurnal, invoice, dan stok tetap di service. Yang tampil di UI " },
          { text: "hanya status yang sudah dikonfirmasi backend.", tone: "acid" },
        ],
        [
          { text: "Xendit", tone: "strong" },
          { text: " on " },
          { text: "GlowMarket", tone: "strong" },
          { text: ", " },
          { text: "Midtrans", tone: "strong" },
          { text: " on " },
          { text: "Roomly", tone: "strong" },
          { text: ". The front end orchestrates the payment steps; journals, invoices, and stock stay in the services. What the UI shows is " },
          { text: "only status already confirmed by the backend.", tone: "acid" },
        ],
      ),
    },
  ],
};

export const artThemes: Record<string, string> = {
  anistream: "bg-[#0b0d12] text-[#e11d2e]",
  arunika: "bg-[#1a110c] text-[#e4c9a0]",
  roomly: "bg-[#174846] text-acid",
  glowmarket: "bg-[#f4eee4] text-[#27180d]",
  sia: "bg-[#12233a] text-[#7fb2ff]",
  goldprice: "bg-[#1c1810] text-[#e4c56a]",
};

export type Project = (typeof projects)[number] | UtilityProject;

export const marqueeTop = ["JAVA", "SPRING BOOT", "REACT", "TYPESCRIPT", "POSTGRESQL", "REDIS"];
export const marqueeBottom = ["REST API", "MICROSERVICES", "TAILWIND", "JWT / OAUTH", "WEBSOCKET", "DOCKER"];

/**
 * Training certificates, transcribed from the scans in `public/certificates`.
 *
 * All ten are issued by the same body — PUB Training Center Programming &
 * Accounting, run under the Pemberdayaan Umat Berkelanjutan scholarship at
 * Universitas Nasional PASIM Bandung — so the issuer is stated once on the
 * section rather than repeated on every card.
 *
 * Ordered newest first. `score` is the mark printed on the certificate;
 * the instructor certificate carries no mark, hence `null`.
 */
export const certificates = [
  {
    id: "frontend-advanced",
    title: dual("Advanced Front-End Programming", "Advanced Front-End Programming"),
    topic: dual("React", "React"),
    score: "87",
    date: dual("2 Juli 2026", "July 2, 2026"),
    sessions: dual("16 sesi · 120 menit", "16 sessions · 120 min"),
    src: "/certificates/frontend-advanced.jpg",
  },
  {
    id: "frontend-fundamental",
    title: dual("Fundamental Front-End Programming", "Fundamental Front-End Programming"),
    topic: dual("React", "React"),
    score: "89",
    date: dual("1 Januari 2026", "January 1, 2026"),
    sessions: dual("16 sesi · 120 menit", "16 sessions · 120 min"),
    src: "/certificates/frontend-fundamental.jpg",
  },
  {
    id: "logic-algorithm-c",
    title: dual("Logic & Algorithm Training", "Logic & Algorithm Training"),
    topic: dual("C", "C"),
    score: "83,85",
    date: dual("22 September 2025", "September 22, 2025"),
    sessions: dual("16 sesi · 120 menit", "16 sessions · 120 min"),
    src: "/certificates/logic-algorithm-c.jpg",
  },
  {
    id: "instructor-java",
    title: dual("Instruktur — Fundamental Java Backend", "Instructor — Fundamental Java Backend"),
    topic: dual("Mengajar", "Teaching"),
    score: null,
    date: dual("15 September 2025", "September 15, 2025"),
    sessions: dual("Instruktur kelas", "Class instructor"),
    src: "/certificates/instructor-java.jpg",
  },
  {
    id: "github",
    title: dual("Git & GitHub Training", "Git & GitHub Training"),
    topic: dual("Version control", "Version control"),
    score: "90",
    date: dual("17 Mei 2025", "May 17, 2025"),
    sessions: dual("4 sesi · 120 menit", "4 sessions · 120 min"),
    src: "/certificates/github.jpg",
  },
  {
    id: "web-programming",
    title: dual("Web Programming Training", "Web Programming Training"),
    topic: dual("HTML · CSS · JavaScript", "HTML · CSS · JavaScript"),
    score: "86",
    date: dual("17 Mei 2025", "May 17, 2025"),
    sessions: dual("16 sesi · 120 menit", "16 sessions · 120 min"),
    src: "/certificates/web-programming.jpg",
  },
  {
    id: "backend-fundamental",
    title: dual("Fundamental Back-End Programming", "Fundamental Back-End Programming"),
    topic: dual("Java", "Java"),
    score: "87,95",
    date: dual("15 Mei 2025", "May 15, 2025"),
    sessions: dual("16 sesi · 120 menit", "16 sessions · 120 min"),
    src: "/certificates/backend-fundamental.jpg",
  },
  {
    id: "backend-advanced",
    title: dual("Advanced Back-End Programming", "Advanced Back-End Programming"),
    topic: dual("Java", "Java"),
    score: "76",
    date: dual("15 Mei 2025", "May 15, 2025"),
    sessions: dual("16 sesi · 120 menit", "16 sessions · 120 min"),
    src: "/certificates/backend-advanced.jpg",
  },
  {
    id: "data-structure",
    title: dual("Data Structure Training", "Data Structure Training"),
    topic: dual("Struktur data", "Data structures"),
    score: "87",
    date: dual("29 Juni 2024", "June 29, 2024"),
    sessions: dual("16 sesi · 120 menit", "16 sessions · 120 min"),
    src: "/certificates/data-structure.jpg",
  },
  {
    id: "database",
    title: dual("Database Training", "Database Training"),
    topic: dual("Basis data", "Databases"),
    score: "83.6",
    date: dual("29 Juni 2024", "June 29, 2024"),
    sessions: dual("16 sesi · 120 menit", "16 sessions · 120 min"),
    src: "/certificates/database.jpg",
  },
];

export type Certificate = (typeof certificates)[number];

export const certificateIssuer = {
  org: "PUB Training Center — Programming & Accounting",
  scheme: dual("Program Pemberdayaan Umat Berkelanjutan", "Pemberdayaan Umat Berkelanjutan scholarship"),
  campus: dual("Universitas Nasional PASIM Bandung", "PASIM National University, Bandung"),
};
