export default function Loading() {
  return (
    <div className="max-w-4xl">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
        <div className="h-4 w-4 bg-neutral-100 rounded animate-pulse" />
        <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
      </div>

      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-neutral-100 rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-neutral-200 rounded-lg animate-pulse" />
      </div>

      {/* QR skeleton */}
      <div className="card p-5 mb-6">
        <div className="h-14 w-full bg-neutral-100 rounded animate-pulse" />
      </div>

      {/* Records skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="h-5 w-2/3 bg-neutral-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-neutral-100 rounded animate-pulse mb-1" />
            <div className="h-4 w-4/5 bg-neutral-100 rounded animate-pulse mb-3" />
            <div className="flex gap-3">
              <div className="h-3 w-24 bg-neutral-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
