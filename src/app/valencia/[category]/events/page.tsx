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
  is_host: boolean | null;
  host_title: string | null;
  host_bio: string | null;
  host_website: string | null;
  host_shop_url: string | null;
  host_contact: string | null;
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
  is_host?: boolean | null;
  host_title?: string | null;
  host_bio?: string | null;
  host_website?: string | null;
  host_shop_url?: string | null;
  host_contact?: string | null;
};

export default function CategoryEventsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  // eventos de grupos que sigues
  const [events, setEvents] = useState<EventRow[]>([]);
  // eventos de anfitrionas que sigues
  const [hostEvents, setHostEvents] = useState<EventRow[]>([]);
  // 🔹 eventos de otros grupos de la categoría/ciudad (Planes para ti)
  const [recommendedEvents, setRecommendedEvents] = useState<EventRow[]>([]);
  // todos los grupos de esta ciudad + categoría (para mostrar nombre/slug)
  const [groups, setGroups] = useState<Record<string, GroupLite>>({});
  // ids de grupos seguidos dentro de esta categoría
  const [followedGroupIds, setFollowedGroupIds] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // popup perfil creadora
  const [openProfile, setOpenProfile] =
    useState<null | { username: string; data?: ProfilePreview; isFollowingHost?: boolean }>(null);

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
          setHostEvents([]);
          setRecommendedEvents([]);
          setGroups({});
          setFollowedGroupIds([]);
          return;
        }

        // 2) ids de grupos que sigues (membership)
        const { data: mems } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("profile_id", user.id);

        const followedIds = (mems ?? []).map(
          (m: { group_id: string }) => m.group_id
        );

        // 3) todos los grupos de esta ciudad + categoría (aprobados)
        const { data: allGroups } = await supabase
          .from("groups")
          .select("id,name,slug")
          .eq("city_id", city.id)
          .eq("category_id", cat.id)
          .eq("is_approved", true);

        if (!allGroups?.length) {
          setEvents([]);
          setHostEvents([]);
          setRecommendedEvents([]);
          setGroups({});
          setFollowedGroupIds([]);
          return;
        }

        const allGroupIds = (allGroups ?? []).map(
          (g: GroupLite) => g.id
        );

        const validGroupIds = allGroupIds.filter((id) =>
          followedIds.includes(id)
        );
        setFollowedGroupIds(validGroupIds);

        const gMap: Record<string, GroupLite> = {};
        (allGroups ?? []).forEach((g: GroupLite) => {
          gMap[g.id] = g;
        });
        setGroups(gMap);

        // 4) anfitrionas que sigo
        const { data: hostFollows } = await supabase
          .from("host_followers")
          .select("host_id")
          .eq("follower_id", user.id);

        const followedHostIds = (hostFollows ?? []).map(
          (r: { host_id: string }) => r.host_id
        );

        // 5) eventos de todos los grupos de esta categoría/ciudad
        const { data: evs } = await supabase
          .from("community_events")
          .select(
            "id,title,description,location,starts_at,is_approved,creator_id,group_id,cover_image_url"
          )
          .in("group_id", allGroupIds)
          .order("starts_at", { ascending: true });

        const dbRows = (evs ?? []) as EventRowDB[];

        // 6) map creadoras → username
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

        const enrichedAll: EventRow[] = dbRows.map((e) => ({
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

        // eventos de grupos que sigues
        const eventsForGroups = enrichedAll.filter((ev) =>
          validGroupIds.includes(ev.group_id)
        );

        // eventos de anfitrionas que sigues (en esta categoría/ciudad)
        let eventsForHosts = enrichedAll.filter(
          (ev) =>
            ev.creator_id &&
            followedHostIds.includes(ev.creator_id)
        );

        // evita duplicar si un evento ya aparece como "de grupos que sigues"
        const groupEventIds = new Set(eventsForGroups.map((e) => e.id));
        eventsForHosts = eventsForHosts.filter(
          (e) => !groupEventIds.has(e.id)
        );

        // 🔹 eventos de otros grupos (no seguidos) = candidatos a "Planes para ti"
        const recommended = enrichedAll.filter(
          (ev) => !validGroupIds.includes(ev.group_id)
        );

        setEvents(eventsForGroups);
        setHostEvents(eventsForHosts);
        setRecommendedEvents(recommended);
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
      .select(
        "id,username,bio,avatar_url,favorite_emoji,quote,is_host,host_title,host_bio,host_website,host_shop_url,host_contact"
      )
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
      is_host: prof.is_host ?? false,
      host_title: prof.host_title,
      host_bio: prof.host_bio,
      host_website: prof.host_website,
      host_shop_url: prof.host_shop_url,
      host_contact: prof.host_contact,
    };

    // intereses
    const interests: string[] = [];
    const { data: pcats } = await supabase
      .from("profile_categories")
      .select("category_id")
      .eq("profile_id", prof.id);
    const catIds = (pcats ?? []).map(
      (c: { category_id: string }) => c.category_id
    );
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

    // galería
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

    // ¿la usuaria actual sigue a esta host?
    let isFollowingHost = false;
    if (prof.is_host && user) {
      const { data: followRow } = await supabase
        .from("host_followers")
        .select("host_id")
        .eq("host_id", prof.id)
        .eq("follower_id", user.id)
        .maybeSingle();
      isFollowingHost = !!followRow;
    }

    setOpenProfile({
      username,
      data: { ...preview, interests, gallery },
      isFollowingHost,
    });
  }

    async function toggleHostFollow() {
    if (!user || !openProfile?.data?.id || !openProfile.data.is_host) return;

    const hostId = openProfile.data.id;
    const currentlyFollowing = !!openProfile.isFollowingHost;

    try {
      if (currentlyFollowing) {
        await supabase
          .from("host_followers")
          .delete()
          .match({ host_id: hostId, follower_id: user.id });
      } else {
        await supabase
          .from("host_followers")
          .insert({ host_id: hostId, follower_id: user.id });
      }

      setOpenProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowingHost: !currentlyFollowing,
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el seguimiento de la anfitriona.");
    }
  }



  // 🔗 compartir plan (usa Web Share API si existe, si no copia el link)
  async function shareEvent(ev: EventRow) {
    try {
      if (typeof window === "undefined") return;

      const group = groups[ev.group_id];
      const baseUrl = window.location.origin;
      const eventUrl = group
        ? `${baseUrl}/valencia/${category}/group/${group.slug}/events`
        : `${baseUrl}/valencia/${category}`;

      const shareData = {
        title: ev.title,
        text:
          ev.description ||
          `Plan en ${group?.name ?? "Girls Collective"} ✨`,
        url: eventUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(eventUrl);
        alert("Enlace copiado ✨");
      } else {
        alert("No se pudo compartir este plan.");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo compartir este plan.");
    }
  }

  if (loading || !user || loadingData) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        Cargando…
      </main>
    );
  }

  const now = new Date();

  const upcomingGroups = events.filter(
    (e) => new Date(e.starts_at).getTime() >= now.getTime()
  );
  const pastGroups = events.filter(
    (e) => new Date(e.starts_at).getTime() < now.getTime()
  );

  const upcomingHosts = hostEvents.filter(
    (e) => new Date(e.starts_at).getTime() >= now.getTime()
  );
  const pastHosts = hostEvents.filter(
    (e) => new Date(e.starts_at).getTime() < now.getTime()
  );

  // 🔹 solo los próximos recomendados (“Planes para ti”)
  const upcomingRecommended = recommendedEvents.filter(
    (e) => new Date(e.starts_at).getTime() >= now.getTime()
  );

  // mezcla de planes pasados (grupos + anfitrionas)
  const pastMixed = [...pastGroups, ...pastHosts].sort(
    (a, b) =>
      new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
  );

  const hasAnyOwnEvents = events.length > 0 || hostEvents.length > 0;
  const hasAnyRecommended = recommendedEvents.length > 0;

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto px-6 py-10">
                <header className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
  {/* Título + Ver calendario (desktop) */}
  <div className="flex flex-wrap items-baseline gap-3">
    <h1 className="font-dmserif text-2xl md:text-3xl">
      {title}
    </h1>
    <Link
      href="/mi-calendario"
      className="underline text-sm hidden md:inline"
    >
      Ver calendario
    </Link>
  </div>

  {/* Volver a la categoría (desktop) */}
  <Link
    href={`/valencia/${category}`}
    className="underline hidden md:inline text-sm"
  >
    Volver a la categoría
  </Link>
