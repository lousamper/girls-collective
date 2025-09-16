"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(""); setErr(""); setBusy(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/reset`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      if (error) throw error;
      setMsg("Te hemos enviado un correo con instrucciones 💌");
      setEmail("");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setErr(message || "No se pudo enviar el correo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat grid place-items-center p-6">
      <div className="bg-white rounded-2xl p-6 shadow-md w-full max-w-md">
        <h1 className="font-dmserif text-2xl mb-3">¿Olvidaste tu contraseña?</h1>
        <form onSubmit={handleResetPassword} className="flex gap-2 items-center">
          <input
            type="email"
            className="flex-1 rounded-xl border p-3"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[#50415b] text-[#fef8f4] px-4 py-2 shadow-md hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Enviando…" : "Enviar"}
          </button>
        </form>
        {msg && <p className="text-sm text-green-700 mt-2">{msg}</p>}
        {err && <p className="text-sm text-red-600 mt-2">{err}</p>}

        <div className="mt-4 text-sm">
          <Link href="/auth" className="underline">Volver a iniciar sesión</Link>
        </div>
      </div>
    </main>
  );
}
