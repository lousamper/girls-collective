// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const RAW = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.girls-collective.com").trim();
const SITE = RAW.replace(/\/+$/, ""); // strip trailing slash

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // --- Static, high-value pages (keep adding here as needed) ---
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
      url: `${SITE}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // --- Dynamic: city/category pages ---
  let combos: MetadataRoute.Sitemap = [];

  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

    // get city slugs (fallback to ["valencia"] if none)
    const { data: citiesData, error: citiesErr } = await supabase
      .from("cities")
      .select("slug")
      .order("name", { ascending: true });

    if (citiesErr) {
      // swallow and continue with fallback
      // console.warn("sitemap: cities error", citiesErr);
    }

    const citySlugs =
      (citiesData?.map((c) => c.slug).filter(Boolean) as string[]) || ["valencia"];

    // get category slugs (if none, we won't create combos)
    const { data: catsData, error: catsErr } = await supabase
      .from("categories")
      .select("slug")
      .order("name", { ascending: true });

    if (catsErr) {
      // console.warn("sitemap: categories error", catsErr);
    }

    const catSlugs = (catsData?.map((c) => c.slug).filter(Boolean) as string[]) || [];

    // build /{city}/{category} URLs
    combos = citySlugs.flatMap<MetadataRoute.Sitemap[number]>((city) =>
      catSlugs.map((cat) => ({
        url: `${SITE}/${encodeURIComponent(city)}/${encodeURIComponent(cat)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      })),
    );
  } catch {
    // on any unexpected error, just return statics
    combos = [];
  }

  return [...staticRoutes, ...combos];
}
