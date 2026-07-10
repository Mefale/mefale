export default function ProductsLoading() {
  return (
    <div className="animate-pulse">
      {/* Título + botón crear */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="h-9 w-36 rounded-lg bg-gray-200" />
      </div>

      {/* Búsqueda */}
      <div className="h-10 w-full sm:w-80 rounded-lg bg-gray-200 mb-4" />

      {/* Tabla */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-200" />
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <div className="h-3 w-20 rounded bg-gray-200" />
              <div className="h-3 flex-1 rounded bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-100 hidden sm:block" />
              <div className="h-3 w-16 rounded bg-gray-200" />
              <div className="h-7 w-16 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
