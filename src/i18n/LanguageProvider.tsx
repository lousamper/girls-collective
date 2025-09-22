"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dict, type Locale } from "./dictionaries";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (k: string) => string };
const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const saved = (localStorage.getItem("gc_locale") as Locale) || null;
    if (saved) setLocaleState(saved);
    else if (typeof navigator !== "undefined" && navigator.language.startsWith("en")) {
      setLocaleState("en");
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("gc_locale", l);
  };

  const t = (k: string) => dict[locale][k] ?? k;
  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
