"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Category = { id: string; name: string; slug: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, "y")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ValenciaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("categories").select("id,name").order("name");
      if (data) {
        const mapped = data
          .map((c) => ({ id: c.id, name: c.name, slug: slugify(c.name) }))
          // 3) hide "otro" from the carousel
          .filter((c) => c.slug !== "otro" && c.name.toLowerCase() !== "otro");
        setCategories(mapped);
      }
    })();
  }, []);

  function scrollLeft() {
    railRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  }
  function scrollRight() {
    railRef.current?.scrollBy({ left: 360, behavior: "smooth" });
  }

  function handleChooseCategory(slug: string) {
    router.push(`/valencia/${slug}`);
  }

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center">Cargando…</div>;
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      {/* HERO IMAGE */}
      {/* Mobile: show full image scaled to screen width (no crop). */}
      {/* Desktop: same as before (cover, fixed viewport height). */}
      <section className="w-full">
        {/* Mobile-only hero (no cropping, fits width) */}
        <img
          src="/cities/valencia-hero.jpg"
          alt="Valencia"
          className="block md:hidden w-screen h-auto"
        />
        {/* Desktop/Tablet hero (unchanged) */}
        <div className="relative hidden md:block w-full h-[70vh]">
          <img
            src="/cities/valencia-hero.jpg"
            alt="Valencia"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      {/* INTRO TEXT BELOW HERO */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        {/* 2) Make this the same size as “Encuentra tu tribu” */}
        <h1 className="text-2xl md:text-4xl font-dmserif mb-6 leading-tight">
          ¿Recién llegada a Valencia? <br />
          ¿O con ganas de reconectar con la ciudad?
        </h1>
        <p className="text-base md:text-lg leading-normal md:leading-relaxed">
          Este es tu espacio para encontrar nuevas amigas, compartir intereses y crear
          planes que de verdad te llenen. <br /><br />
          Aquí tú tienes el control 🤝 <br />
          Puedes crear el grupo, proponer planes o simplemente
          unirte a los grupos ya creados que vibren con lo que te gusta. <br /><br />
          ¡Elige la categoría que más resuene contigo y empieza a construir comunidad!
          <br />
          A tu ritmo, a tu manera.
        </p>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl md:text-4xl font-dmserif text-center mb-8">
          Encuentra tu tribu
        </h2>

        <div className="relative">
          {/* Arrows (CTA yellow) */}
          <button
            aria-label="Anterior"
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-[#fffacd] hover:scale-110 transition"
          >
            <ChevronLeft size={40} strokeWidth={2.5} />
          </button>
          <button
            aria-label="Siguiente"
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-[#fffacd] hover:scale-110 transition"
          >
            <ChevronRight size={40} strokeWidth={2.5} />
          </button>

          <div
            ref={railRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-10 py-2 no-scrollbar"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleChooseCategory(cat.slug)}
                className="relative shrink-0 w-[260px] snap-start rounded-[30px] overflow-hidden shadow-lg hover:scale-[1.02] transition"
                title={cat.name}
              >
                {/* 1) clean image only (no title overlay or label under it) */}
                <div className="relative w-full" style={{ paddingTop: "125%" }}>
                  <img
                    src={`/categories/${cat.slug}.jpg`}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
