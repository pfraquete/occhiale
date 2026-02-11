import { Skeleton } from "@/components/ui/skeleton";

export default function WhatsAppLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0">
      {/* Conversations list skeleton */}
      <div className="w-80 shrink-0 border-r border-border p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>

      {/* Chat panel skeleton */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <Skeleton
                className={`h-12 rounded-xl ${i % 2 === 0 ? "w-64" : "w-48"}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
