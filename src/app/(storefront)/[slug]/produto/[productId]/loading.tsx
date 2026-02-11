export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-4 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-4 w-16 animate-pulse rounded bg-surface-secondary"
          />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image skeleton */}
        <div className="aspect-square animate-pulse rounded-xl bg-surface-secondary" />

        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-20 animate-pulse rounded bg-surface-secondary" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-surface-secondary" />
          <div className="h-10 w-40 animate-pulse rounded bg-surface-secondary" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-surface-secondary" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-surface-secondary" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-surface-secondary" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-surface-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
