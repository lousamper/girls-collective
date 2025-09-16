// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    (async () => {
      try {
        const code = params.get("code");
        if (code) {
          // ✅ expects a string, not { code }
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.warn("exchangeCodeForSession:", error.message);
        } else if (typeof window !== "undefined") {
          // some providers include everything in the URL — also valid
          await supabase.auth.exchangeCodeForSession(window.location.href);
        }
      } finally {
        router.replace("/auth");
      }
    })();
  }, [params, router]);

  return (
    <main className="min-h-screen bg-gcBackground text-gcText grid place-items-center">
      Completando acceso…
    </main>
  );
}

