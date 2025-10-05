"use client";

import { useEffect, useMemo, useState } from "react";
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

export default function CookiesPage() {
  // i18n
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => {
    setLang(getLang());
  }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-dmserif text-3xl mb-4">
          {t("cookies.title", "Política de Cookies")}
        </h1>

        <p className="mb-4">
          {t(
            "cookies.intro",
            "Usamos cookies esenciales para el funcionamiento del sitio y cookies analíticas (Google Analytics) para medir visitas y mejorar la experiencia. Las analíticas están desactivadas por defecto hasta que das tu consentimiento."
          )}
        </p>

        <h2 className="font-semibold text-xl mt-6 mb-2">
          {t("cookies.typesTitle", "Tipos de cookies")}
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>{t("cookies.types.essentialTitle", "Esenciales")}</strong>
            {": "}
            {t(
              "cookies.types.essentialDesc",
              "necesarias para funciones básicas (seguridad, carga de páginas). No requieren consentimiento."
            )}
          </li>
          <li>
            <strong>{t("cookies.types.analyticsTitle", "Analíticas")}</strong>
            {": "}
            {t(
              "cookies.types.analyticsDesc",
              "nos ayudan a entender cómo se usa el sitio. Solo se activan si aceptas."
            )}
          </li>
        </ul>

        <h2 className="font-semibold text-xl mt-6 mb-2">
          {t("cookies.consentTitle", "Gestión del consentimiento")}
        </h2>
        <p>
          {t(
            "cookies.consentText",
            "Puedes aceptar o rechazar cookies en el banner que aparece al visitar la web. Tu decisión se guardará y puedes cambiarla borrando el almacenamiento local del navegador."
          )}
        </p>
      </div>
    </main>
  );
}
