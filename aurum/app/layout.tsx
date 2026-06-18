import type { Metadata, Viewport } from "next";
import FontLoader from "@/components/ui/FontLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURUM — Luxury Sportswear & Apparel",
  description:
    "Luxury sportswear engineered for performance and designed for prestige. Discover AURUM — where excellence meets craftsmanship.",
  keywords: [
    "luxury sportswear",
    "premium activewear",
    "luxury gym clothing",
    "luxury apparel",
    "premium sports garments",
    "AURUM",
  ],
  openGraph: {
    title: "AURUM — Luxury Sportswear & Apparel",
    description:
      "Crafted for Excellence. Luxury sportswear engineered for performance and designed for prestige.",
    type: "website",
    locale: "en_US",
  },
  // Instruct crawlers not to translate the page (preserves brand typography)
  other: { "google": "notranslate" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0C0A09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* DNS prefetch for Unsplash CDN — cuts image TTFB */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <FontLoader />
      </head>
      <body className="min-h-full bg-aurum-black text-aurum-ivory antialiased">
        {children}
      </body>
    </html>
  );
}
