"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  is_approved: boolean;
  creator_id: string;
  group_id: string;
};

type GroupLite = { id: string; name: string; slug: string };

export default function CategoryEventsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [groups, setGroups] = useState<Record<string, GroupLite>>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoadingData(true);
      try {
        // 1) city + category
        const { data: city } = await supabase
          .from("cities")
          .select("id,slug")
          .eq("slug", "valencia")
          .maybeSingle();

        const { data: cat } = await supabase
          .from("categories")
          .select("id,slug")
          .eq("slug", category)
          .maybeSingle();

        if (!city?.id || !cat?.id) {
          setEvents([]);
          setGroups({});
          return;
        }

        // 2) my followed group ids
        const { data: mems } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("profile_id", user.id);

        const followedIds = (mems ?? []).map((m: any) => m.group_id);
        if (!followedIds.length) {
          setEvents([]);
          setGroups({});
          return;
        }

        // 3) limit to followed groups in this category+city and approved
        const { data: gRows } = await supabase
          .from("groups")
          .select("id,name,slug")
          .in("id", followedIds)
          .eq("city_id", city.id)
          .eq("category_id", cat.id)
          .eq("is_approved", true);

        const validGroupIds = (gRows ?? []).map((g) => g.id);
        if (!validGroupIds.length) {
          setEvents([]);
          setGroups({});
          return;
        }

        // keep a map for titles/links
        const gMap: Record<string, GroupLite> = {};
        (gRows ?? []).forEach((g) => (gMap[g.id] = g));
        setGroups(gMap);

        // 4) events for those groups
        // RLS will already ensure: you see approved events, plus your own drafts
        const { data: evs } = await supabase
          .from("community_events")
          .select(
            "id,title,description,location,starts_at,is_approved,creator_id,group_id"
          )
          .in("group_id", validGroupIds)
          .order("starts_at", { ascending: true });

        setEvents(evs ?? []);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [user, category]);

  const title = useMemo(() => {
    return "Eventos de tus grupos seguidos";
  }, []);

  if (loading || !user || loadingData) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        Cargando…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-6 flex items-start justify-between">
          <h1 className="font-dmserif text-3xl md:text-4xl">{title}</h1>
          <Link href={`/valencia/${category}`} className="underline">
            Volver a la categoría
          </Link>
        </header>

        {events.length === 0 ? (
          <p className="opacity-70">
            No hay eventos de tus grupos seguidos todavía. Sigue grupos en esta
            categoría para ver aquí sus eventos ✨
          </p>
        ) : (
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => {
              const when = new Date(ev.starts_at);
              const g = groups[ev.group_id];
              return (
                <li
                  key={ev.id}
                  className="bg-white rounded-2xl p-4 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{ev.title}</h3>
                      {!ev.is_approved && (
                        <span className="text-xs border px-2 py-0.5 rounded-full">
                          Borrador
                        </span>
                      )}
                    </div>

                    <div className="text-sm opacity-80">
                      {when.toLocaleDateString()} •{" "}
                      {when.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {ev.location && (
                      <div className="text-sm opacity-80 mt-1">📍 {ev.location}</div>
                    )}

                    {g ? (
                      <div className="text-sm opacity-80 mt-1">
                        Grupo:{" "}
                        <Link
                          href={`/valencia/${category}/group/${g.slug}/events`}
                          className="underline"
                        >
                          {g.name}
                        </Link>
                      </div>
                    ) : null}

                    {ev.description && <p className="mt-3">{ev.description}</p>}
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
