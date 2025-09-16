"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const strongPwdText =
    "La contraseña debe tener mínimo 8 caracteres, con mayúsculas, minúsculas y números.";

  async function handleResend() {
    setResendMsg("");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });
      if (error) throw error;
      setResendMsg("Te hemos reenviado el correo de confirmación 💌");
    } catch (e: any) {
      setResendMsg(e?.message ?? "No se pudo reenviar el correo.");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResendMsg("");

    try {
      if (mode === "signup") {
        const redirectUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined;

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        setMessage("Revisa tu correo para confirmar el registro.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) {
          // nice message if email isn't confirmed yet
          const msg = String(error.message || "").toLowerCase();
          if (msg.includes("confirm")) {
            setMessage(
              "Tu correo aún no está confirmado. Revisa tu bandeja o reenvía el correo abajo."
            );
          } else {
            setMessage(error.message);
          }
          return;
        }
        setMessage("Has iniciado sesión con éxito!");
      }
    } catch (err: any) {
      setMessage(err?.message ?? "No se pudo completar la acción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <DialogTitle className="text-2xl font-dmserif text-gcText">
        {mode === "login" ? "Bienvenida de nuevo 💜" : "Bienvenida 💜"}
      </DialogTitle>
      <DialogDescription className="text-sm text-gray-600">
        {mode === "login"
          ? "Inicia sesión para encontrar tu tribu."
          : "Crea tu cuenta para encontrar tu tribu."}
      </DialogDescription>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full rounded-xl border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-xl border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={mode === "signup" ? 8 : undefined}
            required
          />

          {mode === "login" && (
            <div className="mt-2 text-left">
              <Link href="/auth/forgot" className="underline text-sm">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}

          {mode === "signup" && (
            <p className="mt-2 text-xs text-gray-600">{strongPwdText}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#50415b] text-[#fef8f4] px-6 py-2 text-lg font-dmserif shadow-md hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Cargando…" : mode === "login" ? "Entrar" : "Registrarse"}
        </button>
      </form>

      {/* offer resend if login warned about confirmation */}
      {message.toLowerCase().includes("confirm") && (
        <div className="text-sm text-center">
          <button onClick={handleResend} className="underline">
            Reenviar correo de confirmación
          </button>
          {resendMsg && <p className="mt-1">{resendMsg}</p>}
        </div>
      )}

      <p className="text-sm mt-3 text-center">
        {mode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-purple-700 underline"
        >
          {mode === "login" ? "Regístrate" : "Entrar"}
        </button>
      </p>

      {message && <p className="mt-2 text-sm text-center">{message}</p>}
    </div>
  );
}
