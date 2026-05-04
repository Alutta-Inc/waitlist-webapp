import type { Metadata, Viewport } from "next";
import "./globals.css";
import AnnouncementBanner from "@/components/layout/AnnouncementBanner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Alutta — Your Study Abroad Journey, Simplified",
    template: "%s | Alutta",
  },
  description:
    "Plan your international education with Alutta. From school research to settlement, Alutta guides you every step of the way to study in the US, UK, and Canada.",
  keywords: [
    "study abroad", "international students", "study in USA", "study in UK",
    "study in Canada", "tuition payment", "student visa", "university application",
    "African students abroad", "Nigerian students abroad", "international student platform",
  ],
  authors: [{ name: "Alutta" }],
  creator: "Alutta",
  publisher: "Alutta",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://alutta.com",
    siteName: "Alutta",
    title: "Alutta — Your Study Abroad Journey, Simplified",
    description: "Plan your international education with Alutta. From school research to settlement, Alutta guides you every step of the way.",
    images: [{ url: "https://alutta.com/og-image.jpg", width: 1200, height: 630, alt: "Alutta" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@aluttahq",
    creator: "@aluttahq",
    title: "Alutta — Your Study Abroad Journey, Simplified",
    description: "Plan your international education with Alutta.",
    images: ["https://alutta.com/og-image.jpg"],
  },
  alternates: { canonical: "https://alutta.com" },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://alutta.com/#organization",
      name: "Alutta",
      url: "https://alutta.com",
      sameAs: ["https://twitter.com/aluttahq", "https://linkedin.com/company/alutta", "https://instagram.com/aluttahq"],
    },
    {
      "@type": "WebSite",
      "@id": "https://alutta.com/#website",
      url: "https://alutta.com",
      name: "Alutta",
      description: "Your Study Abroad Journey, Simplified",
      publisher: { "@id": "https://alutta.com/#organization" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body suppressHydrationWarning>
        <AnnouncementBanner />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
