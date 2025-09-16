"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

/** What we show per 1:1 conversation in the inbox */
type InboxItem = {
  other_id: string;
  other_username: string | null;
  last_text: string | null;
  last_at: string | null;
};

type DirectMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

type ProfileLite = {
  id: string;
  username: string | null;
};

export default function DMInboxPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user || loading) return;

    (async () => {
      setErr("");

      // 1) Get all DMs where I'm the sender OR the recipient
      const { data: dms, error } = await supabase
        .from("direct_messages")
        .select("id,sender_id,recipient_id,body,created_at")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false }); // newest first

      if (error) {
        console.error(error);
        setErr(error.message ?? "No se pudieron cargar los mensajes.");
        return;
      }

      const rows = (dms ?? []) as DirectMessage[];

      // 2) Group by "other user" and keep the latest message per conversation
      const latestByOther: Record<string, { last_text: string; last_at: string }> = {};

      rows.forEach((m) => {
        const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        if (!otherId) return;

        // First time we see this other user, it's already the newest because of ORDER BY desc
        if (!latestByOther[otherId]) {
          latestByOther[otherId] = {
            last_text: m.body,
            last_at: m.created_at,
          };
        }
      });

      const otherIds = Object.keys(latestByOther);
      if (otherIds.length === 0) {
        setItems([]);
        return;
      }

      // 3) Fetch usernames for the "other" users
      const { data: profs, error: pErr } = await supabase
        .from("profiles")
        .select("id,username")
        .in("id", otherIds);

      if (pErr) {
        console.error(pErr);
        // still show conversations without usernames
      }

      const profRows = (profs ?? []) as ProfileLite[];
      const usernameMap: Record<string, string | null> = {};
      profRows.forEach((p) => {
        usernameMap[p.id] = p.username ?? null;
      });

      // 4) Build list and sort by last message desc
      const result: InboxItem[] = otherIds
        .map((oid) => ({
          other_id: oid,
          other_username: usernameMap[oid] ?? null,
          last_text: latestByOther[oid].last_text ?? null,
          last_at: latestByOther[oid].last_at ?? null,
        }))
        .sort((a, b) => (b.last_at ?? "").localeCompare(a.last_at ?? ""));

      setItems(result);
    })();
  }, [user, loading]);

  if (loading) return <main className="min-h-screen grid place-items-center">Cargando…</main>;
  if (!user) return <main className="min-h-screen grid place-items-center">Inicia sesión</main>;

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-dmserif text-3xl mb-4">Mensajes</h1>

        {err && <p className="text-red-600 mb-3">{err}</p>}

        {items.length === 0 ? (
          <p className="opacity-70">
            No hay conversaciones todavía. ¡Escribe a alguien desde su perfil o un mensaje del grupo!
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => {
              const uname = it.other_username ?? "usuario";
              return (
                <li
                  key={it.other_id}
                  className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">@{uname}</div>
                    <div className="text-sm opacity-70 truncate max-w-[60ch]">
                      {it.last_text ?? "—"}
                    </div>
                  </div>
                  <Link
                    href={`/dm/${encodeURIComponent(uname)}`}
                    className="underline"
                    title={`Abrir chat con @${uname}`}
                  >
                    Abrir
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
