// src/app/community-guidelines/page.tsx
"use client";

import Link from "next/link";

export default function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-dmserif mb-3">Normas de la comunidad</h1>
        <p className="opacity-80 mb-6">
          Queremos un espacio seguro, amable y divertido. Al usar Girls Collective aceptas seguir estas reglas.
        </p>

        <section className="bg-white rounded-2xl p-6 shadow-md space-y-5">
          <div>
            <h2 className="text-xl font-semibold mb-1">1) Respeto primero</h2>
            <p className="opacity-80">
              No se permiten insultos, acoso, lenguaje de odio, amenazas, ni doxxing. Trátate y trata a las demás con empatía.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">2) Contenido sensible</h2>
            <p className="opacity-80">
              Prohibido contenido sexual explícito, violento o que promueva drogas/armas. Evita compartir materiales que puedan herir a otras personas.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">3) Seguridad</h2>
            <p className="opacity-80">
              No compartas datos personales (teléfono, dirección, documentos). Si organizas un plan, hazlo con sentido común y en lugares públicos.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">4) Spam y estafas</h2>
            <p className="opacity-80">
              Nada de spam, cuentas falsas o promociones sin permiso. Reporta enlaces sospechosos o comportamientos raros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">5) Edad mínima</h2>
            <p className="opacity-80">
              El uso de Girls Collective es para mayores de 16 años (ajústalo si tu política es diferente).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">6) Consecuencias</h2>
            <p className="opacity-80">
              Podemos aplicar avisos, suspensión temporal o <strong>ban permanente</strong> ante incumplimientos. Los contenidos reportados o marcados como sensibles pueden ocultarse hasta revisión.
            </p>
          </div>

          <div className="pt-2 border-t">
            <h2 className="text-xl font-semibold mb-1">¿Necesitas ayuda?</h2>
            <p className="opacity-80">
              Si ves algo que incumple estas normas, usa el botón <strong>Reportar</strong> o escríbenos desde{" "}
              <Link href="/privacy-policy" className="underline">Política de Privacidad</Link> para ver cómo contactarnos.
            </p>
          </div>
        </section>

        <p className="text-sm opacity-60 mt-6">
          Última actualización: {new Date().toLocaleDateString("es-ES")}
        </p>
      </div>
    </main>
  );
}
