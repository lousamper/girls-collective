"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  // contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  async function handleContact(e: FormEvent) {
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

      setOk("¡Gracias! Te responderemos muy pronto 💌");
      setName("");
      setEmail("");
      setMsg("");
    } catch (e: any) {
      setErr("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      {/* ======================== */}
      {/* Section 1: HERO (full-width split, bg #fef8f4) */}
      {/* UPDATED: forces a true 50/50 split and full height on desktop */}
      {/* ======================== */}
      <section className="w-full bg-gcBackgroundAlt2">
        {/* min height: comfy on mobile, full screen on md+ */}
        <div className="grid md:grid-cols-2 min-h-[70vh] md:min-h-screen">
          {/* Left: video fills the half completely */}
          <div className="relative">
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

          {/* Right: centered content */}
          <div className="flex items-center justify-center px-6 py-10">
            <div className="text-center max-w-xl">
              {/* small, DM Serif, not bold */}
              <p className="font-dmserif text-base md:text-lg mb-3">
                where girls connect, thrive & vibe✨
              </p>
              {/* big, Montserrat bold */}
              <h1 className="font-montserrat font-bold text-2xl md:text-4xl mb-6">
                Tu espacio seguro para encontrar tu tribu en esa nueva ciudad.
              </h1>

              <div className="flex justify-center">
                <Link
                  href="/auth"
                  className="rounded-full bg-gcText text-[#fef8f4] font-dmserif px-7 py-2.5 text-lg shadow-md hover:opacity-90"
                  aria-label="Únete"
                >
                  ¡ÚNETE!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* Section 2: ABOUT (part 1) */}
      {/* ======================== */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
        {/* Left: text (right aligned on desktop), tighter line-height */}
        <div className="md:order-1 text-right">
          <p className="text-[20px] md:text-[30px] font-semibold leading-tight">
            Sabemos lo que es <br />
            <span className="text-gcCTA">empezar de nuevo.</span>
            <br />
            Mudarte a otra ciudad, <br />
            integrarte, adaptarte, <br />
            reorganizar tu vida… <br />
            <br />
            y, entre todo eso, buscar <br />
            con quién compartirla.
            <br />
            <br />
            <span className="text-gcCTA">
              Sabemos lo difícil que puede ser hacer nuevas amistades
            </span>{" "}
            cuando todo va tan rápido.
          </p>
        </div>

        {/* Right: image (no corners/borders/shadows) */}
        <div className="md:order-2">
          <Image
            src="/home/sec2.jpg"
            alt="Conexión"
            width={1600}
            height={1066}
            className="w-full h-[340px] md:h-[520px] object-cover"
            priority
          />
        </div>
      </section>

      {/* ======================== */}
      {/* Section 3: ABOUT (part 2) */}
      {/* ======================== */}
      <section className="max-w-6xl mx-auto px-6 pb-14 grid md:grid-cols-2 gap-10 items-center">
        {/* Left: image (no corners/borders/shadows) */}
        <div>
          <Image
            src="/home/sec3.jpg"
            alt="Comunidad"
            width={1600}
            height={1066}
            className="w-full h-[340px] md:h-[520px] object-cover"
          />
        </div>

        {/* Right: text + yellow CTA */}
        <div>
          <p className="text-[20px] md:text-[30px] font-semibold leading-tight">
            Por eso, creamos un espacio para que conectes desde lo auténtico y formes vínculos reales.
            <br />
            <br />
            De esos que se quedan.
            <br />
            <br />
            <span className="text-gcCTA">¿Y lo mejor?</span>
            <br />
            <span className="text-gcCTA">
              tú eliges <br />
              cómo, cuándo y con quién.
            </span>
          </p>

          <div className="mt-6">
            <Link
              href="/auth"
              className="rounded-full bg-gcCTA text-gcText font-dmserif px-7 py-2.5 text-lg shadow-md hover:opacity-90"
              aria-label="Únete"
            >
              ¡ÚNETE!
            </Link>
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* Section 4: Vibes hero */}
      {/* UPDATED: shows entire 950x500 artwork; full screen height; centered; no crop */}
      {/* ======================== */}
      <section className="w-full flex items-center justify-center bg-gcBackground">
      <div className="w-[950px] max-w-[95vw]">
        <Image
          src="/home/vibes-hero.jpg"
          alt="Vibes"
          width={950}
          height={500}
          className="w-full h-auto"
    />
  </div>
</section>

      {/* ======================== */}
      {/* Section 5: CONTACT (centered) */}
      {/* ======================== */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h2 className="font-dmserif text-1xl md:text-2xl mb-3">
            ¿Quieres sumar tu energía a esta comunidad?
          </h2>
          <p className="text-base leading-relaxed">
            Tanto si eres una marca con ganas de colaborar, una organizadora con planes en mente o
            simplemente una girl con dudas o ideas... <br />
            Escríbenos y te respondemos pronto 💌
          </p>
        </div>

        {/* centered form like Find Your City */}
        <form
          onSubmit={handleContact}
          className="bg-white/90 rounded-2xl p-6 shadow-md flex flex-col gap-4 max-w-md mx-auto text-left"
        >
          <div>
            <label className="block text-sm mb-1">Tu nombre:</label>
            <input
              className="w-full rounded-xl border p-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Tu correo:</label>
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
            <label className="block text-sm mb-1">Tu mensaje:</label>
            <textarea
              className="w-full rounded-xl border p-3"
              rows={5}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Cuéntanos en qué podemos colaborar o ayudarte ✨"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
          >
            {sending ? "Enviando…" : "Enviar"}
          </button>

          {ok && <p className="text-green-700 text-sm">{ok}</p>}
          {err && <p className="text-red-600 text-sm">{err}</p>}
        </form>

        <div className="text-sm mt-3 opacity-80 text-center">
          O escríbenos a{" "}
          <a className="underline" href="mailto:contact@girls-collective.com">
            contact@girls-collective.com
          </a>
        </div>
      </section>
    </main>
  );
}
