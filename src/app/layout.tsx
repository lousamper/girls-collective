// src/app/layout.tsx
import type { Metadata } from "next";
import { Montserrat, DM_Serif_Display } from "next/font/google";
import "./globals.css";

// ⬇️ Use relative imports so they work on Vercel regardless of tsconfig alias
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dmserif",
});

export const metadata: Metadata = {
  title: "Girls Collective",
  description: "Una comunidad para crear amistades reales, a tu ritmo.",
  icons: {
    // Si tienes /public/favicon.ico, este será el principal
    icon: ["/favicon.ico?v=2", "/icon.png?v=2"], // usa /icon.png si no tienes .ico
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-icon.png?v=2", // asegúrate de tener src/app/apple-icon.png o /public/apple-icon.png
  },
  openGraph: {
    title: "Girls Collective",
    description: "Encuentra tu tribu, estés donde estés 💜",
    url: "https://www.girls-collective.com",
    siteName: "Girls Collective",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Girls Collective",
    description: "Encuentra tu tribu, estés donde estés 💜",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${dmSerif.variable}`}>
      <body className="antialiased">
        <div className="min-h-screen bg-gcBackground text-gcText flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
