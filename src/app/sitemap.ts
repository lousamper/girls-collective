import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const RAW = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.girls-collective.com").trim();
const SITE = RAW.replace(/\/+$/, ""); // strip trailing slash

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // --- Rutas estáticas de alto valor ---
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE}/find-your-city`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE}/community-guidelines`, // añade la nueva página
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let combos: MetadataRoute.Sitemap = [];

  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

    // 1) Solo ciudades activas
    const { data: citiesData /*, error: citiesErr */ } = await supabase
      .from("cities")
      .select("slug,is_active")
      .eq("is_active", true)
      .order("name", { ascending: true });

    const activeCitySlugs =
      (citiesData?.filter((c) => c.is_active).map((c) => c.slug).filter(Boolean) as string[]) ||
      [];

    // Si no hay ciudades activas, devolvemos solo estáticas
    if (activeCitySlugs.length === 0) {
      return staticRoutes;
    }

    // 2) Categorías disponibles (si no hay, no generamos combos)
    const { data: catsData /*, error: catsErr */ } = await supabase
      .from("categories")
      .select("slug")
      .order("name", { ascending: true });

    const catSlugs = (catsData?.map((c) => c.slug).filter(Boolean) as string[]) || [];

    if (catSlugs.length === 0) {
      return staticRoutes;
    }

    // 3) Construimos solo {city activa} × {category}
    combos = activeCitySlugs.flatMap<MetadataRoute.Sitemap[number]>((city) =>
      catSlugs.map((cat) => ({
        url: `${SITE}/${encodeURIComponent(city)}/${encodeURIComponent(cat)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      })),
    );
  } catch {
    // Si algo falla, devolvemos solo las rutas estáticas (no rompe nada)
    combos = [];
  }

  return [...staticRoutes, ...combos];
}
