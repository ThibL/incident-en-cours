import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PassageSkeleton } from "@/components/passages/PassageSkeleton";

export default function StopLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 container px-4 py-6 max-w-4xl mx-auto">
        {/* Navigation skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-9 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* Info arrêt skeleton */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-10 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Passages skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <PassageSkeleton count={5} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
