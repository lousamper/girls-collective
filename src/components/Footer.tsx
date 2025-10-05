"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

export default function Footer() {
  // i18n
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => {
    setLang(getLang());
  }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  function reopenCookiePrefs() {
    try {
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
        {/* Row 1: Links (left) + Socials (right) */}
        <div className="flex items-start justify-between md:items-center">
          {/* Left: stack on mobile, row on desktop */}
          <div className="flex-1 min-w-0 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <Link
              href="/privacy-policy"
              className="underline underline-offset-4 hover:opacity-80"
            >
              {t("footer.privacy", "Política de Privacidad")}
            </Link>

            <button
              type="button"
              onClick={reopenCookiePrefs}
              className="underline underline-offset-4 hover:opacity-80 text-left md:text-inherit"
              aria-label={t("footer.cookiePrefsAria", "Abrir preferencias de cookies")}
            >
              {t("footer.cookiePrefs", "Preferencias de cookies")}
            </button>
          </div>

          {/* Right: social icons */}
          <div className="flex gap-4 flex-shrink-0">
            <Link
              href="https://www.instagram.com/girls_collective"
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
          {t("footer.copyright", "© 2025 GirlsCollective. All rights reserved.")}
        </div>

        {/* Row 3: Marca */}
        <div className="text-center opacity-80">
          <span className="tracking-wide">Girls Collective™</span>
        </div>
      </div>
    </footer>
  );
}





