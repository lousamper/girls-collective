"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // ← keep
import { supabase } from "@/lib/supabaseClient";
import type { PostgrestError } from "@supabase/supabase-js";

// i18n helpers
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

// ⬇️ NEW: Vercel Analytics custom events
import { track } from "@vercel/analytics";

export default function HomePage() {
  const router = useRouter();

  // NEW: auth status for CTA routing
  const [authed, setAuthed] = useState(false);

  // NEW: guard → if logged in but profile incomplete (username/city_id), send to /setup-profile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthed(!!user);

      if (!user) return; // not logged in → show public homepage

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

  // contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  // language (read cookie once)
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => {
    setLang(getLang());
  }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  async function handleContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setOk("");
    setErr("");
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: name.trim(),
        email: email.trim(),
        message: msg.trim(),
      });
      if (error) throw error;

      // ⬇️ NEW: custom event on success
      track("contact_submit", { page: "home" });

      setOk(t("home.contact.ok", "¡Gracias! Te responderemos muy pronto 💌"));
      setName("");
      setEmail("");
      setMsg("");
    } catch (error) {
      console.error("contact_messages insert failed:", error as PostgrestError);
      setErr(t("home.contact.error", "No se pudo enviar. Intenta de nuevo."));
    } finally {
      setSending(false);
    }
  }

  // choose CTA href: logged in → find-your-city, else auth
  const ctaHref = authed ? "/find-your-city" : "/auth";

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      {/* ======================== */}
      {/* Section 1: HERO */}
      {/* ======================== */}
      <section className="w-full bg-gcBackgroundAlt2">
        {/* ⬇️ CHANGE: make the hero fill the screen on mobile too */}
        <div className="grid md:grid-cols-2 min-h-[80vh] md:min-h-screen">
          {/* Left: video (desktop only) */}
          <div className="relative hidden md:block">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src="/home/hero.mp4"
              poster="/home/hero-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>

          {/* Right: centered content (mobile & desktop) */}
          {/* ⬇️ CHANGE: more vertical padding on mobile for breathing room */}
          <div className="flex items-center justify-center px-6 py-14 md:py-10">
            <div className="text-center max-w-xl">
              <p className="font-dmserif text-base md:text-lg mb-3">
                {t("home.tagline", "where girls connect, thrive & vibe✨")}
              </p>
              {/* ⬇️ CHANGE: looser line-height on mobile */}
              <h1 className="font-montserrat font-bold text-2xl md:text-4xl mb-6 leading-relaxed md:leading-tight">
                {t(
                  "home.heroTitle",
                  "Tu espacio seguro para encontrar tu tribu en esa nueva ciudad."
                )}
              </h1>

              <div className="flex justify-center">
                <Link
                  href={ctaHref} // ← dynamic target
                  onClick={() => track("cta_join_click", { page: "home" })}
                  className="rounded-full bg-gcText text-[#fef8f4] font-dmserif px-7 py-2.5 text-lg shadow-md hover:opacity-90"
                  aria-label={t("home.find_city_cta_aria", "Encuentra tu ciudad")}
                >
                  {t("home.find_city_cta", "¡ÚNETE!")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* Section 2: ABOUT (text → image) */}
      {/* ======================== */}
      <section
        id="about"
        className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center"
      >
        {/* Text first on mobile (as-is) */}
        <div className="md:order-1 text-right">
          <p className="text-[20px] md:text-[30px] font-semibold leading-tight">
            {t("home.about.p1.l1", "Sabemos lo que es")} <br />
            <span className="text-gcCTA">
              {t("home.about.p1.h1", "empezar de nuevo.")}
            </span>
            <br />
            {t("home.about.p1.l3", "Mudarte a otra ciudad,")} <br />
            {t("home.about.p1.l4", "integrarte, adaptarte,")} <br />
            {t("home.about.p1.l5", "reorganizar tu vida…")} <br />
            <br />
            {t("home.about.p1.l6", "y, entre todo eso, buscar")} <br />
            {t("home.about.p1.l7", "con quién compartirla.")}
            <br />
            <br />
            <span className="text-gcCTA">
              {t(
                "home.about.p1.h2",
                "Sabemos lo difícil que puede ser hacer nuevas amistades"
              )}
            </span>{" "}
            <br />
            {t("home.about.p1.l9", "cuando todo va tan rápido.")}
          </p>
        </div>

        {/* Image second */}
        <div className="md:order-2">
          <Image
            src="/home/sec2.jpg"
            alt={t("home.images.connAlt", "Conexión")}
            width={1600}
            height={1066}
            className="w-full h-[340px] md:h-[520px] object-cover"
            priority
          />
        </div>
      </section>

      {/* ======================== */}
      {/* Section 3: ABOUT (make it text → image on mobile) */}
      {/* ======================== */}
      <section className="max-w-6xl mx-auto px-6 pb-14 grid md:grid-cols-2 gap-10 items-center">
        {/* Text FIRST on mobile, SECOND on desktop */}
        <div className="order-1 md:order-2">
          <p className="text-[20px] md:text-[30px] font-semibold leading-tight">
            {t(
              "home.about.p2.l1",
              "Por eso, creamos un espacio para que conectes desde lo auténtico y formes vínculos reales."
            )}
            <br />
            <br />
            {t("home.about.p2.l2", "De esos que se quedan.")}
            <br />
            <br />
            <span className="text-gcCTA">{t("home.about.p2.h1", "¿Y lo mejor?")}</span>
            <br />
            <span className="text-gcCTA">
              {t("home.about.p2.h2_line1", "tú eliges")} <br />
              {t("home.about.p2.h2_line2", "cómo, cuándo y con quién.")}
            </span>
          </p>

          <div className="mt-6">
            {/* ← dynamic second CTA */}
            <Link
              href={ctaHref}
              onClick={() => track("cta_find_city_click", { page: "home" })}
              className="rounded-full bg-gcCTA text-gcText font-dmserif px-7 py-2.5 text-lg shadow-md hover:opacity-90"
              aria-label={t("home.find_city_cta_aria", "Encuentra tu ciudad")}
            >
              {t("home.find_city_cta", "Encuentra tu ciudad")}
            </Link>
          </div>
        </div>

        {/* Image SECOND on mobile, FIRST on desktop */}
        <div className="order-2 md:order-1">
          <Image
            src="/home/sec3.jpg"
            alt={t("home.images.commAlt", "Comunidad")}
            width={1600}
            height={1066}
            className="w-full h-[340px] md:h-[520px] object-cover"
          />
        </div>
      </section>

      {/* ======================== */}
      {/* Section 4: Vibes hero */}
      {/* ======================== */}
      <section className="w-full flex items-center justify-center bg-gcBackground">
        <div className="w-[950px] max-w-[95vw]">
          <Image
            src="/home/vibes-hero.jpg"
            alt={t("home.images.vibesAlt", "Vibes")}
            width={950}
            height={500}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* ======================== */}
      {/* Section 5: CONTACT */}
      {/* ======================== */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h2 className="font-dmserif text-1xl md:text-2xl mb-3">
            {t("home.contact.title", "¿Quieres sumar tu energía a esta comunidad?")}
          </h2>
          <p className="text-base leading-relaxed">
            {t(
              "home.contact.text",
              "Tanto si eres una marca con ganas de colaborar, una organizadora con planes en mente o simplemente una girl con dudas o ideas... \nEscríbenos y te respondemos pronto 💌"
            )}
          </p>
        </div>

        <form
          onSubmit={handleContact}
          className="bg-white/90 rounded-2xl p-6 shadow-md flex flex-col gap-4 max-w-md mx-auto text-left"
        >
          <div>
            <label className="block text-sm mb-1">
              {t("common.form.nameLabel", "Tu nombre:")}
            </label>
            <input
              className="w-full rounded-xl border p-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("common.form.nameLabel", "Tu nombre:")}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("common.form.emailLabel", "Tu correo:")}
            </label>
            <input
              type="email"
              className="w-full rounded-xl border p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("common.form.messageLabel", "Tu mensaje:")}
            </label>
            <textarea
              className="w-full rounded-xl border p-3"
              rows={5}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={t(
                "home.contact.placeholder",
                "Cuéntanos en qué podemos colaborar o ayudarte ✨"
              )}
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
          >
            {sending
              ? t("common.form.submitting", "Enviando…")
              : t("common.form.submit", "Enviar")}
          </button>

          {ok && <p className="text-green-700 text-sm">{ok}</p>}
          {err && <p className="text-red-600 text-sm">{err}</p>}
        </form>

        <div className="text-sm mt-3 opacity-80 text-center">
          {t("common.form.orWriteUs", "O escríbenos a")}{" "}
          <a className="underline" href="mailto:contact@girls-collective.com">
            contact@girls-collective.com
          </a>
        </div>
      </section>
      {/* ======================== */}
{/* Section 6: FAQ (visible) */}
{/* ======================== */}
<section id="faq" className="max-w-3xl mx-auto px-6 py-10">
  <h2 className="font-dmserif text-2xl md:text-3xl mb-5 text-center">
    Preguntas frecuentes
  </h2>

  <div className="space-y-3">
    <details className="rounded-2xl bg-white/90 p-4 shadow-md">
      <summary className="cursor-pointer font-semibold">
        ¿Qué es Girls Collective?
      </summary>
      <p className="mt-2">
        Una comunidad segura para mujeres donde encontrar amigas y planes en tu ciudad.
      </p>
    </details>

    <details className="rounded-2xl bg-white/90 p-4 shadow-md">
      <summary className="cursor-pointer font-semibold">
        ¿Cómo empiezo?
      </summary>
      <p className="mt-2">
        Crea tu cuenta, completa tu perfil, entra a tu ciudad y explora los distintos grupos (o crea uno tu misma) para conocer a otras girls.
      </p>
    </details>

    <details className="rounded-2xl bg-white/90 p-4 shadow-md">
      <summary className="cursor-pointer font-semibold">
        ¿Cuánto cuesta?
      </summary>
      <p className="mt-2">
        ¡Registrarse es gratis!<br></br>Algunas actividades pueden tener coste según la organización.
      </p>
    </details>
  </div>
</section>

      {/* FAQ JSON-LD (optional) */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Qué es Girls Collective?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Una comunidad segura para mujeres donde encontrar amigas, planes y apoyo en tu nueva ciudad.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cómo empiezo?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Crea tu cuenta, completa tu perfil y entra a tu ciudad para conocer a otras girls.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuánto cuesta?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Registrarse es gratis. Algunas actividades o beneficios pueden tener coste según la organización.",
          },
        },
      ],
    }),
  }}
/>
    </main>
  );
}

