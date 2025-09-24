"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ConsentValue = "granted" | "denied";

const STORAGE_KEY = "gc-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // show banner only if no previous choice
    const saved = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as ConsentValue | null;
    setVisible(!saved);
  }, []);

  function updateConsent(value: ConsentValue) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      // Tell GA4 Consent Mode (works because we load gtag via <GoogleAnalytics />)
      // You set default=denied in layout; here we "update" once the user chooses.
      // @ts-ignore
      window.gtag?.("consent", "update", {
        analytics_storage: value,
        ad_storage: "denied", // keep ads off
        functionality_storage: "granted",
        security_storage: "granted",
      });
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[100] p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border shadow-lg bg-white text-gcText">
        <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <p className="text-sm leading-relaxed">
            Usamos cookies para medir visitas y mejorar la experiencia.{" "}
            <Link href="/cookies" className="underline">
              Más info
            </Link>
            .
          </p>

          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={() => updateConsent("denied")}
              className="rounded-full border px-4 py-1.5 text-sm hover:opacity-90"
            >
              Rechazar
            </button>
            <button
              onClick={() => updateConsent("granted")}
              className="rounded-full bg-[#50415b] text-[#fef8f4] px-4 py-1.5 text-sm shadow-md hover:opacity-90"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