</header>


        {/* Ver calendario en mobile, pegadito al título */}
<div className="md:hidden mt-0.5 mb-2 text-sm">
  <Link href="/mi-calendario" className="underline">
    Ver calendario
  </Link>
</div>



        {!hasAnyOwnEvents && !hasAnyRecommended ? (
          <p className="opacity-70">
            No hay planes de tus grupos seguidos todavía. Sigue grupos en esta
            categoría (y anfitrionas) para ver aquí sus planes ✨
          </p>
        ) : (
          <>
            {/* Próximos planes de grupos que sigues */}
            {upcomingGroups.length > 0 && (
              <section className="mb-10">
                <h2 className="font-dmserif text-xl mb-4">Próximos planes</h2>
                <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 no-scrollbar">
                  {upcomingGroups.map((ev) => {
                    const when = new Date(ev.starts_at);
                    const g = groups[ev.group_id];

                    return (
                      <div
                        key={ev.id}
                        className="relative shrink-0 w-[260px] snap-start rounded-2xl overflow-hidden shadow-md bg-white flex flex-col justify-between"
                      >
                        {/* Botón compartir */}
                        <button
                          type="button"
                          onClick={() => shareEvent(ev)}
                          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-[#50415b]/90 flex items-center justify-center shadow-md hover:opacity-90"
                          aria-label="Compartir plan"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/share-ios.svg"
                            alt=""
                            className="w-5 h-5"
                          />
                        </button>

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

            {/* 🔹 Planes para ti (recomendados de otros grupos) */}
            <section className="mb-10">
              <h2 className="font-dmserif text-xl mb-4">
                Planes para ti
              </h2>

              {upcomingRecommended.length === 0 ? (
                <p className="text-sm opacity-70">
                  Cuando haya nuevos planes que encajen contigo, los verás aquí ✨
                </p>
              ) : (
                <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 no-scrollbar">
                  {upcomingRecommended.map((ev) => {
                    const when = new Date(ev.starts_at);
                    const g = groups[ev.group_id];

                    return (
                      <div
                        key={ev.id}
                        className="relative shrink-0 w-[260px] snap-start rounded-2xl overflow-hidden shadow-md bg-white flex flex-col justify-between"
                      >
                        {/* Botón compartir */}
                        <button
                          type="button"
                          onClick={() => shareEvent(ev)}
                          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-[#50415b]/90 flex items-center justify-center shadow-md hover:opacity-90"
                          aria-label="Compartir plan"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/share-ios.svg"
                            alt=""
                            className="w-5 h-5"
                          />
                        </button>

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
              )}
            </section>

            {/* Planes de las anfitrionas que sigues · Próximos planes */}
            <section className="mb-10">
              <h2 className="font-dmserif text-xl mb-1">
                Planes de las anfitrionas que sigues
              </h2>

              {upcomingHosts.length === 0 ? (
                <p className="text-sm opacity-70 mb-4">
                  Sigue a las anfitrionas que resuenen contigo para ver sus planes aquí ✨
                </p>
              ) : (
                <>
                  <p className="text-sm opacity-70 mb-4">Próximos planes</p>
                  <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 no-scrollbar">
                    {upcomingHosts.map((ev) => {
                      const when = new Date(ev.starts_at);
                      const g = groups[ev.group_id];

                      return (
                        <div
                          key={ev.id}
                          className="relative shrink-0 w-[260px] snap-start rounded-2xl overflow-hidden shadow-md bg-white flex flex-col justify-between"
                        >
                          {/* Botón compartir */}
                          <button
                            type="button"
                            onClick={() => shareEvent(ev)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-[#50415b]/90 flex items-center justify-center shadow-md hover:opacity-90"
                            aria-label="Compartir plan"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/icons/share-ios.svg"
                              alt=""
                              className="w-5 h-5"
                            />
                          </button>

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
                </>
              )}
            </section>

            {/* Planes pasados (mix grupos + anfitrionas) */}
            {pastMixed.length > 0 && (
              <section>
                <h2 className="font-dmserif text-xl mb-4">
                  Planes pasados
                </h2>
                <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 no-scrollbar">
                  {pastMixed.map((ev) => {
                    const when = new Date(ev.starts_at);
                    const g = groups[ev.group_id];

                    return (
                      <div
                        key={ev.id}
                        className="relative shrink-0 w-[260px] snap-start rounded-2xl overflow-hidden shadow-md bg-white flex flex-col justify-between opacity-90"
                      >
                        {/* Botón compartir */}
                        <button
                          type="button"
                          onClick={() => shareEvent(ev)}
                          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-[#50415b]/90 flex items-center justify-center shadow-md hover:opacity-90"
                          aria-label="Compartir plan"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/share-ios.svg"
                            alt=""
                            className="w-5 h-5"
                          />
                        </button>

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

            {/* Popup perfil creadora / anfitriona */}
      <Dialog open={!!openProfile} onOpenChange={() => setOpenProfile(null)}>
        <DialogContent className="max-w-sm bg-white rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="font-dmserif text-2xl">
              Perfil
            </DialogTitle>
          </DialogHeader>

          {!openProfile?.data ? (
            <p>Cargando…</p>
          ) : (
            <div>
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={openProfile.data.avatar_url ?? "/placeholder-avatar.png"}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="flex-1">
                  {/* Cabecera + botón seguir anfitriona */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">
                      @{openProfile.data.username}
                    </div>
                    {openProfile.data.favorite_emoji && (
                      <span className="text-xl leading-none">
                        {openProfile.data.favorite_emoji}
                      </span>
                    )}

                    {openProfile.data.is_host &&
                      openProfile.data.id !== user?.id && (
                        <button
                          type="button"
                          onClick={toggleHostFollow}
                          className="ml-auto rounded-full border px-3 py-0.5 text-xs shadow-sm hover:opacity-90"
                        >
                          {openProfile.isFollowingHost
                            ? "Dejar de seguir"
                            : "Seguir anfitriona"}
                        </button>
                      )}
                  </div>

                  {/* Bio básica */}
                  <div className="text-sm opacity-80">
                    {openProfile.data.bio ?? "—"}
                  </div>

                  {openProfile.data.quote && (
                    <div className="mt-2 text-sm italic opacity-90">
                      “{openProfile.data.quote}”
                    </div>
                  )}

                  {/* Bloque anfitriona (solo si es host) */}
                  {openProfile.data.is_host && (
                    <div className="mt-3 pt-3 border-t text-sm">
                      <h3 className="font-dmserif text-lg mb-1">
                        Perfil como anfitriona
                      </h3>

                      {openProfile.data.host_title && (
                        <p className="font-semibold">
                          {openProfile.data.host_title}
                        </p>
                      )}

                      {openProfile.data.host_bio && (
                        <p className="mt-1 opacity-80 whitespace-pre-wrap">
                          {openProfile.data.host_bio}
                        </p>
                      )}

                      <div className="mt-2 space-y-1">
                        {openProfile.data.host_website && (
                          <p>
                            🌐{" "}
                            <a
                              href={openProfile.data.host_website}
                              target="_blank"
                              rel="noreferrer"
                              className="underline break-all"
                            >
                              {openProfile.data.host_website}
                            </a>
                          </p>
                        )}

                        {openProfile.data.host_shop_url && (
                          <p>
                            🛍️{" "}
                            <span className="break-all">
                              {openProfile.data.host_shop_url}
                            </span>
                          </p>
                        )}

                        {openProfile.data.host_contact && (
                          <p>
                            💌{" "}
                            <span className="break-all">
                              {openProfile.data.host_contact}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Separador antes de intereses/galería */}
                  {(openProfile.data.interests?.length ||
                    openProfile.data.gallery?.length) ? (
                    <hr className="mt-4 mb-3 border-t border-black/10" />
                  ) : null}

                  {/* Intereses */}
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

                  {/* Galería */}
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

                  {/* CTA mensaje privado */}
                  {openProfile.data.id &&
                    openProfile.data.username &&
                    openProfile.data.id !== user?.id && (
                      <Link
                        href={`/dm/${encodeURIComponent(
                          openProfile.data.username
                        )}`}
                        className="inline-block mt-3 rounded-full bg-[#50415b] text-[#fef8f4] px-4 py-1.5 text-sm shadow-md hover:opacity-90"
                      >
                        Enviar mensaje
                      </Link>
                    )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
