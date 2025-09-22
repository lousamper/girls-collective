"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Menu, X } from "lucide-react";
import { getLang, setLang as setLangCookie, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // language
  const [lang, setLangState] = useState<Lang>("es");
  useEffect(() => {
    setLangState(getLang());
  }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (path: string, fallback?: string) => tt(dict, path, fallback);

  // admin check
  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        if (active) setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (active) setIsAdmin(Boolean(data?.is_admin));
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  function switchLang(next: Lang) {
    if (next === lang) return;
    setLangCookie(next);
    setLangState(next);
    if (typeof window !== "undefined") window.location.reload();
  }

  // body scroll lock while menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="w-full sticky top-0 z-50 bg-gcBackground/80 backdrop-blur border-b border-white/20">
      <nav className="relative max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ===== Mobile left: burger ===== */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="p-2 -ml-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* ===== Desktop left: logo ===== */}
        <Link href="/" className="hidden md:flex items-center gap-3">
          <Image
            src="/logo-gc.png"
            alt="Girls Collective"
            width={160}
            height={30}
            priority
          />
          <span className="sr-only">Girls Collective</span>
        </Link>

        {/* ===== Mobile center: logo (visually centered) ===== */}
        <Link
          href="/"
          className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center"
          aria-label="Inicio"
        >
          <Image
            src="/logo-gc.png"
            alt="Girls Collective"
            width={120}
            height={22}
            priority
          />
        </Link>

        {/* ===== Right side ===== */}
        {/* Desktop menu */}
        <ul className="hidden md:flex items-center gap-6 font-montserrat">
          <li>
            <Link href="/#about" className="hover:opacity-80 transition">
              {t("nav.about")}
            </Link>
          </li>
          <li>
            <Link
              href="/find-your-city"
              className={`hover:opacity-80 transition ${
                isActive("/find-your-city") ? "underline underline-offset-4" : ""
              }`}
            >
              {t("nav.cities")}
            </Link>
          </li>
          <li>
            <Link href="/#contact" className="hover:opacity-80 transition">
              {t("nav.contact")}
            </Link>
          </li>

          {user && (
            <li>
              <Link
                href="/dm"
                className={`rounded-full border bg-white px-5 py-2 shadow-sm hover:opacity-90 ${
                  isActive("/dm") ? "underline underline-offset-4" : ""
                }`}
                title={t("nav.messages")}
              >
                {t("nav.messages")}
              </Link>
            </li>
          )}

          {isAdmin && (
            <li>
              <Link
                href="/admin/groups"
                className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-5 py-2 shadow-md hover:opacity-90"
              >
                {t("nav.admin")}
              </Link>
            </li>
          )}

          {/* Language toggle */}
          <li className="ml-2 flex items-center gap-2 text-sm">
            <button
              onClick={() => switchLang("es")}
              className={`px-2 py-1 rounded ${lang === "es" ? "bg-white" : "hover:opacity-80"}`}
              aria-pressed={lang === "es"}
            >
              ES
            </button>
            <span className="opacity-50">|</span>
            <button
              onClick={() => switchLang("en")}
              className={`px-2 py-1 rounded ${lang === "en" ? "bg-white" : "hover:opacity-80"}`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </li>

          <li>
            <Link
              href={user ? "/profile" : "/auth"}
              className="rounded-full bg-gcText text-[#fef8f4] font-dmserif px-5 py-2 shadow-md hover:opacity-90"
            >
              {user ? t("nav.account") : t("nav.join")}
            </Link>
          </li>
        </ul>

        {/* Mobile right: tiny language toggle */}
        <div className="md:hidden flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => switchLang("es")}
              className={`px-1.5 py-0.5 rounded ${lang === "es" ? "bg-white" : "hover:opacity-80"}`}
              aria-pressed={lang === "es"}
            >
              ES
            </button>
            <span className="opacity-50">|</span>
            <button
              onClick={() => switchLang("en")}
              className={`px-1.5 py-0.5 rounded ${lang === "en" ? "bg-white" : "hover:opacity-80"}`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
        </div>
      </nav>

      {/* ===== Mobile slide-over menu (SOLID SHEET) ===== */}
      {/* Overlay */}
      <button
        onClick={closeMenu}
        aria-label="Cerrar menú"
        className={`md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => e.key === "Escape" && closeMenu()}
        tabIndex={-1}
        className={`md:hidden fixed right-0 top-0 z-50 h-dvh w-[78%] max-w-[340px]
                    bg-white text-gcText border-l shadow-2xl
                    transition-transform duration-300
                    ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2" aria-label="Inicio">
            <Image src="/logo-gc.png" alt="Girls Collective" width={120} height={24} />
          </Link>
          <button onClick={closeMenu} aria-label="Cerrar" className="p-2 -mr-2 rounded-full hover:bg-black/5">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="grid gap-1 text-base">
            <li>
              <Link href="/#about" onClick={closeMenu} className="block rounded-xl px-4 py-3 hover:bg-black/5">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link
                href="/find-your-city"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 hover:bg-black/5"
              >
                {t("nav.cities")}
              </Link>
            </li>
            <li>
              <Link href="/#contact" onClick={closeMenu} className="block rounded-xl px-4 py-3 hover:bg.black/5">
                {t("nav.contact")}
              </Link>
            </li>

            {user && (
              <li>
                <Link
                  href="/dm"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 hover:bg-black/5"
                >
                  {t("nav.messages")}
                </Link>
              </li>
            )}

            {isAdmin && (
              <li>
                <Link
                  href="/admin/groups"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 hover:bg-black/5"
                >
                  {t("nav.admin")}
                </Link>
              </li>
            )}
          </ul>

          {/* Language inside drawer (secondary) */}
          <div className="mt-4 border-t pt-4">
            <div className="text-xs opacity-60 mb-2">Idioma</div>
            <div className="flex gap-2">
              <button
                onClick={() => switchLang("es")}
                className={`px-3 py-1.5 rounded-full border ${lang === "es" ? "bg-gcBackgroundAlt2" : "bg-white"}`}
                aria-pressed={lang === "es"}
              >
                ES
              </button>
              <button
                onClick={() => switchLang("en")}
                className={`px-3 py-1.5 rounded-full border ${lang === "en" ? "bg-gcBackgroundAlt2" : "bg.white"}`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <Link
              href={user ? "/profile" : "/auth"}
              onClick={closeMenu}
              className="block text-center rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-3 text-lg shadow-md hover:opacity-90"
            >
              {user ? t("nav.accountShort") : t("nav.join")}
            </Link>
          </div>

          <div className="h-6 pb-[env(safe-area-inset-bottom)]" />
        </nav>
      </div>
    </header>
  );
}
