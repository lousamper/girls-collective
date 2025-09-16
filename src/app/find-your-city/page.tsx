"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PostgrestError } from "@supabase/supabase-js";

type City = { id: string; name: string; slug: string; is_active: boolean; soon?: boolean };

export default function FindYourCityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [cities, setCities] = useState<City[]>([]);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [cityInput, setCityInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cities")
        .select("id,name,slug,is_active")
        .order("name")
        .returns<Array<Omit<City, "soon">>>(); // type the rows we expect

      if (data) {
        const soonSlugs = new Set(["madrid", "santander", "sevilla"]);

        const sorted = [...data].sort((a, b) => {
          if (a.slug === "valencia" && b.slug !== "valencia") return -1;
          if (b.slug === "valencia" && a.slug !== "valencia") return 1;
          if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
          return a.name.localeCompare(b.name, "es");
        });

        setCities(
          sorted.map((c) => ({
            ...c,
            soon: soonSlugs.has(c.slug),
          }))
        );
      }
    })();
  }, []);

  function scrollLeft() {
    railRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  }
  function scrollRight() {
    railRef.current?.scrollBy({ left: 360, behavior: "smooth" });
  }

  async function handleChooseCity(city: City) {
    if (!user) return;

    if (city.slug === "valencia") {
      router.push("/valencia");
      return;
    }

    setCityInput(city.name);
    const el = document.getElementById("waitlist-city") as HTMLInputElement | null;
    el?.focus();
  }

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSuccess("");
    setError("");

    try {
      const { error } = await supabase.from("city_waitlist").insert({
        city_name: cityInput.trim(),
        email: emailInput.trim(),
      });

      const pgErr = error as PostgrestError | null;

      if (pgErr) {
        if (pgErr.code === "23505") {
          setSuccess("¡Genial! Ya estabas en la lista para esa ciudad 💌");
          setCityInput("");
          setEmailInput("");
        } else {
          console.error("Insert error:", pgErr);
          setError("Error al enviar. Inténtalo de nuevo.");
        }
      } else {
        setSuccess("¡Gracias! Te avisaremos cuando tu ciudad esté disponible 💌");
        setCityInput("");
        setEmailInput("");
      }
    } finally {
      setSending(false);
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center">Cargando…</div>;
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-dmserif text-center mb-8">Find your city</h1>

        {/* Horizontal carousel */}
        <div className="relative">
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
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleChooseCity(city)}
                className="relative shrink-0 w-[260px] snap-start rounded-[30px] overflow-hidden shadow-lg hover:scale-[1.02] transition"
                title={city.name}
              >
                <div className="relative w-full" style={{ paddingTop: "125%" }}>
                  <img
                    src={`/cities/${city.slug}.jpg`}
                    alt={city.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {city.soon && (
                    <div className="absolute top-3 right-3 bg-gcCTA text-gcText text-xs font-bold px-2 py-1 rounded-full shadow">
                      SOON
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Waitlist form */}
        <div className="mt-12 max-w-md mx-auto text-center">
          <p className="mb-6 leading-relaxed">
            ¿No encuentras tu ciudad? <br />
            No te preocupes, déjanos tu correo y te avisaremos una vez que esté disponible 💌
          </p>

          <form
            onSubmit={handleWaitlistSubmit}
            className="bg-white/90 rounded-2xl p-6 shadow-md flex flex-col gap-4"
          >
            <div className="text-left">
              <label htmlFor="waitlist-city" className="block text-sm mb-1">
                Tu ciudad:
              </label>
              <input
                id="waitlist-city"
                type="text"
                className="w-full rounded-xl border p-3"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Ej: Sevilla"
                required
              />
            </div>

            <div className="text-left">
              <label htmlFor="waitlist-email" className="block text-sm mb-1">
                Tu correo:
              </label>
              <input
                id="waitlist-email"
                type="email"
                className="w-full rounded-xl border p-3"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="tucorreo@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {sending ? "Enviando…" : "¡únete a la lista de espera!"}
            </button>

            {success && <p className="text-green-700 text-sm">{success}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}
