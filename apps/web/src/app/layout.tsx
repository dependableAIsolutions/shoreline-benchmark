import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "../components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shoreline-714c6.web.app";
const OG_IMAGE_PATH = "/social/shoreline-og.png";
const SEO_TITLE = "Shoreline | Metacognitive Benchmark for AI Models";
const SEO_DESCRIPTION =
  "Shoreline benchmarks AI model capability and self-awareness across sand (claimed), solid (verified), and concrete (failure-aware) depth so teams can compare trustworthiness, calibration, and risk.";

export const viewport: Viewport = {
  themeColor: "#051328",
  colorScheme: "dark"
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_TITLE,
    template: "%s | Shoreline"
  },
  description: SEO_DESCRIPTION,
  applicationName: "Shoreline",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"]
  },
  alternates: {
    canonical: "/"
  },
  keywords: [
    "Shoreline benchmark",
    "AI benchmark",
    "metacognitive benchmark",
    "AI calibration",
    "model self-awareness",
    "LLM evaluation",
    "AI capability benchmark",
    "confidence calibration"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    siteName: "Shoreline",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Shoreline dashboard comparing AI metacognitive depth across models"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: [OG_IMAGE_PATH]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Shoreline",
    url: SITE_URL,
    description: SEO_DESCRIPTION,
    inLanguage: "en-US"
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Shoreline",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    image: `${SITE_URL}${OG_IMAGE_PATH}`,
    description: SEO_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };

  return (
    <html lang="en">
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
