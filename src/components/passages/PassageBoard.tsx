"use client";

import { usePassages } from "@/lib/hooks/usePassages";
import { PassageCard, PassageList } from "./PassageCard";
import { PassageSkeleton } from "./PassageSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface PassageBoardProps {
  stopId: string;
  stopName?: string;
  className?: string;
  maxItems?: number;
  variant?: "default" | "compact";
}

export function PassageBoard({
  stopId,
  stopName,
  className,
  maxItems = 5,
  variant = "default",
}: PassageBoardProps) {
  const {
    data: passages,
    isLoading,
    isError,
    error,
    dataUpdatedAt,
    refetch,
    isRefetching,
  } = usePassages(stopId, {
    refetchInterval: 30000, // 30 secondes
  });

  const lastUpdate = dataUpdatedAt
    ? formatDistanceToNow(new Date(dataUpdatedAt), {
        addSuffix: true,
        locale: fr,
      })
    : null;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            {stopName || "Chargement..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PassageSkeleton count={maxItems} />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            {stopName || "Arrêt"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Erreur de chargement
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error
                  ? error.message
                  : "Impossible de récupérer les prochains passages"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!passages || passages.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            {stopName || "Arrêt"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
            <p>Aucun passage prévu</p>
            <p className="text-sm">
              Les prochains passages apparaîtront ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            {stopName || "Arrêt"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Mis à jour {lastUpdate}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefetching && "animate-spin")}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PassageList
          passages={passages}
          variant={variant}
          maxItems={maxItems}
        />
      </CardContent>
    </Card>
  );
}
