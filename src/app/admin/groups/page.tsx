"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

type GroupRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_approved: boolean;
  category_id: string;
  city_id: string;
};
type CatRow = { id: string; slug: string; name: string };
type CityRow = { id: string; slug: string; name: string };

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  is_approved: boolean;
  group_id: string;
};

// 👉 Lista blanca por email (opcional, útil mientras pruebas)
const ADMIN_EMAILS = [
  "valenciagirlscollective@gmail.com",
  "contact@girls-collective.com",
];

export default function AdminModerationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<"groups" | "events">("groups");

  // Groups state
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [catMap, setCatMap] = useState<Record<string, CatRow>>({});
  const [cityMap, setCityMap] = useState<Record<string, CityRow>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Events state
  const [events, setEvents] = useState<EventRow[]>([]);
  const [busyEvent, setBusyEvent] = useState<string | null>(null);

  const [msg, setMsg] = useState("");

  // Gate: auth
  useEffect(() => {
    if (loading) return;
    if (!user) return router.push("/auth");
  }, [loading, user, router]);

  // Determine admin: por email O por flag en profiles.is_admin
  useEffect(() => {
    (async () => {
      if (!user) return;
      let admin = ADMIN_EMAILS.includes(user.email ?? "");
      if (!admin) {
        const { data: me } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();
        admin = Boolean(me?.is_admin);
      }
      setIsAdmin(admin);
      if (!admin) router.push("/"); // fallback
    })();
  }, [user, router]);

  // Fetch pending groups
  async function fetchPendingGroups() {
    const { data: rows } = await supabase
      .from("groups")
      .select("id, name, slug, description, cover_image_url, is_approved, category_id, city_id")
      .eq("is_approved", false)
      .order("created_at", { ascending: true });

    setGroups(rows ?? []);

    // preload maps for links
    const catIds = Array.from(new Set((rows ?? []).map((g) => g.category_id)));
    const cityIds = Array.from(new Set((rows ?? []).map((g) => g.city_id)));

    if (catIds.length) {
      const { data: cats } = await supabase
        .from("categories")
        .select("id, slug, name")
        .in("id", catIds);
      const m: Record<string, CatRow> = {};
      (cats ?? []).forEach((c) => (m[c.id] = c));
      setCatMap(m);
    } else {
      setCatMap({});
    }

    if (cityIds.length) {
      const { data: cities } = await supabase
        .from("cities")
        .select("id, slug, name")
        .in("id", cityIds);
      const m2: Record<string, CityRow> = {};
      (cities ?? []).forEach((c) => (m2[c.id] = c));
      setCityMap(m2);
    } else {
      setCityMap({});
    }
  }

  // Fetch pending events
  async function fetchPendingEvents() {
    const { data } = await supabase
      .from("community_events")
      .select("id, title, description, location, starts_at, is_approved, group_id")
      .eq("is_approved", false)
      .order("starts_at", { ascending: true });
    setEvents(data ?? []);
  }

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchPendingGroups();
    fetchPendingEvents();
  }, [user, isAdmin]);

  // Approve/delete group
  async function approveGroup(id: string, url: string) {
    setSavingId(id); setMsg("");
    try {
      const { error } = await supabase
        .from("groups")
        .update({ is_approved: true, cover_image_url: url || null })
        .eq("id", id);
      if (error) throw error;
      await fetchPendingGroups();
      setMsg("Grupo aprobado ✅");
    } finally {
      setSavingId(null);
    }
  }
  async function deleteGroup(id: string) {
    if (!confirm("¿Eliminar este grupo?")) return;
    setSavingId(`del-${id}`); setMsg("");
    try {
      const { error } = await supabase.from("groups").delete().eq("id", id);
      if (error) throw error;
      await fetchPendingGroups();
      setMsg("Grupo eliminado ✅");
    } finally {
      setSavingId(null);
    }
  }

  // Approve/delete event
  async function approveEvent(id: string) {
    setBusyEvent(id); setMsg("");
    try {
      const { error } = await supabase
        .from("community_events")
        .update({ is_approved: true })
        .eq("id", id);
      if (error) throw error;
      await fetchPendingEvents();
      setMsg("Evento aprobado ✅");
    } finally {
      setBusyEvent(null);
    }
  }
  async function deleteEvent(id: string) {
    if (!confirm("¿Eliminar este evento?")) return;
    setBusyEvent(`del-${id}`); setMsg("");
    try {
      const { error } = await supabase.from("community_events").delete().eq("id", id);
      if (error) throw error;
      await fetchPendingEvents();
      setMsg("Evento eliminado ✅");
    } finally {
      setBusyEvent(null);
    }
  }

  const hasGroups = useMemo(() => groups.length > 0, [groups]);
  const hasEvents = useMemo(() => events.length > 0, [events]);

  if (loading || !user || !isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        Cargando…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-5xl mx-auto p-6">
        <header className="mb-6 flex items-start justify-between">
          <h1 className="font-dmserif text-3xl">Admin · Moderación</h1>
          <Link href="/" className="underline">Inicio</Link>
        </header>

        {/* Tabs */}
        <div className="mb-4 flex gap-3">
          <button
            className={`px-4 py-1.5 rounded-full border ${tab === "groups" ? "bg-white" : "bg-transparent"}`}
            onClick={() => setTab("groups")}
          >
            Grupos
          </button>
          <button
            className={`px-4 py-1.5 rounded-full border ${tab === "events" ? "bg-white" : "bg-transparent"}`}
            onClick={() => setTab("events")}
          >
            Eventos
          </button>
        </div>

        {msg && <p className="mb-4 text-sm">{msg}</p>}

        {tab === "groups" ? (
          <section className="bg-white rounded-2xl p-4 shadow-md">
            <h2 className="font-dmserif text-2xl mb-4">Grupos pendientes</h2>

            {!hasGroups ? (
              <p>No hay grupos pendientes 🎉</p>
            ) : (
              <div className="grid gap-4">
                {groups.map((r) => {
                  const cat = catMap[r.category_id];
                  const city = cityMap[r.city_id];
                  const href = cat && city ? `/${city.slug}/${cat.slug}/group/${r.slug}` : "#";
                  return (
                    <div key={r.id} className="bg-white rounded-xl p-4 border shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">{r.name}</div>
                          <div className="text-sm opacity-80 mb-2">/{r.slug}</div>
                          <div className="text-sm opacity-70 mb-2">
                            {city?.name ?? "Ciudad"} • {cat?.slug ?? "categoría"}
                          </div>
                        </div>
                        {href !== "#" && <Link href={href} className="underline">Ver</Link>}
                      </div>

                      <p className="text-sm mb-3">{r.description || "—"}</p>

                      <label className="block text-sm mb-1">Cover image URL (opcional)</label>
                      <input
                        id={`url-${r.id}`}
                        className="w-full rounded border p-2 mb-3"
                        defaultValue={r.cover_image_url ?? ""}
                        placeholder="https://...  o  /groups/arte/mi-grupo.jpg"
                      />

                      <div className="flex gap-3">
                        <button
                          disabled={savingId === r.id}
                          onClick={() => {
                            const el = document.getElementById(`url-${r.id}`) as HTMLInputElement | null;
                            approveGroup(r.id, el?.value ?? "");
                          }}
                          className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
                        >
                          {savingId === r.id ? "Guardando…" : "Aprobar"}
                        </button>
                        <button
                          disabled={savingId === `del-${r.id}`}
                          onClick={() => deleteGroup(r.id)}
                          className="underline"
                        >
                          {savingId === `del-${r.id}` ? "Eliminando…" : "Eliminar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section className="bg-white rounded-2xl p-4 shadow-md">
            <h2 className="font-dmserif text-2xl mb-4">Eventos pendientes</h2>

            {!hasEvents ? (
              <p>No hay eventos pendientes 🎉</p>
            ) : (
              <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((ev) => {
                  const when = new Date(ev.starts_at);
                  return (
                    <li key={ev.id} className="bg-white rounded-2xl p-4 border shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ev.title}</h3>
                          <span className="text-xs border px-2 py-0.5 rounded-full">Borrador</span>
                        </div>
                        <div className="text-sm opacity-80">
                          {when.toLocaleDateString()} • {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {ev.location && <div className="text-sm opacity-80 mt-1">📍 {ev.location}</div>}
                        {ev.description && <p className="mt-3">{ev.description}</p>}
                      </div>
                      <div className="mt-4 flex justify-end gap-3">
                        <button
                          onClick={() => approveEvent(ev.id)}
                          disabled={busyEvent === ev.id}
                          className="underline"
                        >
                          {busyEvent === ev.id ? "Aprobando…" : "Aprobar"}
                        </button>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          disabled={busyEvent === `del-${ev.id}`}
                          className="underline text-red-600"
                        >
                          {busyEvent === `del-${ev.id}` ? "Eliminando…" : "Eliminar"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

