import type { Metadata } from "next";
import { Montserrat, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
