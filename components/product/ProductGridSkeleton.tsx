type Props = {
  count?: number;
};

/** Placeholder con la misma forma que ProductGrid + ProductCard. */
export function ProductGridSkeleton({ count = 24 }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-[var(--shadow-card)]"
        >
          <div className="aspect-[4/3] bg-[#F1F5F9] animate-pulse" />
          <div className="flex flex-col gap-2 p-3 border-t border-[#F1F5F9]">
            <div className="h-3 w-16 rounded bg-[#F1F5F9] animate-pulse" />
            <div className="h-3 w-full rounded bg-[#F1F5F9] animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-[#F1F5F9] animate-pulse" />
            <div className="mt-2 h-5 w-20 rounded bg-[#F1F5F9] animate-pulse" />
            <div className="mt-1 h-9 w-full rounded-lg bg-[#F1F5F9] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
