"use client";

import { useEffect, useRef, useState, use } from "react";
import { useAuth } from "@/lib/auth";
import { getUserByUsername, fetchDMHistory, sendDM, DMRow } from "@/lib/dm";

export default function DMPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user, loading } = useAuth();

  const [other, setOther] = useState<{ id: string; username: string | null } | null>(null);
  const [msgs, setMsgs] = useState<DMRow[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    (async () => {
      setErr("");

      // 1) Resolve target user from username
      const uname = decodeURIComponent(username);
      const { data: prof, error: pErr } = await getUserByUsername(uname);
      if (pErr || !prof) {
        setErr("Usuario no encontrado.");
        return;
      }
      if (prof.id === user.id) {
        setErr("No puedes enviarte mensajes a ti misma.");
        return;
      }
      setOther(prof);

      // 2) Load history (me ↔ other)
      const { data, error } = await fetchDMHistory(user.id, prof.id);
      if (error) {
        setErr(error.message ?? "No se pudieron cargar los mensajes.");
        return;
      }
      setMsgs(data ?? []);

      requestAnimationFrame(scrollToBottom);
    })();
  }, [user, loading, username]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !other) return;
    const body = text.trim();
    if (!body) return;

    setBusy(true);
    setErr("");
    try {
      const { error } = await sendDM(user.id, other.id, body);
      if (error) throw error;

      // optimistic append
      const now = new Date().toISOString();
      setMsgs((prev) => [
        ...prev,
        { id: `tmp-${now}`, sender_id: user.id, recipient_id: other.id, body, created_at: now },
      ]);
      setText("");
      requestAnimationFrame(scrollToBottom);
    } catch (e: any) {
      setErr(e.message ?? "No se pudo enviar el mensaje.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main className="min-h-screen grid place-items-center">Cargando…</main>;
  if (!user) return <main className="min-h-screen grid place-items-center">Inicia sesión</main>;

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-dmserif text-3xl mb-4">
          Chat con @{other?.username ?? decodeURIComponent(username)}
        </h1>

        {err && <p className="text-red-600 mb-3">{err}</p>}

        <div
          ref={listRef}
          className="bg-white rounded-2xl p-4 shadow-md max-h-[60vh] overflow-y-auto space-y-3"
        >
          {msgs.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl px-4 py-2 ${mine ? "bg-gcBackgroundAlt2" : "bg-gcBackgroundAlt/30"}`}>
                  <div className="text-xs opacity-70 mb-1" title={new Date(m.created_at).toLocaleString()}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="whitespace-pre-wrap">{m.body}</div>
                </div>
              </div>
            );
          })}
          {msgs.length === 0 && <div className="opacity-70">Empieza la conversación ✨</div>}
        </div>

        <form onSubmit={onSend} className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-xl border p-3 bg-white"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje…"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={busy || !text.trim() || !other}
            className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 shadow-md hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Enviando…" : "Enviar"}
          </button>
        </form>
      </div>
    </main>
  );
}
