// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://www.girls-collective.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth", "/auth/*", "/setup-profile", "/dm", "/api/*"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}