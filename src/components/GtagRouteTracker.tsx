"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// type gtag so TS is happy even if GA is blocked
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires GA4 page_view on client-side route changes (App Router).
 * Skips the very first render to avoid double-counting the server-loaded pageview.
 */
export default function GtagRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRender = useRef(true);

  useEffect(() => {
    // Build full URL for page_location
    const url = typeof window !== "undefined"
      ? window.location.href
      : `${pathname}${searchParams?.toString() ? `?${searchParams}` : ""}`;

    // Skip first render: GA 'config' already sent initial page_view
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    window.gtag?.("event", "page_view", {
      page_location: url,
      page_path: pathname,
      page_title: document.title || undefined,
    });
  }, [pathname, searchParams]);

  return null;
}

