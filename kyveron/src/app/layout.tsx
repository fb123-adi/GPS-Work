import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";

const mona = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
});

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Kyveron | Daily wear and training clothes, made in India", template: "%s | Kyveron" },
  description: "Premium daily wear and performance garments in considered fabrics. Made in India. Free delivery over ₹2,999, 14-day returns.",
  openGraph: { type: "website", siteName: "Kyveron", locale: "en_IN" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#151515",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={mona.variable}>
      <body>{children}</body>
    </html>
  );
}
