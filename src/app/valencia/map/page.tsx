"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

// Import dinámico para evitar errores de SSR con react-leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

type EventRowDB = {
  id: string;
  title: string;
  starts_at: string;
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  group_id: string | null;
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

export default function MapPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroupId, setSelectedGroupId] = useState<string>(""); // "" = todos
  const [dayFilter, setDayFilter] = useState<"all" | "today" | "week" | "month">(
    "all"
  );

  useEffect(() => {
    (async () => {
      setLoading(true);

      try {
        const nowIso = new Date().toISOString();

        // 1) Eventos aprobados, con lat/long y fecha futura
        const { data: evs, error } = await supabase
          .from("community_events")
          .select(
            "id,title,starts_at,cover_image_url,latitude,longitude,group_id"
          )
          .eq("is_approved", true)
          .not("latitude", "is", null)
          .not("longitude", "is", null)
          .gte("starts_at", nowIso);

        if (error) {
          console.error("Error cargando eventos para el mapa:", error);
          setEvents([]);
          setLoading(false);
          return;
        }

        const dbRows = (evs ?? []) as EventRowDB[];

        // 2) Grupos relacionados
        const groupIds = Array.from(
          new Set(
            dbRows
              .map((e) => e.group_id)
              .filter((id): id is string => Boolean(id))
          )
        );

        let groupMap: Record<string, GroupRow> = {};
        if (groupIds.length) {
          const { data: groups, error: gErr } = await supabase
            .from("groups")
            .select("id,name,slug,city_id,category_id")
            .in("id", groupIds);

          if (gErr) {
            console.error("Error cargando grupos para el mapa:", gErr);
          } else {
            (groups ?? []).forEach((g: GroupRow) => {
              groupMap[g.id] = g;
            });
          }
        }

        // 3) Cities + categories para sacar city_slug / category_slug
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
          (cities ?? []).forEach((c: CityRow) => {
            cityMap[c.id] = c;
          });
        }

        if (categoryIds.length) {
          const { data: cats } = await supabase
            .from("categories")
            .select("id,slug")
            .in("id", categoryIds);
          (cats ?? []).forEach((c: CategoryRow) => {
            categoryMap[c.id] = c;
          });
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
      } catch (err) {
        console.error("Error inesperado cargando mapa:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ------- helpers filtro tiempo -------
  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function isInCurrentWeek(date: Date) {
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // lunes=0
    const monday = new Date(now);
    monday.setDate(now.getDate() - day);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return date >= monday && date <= sunday;
  }

  function isInCurrentMonth(date: Date) {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  // ------- opciones de grupo para el select -------
  const groupOptions = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach((ev) => {
      if (ev.group_id && ev.group_name) {
        map.set(ev.group_id, ev.group_name);
      }
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [events]);

  // ------- aplicar filtros -------
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const d = new Date(ev.starts_at);

      // filtro grupo
      if (selectedGroupId && ev.group_id !== selectedGroupId) {
        return false;
      }

      // filtro día
      if (dayFilter === "today") {
        if (!isSameDay(d, new Date())) return false;
      } else if (dayFilter === "week") {
        if (!isInCurrentWeek(d)) return false;
      } else if (dayFilter === "month") {
        if (!isInCurrentMonth(d)) return false;
      }

      return true;
    });
  }, [events, selectedGroupId, dayFilter]);

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="font-dmserif text-3xl">Mapa de planes</h1>
          <Link href="/valencia" className="underline text-sm">
            Volver a la ciudad
          </Link>
        </header>

        {/* Filtros: Grupo + Día */}
        <section className="mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grupo */}
            <div>
              <label className="block text-sm mb-1">Grupo</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full rounded-2xl bg-white px-4 py-3 shadow-sm border-none text-sm md:text-base"
              >
                <option value="">Todos</option>
                {groupOptions.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Día */}
            <div>
              <label className="block text-sm mb-1">Día</label>
              <select
                value={dayFilter}
                onChange={(e) =>
                  setDayFilter(e.target.value as "all" | "today" | "week" | "month")
                }
                className="w-full rounded-2xl bg-white px-4 py-3 shadow-sm border-none text-sm md:text-base"
              >
                <option value="all">Todos</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
              </select>
            </div>
          </div>
        </section>

        <div className="w-full h-[70vh] rounded-3xl overflow-hidden shadow-md">
          {!loading && (
            <MapContainer
              center={[39.4702, -0.3768]} // centro de Valencia
              zoom={13}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredEvents.map((ev) => {
                if (!ev.latitude || !ev.longitude) return null;

                const link =
                  ev.city_slug &&
                  ev.category_slug &&
                  ev.group_slug &&
                  `/${ev.city_slug}/${ev.category_slug}/group/${ev.group_slug}/events`;

                return (
                  <Marker
                    key={ev.id}
                    position={[ev.latitude, ev.longitude]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{ev.title}</strong>
                        <br />
                        {new Date(ev.starts_at).toLocaleString("es-ES", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        <br />
                        {link && (
                          <Link
                            href={link}
                            className="underline text-[#50415b] font-semibold"
                          >
                            Ver plan →
                          </Link>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Mensaje si filtros dejan el mapa sin planes */}
        {!loading && filteredEvents.length === 0 && (
          <p className="mt-3 text-sm opacity-70">
            No hay planes que coincidan con estos filtros. Prueba cambiarlos ✨
          </p>
        )}
      </div>
    </main>
  );
}
