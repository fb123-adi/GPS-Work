import type { Metadata } from "next";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-aurum-black text-aurum-ivory antialiased">
        {children}
      </body>
    </html>
  );
}
