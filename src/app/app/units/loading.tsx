export default function Loading() {
  return (
    <div className="max-w-7xl">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-32 bg-neutral-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-neutral-200 rounded-lg animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-neutral-100 animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-neutral-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
