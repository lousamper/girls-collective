"use client";

import { DICT, type Dict, type Lang } from "./dictionaries";

export const LANG_COOKIE = "gc-lang";

/** Get language from cookie (defaults to "es") */
export function getLang(): Lang {
  if (typeof document === "undefined") return "es";
  const m = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]+)`));
  const val = m ? decodeURIComponent(m[1]) : "";
  return val === "en" || val === "es" ? (val as Lang) : "es";
}

/** Persist language in a cookie (1 year) */
export function setLang(lang: Lang): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${LANG_COOKIE}=${encodeURIComponent(lang)}; path=/; max-age=${maxAge}`;
  // Optional: let listeners know
  if (typeof window !== "undefined") window.dispatchEvent(new Event("langchange"));
}

export function getDict(lang: Lang) {
  return DICT[lang];
}

/** Simple dotted-path lookup without `any` */
export function t(dict: Dict[Lang], path: string, fallback?: string): string {
  const keys = path.split(".");
  let node: unknown = dict;

  for (const k of keys) {
    if (
      typeof node !== "object" ||
      node === null ||
      !(k in (node as Record<string, unknown>))
    ) {
      return fallback ?? path;
    }
    node = (node as Record<string, unknown>)[k];
  }

  return typeof node === "string" ? node : (fallback ?? path);
}
