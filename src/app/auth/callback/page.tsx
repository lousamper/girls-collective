// src/app/auth/callback/page.tsx
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
        // 1) Intercambia el code por sesión
        const code = params.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.warn("exchangeCodeForSession(code):", error.message);
        } else if (typeof window !== "undefined") {
          // fallback por si el provider devuelve todo en la URL
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) console.warn("exchangeCodeForSession(url):", error.message);
        }

        // 2) Obtén usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) router.replace("/auth");
          return;
        }

        // 3) Comprueba si el perfil está completo
        const { data: profile, error: profErr } = await supabase
          .from("profiles")
          .select("username, city_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profErr) {
          console.warn("profiles check:", profErr.message);
        }

        const incomplete = !profile || !profile.username || !profile.city_id;

        // 4) Redirige según estado del perfil
        if (!cancelled) {
          router.replace(incomplete ? "/setup-profile" : "/find-your-city");
        }
      } catch (e) {
        console.warn("auth callback error:", e);
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


