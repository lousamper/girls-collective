// src/app/layout.tsx
import type { Metadata } from "next";
import { Montserrat, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import CookieConsent from "../components/CookieConsent";
import { cookies } from "next/headers";

// ⬇️ ADDED
import SeoOrg from "@/components/SeoOrg";
// ⬇️ ADDED (import tracker)
import GtagRouteTracker from "@/components/GtagRouteTracker";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dmserif" });

export const metadata: Metadata = {
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_SITE_URL || "https://www.girls-collective.com").replace(/\/+$/, "")
  ),
  title: {
    default: "Girls Collective | Encuentra planes y amigas en tu ciudad",
    template: "%s · Girls Collective",
  },
  description:
    "Una comunidad para hacer amistades reales en tu ciudad, a tu ritmo. Encuentra los planes y lugares que van con tu vibra.",
  keywords: [
    "Girls Collective",
    "comunidad mujeres",
    "amigas Valencia",
    "conocer gente nueva",
    "eventos mujeres",
    "tribu",
    "eventos valencia",
    "amigas Madrid",
    "amigas Barcelona",
    "nuevas amistades",
    "planes mujeres",
    "actividades mujeres",
    "planes valencia",
    "planes madrid",
    "planes alicante",
  ],
  applicationName: "Girls Collective",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: ["/favicon.ico?v=3", "/icon.png?v=3"],
    shortcut: "/favicon.ico?v=3",
    apple: "/apple-icon.png?v=2",
  },
  openGraph: {
    title: "Girls Collective",
    description: "Encuentra tu tribu, estés donde estés 💜",
    url: "/",
    siteName: "Girls Collective",
    images: [{ url: "https://www.girls-collective.com/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Girls Collective",
    description: "Encuentra tu tribu, estés donde estés 💜",
    images: ["https://www.girls-collective.com/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  // ⬇️ Google Search Console verification token
  verification: {
    google: "WP6pvdIs8fnhviy1N46IQhzk3XlokyMShjVAjbTF2L0",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  // ⬇️ await cookies() (async in your Next version)
  const cookieStore = await cookies();
  // We no longer gate script loading strictly by consent; still useful elsewhere.
  const consent = cookieStore.get("gc-cookie-consent")?.value;
  const allowAnalytics = consent === "accepted";

  return (
    <html lang="es" className={`${montserrat.variable} ${dmSerif.variable}`}>
      {/* ⬇️ Explicit <head> with the meta tag for GSC */}
      <head>
        <meta
          name="google-site-verification"
          content="WP6pvdIs8fnhviy1N46IQhzk3XlokyMShjVAjbTF2L0"
        />
      </head>

      <body className="antialiased">
        {/* ⬇️ site-wide Organization + Website JSON-LD */}
        <SeoOrg />

        {/* Consent Mode default (Advanced): DENIED by default */}
        <Script id="ga-consent-default" strategy="beforeInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      personalization_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });

    // Enable additional pings for modeling
    gtag('set', 'url_passthrough', true);
    gtag('set', 'ads_data_redaction', true);
  `}
        </Script>

        {/* ✅ Always load GA library if GA_ID exists (Consent controls storage) */}
        {GA_ID && (
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

                // Disable auto page_view; SPA tracker will send it
                (function(){
                  var debug = false;
                  try { debug = location.search.includes('ga_debug=1'); } catch(e){}
                  gtag('config', '${GA_ID}', {
                    anonymize_ip: true,
                    send_page_view: false,
                    debug_mode: debug || (${process.env.NODE_ENV === "development" ? "true" : "false"})
                  });
                })();
              `}
            </Script>

            {/* Tracker always mounted; consent controls whether hits are cookied */}
            <GtagRouteTracker measurementId={GA_ID} />
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

