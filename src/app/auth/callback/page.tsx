"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Evita el prerender en build
export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gcBackground text-gcText grid place-items-center">
          Procesando autenticación…
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const code = params.get("code");
        if (code) {
          // espera un string
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.warn("exchangeCodeForSession:", error.message);
        } else if (typeof window !== "undefined") {
          // algunos providers devuelven todo en la URL
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) console.warn("exchangeCodeForSession(url):", error.message);
        }
      } finally {
        if (!cancelled) router.replace("/auth");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <main className="min-h-screen bg-gcBackground text-gcText grid place-items-center">
      Completando acceso…
    </main>
  );
}


