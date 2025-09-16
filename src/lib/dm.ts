// C:\Users\lousa\girls-collective\src\lib\dm.ts
import { supabase } from "@/lib/supabaseClient";

export type DMRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

export type ProfileLite = { id: string; username: string | null };

export async function getUserByUsername(username: string) {
  // exact first (fast), then case-insensitive fallback
  const exact = await supabase
    .from("profiles")
    .select("id,username")
    .eq("username", username)
    .maybeSingle();
  if (exact.data || exact.error) return exact;

  return await supabase
    .from("profiles")
    .select("id,username")
    .ilike("username", username)
    .maybeSingle();
}

export function dmOrFilter(meId: string, otherId: string) {
  // PostgREST OR with two ANDs
  return `and(sender_id.eq.${meId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${meId})`;
}

export async function fetchDMHistory(meId: string, otherId: string) {
  return await supabase
    .from("direct_messages")
    .select("id,sender_id,recipient_id,body,created_at")
    .or(dmOrFilter(meId, otherId))
    .order("created_at", { ascending: true });
}

export async function sendDM(meId: string, otherId: string, text: string) {
  return await supabase
    .from("direct_messages")
    .insert({ sender_id: meId, recipient_id: otherId, body: text.trim() });
}
