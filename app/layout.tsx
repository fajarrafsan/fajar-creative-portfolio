import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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
    authors: [{ name: "Fajar Rafsan", url: "https://github.com/fajarrafsan02-bit" }],
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
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
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
    "https://github.com/fajarrafsan02-bit",
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
          <style>{`[style*="opacity"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a className="skip-link" href="#work">
          Lompat ke konten utama
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
