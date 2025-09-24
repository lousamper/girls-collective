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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Revisa tu correo para confirmar el registro.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Has iniciado sesión con éxito!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Algo salió mal.";
      setMessage(msg);
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
          className="p-2 rounded border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="p-2 rounded border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* 👇 Extra row under the password field */}
        {mode === "login" ? (
          <div className="text-left">
            <Link
              href="/auth/forgot"
              className="text-sm text-purple-700 underline hover:opacity-80"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        ) : (
          <p className="text-xs text-gray-600">
            La contraseña debe tener mínimo 8 caracteres, con mayúsculas, minúsculas y números.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#50415b] text-[#fef8f4] px-6 py-2 text-lg font-dmserif shadow-md hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Cargando…" : mode === "login" ? "Entrar" : "Registrarse"}
        </button>
      </form>

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


