export default function ConfiguracionPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Configuración
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Ajustes generales del panel.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Credenciales admin</p>
          <p className="text-xs text-gray-400 mt-1">
            El email y contraseña se configuran en las variables de entorno{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">ADMIN_EMAIL</code>{" "}
            y{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">ADMIN_PASSWORD</code>{" "}
            del servidor.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700">Número de WhatsApp</p>
          <p className="text-xs text-gray-400 mt-1">
            Se configura en{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_WHATSAPP_NUMBER</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
