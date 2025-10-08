// src/app/community-guidelines/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ⬇️ i18n
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

export default function CommunityGuidelinesPage() {
  // i18n
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => setLang(getLang()), []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-dmserif mb-3">
          {t("guidelines.title", "Normas de la comunidad")}
        </h1>

        <p className="opacity-80 mb-6">
          {t(
            "guidelines.intro",
            "Queremos un espacio seguro, amable y divertido. Al usar Girls Collective aceptas seguir estas reglas."
          )}
        </p>

        <section className="bg-white rounded-2xl p-6 shadow-md space-y-5">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              {t("guidelines.rule1.title", "1) Respeto primero")}
            </h2>
            <p className="opacity-80">
              {t(
                "guidelines.rule1.body",
                "No se permiten insultos, acoso, lenguaje de odio, amenazas, ni doxxing. Trátate y trata a las demás con empatía."
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">
              {t("guidelines.rule2.title", "2) Contenido sensible")}
            </h2>
            <p className="opacity-80">
              {t(
                "guidelines.rule2.body",
                "Prohibido contenido sexual explícito, violento o que promueva drogas/armas. Evita compartir materiales que puedan herir a otras personas."
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">
              {t("guidelines.rule3.title", "3) Seguridad")}
            </h2>
            <p className="opacity-80">
              {t(
                "guidelines.rule3.body",
                "No compartas datos personales (teléfono, dirección, documentos). Si organizas un plan, hazlo con sentido común y en lugares públicos."
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">
              {t("guidelines.rule4.title", "4) Spam y estafas")}
            </h2>
            <p className="opacity-80">
              {t(
                "guidelines.rule4.body",
                "Nada de spam, cuentas falsas o promociones sin permiso. Reporta enlaces sospechosos o comportamientos raros."
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">
              {t("guidelines.rule5.title", "5) Edad mínima")}
            </h2>
            <p className="opacity-80">
              {t(
                "guidelines.rule5.body",
                "El uso de Girls Collective es para mayores de 16 años (ajústalo si tu política es diferente)."
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">
              {t("guidelines.rule6.title", "6) Consecuencias")}
            </h2>
            <p className="opacity-80">
              {t(
                "guidelines.rule6.body",
                "Podemos aplicar avisos, suspensión temporal o ban permanente ante incumplimientos. Los contenidos reportados o marcados como sensibles pueden ocultarse hasta revisión."
              )}
            </p>
          </div>

          <div className="pt-2 border-t">
            <h2 className="text-xl font-semibold mb-1">
              {t("guidelines.help.title", "¿Necesitas ayuda?")}
            </h2>
            <p className="opacity-80">
              {t(
                "guidelines.help.body",
                "Si ves algo que incumple estas normas, usa el botón Reportar o escríbenos desde"
              )}{" "}
              <Link href="/privacy-policy" className="underline">
                {t("guidelines.help.linkText", "Política de Privacidad")}
              </Link>{" "}
              {t("guidelines.help.tail", "para ver cómo contactarnos.")}
            </p>
          </div>
        </section>

        <p className="text-sm opacity-60 mt-6">
          {t("common.lastUpdated", "Última actualización")}:{" "}
          {new Date().toLocaleDateString(lang === "en" ? "en-GB" : "es-ES")}
        </p>
      </div>
    </main>
  );
}

