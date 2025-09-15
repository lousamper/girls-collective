"use client";
import { use, useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { getOrCreateThread } from "@/lib/dm";

type Msg = { id: string; sender_id: string; content: string; created_at: string };

export default function DMPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user, loading } = useAuth();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [other, setOther] = useState<{ id: string; username: string } | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || loading) return;
    (async () => {
      // buscar perfil por username
      const { data: p } = await supabase
        .from("profiles")
        .select("id,username")
        .ilike("username", username)
        .maybeSingle();
      if (!p?.id) return;
      setOther(p);

      const tid = await getOrCreateThread(user.id, p.id);
      setThreadId(tid);

      // cargar mensajes
      const { data: rows } = await supabase
        .from("direct_messages")
        .select("id,sender_id,content,created_at")
        .eq("thread_id", tid)
        .order("created_at", { ascending: true });
      setMsgs(rows ?? []);
      setTimeout(() => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 0);
    })();
  }, [user, loading, username]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !threadId || !text.trim()) return;
    const payload = { thread_id: threadId, sender_id: user.id, content: text.trim() };
    const { data, error } = await supabase
      .from("direct_messages")
      .insert(payload)
      .select("id,sender_id,content,created_at")
      .single();
    if (!error && data) {
      setMsgs(prev => [...prev, data]);
      setText("");
      setTimeout(() => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 0);
    }
  }

  if (loading) return <main className="min-h-screen grid place-items-center">Cargando…</main>;
  if (!user) return <main className="min-h-screen grid place-items-center">Inicia sesión</main>;

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-dmserif text-3xl mb-4">Chat con @{other?.username ?? "..."}</h1>

        <div ref={listRef} className="bg-white rounded-2xl p-4 shadow-md max-h-[60vh] overflow-y-auto space-y-3">
          {msgs.map(m => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl px-4 py-2 ${mine ? "bg-gcBackgroundAlt2" : "bg-gcBackgroundAlt/30"}`}>
                  {m.content}
                </div>
              </div>
            );
          })}
          {msgs.length === 0 && <div className="opacity-70">Empieza la conversación ✨</div>}
        </div>

        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-xl border p-3 bg-white"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje…"
          />
          <button
            type="submit"
            className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 shadow-md hover:opacity-90"
          >
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}
