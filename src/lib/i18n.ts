"use client";

import { DICT, Lang } from "./dictionaries";

export const LANG_COOKIE = "gc-lang";

export function getLang(): Lang {
  if (typeof document === "undefined") return "es";
  const m = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]+)`));
  const val = m ? decodeURIComponent(m[1]) : "";
  return (val === "en" || val === "es") ? (val as Lang) : "es";
}

export function setLang(lang: Lang) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${LANG_COOKIE}=${encodeURIComponent(lang)}; path=/; max-age=${maxAge}`;
}

export function getDict(lang: Lang) {
  return DICT[lang];
}

/** super simple path lookup: "nav.about" -> dict.nav.about */
export function t(dict: any, path: string, fallback?: string) {
  return path.split(".").reduce((acc: any, key) => (acc && acc[key] != null ? acc[key] : undefined), dict) ?? fallback ?? path;
}
