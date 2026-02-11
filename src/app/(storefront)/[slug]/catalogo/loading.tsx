export default function CatalogoLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Title skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-secondary" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-surface-secondary" />
      </div>

      <div className="flex gap-6">
        {/* Sidebar skeleton - desktop */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-secondary" />
                <div className="space-y-1.5">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="h-4 w-full animate-pulse rounded bg-surface-secondary"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Product grid skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border"
              >
                <div className="aspect-square animate-pulse bg-surface-secondary" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-16 animate-pulse rounded bg-surface-secondary" />
                  <div className="h-4 w-full animate-pulse rounded bg-surface-secondary" />
                  <div className="h-5 w-24 animate-pulse rounded bg-surface-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
