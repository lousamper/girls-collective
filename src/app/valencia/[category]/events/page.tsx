"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GroupLite = { id: string; name: string; slug: string };

type EventRowDB = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  is_approved: boolean;
  creator_id: string | null;
  group_id: string;
  cover_image_url: string | null;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  is_approved: boolean;
  creator_id: string | null;
  group_id: string;
  image_url: string | null;
  creator_username: string | null;
};

type ProfileRowDB = {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  favorite_emoji: string | null;
  quote: string | null;
};

type ProfilePreview = {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  favorite_emoji?: string | null;
  quote?: string | null;
  interests?: string[];
  gallery?: string[];
};

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

  // popup perfil creadora
  const [openProfile, setOpenProfile] =
    useState<null | { username: string; data?: ProfilePreview }>(null);

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

        const followedIds = (mems ?? []).map(
          (m: { group_id: string }) => m.group_id
        );
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

        const validGroupIds = (gRows ?? []).map((g: GroupLite) => g.id);
        if (!validGroupIds.length) {
          setEvents([]);
          setGroups({});
          return;
        }

        const gMap: Record<string, GroupLite> = {};
        (gRows ?? []).forEach((g: GroupLite) => {
          gMap[g.id] = g;
        });
        setGroups(gMap);

        // 4) events for those groups
        const { data: evs } = await supabase
          .from("community_events")
          .select(
            "id,title,description,location,starts_at,is_approved,creator_id,group_id,cover_image_url"
          )
          .in("group_id", validGroupIds)
          .order("starts_at", { ascending: true });

        const dbRows = (evs ?? []) as EventRowDB[];

        // map creadoras → username
        const creatorIds = Array.from(
          new Set(
            dbRows
              .map((e) => e.creator_id)
              .filter((id): id is string => Boolean(id))
          )
        );
        let creatorMap: Record<string, string | null> = {};
        if (creatorIds.length) {
          const { data: creators } = await supabase
            .from("profiles")
            .select("id,username")
            .in("id", creatorIds);
          creatorMap = {};
          (creators ?? []).forEach(
            (p: { id: string; username: string | null }) => {
              creatorMap[p.id] = p.username ?? null;
            }
          );
        }

        const enriched: EventRow[] = dbRows.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          location: e.location,
          starts_at: e.starts_at,
          is_approved: e.is_approved,
          creator_id: e.creator_id,
          group_id: e.group_id,
          image_url: e.cover_image_url ?? null,
          creator_username: e.creator_id
            ? creatorMap[e.creator_id] ?? null
            : null,
        }));

        setEvents(enriched);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [user, category]);

  const title = useMemo(() => {
    return "Planes de los grupos que sigues";
  }, []);

  async function openUserSheet(username: string) {
    setOpenProfile({ username });
    const { data: prof } = await supabase
      .from("profiles")
      .select("id,username,bio,avatar_url,favorite_emoji,quote")
      .ilike("username", username)
      .maybeSingle<ProfileRowDB>();

    if (!prof) {
      setOpenProfile({ username });
      return;
    }

    const preview: ProfilePreview = {
      id: prof.id,
      username: prof.username,
      bio: prof.bio,
      avatar_url: prof.avatar_url,
      favorite_emoji: prof.favorite_emoji ?? null,
      quote: prof.quote ?? null,
    };

    const interests: string[] = [];
    const { data: pcats } = await supabase
      .from("profile_categories")
      .select("category_id")
      .eq("profile_id", prof.id);
    const catIds = (pcats ?? []).map((c: { category_id: string }) => c.category_id);
    if (catIds.length) {
      const { data: cats } = await supabase
        .from("categories")
        .select("id,name")
        .in("id", catIds);
      interests.push(...((cats ?? []).map((c: { name: string }) => c.name)));
    }
    const { data: custom } = await supabase
      .from("profile_custom_interests")
      .select("interest")
      .eq("profile_id", prof.id)
      .maybeSingle();
    if (custom?.interest) interests.push(custom.interest);

    let gallery: string[] = [];
    try {
      const { data: gal1 } = await supabase
        .from("profile_gallery")
        .select("url, position, created_at")
        .eq("profile_id", prof.id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      gallery = (gal1 ?? []).map((g: { url: string }) => g.url).filter(Boolean);
    } catch {}
    if (!gallery.length) {
      try {
        const { data: gal2 } = await supabase
          .from("profile_photos")
          .select("url, position, created_at")
          .eq("profile_id", prof.id)
          .order("position", { ascending: true })
          .order("created_at", { ascending: false });
        gallery = (gal2 ?? []).map((g: { url: string }) => g.url).filter(Boolean);
      } catch {}
    }

    setOpenProfile({
      username,
      data: { ...preview, interests, gallery },
    });
  }

  if (loading || !user || loadingData) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        Cargando…
      </main>
    );
  }

  const now = new Date();
  const upcoming = events.filter(
    (e) => new Date(e.starts_at).getTime() >= now.getTime()
  );
  const past = events
    .filter((e) => new Date(e.starts_at).getTime() < now.getTime())
    .slice()
    .sort(
      (a, b) =>
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-6 flex items-start justify-between">
          <h1 className="font-dmserif text-2xl md:text-3xl">{title}</h1>
          {/* Desktop: link arriba */}
          <Link
            href={`/valencia/${category}`}
            className="underline hidden md:inline"
          >
            Volver a la categoría
          </Link>
        </header>

        {events.length === 0 ? (
          <p className="opacity-70">
            No hay planes de tus grupos seguidos todavía. Sigue grupos en esta
            categoría para ver aquí sus planes ✨
          </p>
        ) : (
          <>
            {/* Próximos planes */}
            {upcoming.length > 0 && (
              <section className="mb-10">
                <h2 className="font-dmserif text-xl mb-4">Próximos planes</h2>
                <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 no-scrollbar">
                  {upcoming.map((ev) => {
                    const when = new Date(ev.starts_at);
                    const g = groups[ev.group_id];

                    return (
                      <div
                        key={ev.id}
                        className="relative shrink-0 w-[260px] snap-start rounded-2xl overflow-hidden shadow-md bg-white flex flex-col justify-between"
                      >
                        {ev.image_url && (
                          <div className="w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ev.image_url}
                              alt={ev.title}
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        )}

                        <div className="p-4">
                          <div className="text-xs uppercase tracking-wide opacity-70 mb-1">
                            {when.toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <h3 className="font-dmserif text-lg mb-1">
                            {ev.title}
                          </h3>

                          {ev.location && (
                            <p className="text-sm mb-1">📍 {ev.location}</p>
                          )}

                          {g && (
                            <p className="text-xs opacity-80 mb-1">
                              Grupo:{" "}
                              <Link
                                href={`/valencia/${category}/group/${g.slug}/events`}
                                className="underline"
                              >
                                {g.name}
                              </Link>
                            </p>
                          )}

                          {ev.description && (
                            <p className="text-sm opacity-80 line-clamp-3">
                              {ev.description}
                            </p>
                          )}

                          {ev.creator_username && (
                            <div className="mt-2 text-xs opacity-80">
                              Creado por{" "}
                              <button
                                type="button"
                                className="underline font-semibold hover:opacity-80"
                                onClick={() =>
                                  openUserSheet(ev.creator_username!)
                                }
                              >
                                @{ev.creator_username}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Planes pasados */}
            {past.length > 0 && (
              <section>
                <h2 className="font-dmserif text-xl mb-4">Planes pasados</h2>
                <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 no-scrollbar">
                  {past.map((ev) => {
                    const when = new Date(ev.starts_at);
                    const g = groups[ev.group_id];

                    return (
                      <div
                        key={ev.id}
                        className="relative shrink-0 w-[260px] snap-start rounded-2xl overflow-hidden shadow-md bg-white flex flex-col justify-between opacity-90"
                      >
                        {ev.image_url && (
                          <div className="w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ev.image_url}
                              alt={ev.title}
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        )}

                        <div className="p-4">
                          <div className="text-xs uppercase tracking-wide opacity-70 mb-1">
                            {when.toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <h3 className="font-dmserif text-lg mb-1">
                            {ev.title}
                          </h3>

                          {ev.location && (
                            <p className="text-sm mb-1">📍 {ev.location}</p>
                          )}

                          {g && (
                            <p className="text-xs opacity-80 mb-1">
                              Grupo:{" "}
                              <Link
                                href={`/valencia/${category}/group/${g.slug}/events`}
                                className="underline"
                              >
                                {g.name}
                              </Link>
                            </p>
                          )}

                          {ev.description && (
                            <p className="text-sm opacity-80 line-clamp-3">
                              {ev.description}
                            </p>
                          )}

                          {ev.creator_username && (
                            <div className="mt-2 text-xs opacity-80">
                              Creado por{" "}
                              <button
                                type="button"
                                className="underline font-semibold hover:opacity-80"
                                onClick={() =>
                                  openUserSheet(ev.creator_username!)
                                }
                              >
                                @{ev.creator_username}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Mobile: link abajo del todo */}
      <div className="md:hidden px-6 pb-8">
        <Link href={`/valencia/${category}`} className="underline text-sm">
          Volver a la categoría
        </Link>
      </div>

      {/* Popup perfil creadora */}
      <Dialog open={!!openProfile} onOpenChange={() => setOpenProfile(null)}>
        <DialogContent className="max-w-sm bg-white rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="font-dmserif text-2xl">Perfil</DialogTitle>
          </DialogHeader>
          {!openProfile?.data ? (
            <p>Cargando…</p>
          ) : (
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  openProfile.data.avatar_url ?? "/placeholder-avatar.png"
                }
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    @{openProfile.data.username}
                  </div>
                  {openProfile.data.favorite_emoji ? (
                    <span className="text-xl leading-none">
                      {openProfile.data.favorite_emoji}
                    </span>
                  ) : null}
                </div>

                <div className="text-sm opacity-80">
                  {openProfile.data.bio ?? "—"}
                </div>

                {openProfile.data.quote && (
                  <div className="mt-2 text-sm italic opacity-90">
                    “{openProfile.data.quote}”
                  </div>
                )}

                {openProfile.data.interests &&
                  openProfile.data.interests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {openProfile.data.interests.map((name, i) => (
                        <span
                          key={i}
                          className="text-xs border rounded-full px-2 py-0.5"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}

                {openProfile.data.gallery &&
                  openProfile.data.gallery.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {openProfile.data.gallery.slice(0, 6).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="w-full aspect-square object-cover rounded-xl border"
                        />
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
