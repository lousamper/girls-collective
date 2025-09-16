"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, city_id")
        .eq("id", user.id)
        .maybeSingle();

      const incomplete = !data || !data.username || !data.city_id;
      router.push(incomplete ? "/setup-profile" : "/find-your-city");
    })();
  }, [user, router]);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        Cargando…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText flex flex-col items-center justify-center font-montserrat px-4">
      {!user ? (
        <Dialog defaultOpen>
          <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <AuthForm />
          </DialogContent>
        </Dialog>
      ) : (
        <p>Redirigiendo…</p>
      )}
    </main>
  );
}

