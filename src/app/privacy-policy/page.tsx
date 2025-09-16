"use client";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fef8f4] text-[#50415b] font-montserrat p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-dmserif mb-6">Política de Privacidad</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Información que recopilamos</h2>
          <p>Cuando utilizas nuestra aplicación, podemos recopilar:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Datos de registro:</strong> correo electrónico y contraseña (a través de Supabase).</li>
            <li><strong>Datos de perfil:</strong> nombre de usuario, ciudad, año de nacimiento, biografía, intereses, foto de perfil e intereses personalizados.</li>
            <li><strong>Datos técnicos:</strong> uso de la app, cookies y registros del servidor.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Uso de los datos</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Mejorar la experiencia de la comunidad.</li>
            <li>Personalizar tu perfil y recomendaciones.</li>
            <li>Contactarte sobre novedades de tu ciudad.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. Compartición de datos</h2>
          <p>
            Nunca venderemos tus datos. Solo se comparten con servicios necesarios para el funcionamiento de la app
            (como Supabase para autenticación y base de datos).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Tus derechos</h2>
          <p>
            Puedes solicitar la eliminación o modificación de tus datos en cualquier momento escribiéndonos a{" "}
            <a
              href="mailto:contact@girls-collective.com"
              className="underline text-[#50415b]"
            >
              contact@girls-collective.com
            </a>
            .
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Cambios</h2>
          <p>
            Esta política puede actualizarse. Si hay cambios importantes, te lo notificaremos dentro de la app.
          </p>
        </section>

        <footer className="text-sm mt-10">
          Última actualización: {new Date().toLocaleDateString("es-ES")}
        </footer>
      </div>
    </main>
  );
}
