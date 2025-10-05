"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

// i18n
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

type NotificationRow = {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  read_at: string | null;
  url?: string | null; // column exists in your schema
};

export const dynamic = "force-dynamic";

function timeAgo(iso: string, locale: string) {
  const d = new Date(iso);
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, per] of units) {
    if (Math.abs(diffSec) >= per || unit === "second") {
      const value = Math.round(-diffSec / per);
      return rtf.format(value, unit);
    }
  }
  return "";
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // i18n
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => {
    setLang(getLang());
  }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  const [items, setItems] = useState<NotificationRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    (async () => {
      setBusy(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, url, created_at, read_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("notifications query failed:", error.message);
        setItems([]);
      } else {
        setItems(data ?? []);
      }
      setBusy(false);
    })();
  }, [user, loading, router]);

  async function markAllRead() {
    if (!user) return;
    const nowISO = new Date().toISOString();

    // optimistic UI
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? nowISO })));

    // persist (user_id only)
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: nowISO })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) console.error("markAllRead failed:", error.message);

    // notify navbar / other tabs to refresh badge
    try {
      localStorage.setItem("notif-refresh", String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  function openUrl(url?: string | null) {
    if (!url) return;
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  }

  if (loading || busy) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        {t("notificationsPage.loading", "Cargando notificaciones…")}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6 grid grid-cols-[1fr_auto] items-start gap-2">
          <h1 className="font-dmserif text-2xl md:text-3xl">
            {t("notificationsPage.title", "Notificaciones")}
          </h1>

          {items.some((i) => !i.read_at) && (
            <button
              onClick={markAllRead}
              className="rounded-full border bg-white px-3 py-1 text-xs md:text-sm shadow-sm hover:opacity-90 text-right leading-tight"
            >
              <span className="block">
                {t("notificationsPage.markAllLine1", "Marcar todo")}
              </span>
              <span className="block">
                {t("notificationsPage.markAllLine2", "como leído")}
              </span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="opacity-80">
              {t("notificationsPage.emptyLead", "No tienes notificaciones todavía.")}{" "}
              <Link className="underline" href="/find-your-city">
                {t("notificationsPage.exploreCommunity", "Explora la comunidad")}
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => {
              const clickable = Boolean(n.url);
              return (
                <li
                  key={n.id}
                  role={clickable ? "link" : undefined}
                  tabIndex={clickable ? 0 : -1}
                  onClick={() => openUrl(n.url!)}
                  onKeyDown={(e) => {
                    if (!clickable) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openUrl(n.url!);
                    }
                  }}
                  className={`rounded-2xl bg-white p-4 shadow-sm border ${
                    clickable
                      ? "cursor-pointer hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/10"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read_at && (
                      <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#50415b]" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">
                          {n.title ?? t("notificationsPage.defaultTitle", "Notificación")}
                        </p>
                        <span className="text-xs opacity-60">
                          {timeAgo(n.created_at, lang)}
                        </span>
                      </div>
                      {n.body && (
                        <p className="mt-1 opacity-90 whitespace-pre-wrap">{n.body}</p>
                      )}
                      {/* whole card is clickable when url exists */}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

