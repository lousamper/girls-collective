import type { Metadata } from "next";
import { Montserrat, DM_Serif_Display } from "next/font/google";
import "./globals.css";

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
  description: "A community space for creativity and collaboration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${dmSerif.variable}`}>
      <body className="antialiased">
        {/* wrapper gets the colors */}
        <div className="min-h-screen bg-gcBackground text-gcText">
          {children}
        </div>
      </body>
    </html>
  );
}