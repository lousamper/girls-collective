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

// ⬇️ (unchanged copy; enhanced matching but SAME messages returned)
function friendlyAuthError(err: unknown): string {
  const e = err as { message?: string; status?: number; code?: string };
  const m = (e?.message || "");

  if (/Invalid login credentials/i.test(m) || e?.status === 400) return "Correo o contraseña incorrectos.";
  if (/Email not confirmed/i.test(m) || e?.code === "email_not_confirmed") return "Confirma tu correo para iniciar sesión.";
  if (/User already registered/i.test(m) || e?.code === "user_already_exists") return "Ya existe una cuenta con ese correo.";
  if (/Password should be at least/i.test(m)) return "La contraseña no cumple los requisitos.";
  return "No se pudo completar la operación. Intenta de nuevo.";
}

// ⬇️ Extra parser to know when to show the Resend button (no UI text changes)
function isEmailNotConfirmed(err: unknown): boolean {
  const e = err as { message?: string; status?: number; code?: string };
  const m = (e?.message || "").toLowerCase();
  return e?.code === "email_not_confirmed" || m.includes("email not confirmed") || m.includes("confirm");
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

  // ⬇️ you already had these
  const [signupSent, setSignupSent] = useState(false);
  const [resendOk, setResendOk] = useState("");
  const [resendErr, setResendErr] = useState("");

  // ⬇️ NEW: when login fails because email isn’t confirmed, show same Resend block
  const [needConfirm, setNeedConfirm] = useState(false);

  // URL destino tras confirmar email
  const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.girls-collective.com").replace(/\/+$/, "");
  const redirectTo = `${SITE}/auth/callback`;

  async function handleResend() {
    setResendOk("");
    setResendErr("");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setResendOk("Hemos reenviado el correo. Revisa tu bandeja de entrada.");
    } catch (e) {
      setResendErr("No se pudo reenviar. Intenta de nuevo en unos segundos.");
      console.warn("resend error:", e);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSignupSent(false);
    setResendOk("");
    setResendErr("");
    setNeedConfirm(false);

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

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;

        setSignupSent(true);
        setMessage(t("auth.msg.checkEmail", "Revisa tu correo para confirmar el registro."));
      } else {
        // LOGIN (password) — no email is sent in this flow
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          console.warn("login error:", error);
          setMessage(friendlyAuthError(error));
          if (isEmailNotConfirmed(error)) setNeedConfirm(true);
          return;
        }

        // Defensive: older SDKs may return no session if unconfirmed
        if (!data?.session) {
          setMessage("Confirma tu correo para iniciar sesión.");
          setNeedConfirm(true);
          return;
        }

        setMessage(t("auth.msg.loginSuccess", "¡Has iniciado sesión con éxito!"));
      }
    } catch (err: unknown) {
      console.warn("auth submit error:", err);
      setMessage(friendlyAuthError(err));
      if (isEmailNotConfirmed(err)) setNeedConfirm(true);
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

      {/* Mensajes */}
      {message && <p className="mt-2 text-sm text-center">{message}</p>}

      {/* Reenviar SI: (A) signup enviado, o (B) login detectó email sin confirmar */}
      {email && ((mode === "signup" && signupSent) || (mode === "login" && needConfirm)) && (
        <div className="text-xs mt-2 text-center">
          ¿No has recibido el email?{" "}
          <button type="button" onClick={handleResend} className="underline hover:opacity-80">
            Reenviar
          </button>
          {resendOk && <p className="text-green-700 mt-2">{resendOk}</p>}
          {resendErr && <p className="text-red-600 mt-2">{resendErr}</p>}
        </div>
      )}

      {/* ⛳️ Ocultar el switch cuando signupSent = true */}
      {!(mode === "signup" && signupSent) && (
        <p className="text-sm mt-3 text-center">
          {mode === "login"
            ? t("auth.switch.toSignupPrompt", "¿Aún no tienes cuenta?")
            : t("auth.switch.toLoginPrompt", "¿Ya tienes una cuenta?")}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-purple-700 underline"
          >
            {mode === "login"
              ? t("auth.switch.signupLink", "Regístrate")
              : t("auth.switch.loginLink", "Entrar")}
          </button>
        </p>
      )}
    </div>
  );
}
