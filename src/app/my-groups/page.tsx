"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { ArrowRight } from "lucide-react";

type GroupRow = {
  id: string;
  slug: string;
  name: string;
  city_id: string;
  category_id: string;
};

type City = { id: string; slug: string };
type Category = { id: string; slug: string };

export const dynamic = "force-dynamic";

export default function MyGroupsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [cityMap, setCityMap] = useState<Record<string, string>>({});
  const [catMap, setCatMap] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    (async () => {
      setBusy(true);

      // 1) get group_ids the user follows
      const { data: mem, error: mErr } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("profile_id", user.id);

      if (mErr) {
        console.error(mErr);
        setGroups([]);
        setBusy(false);
        return;
      }
      const ids = (mem ?? []).map((m) => m.group_id);
      if (!ids.length) {
        setGroups([]);
        setBusy(false);
        return;
      }

      // 2) groups
      const { data: gRows, error: gErr } = await supabase
        .from("groups")
        .select("id, slug, name, city_id, category_id")
        .in("id", ids)
        .order("name", { ascending: true });

      if (gErr) {
        console.error(gErr);
        setGroups([]);
        setBusy(false);
        return;
      }
      setGroups(gRows ?? []);

      // 3) city + category slugs for link building
      const cityIds = Array.from(new Set((gRows ?? []).map((g) => g.city_id)));
      const catIds = Array.from(new Set((gRows ?? []).map((g) => g.category_id)));

      const [{ data: cities }, { data: cats }] = await Promise.all([
        supabase.from("cities").select("id, slug").in("id", cityIds),
        supabase.from("categories").select("id, slug").in("id", catIds),
      ]);

      const cityDict: Record<string, string> = {};
      (cities as City[] | null)?.forEach((c) => (cityDict[c.id] = c.slug));
      setCityMap(cityDict);

      const catDict: Record<string, string> = {};
      (cats as Category[] | null)?.forEach((c) => (catDict[c.id] = c.slug));
      setCatMap(catDict);

      setBusy(false);
    })();
  }, [user, loading, router]);

  if (loading || busy) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        Cargando tus grupos…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-dmserif text-3xl">Mis grupos</h1>
          <Link
            href="/find-your-city"
            className="rounded-full border bg-white px-4 py-1.5 text-sm shadow-sm hover:opacity-90"
          >
            Explorar ciudades
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="opacity-80">
              Aún no sigues ningún grupo.{" "}
              <Link className="underline" href="/find-your-city">
                Encuentra tu ciudad
              </Link>{" "}
              y únete.
            </p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => {
              const citySlug = cityMap[g.city_id];
              const catSlug = catMap[g.category_id];
              const href =
                citySlug && catSlug
                  ? `/${citySlug}/${catSlug}/group/${g.slug}`
                  : undefined;

              return (
                <li key={g.id} className="rounded-2xl bg-white p-5 shadow-sm border">
                  {/* Header row: name left, arrow button right */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-lg">{g.name}</h3>
                    <div className="shrink-0">
                      {href ? (
                        <Link
                          href={href}
                          aria-label={`Entrar a ${g.name}`}
                          className="rounded-full bg-[#50415b] text-[#fef8f4] p-2.5 shadow-md hover:opacity-90 inline-flex"
                          title="Entrar al grupo"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      ) : (
                        <span className="opacity-60 text-sm">—</span>
                      )}
                    </div>
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
