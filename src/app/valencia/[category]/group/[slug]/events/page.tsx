"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

type Group = { id: string; name: string; slug: string };
type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  is_approved: boolean;
  creator_id: string;
};

export default function EventsPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = use(params);
  const { user, loading } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  // asistencia
  const [goingMap, setGoingMap] = useState<Record<string, boolean>>({});
  const [countMap, setCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: me } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(Boolean(me?.is_admin));
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      // find group by city 'valencia' + category + slug
      const { data: city } = await supabase
        .from("cities")
        .select("id")
        .eq("slug", "valencia")
        .maybeSingle();
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category)
        .maybeSingle();
      if (!city?.id || !cat?.id) return;

      const { data: g } = await supabase
        .from("groups")
        .select("id,name,slug")
        .eq("city_id", city.id)
        .eq("category_id", cat.id)
        .eq("slug", slug)
        .eq("is_approved", true)
        .maybeSingle();
      if (!g?.id) return;
      setGroup(g);

      // load events (admin ve todos; user normal: aprobados + sus borradores)
      const { data: rows } = await supabase
        .from("community_events")
        .select("id,title,description,location,starts_at,is_approved,creator_id")
        .eq("group_id", g.id)
        .order("starts_at", { ascending: true });

      const list = (rows ?? []).filter((ev) => {
        if (ev.is_approved) return true;
        if (!user) return false;
        if (isAdmin) return true;
        return ev.creator_id === user.id; // creadora ve su borrador
      });

      setEvents(list);

      // asistencia: cargar para los ids listados
      const ids = list.map((e) => e.id);
      if (ids.length && user) {
        // quién va (todas las filas) para contar + si yo voy
        const { data: attRows } = await supabase
          .from("community_event_attendees")
          .select("event_id, profile_id")
          .in("event_id", ids);

        const cMap: Record<string, number> = {};
        const gMap: Record<string, boolean> = {};
        (attRows ?? []).forEach((r) => {
          cMap[r.event_id] = (cMap[r.event_id] ?? 0) + 1;
          if (r.profile_id === user.id) gMap[r.event_id] = true;
        });
        // asegurar key con 0 si no hay filas
        ids.forEach((id) => {
          if (!(id in cMap)) cMap[id] = 0;
          if (!(id in gMap)) gMap[id] = false;
        });
        setCountMap(cMap);
        setGoingMap(gMap);
      } else {
        setCountMap({});
        setGoingMap({});
      }
    })();
  }, [category, slug, user, isAdmin]);

  async function deleteEvent(id: string) {
    if (!user) return;
    if (!confirm("¿Eliminar este evento?")) return;
    try {
      setBusy(id);
      const { error } = await supabase
        .from("community_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== id));
      // limpiar contadores locales
      const nextCount = { ...countMap };
      const nextGoing = { ...goingMap };
      delete nextCount[id];
      delete nextGoing[id];
      setCountMap(nextCount);
      setGoingMap(nextGoing);
    } finally {
      setBusy(null);
    }
  }

  async function approveEvent(id: string) {
    if (!isAdmin) return;
    setBusy(`approve-${id}`); setMsg("");
    try {
      const { error } = await supabase
        .from("community_events")
        .update({ is_approved: true })
        .eq("id", id);
      if (error) throw error;
      setEvents(prev => prev.map(e => e.id === id ? { ...e, is_approved: true } : e));
      setMsg("Evento aprobado ✅");
    } catch (e: any) {
      setMsg(e.message ?? "No se pudo aprobar el evento.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleGoing(id: string, isApproved: boolean) {
    if (!user) return;
    if (!isApproved) return; // no permitir asistir a borradores
    setBusy(`going-${id}`);
    try {
      const going = goingMap[id] === true;
      if (going) {
        const { error } = await supabase
          .from("community_event_attendees")
          .delete()
          .match({ event_id: id, profile_id: user.id });
        if (error) throw error;
        setGoingMap({ ...goingMap, [id]: false });
        setCountMap({ ...countMap, [id]: Math.max(0, (countMap[id] ?? 1) - 1) });
      } else {
        const { error } = await supabase
          .from("community_event_attendees")
          .insert({ event_id: id, profile_id: user.id });
        if (error) throw error;
        setGoingMap({ ...goingMap, [id]: true });
        setCountMap({ ...countMap, [id]: (countMap[id] ?? 0) + 1 });
      }
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <main className="min-h-screen grid place-items-center">Cargando…</main>;
  if (!group) return <main className="min-h-screen grid place-items-center">Grupo no encontrado</main>;

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-6 flex items-start justify-between">
          <h1 className="font-dmserif text-3xl md:text-4xl">Eventos de {group.name}</h1>
          <Link href={`/${"valencia"}/${category}/group/${slug}`} className="underline">Volver al grupo</Link>
        </header>

        {msg && <p className="mb-3 text-sm">{msg}</p>}

        {events.length === 0 ? (
          <p className="opacity-70">No hay eventos todavía. ¡Crea el primero desde el grupo! ✨</p>
        ) : (
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => {
              const when = new Date(ev.starts_at);
              const canDelete = isAdmin || (user && ev.creator_id === user.id);
              const canApprove = isAdmin && !ev.is_approved;
              const going = goingMap[ev.id] === true;
              const count = countMap[ev.id] ?? 0;

              return (
                <li key={ev.id} className="bg-white rounded-2xl p-4 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{ev.title}</h3>
                      {!ev.is_approved && (
                        <span className="text-xs border px-2 py-0.5 rounded-full">Borrador</span>
                      )}
                    </div>
                    <div className="text-sm opacity-80">
                      {when.toLocaleDateString()} • {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {ev.location && <div className="text-sm opacity-80 mt-1">📍 {ev.location}</div>}
                    {ev.description && <p className="mt-3">{ev.description}</p>}
                  </div>

                  {/* Acciones: Asistencia + Admin */}
                  <div className="mt-4 flex items-center justify-between">
                    {/* Lado izquierdo: asistencia (solo si aprobado) */}
                    <div className="text-sm opacity-80">
                      {count} {count === 1 ? "asistencia" : "asistencias"}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleGoing(ev.id, ev.is_approved)}
                        disabled={busy === `going-${ev.id}` || !ev.is_approved}
                        className={`rounded-full px-4 py-1.5 text-sm border shadow-sm hover:opacity-90 ${
                          going ? "bg-gcBackgroundAlt2" : "bg-white"
                        } ${!ev.is_approved ? "opacity-60 cursor-not-allowed" : ""}`}
                        title={ev.is_approved ? (going ? "Cancelar asistencia" : "Confirmar asistencia") : "Pendiente de aprobación"}
                      >
                        {busy === `going-${ev.id}` ? "…" : going ? "Ya vas" : "Asistiré"}
                      </button>

                      {/* Admin actions */}
                      {canApprove && (
                        <button
                          onClick={() => approveEvent(ev.id)}
                          disabled={busy === `approve-${ev.id}`}
                          className="underline text-sm"
                        >
                          {busy === `approve-${ev.id}` ? "Aprobando…" : "Aprobar"}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          disabled={busy === ev.id}
                          className="underline text-sm"
                        >
                          {busy === ev.id ? "Eliminando…" : "Eliminar"}
                        </button>
                      )}
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

