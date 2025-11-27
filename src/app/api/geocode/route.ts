// src/app/api/geocode/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { location, city } = body as {
      location?: string;
      city?: string;
    };

    if (!location) {
      return NextResponse.json(
        { error: "Falta 'location' en el body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENCAGE_API_KEY;
    if (!apiKey) {
      console.error("OPENCAGE_API_KEY no está definida en las env vars");
      return NextResponse.json(
        { error: "Falta configuración de geocoding" },
        { status: 500 }
      );
    }

    // Añadimos ciudad por contexto (ej: "Puente de la Alameda, Valencia, España")
    const query = city
      ? `${location}, ${city}`
      : location;

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      query
    )}&key=${apiKey}&language=es&limit=1`;

    const resp = await fetch(url);
    if (!resp.ok) {
      console.error("Error HTTP geocoding:", resp.status, resp.statusText);
      return NextResponse.json(
        { error: "Error al llamar a la API de geocoding" },
        { status: 502 }
      );
    }

    const data = await resp.json();

    if (!data.results || !data.results.length) {
      return NextResponse.json(
        { error: "No se encontraron coordenadas para esa ubicación" },
        { status: 404 }
      );
    }

    const best = data.results[0];
    const { lat, lng } = best.geometry;

    return NextResponse.json(
      {
        lat,
        lng,
        formatted: best.formatted ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error interno en /api/geocode:", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
