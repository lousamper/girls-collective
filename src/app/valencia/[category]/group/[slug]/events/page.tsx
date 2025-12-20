"use client";

import { use, useEffect, useState, useRef, type ChangeEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Group = { id: string; name: string; slug: string };

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  is_approved: boolean;
  creator_id: string | null;
  image_url: string | null;
  creator_username: string | null;
  is_cancelled: boolean;
};

type EventRowDB = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  is_approved: boolean;
  creator_id: string | null;
  cover_image_url: string | null;
  is_cancelled: boolean | null;
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

  // edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLoc, setEditLoc] = useState("");
  const [editWhen, setEditWhen] = useState("");

  // edición de imagen
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageEventId, setImageEventId] = useState<string | null>(null);

  // popup de perfil
  const [openProfile, setOpenProfile] =
    useState<null | { username: string; data?: ProfilePreview }>(null);

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

      // load events
      const { data: rows } = await supabase
        .from("community_events")
        .select(
          "id,title,description,location,starts_at,is_approved,creator_id,cover_image_url,is_cancelled"
        )
        .eq("group_id", g.id)
        .order("starts_at", { ascending: true });

      const dbList = (rows ?? []) as EventRowDB[];

      // map creadoras
      const creatorIds = Array.from(
        new Set(
          dbList
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

      const filtered: EventRow[] = dbList
        .filter((ev) => {
          if (ev.is_approved) return true;
          if (!user) return false;
          if (isAdmin) return true;
          return ev.creator_id === user.id;
        })
        .map((ev) => ({
          id: ev.id,
          title: ev.title,
          description: ev.description,
          location: ev.location,
          starts_at: ev.starts_at,
          is_approved: ev.is_approved,
          creator_id: ev.creator_id,
          image_url: ev.cover_image_url ?? null,
          creator_username: ev.creator_id
            ? creatorMap[ev.creator_id] ?? null
            : null,
          is_cancelled: ev.is_cancelled ?? false,
        }));

      setEvents(filtered);

      // asistencia
      const ids = filtered.map((e) => e.id);
      if (ids.length && user) {
        const { data: attRows } = await supabase
          .from("community_event_attendees")
          .select("event_id, profile_id")
          .in("event_id", ids);

        const cMap: Record<string, number> = {};
        const gMap: Record<string, boolean> = {};
        (attRows ?? []).forEach(
          (r: { event_id: string; profile_id: string }) => {
            cMap[r.event_id] = (cMap[r.event_id] ?? 0) + 1;
            if (r.profile_id === user.id) gMap[r.event_id] = true;
          }
        );
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
    setBusy(`approve-${id}`);
    setMsg("");
    try {
      const { error } = await supabase
        .from("community_events")
        .update({ is_approved: true })
        .eq("id", id);
      if (error) throw error;
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_approved: true } : e))
      );
      setMsg("Evento aprobado ✅");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo aprobar el evento.";
      setMsg(message);
    } finally {
      setBusy(null);
    }
  }

  async function cancelEvent(id: string) {
    if (!user) return;
    if (!confirm("¿Cancelar este evento?")) return;
    setBusy(`cancel-${id}`);
    setMsg("");
    try {
      const updateQuery = supabase
        .from("community_events")
        .update({ is_cancelled: true })
        .eq("id", id);

      const { error } = await updateQuery;
      if (error) throw error;

      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_cancelled: true } : e
        )
      );
      setMsg("Evento cancelado ❌");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo cancelar el evento.";
      setMsg(message);
    } finally {
      setBusy(null);
    }
  }

  async function toggleGoing(id: string, isApproved: boolean, isCancelled: boolean) {
    if (!user) return;
    if (!isApproved || isCancelled) return;
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
        setCountMap({
          ...countMap,
          [id]: Math.max(0, (countMap[id] ?? 1) - 1),
        });
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

  function toLocalInputValue(iso: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function startEdit(ev: EventRow) {
    setEditingId(ev.id);
    setEditTitle(ev.title);
    setEditDesc(ev.description ?? "");
    setEditLoc(ev.location ?? "");
    setEditWhen(toLocalInputValue(ev.starts_at));
  }

  async function saveEdit(id: string) {
    if (!user) return;
    if (!editTitle.trim() || !editWhen) {
      alert("Título y fecha son obligatorios.");
      return;
    }
    setBusy(`edit-${id}`);
    try {
      const starts_at = new Date(editWhen).toISOString();
      const { error } = await supabase
        .from("community_events")
        .update({
          title: editTitle.trim(),
          description: editDesc.trim() || null,
          location: editLoc.trim() || null,
          starts_at,
        })
        .eq("id", id)
        .eq("creator_id", user.id);
      if (error) throw error;

      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                title: editTitle.trim(),
                description: editDesc.trim() || null,
                location: editLoc.trim() || null,
                starts_at,
              }
            : e
        )
      );
      setEditingId(null);
      setMsg("Evento actualizado ✅");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar el evento.";
      setMsg(message);
    } finally {
      setBusy(null);
    }
  }

  async function updateEventImage(eventId: string, file: File) {
    if (!user) return;
    setBusy(`img-${eventId}`);
    setMsg("");
    try {
      const ext =
        file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `events/${user.id}/${eventId}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("Avatars")
        .upload(path, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type || "image/jpeg",
        });
      if (upErr) throw upErr;

      const pub = supabase.storage.from("Avatars").getPublicUrl(path);
      const image_url = pub?.data?.publicUrl ?? null;

      const { error } = await supabase
        .from("community_events")
        .update({ cover_image_url: image_url })
        .eq("id", eventId)
        .eq("creator_id", user.id);
      if (error) throw error;

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, image_url } : e
        )
      );
      setMsg("Imagen actualizada ✅");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar la imagen.";
      setMsg(message);
    } finally {
      setBusy(null);
    }
  }

  function handleImageClick(eventId: string, canChange: boolean) {
    if (!canChange) return;
    setImageEventId(eventId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  async function handleImageFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !imageEventId) return;
    await updateEventImage(imageEventId, file);
    setImageEventId(null);
  }

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

  // compartir evento (usa anchor al evento)
  async function handleShare(ev: EventRow) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/valencia/${category}/group/${slug}/events#${ev.id}`;

    const shareData = {
      title: ev.title,
      text: ev.description ?? `Plan en ${group?.name ?? "Girls Collective"}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Enlace del plan copiado ✨");
      } else {
        alert(url);
      }
    } catch {
      // usuario canceló → nada
    }
  }

  if (loading)
    return (
      <main className="min-h-screen grid place-items-center">Cargando…</main>
    );
  if (!group)
    return (
      <main className="min-h-screen grid place-items-center">
        Grupo no encontrado
      </main>
    );

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
          <h1 className="font-dmserif text-2xl md:text-4xl">
            Planes de {group.name}
          </h1>
          <Link
            href={`/${"valencia"}/${category}/group/${slug}`}
            className="underline hidden md:inline"
          >
            Volver al grupo
          </Link>
        </header>

        {msg && <p className="mb-3 text-sm">{msg}</p>}

        {events.length === 0 ? (
          <p className="opacity-70">
            No hay eventos todavía. ¡Crea el primero desde el grupo! ✨
          </p>
        ) : (
          <>
            {/* Próximos eventos */}
            {upcoming.length > 0 && (
              <>
                <h2 className="font-dmserif text-xl mb-4">Próximos planes</h2>
                <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {upcoming.map((ev) => {
                    const when = new Date(ev.starts_at);
                    const canDelete =
                      isAdmin || (user && ev.creator_id === user.id);
                    const canApprove = isAdmin && !ev.is_approved;
                    const canEdit = user && ev.creator_id === user.id;
                    const canCancel =
                      isAdmin || (user && ev.creator_id === user.id);
                    const canChangeImage =
                      user && (ev.creator_id === user.id || isAdmin);
                    const going = goingMap[ev.id] === true;
                    const count = countMap[ev.id] ?? 0;
                    const isEditing = editingId === ev.id;

                    return (
                      <li
                        key={ev.id}
                        id={ev.id}
                        className="bg-white rounded-2xl p-4 shadow-md flex flex-col justify-between"
                      >
                        <div>
                          {ev.image_url && (
                            <div className="-mx-4 -mt-4 mb-3 rounded-t-2xl overflow-hidden relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ev.image_url}
                                alt={ev.title}
                                className="w-full h-40 object-cover"
                                onClick={() =>
                                  handleImageClick(
                                    ev.id,
                                    Boolean(canChangeImage)
                                  )
                                }
                                style={{
                                  cursor: canChangeImage ? "pointer" : "default",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleShare(ev)}
                                className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#c197d2] text-white shadow-md hover:opacity-90"
                                aria-label="Compartir plan"
                              >
                                {/* usa tu icono en /public/icons/share-ios.png */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/icons/share-ios.svg"
                                  alt=""
                                  className="w-5 h-5"
                                />
                              </button>
                            </div>
                          )}

                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                className="w-full rounded-xl border p-2 text-sm"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Título"
                              />
                              <textarea
                                className="w-full rounded-xl border p-2 text-sm"
                                rows={3}
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                placeholder="Descripción"
                              />
                              <input
                                className="w-full rounded-xl border p-2 text-sm"
                                value={editLoc}
                                onChange={(e) => setEditLoc(e.target.value)}
                                placeholder="Ubicación"
                              />
                              <input
                                type="datetime-local"
                                className="w-full rounded-xl border p-2 text-sm"
                                value={editWhen}
                                onChange={(e) => setEditWhen(e.target.value)}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{ev.title}</h3>
                                {!ev.is_approved && (
                                  <span className="text-xs border px-2 py-0.5 rounded-full">
                                    Borrador
                                  </span>
                                )}
                                {ev.is_cancelled && (
                                  <span className="text-xs border px-2 py-0.5 rounded-full bg-red-50 border-red-200 text-red-700">
                                    Cancelado
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
                                <div className="text-sm opacity-80 mt-1">
                                  📍 {ev.location}
                                </div>
                              )}
                              {ev.description && (
                                <p className="mt-3 text-sm">
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
                            </>
                          )}
                        </div>

                        <div className="mt-4 space-y-2">
  {/* fila 1: emoji + número / botón Asistiré */}
  <div className="flex items-center justify-between">
    <div className="text-sm opacity-80 flex items-center gap-1">
      <span>👥</span>
      <span>{count}</span>
    </div>

    <button
      onClick={() => toggleGoing(ev.id, ev.is_approved, ev.is_cancelled)}
      disabled={
        busy === `going-${ev.id}` || !ev.is_approved || ev.is_cancelled
      }
      className={`rounded-full px-4 py-1.5 text-sm border shadow-sm hover:opacity-90 ${
        going ? "bg-gcBackgroundAlt2" : "bg-white"
      } ${
        !ev.is_approved || ev.is_cancelled
          ? "opacity-60 cursor-not-allowed"
          : ""
      }`}
      title={
        ev.is_cancelled
          ? "Este plan está cancelado"
          : ev.is_approved
          ? going
            ? "Cancelar asistencia"
            : "Confirmar asistencia"
          : "Pendiente de aprobación"
      }
    >
      {busy === `going-${ev.id}`
        ? "…"
        : ev.is_cancelled
        ? "Cancelado"
        : going
        ? "Ya vas"
        : "Asistiré"}
    </button>
  </div>

  {/* fila 2: Editar / Cancelar / Eliminar (y Aprobar si aplica) */}
  <div className="flex flex-wrap gap-3 justify-end text-sm">
    {isEditing && canEdit ? (
      <>
        <button
          onClick={() => saveEdit(ev.id)}
          disabled={busy === `edit-${ev.id}`}
          className="underline"
        >
          {busy === `edit-${ev.id}` ? "Guardando…" : "Guardar"}
        </button>
        <button
          onClick={() => setEditingId(null)}
          className="underline"
        >
          Cancelar
        </button>
      </>
    ) : (
      <>
        {canEdit && (
          <button
            onClick={() => startEdit(ev)}
            className="underline"
          >
            Editar
          </button>
        )}
        {canCancel && !ev.is_cancelled && (
          <button
            onClick={() => cancelEvent(ev.id)}
            disabled={busy === `cancel-${ev.id}`}
            className="underline"
          >
            {busy === `cancel-${ev.id}` ? "Cancelando…" : "Cancelar plan"}
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => deleteEvent(ev.id)}
            disabled={busy === ev.id}
            className="underline"
          >
            {busy === ev.id ? "Eliminando…" : "Eliminar"}
          </button>
        )}
        {canApprove && (
          <button
            onClick={() => approveEvent(ev.id)}
            disabled={busy === `approve-${ev.id}`}
            className="underline"
          >
            {busy === `approve-${ev.id}` ? "Aprobando…" : "Aprobar"}
          </button>
        )}
      </>
    )}
  </div>
</div>

                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {/* Eventos pasados */}
            {past.length > 0 && (
              <>
                <h2 className="font-dmserif text-xl mb-4">
                  Planes pasados
                </h2>
                <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {past.map((ev) => {
                    const when = new Date(ev.starts_at);
                    const canDelete =
                      isAdmin || (user && ev.creator_id === user.id);
                    const canApprove = isAdmin && !ev.is_approved;
                    const canEdit = user && ev.creator_id === user.id;
                    const canCancel =
                      isAdmin || (user && ev.creator_id === user.id);
                    const canChangeImage =
                      user && (ev.creator_id === user.id || isAdmin);
                    const going = goingMap[ev.id] === true;
                    const count = countMap[ev.id] ?? 0;
                    const isEditing = editingId === ev.id;

                    return (
                      <li
                        key={ev.id}
                        id={ev.id}
                        className="bg-white rounded-2xl p-4 shadow-md flex flex-col justify-between opacity-90"
                      >
                        <div>
                          {ev.image_url && (
  <div className="-mx-4 -mt-4 mb-3 rounded-t-2xl overflow-hidden">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={ev.image_url}
      alt={ev.title}
      className="w-full h-40 object-cover"
      onClick={() =>
        handleImageClick(
          ev.id,
          Boolean(canChangeImage)
        )
      }
      style={{
        cursor: canChangeImage ? "pointer" : "default",
      }}
    />
  </div>
)}


                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                className="w-full rounded-xl border p-2 text-sm"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Título"
                              />
                              <textarea
                                className="w-full rounded-xl border p-2 text-sm"
                                rows={3}
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                placeholder="Descripción"
                              />
                              <input
                                className="w-full rounded-xl border p-2 text-sm"
                                value={editLoc}
                                onChange={(e) => setEditLoc(e.target.value)}
                                placeholder="Ubicación"
                              />
                              <input
                                type="datetime-local"
                                className="w-full rounded-xl border p-2 text-sm"
                                value={editWhen}
                                onChange={(e) => setEditWhen(e.target.value)}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{ev.title}</h3>
                                {!ev.is_approved && (
                                  <span className="text-xs border px-2 py-0.5 rounded-full">
                                    Borrador
                                  </span>
                                )}
                                {ev.is_cancelled && (
                                  <span className="text-xs border px-2 py-0.5 rounded-full bg-red-50 border-red-200 text-red-700">
                                    Cancelado
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
                                <div className="text-sm opacity-80 mt-1">
                                  📍 {ev.location}
                                </div>
                              )}
                              {ev.description && (
                                <p className="mt-3 text-sm">
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
                            </>
                          )}
                        </div>

                        <div className="mt-4 space-y-2">
  {/* fila 1: emoji + número / botón Asistiré */}
  <div className="flex items-center justify-between">
    <div className="text-sm opacity-80 flex items-center gap-1">
      <span>👥</span>
      <span>{count}</span>
    </div>

    <button
      onClick={() => toggleGoing(ev.id, ev.is_approved, ev.is_cancelled)}
      disabled={
        busy === `going-${ev.id}` || !ev.is_approved || ev.is_cancelled
      }
      className={`rounded-full px-4 py-1.5 text-sm border shadow-sm hover:opacity-90 ${
        going ? "bg-gcBackgroundAlt2" : "bg-white"
      } ${
        !ev.is_approved || ev.is_cancelled
          ? "opacity-60 cursor-not-allowed"
          : ""
      }`}
      title={
        ev.is_cancelled
          ? "Este plan está cancelado"
          : ev.is_approved
          ? going
            ? "Cancelar asistencia"
            : "Confirmar asistencia"
          : "Pendiente de aprobación"
      }
    >
      {busy === `going-${ev.id}`
        ? "…"
        : ev.is_cancelled
        ? "Cancelado"
        : going
        ? "Ya vas"
        : "Asistiré"}
    </button>
  </div>

  {/* fila 2: Editar / Cancelar / Eliminar (y Aprobar si aplica) */}
  <div className="flex flex-wrap gap-3 justify-end text-sm">
    {isEditing && canEdit ? (
      <>
        <button
          onClick={() => saveEdit(ev.id)}
          disabled={busy === `edit-${ev.id}`}
          className="underline"
        >
          {busy === `edit-${ev.id}` ? "Guardando…" : "Guardar"}
        </button>
        <button
          onClick={() => setEditingId(null)}
          className="underline"
        >
          Cancelar
        </button>
      </>
    ) : (
      <>
        {canEdit && (
          <button
            onClick={() => startEdit(ev)}
            className="underline"
          >
            Editar
          </button>
        )}
        {canCancel && !ev.is_cancelled && (
          <button
            onClick={() => cancelEvent(ev.id)}
            disabled={busy === `cancel-${ev.id}`}
            className="underline"
          >
            {busy === `cancel-${ev.id}` ? "Cancelando…" : "Cancelar plan"}
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => deleteEvent(ev.id)}
            disabled={busy === ev.id}
            className="underline"
          >
            {busy === ev.id ? "Eliminando…" : "Eliminar"}
          </button>
        )}
        {canApprove && (
          <button
            onClick={() => approveEvent(ev.id)}
            disabled={busy === `approve-${ev.id}`}
            className="underline"
          >
            {busy === `approve-${ev.id}` ? "Aprobando…" : "Aprobar"}
          </button>
        )}
      </>
    )}
  </div>
</div>

                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </>
        )}

        {/* volver al grupo abajo en mobile */}
        <div className="mt-8 md:hidden">
          <Link
            href={`/${"valencia"}/${category}/group/${slug}`}
            className="underline text-sm"
          >
            ← Volver al grupo
          </Link>
        </div>
      </div>

      {/* input oculto para cambiar imagen */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Popup de perfil */}
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
