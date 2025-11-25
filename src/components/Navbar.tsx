"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Menu, Bell, User } from "lucide-react";
import { getLang, setLang as setLangCookie, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // placeholder badge
  const [accountOpen, setAccountOpen] = useState(false);

  // language
  const [lang, setLangState] = useState<Lang>("es");
  useEffect(() => {
    setLangState(getLang());
  }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (path: string, fallback?: string) => tt(dict, path, fallback);

  // detectar ciudad + categoría actual (si estamos en /valencia/[category]/...)
  const segments = pathname.split("/").filter(Boolean); // ej: ["valencia","arte","group","xxx"]
  const currentCity = segments[0] === "valencia" ? segments[0] : null;
  const currentCategory =
    currentCity && segments[1] ? segments[1] : null;

  // href para "Mis planes"
  const myPlansHref =
    currentCity && currentCategory
      ? `/${currentCity}/${currentCategory}/events`
      : "/find-your-city";

  // href para "Mapa de planes"
  const mapHref = currentCity ? `/${currentCity}/map` : "/valencia/map";

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

  // load unread count once (no Realtime) + react to localStorage signal
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        if (!cancelled) setUnreadCount(0);
        return;
      }
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", user.id)
        .is("read_at", null);

      if (!error && !cancelled) {
        setUnreadCount(count ?? 0);
      }
    }

    load();

    // light polling every 30s
    const iv = setInterval(load, 30_000);

    // refresh cuando tab visible
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };

    // listen for notif updates signaled via localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === "notif-refresh") load();
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
    };
  }, [user?.id]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href);

  function switchLang(next: Lang) {
    if (next === lang) return;
    setLangCookie(next);
    setLangState(next);
    if (typeof window !== "undefined") window.location.reload();
  }

  // body lock when drawer open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  // shared button so icons align perfectly
  const iconBtn =
    "inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/10";

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      setAccountOpen(false);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-gcBackground/80 backdrop-blur border-b border-white/20">
      <nav className="relative max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Mobile left: burger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="p-2 -ml-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop left: logo */}
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

        {/* Mobile center: logo */}
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

        {/* Right side (desktop) */}
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
                isActive("/find-your-city")
                  ? "underline underline-offset-4"
                  : ""
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

          {/* Language toggle */}
          <li className="ml-2 flex items-center gap-2 text-sm">
            <button
              onClick={() => switchLang("es")}
              className={`px-2 py-1 rounded ${
                lang === "es" ? "bg-white" : "hover:opacity-80"
              }`}
              aria-pressed={lang === "es"}
            >
              ES
            </button>
            <span className="opacity-50">|</span>
            <button
              onClick={() => switchLang("en")}
              className={`px-2 py-1 rounded ${
                lang === "en" ? "bg-white" : "hover:opacity-80"
              }`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </li>

          {/* Mi cuenta / Únete */}
          <li className="relative">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  className="rounded-full bg-gcText text-[#fef8f4] font-dmserif px-5 py-2 shadow-md hover:opacity-90 flex items-center gap-2"
                >
                  {t("nav.account")}
                  <span className="text-xs">▾</span>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-gcText shadow-lg border py-2 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-black/5"
                    >
                      {t("nav.accountShort", "Mi perfil")}
                    </Link>
                    <Link
                      href="/my-groups"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-black/5"
                    >
                      {t("nav.myGroups", "Mis grupos")}
                    </Link>
                    <Link
                      href={myPlansHref}
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-black/5"
                    >
                      {t("nav.myPlans", "Mis planes")}
                    </Link>
                    {/* 🔸 Mapa de planes (desktop dropdown) */}
                    <Link
                      href={mapHref}
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-black/5"
                    >
                      {t("nav.map", "Mapa de planes")}
                    </Link>
                    <Link
                      href="/dm"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-black/5"
                    >
                      {t("nav.messages")}
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-sm hover:bg-black/5"
                    >
                      <span>{t("nav.notifications", "Notificaciones")}</span>
                      {unreadCount > 0 && (
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                      )}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/groups"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-black/5"
                      >
                        {t("nav.admin")}
                      </Link>
                    )}
                    <div className="border-t mt-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-black/5"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/auth"
                className="rounded-full bg-gcText text-[#fef8f4] font-dmserif px-5 py-2 shadow-md hover:opacity-90"
              >
                {t("nav.join")}
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile right: notif + profile icons (aligned) */}
        <div className="md:hidden flex items-center gap-1">
          <Link
            href={user ? "/notifications" : "/auth"}
            aria-label={t("nav.notifications", "Notificaciones")}
            className={iconBtn}
          >
            <span className="relative inline-flex items-center justify-center">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </span>
          </Link>
          <Link
            href={user ? "/profile" : "/auth"}
            aria-label={user ? t("nav.accountShort") : t("nav.join")}
            className={iconBtn}
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </nav>

      {/* Overlay */}
      <button
        onClick={closeMenu}
        aria-label="Cerrar menú"
        className={`md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => e.key === "Escape" && closeMenu()}
        tabIndex={-1}
        className={`md:hidden fixed right-0 top-0 z-50 h-dvh w-[78%] max-w-[340px] bg-white text-gcText border-l shadow-2xl transition-transform duration-300 overflow-y-auto ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2"
            aria-label="Inicio"
          >
            <Image
              src="/logo-gc.png"
              alt="Girls Collective"
              width={120}
              height={24}
            />
          </Link>
        </div>

        <nav className="p-4">
          {/* Navegación general */}
          <ul className="grid gap-1 text-base">
            <li>
              <Link
                href="/#about"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 hover:bg-black/5"
              >
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
              <Link
                href="/#contact"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 hover:bg-black/5"
              >
                {t("nav.contact")}
              </Link>
            </li>
          </ul>

          {/* Tu espacio (solo si logueada) */}
          {user && (
            <div className="mt-4 border-t pt-4">
              <div className="text-xs opacity-60 mb-2 px-1">Tu espacio</div>
              <ul className="grid gap-1 text-base">
                <li>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 hover:bg-black/5"
                  >
                    {t("nav.accountShort", "Mi perfil")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-groups"
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 hover:bg-black/5"
                  >
                    {t("nav.myGroups", "Mis grupos")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={myPlansHref}
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 hover:bg-black/5"
                  >
                    {t("nav.myPlans", "Mis planes")}
                  </Link>
                </li>
                {/* 🔸 Mapa de planes (mobile drawer) */}
                <li>
                  <Link
                    href={mapHref}
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 hover:bg-black/5"
                  >
                    {t("nav.map", "Mapa de planes")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dm"
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 hover:bg-black/5"
                  >
                    {t("nav.messages")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/notifications"
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 hover:bg-black/5"
                  >
                    {t("nav.notifications", "Notificaciones")}
                  </Link>
                </li>
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
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      handleSignOut();
                    }}
                    className="w-full text-left rounded-xl px-4 py-3 hover:bg-black/5 text-base"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Language inside drawer */}
          <div className="mt-4 border-t pt-4">
            <div className="text-xs opacity-60 mb-2">Idioma</div>
            <div className="flex gap-2">
              <button
                onClick={() => switchLang("es")}
                className={`px-3 py-1.5 rounded-full border ${
                  lang === "es" ? "bg-gcBackgroundAlt2" : "bg-white"
                }`}
                aria-pressed={lang === "es"}
              >
                ES
              </button>
              <button
                onClick={() => switchLang("en")}
                className={`px-3 py-1.5 rounded-full border ${
                  lang === "en" ? "bg-gcBackgroundAlt2" : "bg-white"
                }`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>
          </div>

          {/* CTA inferior: solo si NO está logueada */}
          {!user && (
            <div className="mt-6">
              <Link
                href="/auth"
                onClick={closeMenu}
                className="block text-center rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-3 text-lg shadow-md hover:opacity-90"
              >
                {t("nav.join")}
              </Link>
            </div>
          )}

          <div className="h-6 pb-[env(safe-area-inset-bottom)]" />
        </nav>
      </div>
    </header>
  );
}
