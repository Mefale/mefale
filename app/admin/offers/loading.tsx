export default function OffersLoading() {
  return (
    <div className="animate-pulse">
      {/* Título */}
      <div className="h-7 w-32 rounded bg-gray-200 mb-6" />

      {/* Toolbar: búsqueda + acciones */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="h-10 flex-1 rounded-lg bg-gray-200" />
        <div className="h-10 w-full sm:w-32 rounded-lg bg-gray-200" />
        <div className="h-10 w-full sm:w-32 rounded-lg bg-gray-200" />
      </div>

      {/* Filas de productos */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5"
          >
            <div className="h-6 w-10 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-3 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
            <div className="h-9 w-28 rounded-lg bg-gray-100 hidden sm:block" />
            <div className="h-8 w-20 rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
