import { CheckCircle2, XCircle } from "lucide-react";

type VarConfig = {
  key: string;
  label: string;
  sensitive: boolean;
  hint?: string;
};

const ENV_VARS: { section: string; vars: VarConfig[] }[] = [
  {
    section: "Google Sheets",
    vars: [
      { key: "GOOGLE_SHEETS_ID", label: "Sheet ID", sensitive: false },
      { key: "GOOGLE_SERVICE_ACCOUNT_EMAIL", label: "Service Account Email", sensitive: false },
      { key: "GOOGLE_PRIVATE_KEY", label: "Private Key", sensitive: true },
    ],
  },
  {
    section: "Autenticación",
    vars: [
      { key: "NEXTAUTH_URL", label: "URL del sitio", sensitive: false },
      { key: "NEXTAUTH_SECRET", label: "Secret", sensitive: true },
      { key: "ADMIN_EMAIL", label: "Email admin", sensitive: false },
      { key: "ADMIN_PASSWORD", label: "Contraseña admin", sensitive: true },
    ],
  },
  {
    section: "Cloudinary",
    vars: [
      { key: "CLOUDINARY_CLOUD_NAME", label: "Cloud Name", sensitive: false },
      { key: "CLOUDINARY_API_KEY", label: "API Key", sensitive: false },
      { key: "CLOUDINARY_API_SECRET", label: "API Secret", sensitive: true },
    ],
  },
  {
    section: "WhatsApp y sitio público",
    vars: [
      { key: "NEXT_PUBLIC_WHATSAPP_NUMBER", label: "Número de WhatsApp", sensitive: false, hint: "Solo dígitos, sin + ni espacios. Ej: 5491112345678" },
      { key: "NEXT_PUBLIC_SITE_URL", label: "URL pública del sitio", sensitive: false },
    ],
  },
];

function maskValue(value: string): string {
  if (value.length <= 4) return "●●●●";
  return value.slice(0, 4) + "●".repeat(Math.min(value.length - 4, 12));
}

export default function SettingsPage() {
  const allOk = ENV_VARS.flatMap((s) => s.vars).every(
    ({ key }) => !!process.env[key]
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Estado de las variables de entorno del servidor.
        </p>
      </div>

      {/* Global status */}
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium ${
        allOk
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-amber-50 border-amber-200 text-amber-800"
      }`}>
        {allOk ? (
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
        ) : (
          <XCircle className="w-4 h-4 shrink-0 text-amber-600" />
        )}
        {allOk
          ? "Todas las variables están configuradas correctamente."
          : "Faltan variables de entorno — revisá los ítems marcados en rojo."}
      </div>

      {/* Sections */}
      {ENV_VARS.map(({ section, vars }) => (
        <div key={section} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section}</p>
          </div>
          <div className="divide-y divide-gray-100">
            {vars.map(({ key, label, sensitive, hint }) => {
              const raw = process.env[key];
              const configured = !!raw;
              const displayValue = configured
                ? sensitive
                  ? maskValue(raw)
                  : raw
                : null;

              return (
                <div key={key} className="flex items-start gap-3 px-5 py-3.5">
                  {configured ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                      <code className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                        {key}
                      </code>
                    </div>
                    {configured ? (
                      <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                        {displayValue}
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 mt-0.5">No configurada</p>
                    )}
                    {hint && (
                      <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-400">
        Para cambiar estos valores, editá el archivo <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> en el servidor y reiniciá la aplicación.
      </p>
    </div>
  );
}
