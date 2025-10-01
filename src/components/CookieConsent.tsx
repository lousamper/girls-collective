// src/components/CookieConsent.tsx
"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "gc-cookie-consent";
type ConsentValue = "accepted" | "rejected";

// ✅ Type gtag so we don't use `any`
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function readConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {}
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)gc-cookie-consent=([^;]+)/);
    const val = m ? decodeURIComponent(m[1]) : "";
    if (val === "accepted" || val === "rejected") return val as ConsentValue;
  }
  return null;
}

function writeConsent(v: ConsentValue) {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {}
  const maxAge = 60 * 60 * 24 * 180; // 180 días
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(v)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

// ✅ Inform GA4 (Consent Mode Advanced) immediately with proper typing
function updateGaConsent(granted: boolean) {
  window.gtag?.("consent", "update", {
    ad_storage: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
    personalization_storage: granted ? "granted" : "denied",
  });
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(readConsent() == null);
  }, []);

  if (!show) return null;

  function acceptAll() {
    updateGaConsent(true);
    writeConsent("accepted");
    location.reload();
  }

  function onlyEssential() {
    updateGaConsent(false);
    writeConsent("rejected");
    location.reload();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white/95 text-gcText shadow-lg backdrop-blur px-4 py-3 md:px-5 md:py-3.5">
          {/* 🟣 Make it a row on md+; stack on mobile */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <p className="text-sm md:flex-1 md:pr-2 leading-relaxed md:leading-normal">
              Usamos cookies para analizar el uso y mejorar tu experiencia. Puedes
              aceptar todas o quedarte solo con las esenciales.
            </p>

            <div className="flex gap-2 justify-end shrink-0">
              <button
                type="button"
                onClick={onlyEssential}
                className="rounded-full border px-4 py-2 text-sm hover:opacity-90"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-full bg-[#50415b] text-[#fef8f4] px-5 py-2 text-sm shadow-md hover:opacity-90"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

