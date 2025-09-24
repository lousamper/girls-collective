"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  function reopenCookiePrefs() {
    try {
      // Limpia consentimiento guardado y recarga para mostrar el banner de nuevo
      localStorage.removeItem("gc-cookie-consent");
      document.cookie = "gc-cookie-consent=; Max-Age=0; path=/";
      location.reload();
    } catch {
      location.reload();
    }
  }

  return (
    <footer className="mt-16 border-t border-white/20 bg-gcBackground/60">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4 text-sm">
        {/* Row 1: Privacy + Icons (mobile-friendly) */}
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          {/* Left: links keep together and don’t wrap mid-word */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/privacy-policy"
              className="whitespace-nowrap text-[13px] md:text-sm underline underline-offset-4 hover:opacity-80"
            >
              Política de Privacidad
            </Link>

            <button
              type="button"
              onClick={reopenCookiePrefs}
              className="whitespace-nowrap text-[13px] md:text-sm underline underline-offset-4 hover:opacity-80"
              aria-label="Abrir preferencias de cookies"
            >
              Preferencias de cookies
            </button>
          </div>

          {/* Right: social icons */}
          <div className="flex gap-4">
            <Link
              href="https://www.instagram.com/girlscollective_yourcity"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full overflow-hidden hover:opacity-80 transition"
            >
              <Image src="/icons/instagram.png" alt="Instagram" width={24} height={24} />
            </Link>
            <Link
              href="https://www.tiktok.com/@valenciagirlscollective"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="rounded-full overflow-hidden hover:opacity-80 transition"
            >
              <Image src="/icons/tiktok.png" alt="TikTok" width={24} height={24} />
            </Link>
          </div>
        </div>

        {/* Row 2: Copyright */}
        <div className="text-center opacity-80">
          © 2025 GirlsCollective. All rights reserved.
        </div>

        {/* Row 3: Marca */}
        <div className="text-center opacity-80">
          <span className="tracking-wide">Girls Collective™</span>
        </div>
      </div>
    </footer>
  );
}



