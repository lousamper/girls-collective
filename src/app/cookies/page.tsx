export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-dmserif text-3xl mb-4">Política de Cookies</h1>
        <p className="mb-4">
          Usamos cookies esenciales para el funcionamiento del sitio y cookies analíticas (Google Analytics)
          para medir visitas y mejorar la experiencia. Las analíticas están desactivadas por defecto hasta que
          das tu consentimiento.
        </p>
        <h2 className="font-semibold text-xl mt-6 mb-2">Tipos de cookies</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Esenciales</strong>: necesarias para funciones básicas (seguridad, carga de páginas). No requieren consentimiento.
          </li>
          <li>
            <strong>Analíticas</strong>: nos ayudan a entender cómo se usa el sitio. Solo se activan si aceptas.
          </li>
        </ul>
        <h2 className="font-semibold text-xl mt-6 mb-2">Gestión del consentimiento</h2>
        <p>
          Puedes aceptar o rechazar cookies en el banner que aparece al visitar la web. Tu decisión se guardará y
          puedes cambiarla borrando el almacenamiento local del navegador.
        </p>
      </div>
    </main>
  );
}
