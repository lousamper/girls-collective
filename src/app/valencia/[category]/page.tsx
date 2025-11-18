"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// i18n
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

type GroupRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
};

type PromoCard = { img: string; url: string };

const CATEGORY_COPY: Record<string, { title: string }> = {
  arte: { title: "Inspírate y explora tu lado más creativo" },
  foodies: { title: "Saborea la ciudad" },
  wellness: { title: "Conecta con tu bienestar" },
  "deporte-y-movimiento": { title: "Muévete a tu ritmo" },
  gaming: { title: "Encuentra compañeras de gaming" },
  nightlife: { title: "EL plan del plan del plan" },
  viajes: { title: "A por nuevas aventuras" },
  emprendedoras: { title: "Desconecta e inspírate con nuevas ideas" },
  naturaleza: { title: "Vive tu lado más outdoor" },
};

const DEMO_EVENTS: Record<string, PromoCard[]> = {
  arte: [{ img: "/events/arte/event-1.jpg", url: "https://www.instagram.com/antesydespues.estudio" }],
  "deporte-y-movimiento": [{ img: "/events/deporte-y-movimiento/event-1.jpg", url: "https://onfitt.es/onfitt-presencial/" }],
};

const DEMO_PLACES: Record<string, PromoCard[]> = {
  arte: [{ img: "/places/arte/place-1.jpg", url: "https://www.elmolilab.com/" },{ img: "/places/arte/place-2.jpg", url: "https://theespanista.com/" }],
  wellness: [{ img: "/places/wellness/place-1.jpg", url: "https://www.suavestudio.eu/" }],
  emprendedoras: [{ img: "/places/emprendedoras/place-1.jpg", url: "https://llumcoworking.com/" }],
  foodies: [{ img: "/places/foodies/place-1.jpg", url: "https://astralcafebar.es/" }],
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  // i18n setup
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => {
    setLang(getLang());
  }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  const [open, setOpen] = useState(false);
  const [gName, setGName] = useState("");
  const [gDesc, setGDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  const meta = CATEGORY_COPY[category] ?? { title: t("category.meta.defaultTitle", "Explora esta categoría") };

  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // TS non-null to avoid complaints
  const groupsRef = useRef<HTMLDivElement>(null!);
  const eventsRef = useRef<HTMLDivElement>(null!);
  const placesRef = useRef<HTMLDivElement>(null!);

  function scroll(ref: React.RefObject<HTMLDivElement>, dx: number) {
    ref.current?.scrollBy({ left: dx, behavior: "smooth" });
  }

  async function fetchGroups() {
    if (!user) return;
    setLoadingGroups(true);
    try {
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

      if (!city?.id || !cat?.id) {
        setGroups([]);
        setLoadingGroups(false);
        return;
      }

      const { data: rows, error } = await supabase
        .from("groups")
        .select("id, slug, name, description, cover_image_url")
        .eq("city_id", city.id)
        .eq("category_id", cat.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGroups(rows ?? []);
    } catch (e) {
      console.error(e);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, category]);

  const events = useMemo(() => DEMO_EVENTS[category] ?? [], [category]);
  const places = useMemo(() => DEMO_PLACES[category] ?? [], [category]);

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSubmitMsg("");

    try {
      const { data: city } = await supabase
        .from("cities")
        .select("id, slug")
        .eq("slug", "valencia")
        .maybeSingle();

      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category)
        .maybeSingle();

      if (!city?.id || !cat?.id) throw new Error(t("category.errors.cityOrCatMissing", "Ciudad o categoría no encontrada."));

      const newSlug = slugify(gName);

      const { error: insErr } = await supabase.from("groups").insert({
        city_id: city.id,
        category_id: cat.id,
        slug: newSlug,
        name: gName.trim(),
        description: gDesc.trim() || null,
        cover_image_url: null,
        creator_id: user.id,
        is_approved: false,
      });
      if (insErr) throw insErr;

      setSubmitMsg(t("category.create.thanks", "¡Gracias! Revisaremos tu grupo y lo publicaremos si todo está OK."));
      setGName("");
      setGDesc("");
      setOpen(false);
      fetchGroups();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("category.create.fail", "No se pudo crear el grupo.");
      setSubmitMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        {t("common.misc.loading", "Cargando…")}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          {/* title left, back link right */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-dmserif text-2xl md:text-3xl m-0 text-left md:text-left">{meta.title}</h1>
            <Link
              href="/valencia"
              className="ml-auto hidden md:block text-xs md:text-sm underline underline-offset-2 hover:opacity-80"
            >
              {t("category.back", "← Volver")}
            </Link>
          </div>

          <p className="max-w-3xl text-[0.95rem] md:text-[1.05rem] leading-[1.35] md:leading-[1.4] text-left md:text-left mt-1">
            {t(
              "category.intro.l1",
              "Encuentra los grupos que resuenan contigo… o crea uno tú misma."
            )}
            <br />
            {t(
              "category.intro.l4",
              "Filtra por "
            )}
            <u>{t("category.intro.l5u1", "ubicación o edad")}</u>{" "}
            {t(
              "category.intro.l6",
              ", sigue tus favoritos y descubre qué está pasando cerca de ti."
            )}
          </p>
        </header>

        {/* GROUPS rail */}
        <section className="mb-10 relative">
          <button
            aria-label={t("common.prev", "Anterior")}
            onClick={() => scroll(groupsRef, -360)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 hover:opacity-80"
          >
            <ChevronLeft className="w-8 h-8 text-[#fffacd]" />
          </button>
          <button
            aria-label={t("common.next", "Siguiente")}
            onClick={() => scroll(groupsRef, 360)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 hover:opacity-80"
          >
            <ChevronRight className="w-8 h-8 text-[#fffacd]" />
          </button>

          <div
            ref={groupsRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-10 pb-2 no-scrollbar"
          >
            {loadingGroups && (
              <div className="py-8 opacity-70">
                {t("category.groups.loading", "Cargando grupos…")}
              </div>
            )}
            {!loadingGroups && groups.length === 0 && (
              <div className="py-8 opacity-70">
                {t("category.groups.none", "Aún no hay grupos aprobados en esta categoría.")}
              </div>
            )}

            {!loadingGroups &&
              groups.map((g) => (
                <Link
                  key={g.id}
                  href={`/valencia/${category}/group/${g.slug}`}
                  className="relative shrink-0 w-[260px] snap-start rounded-[2rem] overflow-hidden shadow-lg hover:scale-[1.02] transition"
                >
                  <div className="relative w-full" style={{ paddingTop: "125%" }}>
                    <Image
                      src={g.cover_image_url || "/placeholder-group.jpg"}
                      alt={g.name}
                      fill
                      className="object-cover"
                      sizes="260px"
                    />
                  </div>
                </Link>
              ))}
          </div>

          <div className="mt-4 text-left px-1">
            <button onClick={() => setOpen(true)} className="underline">
              {t("category.create.cta", "Solicitar un nuevo grupo")}
            </button>
          </div>
        </section>

        {/* EVENTS — now always visible, with the new link card first */}
        <section className="mb-10">
          <h2 className="font-dmserif text-2xl mb-4">
            {t("category.events.title", "Planes relacionados")}
          </h2>
          <div
            ref={eventsRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 no-scrollbar"
          >
            {/* NUEVA TARJETA: eventos de tus grupos seguidos (categoría actual) */}
            <Link
              href={`/valencia/${category}/events`}
              className="relative shrink-0 w/[300px] w-[300px] snap-start rounded-2xl overflow-hidden shadow-md hover:scale-[1.02] transition"
              title={t("category.events.followedTitle", "Eventos de tus grupos seguidos")}
            >
              <div className="relative w-full" style={{ paddingTop: "66.66%" }}>
                <Image
                  src="/events/community-followed.jpg"
                  alt={t("category.events.followedAlt", "Eventos de tus grupos seguidos")}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            </Link>

            {/* Cards demo */}
            {events.map((ev, idx) => (
              <a
                key={idx}
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative shrink-0 w-[300px] snap-start rounded-2xl overflow-hidden shadow-md hover:scale-[1.02] transition"
                title={t("category.events.cardTitle", "Evento")}
              >
                <div className="relative w-full" style={{ paddingTop: "66.66%" }}>
                  <Image
                    src={ev.img}
                    alt={t("category.events.cardAlt", "Evento")}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              </a>
            ))}
          </div>
          <div className="mt-4 text-left px-1">
            <a
              href="mailto:contact@girls-collective.com?subject=Promocionar%20evento"
              className="underline"
            >
              {t("category.events.promote", "Me gustaría promocionar un evento")}
            </a>
          </div>
        </section>

        {/* PLACES */}
        {places.length > 0 && (
          <section className="mb-4">
            <h2 className="font-dmserif text-2xl mb-4">
              {t("category.places.title", "Lugares que van con la vibra")}
            </h2>
            <div
              ref={placesRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 no-scrollbar"
            >
              {places.map((pl, idx) => (
                <a
                  key={idx}
                  href={pl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative shrink-0 w-[300px] snap-start rounded-2xl overflow-hidden shadow-md hover:scale-[1.02] transition"
                  title={t("category.places.cardTitle", "Lugar")}
                >
                  <div className="relative w-full" style={{ paddingTop: "66.66%" }}>
                    <Image
                      src={pl.img}
                      alt={t("category.places.cardAlt", "Lugar")}
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-4 text-left px-1">
              <a
                href="mailto:contact@girls-collective.com?subject=Promocionar%20lugar"
                className="underline"
              >
                {t("category.places.promote", "Me gustaría promocionar un lugar")}
              </a>
            </div>
          </section>
        )}

        {/* Volver (solo mobile, al final de la página) */}
        <div className="mt-8 md:hidden text-left">
          <button
            onClick={() => router.push("/valencia")}
            className="text-xs underline underline-offset-2 hover:opacity-80"
          >
            {t("category.back", "← Volver")}
          </button>
        </div>
      </div>

      {/* Crear Grupo Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-dmserif text-gcText">
              {t("category.create.title", "Crear grupo")}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {t(
                "category.create.description",
                "Propón un nuevo grupo para esta categoría. Lo revisaremos antes de publicarlo."
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroup} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">
                {t("category.create.nameLabel", "Nombre del grupo *")}
              </label>
              <input
                className="w-full rounded-xl border p-3"
                value={gName}
                onChange={(e) => setGName(e.target.value)}
                placeholder={t("category.create.namePh", "Ej: Art in the park")}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                {t("category.create.descLabel", "Descripción (opcional")}
              </label>
              <textarea
                className="w-full rounded-xl border p-3"
                rows={3}
                value={gDesc}
                onChange={(e) => setGDesc(e.target.value)}
                placeholder={t("category.create.descPh", "Cuéntanos de qué va el grupo")}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {submitting
                ? t("category.create.sending", "Enviando…")
                : t("category.create.submit", "Enviar propuesta")}
            </button>

            {submitMsg && <p className="text-sm mt-2">{submitMsg}</p>}
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

