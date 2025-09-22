"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Menu, X } from "lucide-react";
import { getLang, setLang, getDict, t as tt } from "@/lib/i18n";
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
    setLang(next);
    setLangState(next);
    // reload so the rest of the app can pick up the new cookie later when you i18n-ify more pages
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-gcBackground/80 backdrop-blur border-b border-white/20">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-gc.png"
            alt="Girls Collective"
            width={160}
            height={30}
            priority
          />
          <span className="sr-only">Girls Collective</span>
        </Link>

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

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          {/* language mini toggle on mobile header */}
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

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 -mr-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile slide-over menu */}
      {mobileOpen && (
        <div className="md:hidden">
          {/* overlay */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="fixed inset-0 bg-black/40"
          />
          {/* panel */}
          <div className="fixed top-0 right-0 h-full w-72 bg-gcBackground text-gcText shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <Image src="/logo-gc.png" alt="Girls Collective" width={120} height={24} />
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Close" className="p-2 -mr-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1">
              <ul className="grid gap-3 text-base">
                <li>
                  <Link href="/#about" onClick={() => setMobileOpen(false)} className="block py-1">
                    {t("nav.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/find-your-city"
                    onClick={() => setMobileOpen(false)}
                    className="block py-1"
                  >
                    {t("nav.cities")}
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" onClick={() => setMobileOpen(false)} className="block py-1">
                    {t("nav.contact")}
                  </Link>
                </li>

                {user && (
                  <li>
                    <Link
                      href="/dm"
                      onClick={() => setMobileOpen(false)}
                      className="block py-1"
                    >
                      {t("nav.messages")}
                    </Link>
                  </li>
                )}

                {isAdmin && (
                  <li>
                    <Link
                      href="/admin/groups"
                      onClick={() => setMobileOpen(false)}
                      className="block py-1"
                    >
                      {t("nav.admin")}
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            <div className="mt-3 grid gap-2">
              <Link
                href={user ? "/profile" : "/auth"}
                onClick={() => setMobileOpen(false)}
                className="text-center rounded-full bg-gcText text-[#fef8f4] font-dmserif px-5 py-2 shadow-md hover:opacity-90"
              >
                {user ? t("nav.accountShort") : t("nav.join")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
