"use client";

import { useEffect, useMemo, useState } from "react";
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

export default function PrivacyPolicyPage() {
  // i18n
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => setLang(getLang()), []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  return (
    <main className="min-h-screen bg-[#fef8f4] text-[#50415b] font-montserrat p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-dmserif mb-6">
          {t("privacy.title", "Política de Privacidad")}
        </h1>

        {/* 1. Información que recopilamos */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.section1.title", "1. Información que recopilamos")}
          </h2>
          <p>{t("privacy.section1.p1", "Cuando utilizas nuestra aplicación, podemos recopilar:")}</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>{t("privacy.section1.items.register.bold", "Datos de registro:")}</strong>{" "}
              {t("privacy.section1.items.register.text", "correo electrónico y contraseña (a través de Supabase).")}
            </li>
            <li>
              <strong>{t("privacy.section1.items.profile.bold", "Datos de perfil:")}</strong>{" "}
              {t("privacy.section1.items.profile.text", "nombre de usuario, ciudad, año de nacimiento, biografía, intereses, foto de perfil e intereses personalizados.")}
            </li>
            <li>
              <strong>{t("privacy.section1.items.tech.bold", "Datos técnicos:")}</strong>{" "}
              {t("privacy.section1.items.tech.text", "uso de la app, cookies y registros del servidor.")}
            </li>
          </ul>
        </section>

        {/* 2. Uso de los datos */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.section2.title", "2. Uso de los datos")}
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>{t("privacy.section2.items.improve", "Mejorar la experiencia de la comunidad.")}</li>
            <li>{t("privacy.section2.items.personalize", "Personalizar tu perfil y recomendaciones.")}</li>
            <li>{t("privacy.section2.items.contact", "Contactarte sobre novedades de tu ciudad.")}</li>
          </ul>
        </section>

        {/* 3. Compartición de datos */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.section3.title", "3. Compartición de datos")}
          </h2>
          <p>
            {t(
              "privacy.section3.p",
              "Nunca venderemos tus datos. Solo se comparten con servicios necesarios para el funcionamiento de la app (como Supabase para autenticación y base de datos)."
            )}
          </p>
        </section>

        {/* 4. Tus derechos */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.section4.title", "4. Tus derechos")}
          </h2>
          <p>
            {t("privacy.section4.p1", "Puedes solicitar la eliminación o modificación de tus datos en cualquier momento escribiéndonos a")}{" "}
            <a href="mailto:contact@girls-collective.com" className="underline text-[#50415b]">
              contact@girls-collective.com
            </a>.
          </p>
        </section>

        {/* 5. Cambios */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.section5.title", "5. Cambios")}
          </h2>
          <p>
            {t("privacy.section5.p", "Esta política puede actualizarse. Si hay cambios importantes, te lo notificaremos dentro de la app.")}
          </p>
        </section>

        {/* 6. Edad mínima */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.section6.title", "6. Edad mínima de uso")}
          </h2>
          <p>
            {t(
              "privacy.section6.p",
              "Girls Collective está dirigida exclusivamente a personas mayores de 16 años. Si descubrimos que una persona menor de esa edad ha creado una cuenta, podremos eliminar o suspender su acceso para proteger su privacidad y cumplir con la normativa vigente."
            )}
          </p>
        </section>

        <footer className="text-sm mt-10">
          {t("privacy.footer.lastUpdated", "Última actualización")}:{" "}
          {new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-ES")}
        </footer>
      </div>
    </main>
  );
}
