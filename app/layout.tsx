import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { LocaleProvider } from "@/app/lib/i18n";
import { SkipLink } from "@/app/components/skip-link";
import "./globals.css";

// Geist, Geist Mono, and the Archivo display face are self-hosted from
// `public/fonts` and declared in `app/fonts.css`. next/font/google is not used
// here: under vinext it writes absolute local paths into the generated
// @font-face rules, so none of the faces ever reach the bundle.

const title = "Fajar Rafsan — Fullstack Developer";
const description =
  "Portofolio Fajar Rafsan, Fullstack Developer yang merancang API Java/Spring Boot dan interface React/TypeScript — dari data sampai layar.";

export const viewport: Viewport = {
  themeColor: "#0b0d0c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const imageUrl = new URL("/og-v2.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: title,
      template: "%s — Fajar Rafsan",
    },
    description,
    applicationName: "Fajar Rafsan Portfolio",
    authors: [{ name: "Fajar Rafsan", url: "https://github.com/fajarrafsan" }],
    creator: "Fajar Rafsan",
    keywords: [
      "Fajar Rafsan",
      "Fullstack Developer",
      "Java Developer",
      "Spring Boot",
      "React",
      "TypeScript",
      "Microservices",
      "REST API",
      "Backend Developer Indonesia",
      "Frontend Developer Bandung",
    ],
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
        { url: "/icon", sizes: "32x32", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "Fajar Rafsan",
      locale: "id_ID",
      url: origin,
      images: [{ url: imageUrl, width: 1792, height: 922, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

const FAVICON_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#d8ff3e"/><path fill="#0b0d0c" fill-rule="evenodd" d="M3.6 6.4h11.1v3.6H7.4v3.3h6.1v3.5H7.4V25.6H3.6V6.4Zm11.8 19.2L18.3 6.4h2.5L17.9 25.6h-2.5Zm6.1-19.2h6.2c2.2 0 3.6 1.4 3.6 3.5 0 1.55-.9 2.75-2.35 3.25L31.2 25.6h-3.35l-2.95-8.05h-1.4V25.6H21.5V6.4Zm2.8 3.45v3.55h2.45c.75 0 1.15-.5 1.15-1.8s-.4-1.75-1.15-1.75H24.3Z"/></svg>`,
  );

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Fajar Rafsan",
  jobTitle: "Fullstack Developer",
  description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bandung",
    addressCountry: "ID",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Universitas Nasional PASIM",
  },
  knowsAbout: [
    "Java",
    "Spring Boot",
    "Microservices",
    "REST API",
    "PostgreSQL",
    "Redis",
    "RabbitMQ",
    "Docker",
    "React",
    "TypeScript",
  ],
  sameAs: [
    "https://github.com/fajarrafsan",
    "https://www.linkedin.com/in/fajar-rafsan-80822b394/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href={FAVICON_SVG} type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon" sizes="180x180" />
        <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* If the bundle never hydrates, Motion's server-rendered opacity:0
            styles would hide the page for good. Reveal it instead. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "setTimeout(function(){var e=document.documentElement;if(!e.dataset.motionReady)e.classList.add('motion-stalled')},4000)",
          }}
        />
      </head>
      <body className="antialiased">
        <noscript>
          {/* Motion server-renders each element's `initial` state; without JS
              nothing would ever animate it back to visible. */}
          <style>{`[style*="opacity"]{opacity:1!important;transform:none!important}.intro-overlay{display:none!important}`}</style>
        </noscript>
        <LocaleProvider>
          <SkipLink />
          {children}
        </LocaleProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
