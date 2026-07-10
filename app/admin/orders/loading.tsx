export default function OrdersLoading() {
  return (
    <div className="animate-pulse">
      {/* Título */}
      <div className="h-7 w-52 rounded bg-gray-200 mb-6" />

      {/* KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="h-3 w-24 rounded bg-gray-200 mb-3" />
            <div className="h-6 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Tabs + fecha */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-lg bg-gray-200" />
        ))}
        <div className="h-9 w-36 rounded-lg bg-gray-200 ml-auto" />
      </div>

      {/* Cards de pedidos */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-8 w-32 rounded-lg bg-gray-200" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-5/6 rounded bg-gray-100" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
