"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { Star } from "lucide-react";

type EventRowDB = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  group_id: string | null;
  cover_image_url: string | null;
  creator_id: string | null;
};

type EventRow = EventRowDB & {
  group_name: string | null;
  group_slug: string | null;
  city_slug: string | null;
  category_slug: string | null;
};

type GroupRow = {
  id: string;
  name: string;
  slug: string;
  city_id: string;
  category_id: string;
};

type CityRow = { id: string; slug: string };
type CategoryRow = { id: string; slug: string };

export default function MyCalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // mes que se está viendo en el calendario (1er día del mes)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoadingData(true);
      try {
        // 1) eventos a los que vas
        const { data: attends } = await supabase
          .from("community_event_attendees")
          .select("event_id")
          .eq("profile_id", user.id);

        const attendingIds = (attends ?? []).map(
          (r: { event_id: string }) => r.event_id
        );

        // 2) eventos creados por ti
        const { data: created } = await supabase
          .from("community_events")
          .select("id")
          .eq("creator_id", user.id);

        const createdIds = (created ?? []).map((e: { id: string }) => e.id);

        const allIds = Array.from(new Set([...attendingIds, ...createdIds]));
        if (!allIds.length) {
          setEvents([]);
          return;
        }

        // 3) cargar eventos completos
        const { data: evs } = await supabase
          .from("community_events")
          .select(
            "id,title,description,location,starts_at,group_id,cover_image_url,creator_id"
          )
          .in("id", allIds)
          .order("starts_at", { ascending: true });

        const dbRows = (evs ?? []) as EventRowDB[];

        // 4) grupos relacionados
        const groupIds = Array.from(
          new Set(
            dbRows
              .map((e) => e.group_id)
              .filter((id): id is string => Boolean(id))
          )
        );
        let groupMap: Record<string, GroupRow> = {};
        if (groupIds.length) {
          const { data: groups } = await supabase
            .from("groups")
            .select("id,name,slug,city_id,category_id")
            .in("id", groupIds);
          (groups ?? []).forEach((g: GroupRow) => (groupMap[g.id] = g));
        }

        // 5) cities + categories
        const cityIds = Array.from(
          new Set(Object.values(groupMap).map((g) => g.city_id))
        );
        const categoryIds = Array.from(
          new Set(Object.values(groupMap).map((g) => g.category_id))
        );

        let cityMap: Record<string, CityRow> = {};
        let categoryMap: Record<string, CategoryRow> = {};

        if (cityIds.length) {
          const { data: cities } = await supabase
            .from("cities")
            .select("id,slug")
            .in("id", cityIds);
          (cities ?? []).forEach((c: CityRow) => (cityMap[c.id] = c));
        }

        if (categoryIds.length) {
          const { data: cats } = await supabase
            .from("categories")
            .select("id,slug")
            .in("id", categoryIds);
          (cats ?? []).forEach((c: CategoryRow) => (categoryMap[c.id] = c));
        }

        const enriched: EventRow[] = dbRows.map((e) => {
          const g = e.group_id ? groupMap[e.group_id] : undefined;
          const city = g ? cityMap[g.city_id] : undefined;
          const cat = g ? categoryMap[g.category_id] : undefined;

          return {
            ...e,
            group_name: g?.name ?? null,
            group_slug: g?.slug ?? null,
            city_slug: city?.slug ?? null,
            category_slug: cat?.slug ?? null,
          };
        });

        setEvents(enriched);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [user]);

  if (loading || !user || loadingData) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        Cargando…
      </main>
    );
  }

  // si no hay eventos, mostramos mensaje pero igualmente podríamos mostrar un calendario vacío
  if (!events.length) {
    return (
      <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <header className="mb-6 flex items-start justify-between">
            <h1 className="font-dmserif text-2xl md:text-3xl">
              Mi calendario de planes
            </h1>
            <Link href="/valencia" className="underline hidden md:inline text-sm">
              Volver a la ciudad
            </Link>
          </header>
          <p className="opacity-70">
            Aún no tienes planes en tu calendario. Cuando te apuntes a un plan
            (o crees uno), aparecerá aquí ✨
          </p>
        </div>

        <div className="md:hidden px-6 pb-8">
          <Link href="/valencia" className="underline text-sm">
            Volver a la ciudad
          </Link>
        </div>
      </main>
    );
  }

  // -----------------------------
  // Helpers calendario mensual
  // -----------------------------

  const monthFormatter = new Intl.DateTimeFormat("es-ES", {
    month: "long",
  });
  const monthLabel = monthFormatter
    .format(currentMonth)
    .toLocaleUpperCase("es-ES");
  const yearLabel = currentMonth.getFullYear();

  // mapa { "YYYY-MM-DD": [eventos...] }
  const eventsByDate: Record<string, EventRow[]> = {};
  for (const ev of events) {
    const d = new Date(ev.starts_at);
    // clave YYYY-MM-DD en local
    const key = d.toISOString().slice(0, 10);
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  }

  // primer día visible del grid (empezando lunes)
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const weekday = (firstOfMonth.getDay() + 6) % 7; // 0 = lunes
  const gridStart = new Date(year, month, 1 - weekday);

  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push({
      date: d,
      isCurrentMonth: d.getMonth() === month,
    });
  }

  function goMonth(offset: number) {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + offset);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getEventLink(ev: EventRow) {
    if (ev.city_slug && ev.category_slug && ev.group_slug) {
      return `/${ev.city_slug}/${ev.category_slug}/group/${ev.group_slug}/events`;
    }
    return null;
  }

  const weekdayLabels = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        <header className="mb-6 flex items-start justify-between">
          <h1 className="font-dmserif text-2xl md:text-3xl">
            Mi calendario de planes
          </h1>
          <Link href="/valencia" className="underline hidden md:inline text-sm">
            Volver a la ciudad
          </Link>
        </header>

        {/* Tarjeta calendario */}
        <section className="bg-white rounded-[32px] shadow-md px-4 md:px-8 py-6 md:py-8">
          {/* Encabezado mes / año + navegación */}
          <div className="mb-4 md:mb-6 flex items-baseline justify-between">
            <h2 className="font-dmserif text-2xl md:text-3xl">
              {monthLabel}
            </h2>
            <div className="flex items-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-sm hover:opacity-80"
                aria-label="Mes anterior"
              >
                ←
              </button>
              <span className="font-dmserif text-xl md:text-2xl">
                {yearLabel}
              </span>
              <button
                type="button"
                onClick={() => goMonth(1)}
                className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-sm hover:opacity-80"
                aria-label="Mes siguiente"
              >
                →
              </button>
            </div>
          </div>

          {/* Cabecera días de la semana */}
          <div className="grid grid-cols-7 text-center text-xs md:text-sm font-semibold mb-2 md:mb-4">
            {weekdayLabels.map((label) => (
              <div key={label} className="py-1 md:py-2">
                {label}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-px md:gap-1 bg-[#c197d2]/40 rounded-3xl overflow-hidden">
            {days.map(({ date, isCurrentMonth }) => {
              const key = date.toISOString().slice(0, 10);
              const dayEvents = eventsByDate[key] ?? [];

              const isToday = (() => {
                const today = new Date();
                return (
                  date.getFullYear() === today.getFullYear() &&
                  date.getMonth() === today.getMonth() &&
                  date.getDate() === today.getDate()
                );
              })();

              return (
                <div
                  key={key}
                  className={`relative min-h-[90px] md:min-h-[120px] bg-gcBackground px-1.5 md:px-2 py-1.5 md:py-2 flex flex-col border border-black/5 ${
                    isCurrentMonth ? "" : "opacity-50"
                  }`}
                >
                  {/* cabecera día */}
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="font-semibold">{date.getDate()}</span>

                    {/* “Hoy” solo desktop, alineado a la derecha */}
                    {isToday && (
                      <span className="hidden md:inline-flex items-center justify-center rounded-full bg-[#50415b] text-[#fef8f4] text-[10px] px-2 py-0.5 leading-none">
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* “Hoy” centrado en mobile */}
                  {isToday && (
                    <div className="md:hidden mt-1 flex justify-center">
                      <span className="rounded-full bg-[#50415b] text-[#fef8f4] text-[10px] px-2 py-0.5 leading-none">
                        Hoy
                      </span>
                    </div>
                  )}

                  {/* Mini tarjetas de eventos del día */}
                  {dayEvents.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const link = getEventLink(ev);
                        const timeLabel = formatTime(ev.starts_at);

                        const inner = (
                          <>
                            {/* DESKTOP: card como antes */}
                            <div className="hidden md:block rounded-xl bg-white/90 shadow-sm p-1.5 md:p-2 text-[10px] md:text-xs leading-tight hover:opacity-95">
                              <div className="text-[10px] md:text-[11px] opacity-70">
                                {timeLabel}
                              </div>
                              <div className="font-semibold line-clamp-2">
                                {ev.title}
                              </div>
                              {ev.location && (
                                <div className="mt-0.5 opacity-80 line-clamp-1">
                                  📍 {ev.location}
                                </div>
                              )}
                            </div>

                            {/* MOBILE: card rectangular con hora + estrella */}
<div className="md:hidden flex justify-center">
  <div className="rounded-xl bg-white shadow-md px-2 py-1.5 min-w-[60px] flex flex-col items-center justify-center text-[11px] font-semibold text-[#50415b] hover:opacity-95 leading-tight">
    <span>{timeLabel}</span>
    <Star
      className="w-3 h-3 mt-0.5 text-[#c197d2]"
      fill="currentColor"
    />
  </div>
</div>
                          </>
                        );

                        return link ? (
                          <Link key={ev.id} href={link} className="block">
                            {inner}
                          </Link>
                        ) : (
                          <div key={ev.id}>{inner}</div>
                        );
                      })}

                      {dayEvents.length > 2 && (
                        <div className="text-[10px] md:text-xs opacity-70 text-center md:text-left">
                          +{dayEvents.length - 2} plan(es) más
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Mobile: link abajo */}
      <div className="md:hidden px-6 pb-8">
        <Link href="/valencia" className="underline text-sm">
          Volver a la ciudad
        </Link>
      </div>
    </main>
  );
}
