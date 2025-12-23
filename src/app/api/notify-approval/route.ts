import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const notifySecret = process.env.NOTIFY_SECRET;

    // 🛡️ Guard: evita errores silenciosos si falta config
    if (!supabaseUrl || !notifySecret) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing env vars: NEXT_PUBLIC_SUPABASE_URL or NOTIFY_SECRET",
        },
        { status: 500 }
      );
    }

    const fnUrl = `${supabaseUrl}/functions/v1/notify-approval`;

    const r = await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${notifySecret}`, // 🔑 clave compartida
      },
      body: JSON.stringify(body),
    });

    const text = await r.text();

    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: text || "notify failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
