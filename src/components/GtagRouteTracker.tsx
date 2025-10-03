// src/components/GtagRouteTracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GtagRouteTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || !("gtag" in window) || !window.gtag || !measurementId) {
      return;
    }

    const query = searchParams?.toString();
    const url = pathname + (query ? `?${query}` : "");

    // Send SPA-safe page_view
    window.gtag("event", "page_view", {
      page_location: window.location.origin + url,
      page_path: pathname,
      page_title: document?.title || "",
      send_to: measurementId,
    });
  }, [pathname, searchParams, measurementId]);

  return null;
}

