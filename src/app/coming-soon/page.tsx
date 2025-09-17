"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ComingSoonPage() {
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
    } catch {
      setErr("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      {/* Hide the site navbar/footer ONLY on this page (adjust selector if needed) */}
      <style jsx global>{`
        header { display: none !important; } /* if your navbar is inside <header> */
      `}</style>

      {/* Full-screen hero with cream/white background */}
      <section className="w-full min-h-screen flex items-center justify-center bg-[#fef8f4]">
        <div className="text-center px-6 max-w-3xl">
          <p className="font-dmserif text-base md:text-lg mb-3">coming soon✨</p>
          <h1 className="font-montserrat font-bold text-3xl md:text-5xl leading-tight">
            Tu espacio seguro para encontrar tu tribu en esa nueva ciudad.
          </h1>
          <div className="mt-8">
          </div>
        </div>
      </section>

      {/* Public contact form */}
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

