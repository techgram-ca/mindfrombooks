import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import { BRAND, TAGLINE, siteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });

const description =
  "Daily-action courses inspired by great books. One small task a day, one written response. Do the work every day and if you're still not happy, get a one-click refund.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${BRAND} — ${TAGLINE}`, template: `%s · ${BRAND}` },
  description,
  applicationName: BRAND,
  openGraph: { type: "website", siteName: BRAND, title: `${BRAND} — ${TAGLINE}`, description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
