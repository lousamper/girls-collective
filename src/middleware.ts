// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ASSET_EXT = /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|txt|xml|css|js|map|woff2?|ttf|otf|mp4|webm|mp3)$/i;

export function middleware(req: NextRequest) {
  const enabled = process.env.NEXT_PUBLIC_COMING_SOON === "1";
  if (!enabled) return NextResponse.next();

  const { pathname, searchParams } = req.nextUrl;

  // Let assets and Next internals pass
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    ASSET_EXT.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Allowlist of routes that should still work
  const allow = [
    "/coming-soon",
    "/auth",
    "/auth/forgot",
    "/auth/reset",
    "/auth/callback",
    "/api",
    "/robots.txt",
    "/sitemap.xml",
  ];
  if (allow.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Preview bypass: add ?preview=1 once to set a cookie in this browser
  const cookie = req.cookies.get("gc_preview")?.value;
  const preview = searchParams.get("preview");
  if (cookie === "1" || preview === "1") {
    const res = NextResponse.next();
    if (preview === "1") res.cookies.set("gc_preview", "1", { path: "/", maxAge: 60 * 60 * 24 });
    return res;
  }

  // Rewrite everything else to /coming-soon
  const url = req.nextUrl.clone();
  url.pathname = "/coming-soon";
  url.search = "";
  return NextResponse.rewrite(url);
}

// Match everything; filtering happens above.
export const config = { matcher: ["/:path*"] };
