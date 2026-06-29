import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AnnouncementBanner from "@/components/layout/AnnouncementBanner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const mierB = localFont({
  src: [
    { path: "../../public/fonts/MierB-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/MierB-Book.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/MierB-Regular.woff2", weight: "450", style: "normal" },
    { path: "../../public/fonts/MierB-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mierb",
  display: "swap",
});

const siteUrl = "https://alutta.com";
const socialLinks = [
  "https://twitter.com/aluttahq",
  "https://linkedin.com/company/alutta",
  "https://instagram.com/aluttahq",
  "https://www.tiktok.com/@aluttahq",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Alutta - Your Study Abroad Journey, Simplified",
    template: "%s | Alutta",
  },
  description:
    "Alutta helps international students plan, fund, and manage their study abroad journey, from university applications and tuition payments to visas, housing, travel, and settlement support.",
  keywords: [
    "Alutta",
    "study abroad platform",
    "international student platform",
    "study abroad planning",
    "international students",
    "tuition payment",
    "student visa support",
    "university application support",
    "student accommodation abroad",
    "African students abroad",
    "Nigerian students abroad",
    "study in USA",
    "study in UK",
    "study in Canada",
    "study in Australia",
    "study in Europe",
  ],
  authors: [{ name: "Alutta" }],
  creator: "Alutta",
  publisher: "Alutta",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Alutta",
    title: "Alutta - Your Study Abroad Journey, Simplified",
    description: "Plan, fund, and manage your international education journey with Alutta.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Alutta study abroad platform" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@aluttahq",
    creator: "@aluttahq",
    title: "Alutta - Your Study Abroad Journey, Simplified",
    description: "Plan, fund, and manage your international education journey with Alutta.",
    images: ["/opengraph-image"],
  },
  alternates: { canonical: siteUrl },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#029b47",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Alutta",
      url: siteUrl,
      sameAs: socialLinks,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Alutta",
      description: "Alutta helps international students plan, fund, and manage their study abroad journey.",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Alutta",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "A study abroad platform for international students covering applications, payments, visas, housing, travel, and settlement support.",
      publisher: { "@id": `${siteUrl}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/PreOrder",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={mierB.variable} suppressHydrationWarning>
        <AnnouncementBanner />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
