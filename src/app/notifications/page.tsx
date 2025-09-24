"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

type NotificationRow = {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  read_at: string | null;
};

export const dynamic = "force-dynamic";

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
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
      // If you don't have a table yet, this will just return an error which we ignore gracefully.
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, created_at, read_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("notifications table missing or query failed:", error.message);
        setItems([]);
      } else {
        setItems(data ?? []);
      }
      setBusy(false);
    })();
  }, [user, loading, router]);

  async function markAllRead() {
    if (!user) return;
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
  }

  if (loading || busy) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        Cargando notificaciones…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-dmserif text-3xl">Notificaciones</h1>
          {items.some((i) => !i.read_at) && (
            <button
              onClick={markAllRead}
              className="rounded-full border bg-white px-4 py-1.5 text-sm shadow-sm hover:opacity-90"
            >
              Marcar todo como leído
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="opacity-80">
              No tienes notificaciones todavía. <Link className="underline" href="/find-your-city">Explora la comunidad</Link>.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id} className="rounded-2xl bg-white p-4 shadow-sm border">
                <div className="flex items-start gap-3">
                  {!n.read_at && <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#50415b]" />}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{n.title ?? "Notificación"}</p>
                      <span className="text-xs opacity-60">{timeAgo(n.created_at)}</span>
                    </div>
                    {n.body && <p className="mt-1 opacity-90 whitespace-pre-wrap">{n.body}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
