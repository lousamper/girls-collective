// src/components/AuthForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

// i18n
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

const PW_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function friendlyAuthError(err: unknown): string {
  if (!(err instanceof Error)) return "Algo salió mal.";
  const m = err.message || "";

  if (/Invalid login credentials/i.test(m)) return "Correo o contraseña incorrectos.";
  if (/Email not confirmed/i.test(m)) return "Confirma tu correo para iniciar sesión.";
  if (/User already registered/i.test(m)) return "Ya existe una cuenta con ese correo.";
  if (/Password should be at least/i.test(m)) return "La contraseña no cumple los requisitos.";
  return "No se pudo completar la operación. Intenta de nuevo.";
}

export default function AuthForm() {
  // i18n setup
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => setLang(getLang()), []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        if (!PW_RULE.test(password)) {
          setMessage(
            t(
              "auth.pwRuleHelper",
              "La contraseña debe tener mínimo 8 caracteres, con mayúsculas, minúsculas y números."
            )
          );
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(t("auth.msg.checkEmail", "Revisa tu correo para confirmar el registro."));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage(t("auth.msg.loginSuccess", "¡Has iniciado sesión con éxito!"));
      }
    } catch (err: unknown) {
      setMessage(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <DialogTitle className="text-2xl font-dmserif text-gcText">
        {mode === "login" ? t("auth.title.login", "Bienvenida de nuevo 💜") : t("auth.title.signup", "Bienvenida 💜")}
      </DialogTitle>
      <DialogDescription className="text-sm text-gray-600">
        {mode === "login"
          ? t("auth.desc.login", "Inicia sesión para encontrar tu tribu.")
          : t("auth.desc.signup", "Crea tu cuenta para encontrar tu tribu.")}
      </DialogDescription>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder={t("auth.emailPlaceholder", "Correo electrónico")}
          className="p-2 rounded border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD with show/hide toggle */}
        <div>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              placeholder={t("auth.passwordPlaceholder", "Contraseña")}
              className="p-2 rounded border w-full pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            <button
              type="button"
              aria-label={
                showPwd
                  ? t("auth.passwordHide", "Ocultar contraseña")
                  : t("auth.passwordShow", "Mostrar contraseña")
              }
              onClick={() => setShowPwd((s) => !s)}
              className="absolute inset-y-0 right-2 my-auto h-8 w-8 grid place-items-center rounded hover:bg-black/5"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Under password: link for login, helper text for signup */}
        {mode === "login" ? (
          <div className="text-left -mt-1">
            <Link href="/auth/forgot" className="text-sm underline hover:opacity-80">
              {t("auth.forgot", "¿Olvidaste tu contraseña?")}
            </Link>
          </div>
        ) : (
          <p className="text-xs text-gray-600 -mt-1">
            {t(
              "auth.pwRuleHelper",
              "La contraseña debe tener mínimo 8 caracteres, con mayúsculas, minúsculas y números."
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#50415b] text-[#fef8f4] px-6 py-2 text-lg font-dmserif shadow-md hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? t("auth.loading", "Cargando…")
            : mode === "login"
            ? t("auth.loginCta", "Entrar")
            : t("auth.signupCta", "Registrarse")}
        </button>
      </form>

      <p className="text-sm mt-3 text-center">
        {mode === "login"
          ? t("auth.switch.toSignupPrompt", "¿Aún no tienes cuenta?")
          : t("auth.switch.toLoginPrompt", "¿Ya tienes una cuenta?")}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-purple-700 underline"
        >
          {mode === "login" ? t("auth.switch.signupLink", "Regístrate") : t("auth.switch.loginLink", "Entrar")}
        </button>
      </p>

      {message && <p className="mt-2 text-sm text-center">{message}</p>}
    </div>
  );
}


