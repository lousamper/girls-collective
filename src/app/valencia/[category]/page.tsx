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

type GroupRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
};

type PromoCard = { img: string; url: string };

const CATEGORY_COPY: Record<string, { title: string }> = {
  arte: { title: "Explora tu lado más creativo" },
  foodies: { title: "Saborea la ciudad" },
  wellness: { title: "Conecta con tu bienestar" },
  "deporte-y-movimiento": { title: "Muévete a tu ritmo" },
  gaming: { title: "Juega y conéctate" },
  nightlife: { title: "Planes & bailes" },
  viajes: { title: "Organiza nuevas aventuras" },
  emprendedoras: { title: "Profesionales & Emprendedoras" },
  naturaleza: { title: "Vive tu lado más outdoor" },
};

const DEMO_EVENTS: Record<string, PromoCard[]> = {
  arte: [{ img: "/events/arte/event-1.jpg", url: "https://example.com/event-1" }],
};

const DEMO_PLACES: Record<string, PromoCard[]> = {
  arte: [{ img: "/places/arte/place-1.jpg", url: "https://example.com/place-1" }],
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

  const [open, setOpen] = useState(false);
  const [gName, setGName] = useState("");
  const [gDesc, setGDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  const meta = CATEGORY_COPY[category] ?? { title: "Explora esta categoría" };

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

      if (!city?.id || !cat?.id) throw new Error("Ciudad o categoría no encontrada.");

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

      setSubmitMsg("¡Gracias! Revisaremos tu grupo y lo publicaremos si todo está OK.");
      setGName("");
      setGDesc("");
      setOpen(false);
      fetchGroups();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "No se pudo crear el grupo.";
      setSubmitMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        Cargando…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-dmserif text-3xl md:text-4xl mb-3">{meta.title}</h1>
          <p className="max-w-3xl text-base md:text-lg leading-relaxed">
            Ya sea que quieras unirte a un grupo ya creado o iniciar uno nuevo,
            aquí puedes hacerlo a tu ritmo, sin presiones. Conecta desde lo que te
            inspira, propone planes o simplemente mira qué está pasando cerca de ti. 
            <br />
            <br />
            Dentro podrás filtrar por <u>ubicaciones o por edades</u> si así lo prefieres.
            <br />
            Sigue los grupos que quieras para poder verlos en tu cuenta.
          </p>
        </header>

        {/* GROUPS rail */}
        <section className="mb-10 relative">
          <button
            aria-label="Anterior"
            onClick={() => scroll(groupsRef, -360)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 hover:opacity-80"
          >
            <ChevronLeft className="w-8 h-8 text-[#fffacd]" />
          </button>
          <button
            aria-label="Siguiente"
            onClick={() => scroll(groupsRef, 360)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 hover:opacity-80"
          >
            <ChevronRight className="w-8 h-8 text-[#fffacd]" />
          </button>

          <div
            ref={groupsRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-10 pb-2 no-scrollbar"
          >
            {loadingGroups && <div className="py-8 opacity-70">Cargando grupos…</div>}
            {!loadingGroups && groups.length === 0 && (
              <div className="py-8 opacity-70">Aún no hay grupos aprobados en esta categoría.</div>
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
              Solicitar un nuevo grupo
            </button>
          </div>
        </section>

        {/* EVENTS — now always visible, with the new link card first */}
        <section className="mb-10">
          <h2 className="font-dmserif text-2xl mb-4">Eventos relacionados</h2>
          <div
            ref={eventsRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 no-scrollbar"
          >
            {/* NUEVA TARJETA: eventos de tus grupos seguidos (categoría actual) */}
            <Link
              href={`/valencia/${category}/events`}
              className="relative shrink-0 w/[300px] w-[300px] snap-start rounded-2xl overflow-hidden shadow-md hover:scale-[1.02] transition"
              title="Eventos de tus grupos seguidos"
            >
              <div className="relative w-full" style={{ paddingTop: "66.66%" }}>
                <Image
                  src="/events/community-followed.jpg"
                  alt="Eventos de tus grupos seguidos"
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
                title="Evento"
              >
                <div className="relative w-full" style={{ paddingTop: "66.66%" }}>
                  <Image src={ev.img} alt="Evento" fill className="object-cover" sizes="300px" />
                </div>
              </a>
            ))}
          </div>
          <div className="mt-4 text-left px-1">
            <a
              href="mailto:contact@girls-collective.com?subject=Promocionar%20evento"
              className="underline"
            >
              Me gustaría promocionar un evento
            </a>
          </div>
        </section>

        {/* PLACES */}
        {places.length > 0 && (
          <section className="mb-4">
            <h2 className="font-dmserif text-2xl mb-4">Lugares que van con la vibra</h2>
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
                  title="Lugar"
                >
                  <div className="relative w-full" style={{ paddingTop: "66.66%" }}>
                    <Image src={pl.img} alt="Lugar" fill className="object-cover" sizes="300px" />
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-4 text-left px-1">
              <a
                href="mailto:contact@girls-collective.com?subject=Promocionar%20lugar"
                className="underline"
              >
                Me gustaría promocionar un lugar
              </a>
            </div>
          </section>
        )}
      </div>

      {/* Crear Grupo Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-dmserif text-gcText">Crear grupo</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Propón un nuevo grupo para esta categoría. Lo revisaremos antes de publicarlo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroup} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Nombre del grupo *</label>
              <input
                className="w-full rounded-xl border p-3"
                value={gName}
                onChange={(e) => setGName(e.target.value)}
                placeholder="Ej: Art in the park"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Descripción (opcional)</label>
              <textarea
                className="w-full rounded-xl border p-3"
                rows={3}
                value={gDesc}
                onChange={(e) => setGDesc(e.target.value)}
                placeholder="Cuéntanos de qué va el grupo"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Enviando…" : "Enviar propuesta"}
            </button>

            {submitMsg && <p className="text-sm mt-2">{submitMsg}</p>}
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}





