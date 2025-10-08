// src/app/robots.ts
import type { MetadataRoute } from "next";

const RAW = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.girls-collective.com").trim();
const SITE = RAW.replace(/\/+$/, ""); // no trailing slash

export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE,
    sitemap: `${SITE}/sitemap.xml`,
    rules: [
      // Generic rule for all crawlers (search engines, etc.)
      {
        userAgent: "*",
        allow: ["/", "/favicon.ico", "/og.jpg"],
        disallow: [
          // auth & account flows
          "/auth",
          "/auth/*",
          "/setup-profile",
          "/setup-profile/*",

          // internal/system
          "/api/*",
          "/_next/*",

          // soft-gating pages
          "/coming-soon",

          // admin/moderation (if any)
          "/admin/*",
        ],
      },

      // LLM / AI crawlers — explicitly allowed
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
    ],
  };
}
