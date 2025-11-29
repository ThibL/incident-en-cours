import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PassageSkeletonProps {
  count?: number;
  variant?: "default" | "compact";
  className?: string;
}

export function PassageSkeleton({
  count = 3,
  variant = "default",
  className,
}: PassageSkeletonProps) {
  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 px-3 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-10 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-7 w-12 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border bg-card">
          <Skeleton className="h-6 w-32 mb-4" />
          <PassageSkeleton count={4} />
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded border">
                <Skeleton className="h-6 w-6 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
