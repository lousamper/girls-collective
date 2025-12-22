"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// i18n helpers (igual que Home)
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

// analytics (igual que Home)
import { track } from "@vercel/analytics";

export default function AnfitrionasPage() {
  const router = useRouter();

  // auth status para CTA routing (igual que Home)
  const [authed, setAuthed] = useState(false);

  // idioma (igual que Home)
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => {
    setLang(getLang());
  }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  // guard → si logged in pero profile incompleto, send a /setup-profile (igual que Home)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthed(!!user);

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, city_id")
        .eq("id", user.id)
        .maybeSingle();

      const incomplete = !profile || !profile.username || !profile.city_id;
      if (!cancelled && incomplete) {
        router.replace("/setup-profile");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // CTA igual que Home
  const ctaHref = authed ? "/profile" : "/auth";

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8 flex items-start justify-between">
          <h1 className="font-dmserif text-2xl md:text-4xl">
            {t("hosts.title", "Organiza esos planes que amas")}
          </h1>

          <Link href="/" className="underline hidden md:inline text-sm">
            {t("hosts.backHome", "Volver a la home")}
          </Link>
        </header>

        {/* Hero */}
        <section className="rounded-3xl mt-4 md:mt-6"> 
          <p className="text-sm md:text-xl mb-3">
            {t(
              "hosts.intro",
              "¿Ya creas experiencias… o llevas tiempo pensando en hacerlo?"
            )}
          </p>

          <p className="text-sm md:text-base opacity-90 leading-relaxed">
  {t("hosts.brandPrefix", "En")}{" "}
  <strong>{t("hosts.brand", "Girls Collective")}</strong>{" "}
  {t(
    "hosts.p1",
    "damos espacio a planes con alma: visibilidad, apoyo y una comunidad de mujeres que valora el cuidado, la intención y los detalles."
  )}
</p>


          <p className="text-sm md:text-base opacity-90 leading-relaxed mt-1">
            {t(
              "hosts.p2",
              "Aquí no se trata de cantidad, sino de crear momentos que realmente importan."
            )}
          </p>

          {/* CTA 1 (igual patrón home) */}
          <div className="mt-6 flex justify-center">
            <Link
              href={ctaHref}
              onClick={() => track("cta_host_primary_click", { page: "hosts" })}
              className="rounded-full bg-gcText text-[#fef8f4] font-dmserif px-7 py-2.5 text-lg shadow-md hover:opacity-90"
              aria-label={t("hosts.cta1_aria", "Conviértete en anfitriona")}
            >
              {t("hosts.cta1", "Conviértete en anfitriona")}
            </Link>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="mt-10">
          <h2 className="font-dmserif text-xl md:text-2xl mb-4">
            {t(
              "hosts.how.title",
              "Cómo funciona💫"
            )}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-semibold mb-2">
                {t("hosts.how.1.title", "Crea tu perfil")}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {t(
                  "hosts.how.1.text",
                  "Cuéntanos quién eres, qué te gusta crear y qué tipo de experiencias te representan."
                )}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-semibold mb-2">
                {t("hosts.how.2.title", "Diseña planes alineados con tu vibra")}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {t(
                  "hosts.how.2.text1",
                  "Propón planes dentro de los grupos que mejor encajen contigo."
                )}
              </p>
              <p className="text-sm opacity-90 leading-relaxed mt-2 italic">
                {t(
                  "hosts.how.2.text2",
                  "Cada semana destacamos los planes de la semana, rotando entre anfitrionas para dar visibilidad a todas."
                )}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-semibold mb-2">
                {t("hosts.how.3.title", "Conecta con las asistentes")}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {t(
                  "hosts.how.3.text",
                  "El día del plan se abre un chat privado para compartir detalles, resolver dudas y facilitar la experiencia."
                )}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-semibold mb-2">
                {t("hosts.how.4.title", "Recibe valoraciones")}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {t(
                  "hosts.how.4.text",
                  "Las opiniones de las asistentes nos ayudan a cuidar la calidad de los planes y a construir una comunidad segura y de confianza."
                )}
              </p>
            </div>
          </div>

          {/* CTA 2 (igual patrón home: segundo botón, color CTA) */}
          <div className="mt-8 flex justify-center">
            <Link
              href={ctaHref}
              onClick={() => track("cta_host_secondary_click", { page: "hosts" })}
              className="rounded-full bg-gcText text-[#fef8f4] font-dmserif px-7 py-2.5 text-lg shadow-md hover:opacity-90"
              aria-label={t("hosts.cta2_aria", "Empieza a crear planes")}
            >
              {t("hosts.cta2", "Empieza a crear planes")}
            </Link>
          </div>

          <div className="mt-8 md:hidden">
            <Link href="/" className="underline text-sm">
              ← {t("hosts.backHome", "Volver a la home")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
