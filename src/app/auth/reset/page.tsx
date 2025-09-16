"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const strongPwd = (s: string) =>
  /[A-Z]/.test(s) && /[a-z]/.test(s) && /\d/.test(s) && s.length >= 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // ✅ NEW: exchange the code in the email link for a temporary session
  useEffect(() => {
    (async () => {
      try {
        const href = typeof window !== "undefined" ? window.location.href : "";
        const code = href ? new URL(href).searchParams.get("code") : null;

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else if (href) {
          // fallback in case the provider puts tokens directly in the URL
          await supabase.auth.exchangeCodeForSession(href);
        }
      } catch {
        // ignore — user might already be signed in or the code was used
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (pwd1 !== pwd2) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    if (!strongPwd(pwd1)) {
      setErr("La contraseña no cumple los requisitos (8+, mayúsculas, minúsculas y números).");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd1 });
      if (error) throw error;
      setMsg("Contraseña actualizada ✅. Ahora puedes iniciar sesión.");
      setTimeout(() => router.push("/auth"), 1000);
    } catch (e: any) {
      setErr(e.message ?? "No se pudo actualizar la contraseña.");
    }
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat grid place-items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 shadow-md w-full max-w-md grid gap-3"
      >
        <h1 className="font-dmserif text-2xl mb-1">Nueva contraseña</h1>
        <p className="text-sm opacity-70 mb-2">
          La contraseña debe tener mínimo 8 caracteres, con mayúsculas, minúsculas y números.
        </p>

        <input
          type="password"
          className="w-full rounded-xl border p-3"
          placeholder="Nueva contraseña"
          value={pwd1}
          onChange={(e) => setPwd1(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full rounded-xl border p-3"
          placeholder="Confirmar nueva contraseña"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          required
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90"
          >
            Guardar
          </button>
        </div>

        {msg && <p className="text-sm text-green-700">{msg}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </main>
  );
}

