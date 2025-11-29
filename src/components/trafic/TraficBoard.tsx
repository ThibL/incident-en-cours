"use client";

import { useTraficInfo } from "@/lib/hooks/useTraficInfo";
import { TraficLineCard } from "./TraficLineCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransportMode } from "@/types/prim";

interface TraficBoardProps {
  mode?: TransportMode;
  title?: string;
  showHeader?: boolean;
}

const modeIcons: Record<TransportMode, string> = {
  Metro: "🚇",
  RER: "🚆",
  Tramway: "🚊",
  Bus: "🚌",
  Transilien: "🚈",
};

export function TraficBoard({
  mode,
  title,
  showHeader = true,
}: TraficBoardProps) {
  const { data: lines, isLoading, isError, refetch, isRefetching } = useTraficInfo({
    mode,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              Impossible de charger les infos trafic
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lines || lines.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            Aucune ligne disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  // Trier : perturbées en premier, puis par nom
  const sortedLines = [...lines].sort((a, b) => {
    const statusOrder = { interrompu: 0, perturbe: 1, normal: 2 };
    const aOrder = statusOrder[a.status];
    const bOrder = statusOrder[b.status];
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.lineName.localeCompare(b.lineName);
  });

  const perturbedCount = lines.filter((l) => l.status !== "normal").length;

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {mode && <span>{modeIcons[mode]}</span>}
              {title || (mode ? `Lignes ${mode}` : "Toutes les lignes")}
            </CardTitle>
            <div className="flex items-center gap-2">
              {perturbedCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {perturbedCount} perturbée{perturbedCount > 1 ? "s" : ""}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {sortedLines.map((line) => (
          <TraficLineCard key={line.lineId} line={line} />
        ))}
      </CardContent>
    </Card>
  );
}

export function TraficBoardCompact({ mode }: { mode?: TransportMode }) {
  const { data: lines, isLoading } = useTraficInfo({ mode });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!lines) return null;

  const perturbedLines = lines.filter((l) => l.status !== "normal");

  if (perturbedLines.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Aucune perturbation en cours
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {perturbedLines.map((line) => (
        <TraficLineCard key={line.lineId} line={line} compact />
      ))}
    </div>
  );
}
