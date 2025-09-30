// src/app/layout.tsx
import type { Metadata } from "next";
import { Montserrat, DM_Serif_Display } from "next/font/google";
import "./globals.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import CookieConsent from "../components/CookieConsent";
import { cookies } from "next/headers";

// ⬇️ ADDED
import SeoOrg from "@/components/SeoOrg";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dmserif" });

export const metadata: Metadata = {
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_SITE_URL || "https://www.girls-collective.com").replace(/\/+$/, "")
  ),
  title: {
    default: "Girls Collective",
    template: "%s · Girls Collective",
  },
  description: "Una comunidad para crear amistades reales, a tu ritmo.",
  keywords: [
    "Girls Collective",
    "comunidad mujeres",
    "amigas Valencia",
    "conocer gente nueva",
    "eventos mujeres",
    "tribu",
    "eventos valencia",
  ],
  applicationName: "Girls Collective",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: ["/favicon.ico?v=2", "/icon.png?v=2"],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-icon.png?v=2",
  },
  openGraph: {
    title: "Girls Collective",
    description: "Encuentra tu tribu, estés donde estés 💜",
    url: "/",
    siteName: "Girls Collective",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Girls Collective",
    description: "Encuentra tu tribu, estés donde estés 💜",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  // ⬇️ await cookies() (async in your Next version)
  const cookieStore = await cookies();
  const consent = cookieStore.get("gc-cookie-consent")?.value;
  const allowAnalytics = consent === "accepted";

  return (
    <html lang="es" className={`${montserrat.variable} ${dmSerif.variable}`}>
      <body className="antialiased">
        {/* ⬇️ ADDED: site-wide Organization + Website JSON-LD */}
        <SeoOrg />

        {/* Consent Mode default BEFORE GA loads */}
        <Script id="ga-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              functionality_storage: 'granted',
              security_storage: 'granted'
            });
          `}
        </Script>

        {/* Load GA only if user accepted */}
        {allowAnalytics && GA_ID && (
          <>
            <Script
              id="ga-loader"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}

        <div className="min-h-screen bg-gcBackground text-gcText flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

        <Analytics />
        <SpeedInsights />
        <CookieConsent />
      </body>
    </html>
  );
}
