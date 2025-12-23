// supabase/functions/notify-approval/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("RESEND_FROM") || "Girls Collective <contact@girls-collective.com>";
const TO_EMAIL = "contact@girls-collective.com";

serve(async (req: Request) => {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const expected = `Bearer ${Deno.env.get("NOTIFY_SECRET") ?? ""}`;
    if (!expected.endsWith(" ") && expected !== "Bearer " && auth !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await req.json();

    const type = payload?.type as string; // "group" | "event" | "host_request"
    const item = payload?.item ?? {};
    const subject = payload?.subject ?? "Nuevo contenido para aprobar";
    const adminUrl = payload?.adminUrl ?? "https://girls-collective.com/admin/groups";

    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height:1.45">
        <h2>${subject}</h2>
        <p><strong>Tipo:</strong> ${type}</p>
        <pre style="background:#f6f6f6;padding:12px;border-radius:10px;white-space:pre-wrap">${escapeHtml(
          JSON.stringify(item, null, 2)
        )}</pre>
        <p>
          <a href="${adminUrl}" target="_blank" rel="noreferrer">Abrir panel de admin</a>
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(`Resend error: ${text}`, { status: 500 });
    }

    return new Response("ok");
  } catch (e) {
    return new Response(`Error: ${e instanceof Error ? e.message : "unknown"}`, { status: 500 });
  }
});

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
