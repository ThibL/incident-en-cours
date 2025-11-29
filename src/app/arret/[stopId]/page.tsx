"use client";

import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PassageBoard } from "@/components/passages/PassageBoard";
import { GlassPanel, StatusIndicator, GlowBadge, LiveClock } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, StarOff, RefreshCw, Radio, MapPin } from "lucide-react";
import Link from "next/link";
import { useFavoritesStore, type FavoriteStop } from "@/lib/stores/favorites-store";
import { usePassages, useInvalidatePassages } from "@/lib/hooks/usePassages";
import { getLineColor } from "@/types/prim";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Known stops mapping (real IDFM IDs)
const KNOWN_STOPS: Record<string, { name: string; lines: string[] }> = {
  "22087": { name: "Châtelet", lines: ["1"] },
  "21959": { name: "Châtelet", lines: ["14"] },
  "22092": { name: "Châtelet", lines: ["4"] },
  "21966": { name: "Châtelet", lines: ["11"] },
  "22104": { name: "Château de Vincennes", lines: ["1"] },
  "22079": { name: "La Défense", lines: ["1"] },
};

export default function StopPage() {
  const params = useParams();
  const stopId = params.stopId as string;

  const stopInfo = KNOWN_STOPS[stopId] || { name: `Station ${stopId}`, lines: [] };

  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const isFavorite = favorites.some((f) => f.id === stopId);

  const invalidatePassages = useInvalidatePassages();
  const { isRefetching } = usePassages(stopId);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(stopId);
    } else {
      const newFavorite: Omit<FavoriteStop, "addedAt"> = {
        type: "stop",
        id: stopId,
        name: stopInfo.name,
        lines: stopInfo.lines,
      };
      addFavorite(newFavorite);
    }
  };

  const handleRefresh = () => {
    invalidatePassages(stopId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 container px-4 py-6 max-w-4xl mx-auto">
        {/* Navigation */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-mono text-xs">RETOUR</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="relative"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 transition-all",
                  isRefetching ? "animate-spin text-primary" : "text-muted-foreground"
                )}
              />
            </Button>
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={handleToggleFavorite}
              className={cn(
                "gap-2 font-mono text-xs",
                isFavorite && "bg-primary/20 text-primary border-primary/50"
              )}
            >
              {isFavorite ? (
                <>
                  <Star className="h-4 w-4 fill-current" />
                  FAVORI
                </>
              ) : (
                <>
                  <StarOff className="h-4 w-4" />
                  AJOUTER
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Station Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassPanel
            accentColor={stopInfo.lines.length > 0 ? getLineColor(stopInfo.lines[0]) : "var(--primary)"}
            className="mb-6 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-[family-name:var(--font-orbitron)] text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
                    {stopInfo.name}
                  </h1>
                  <p className="text-sm font-mono text-muted-foreground">
                    ID STATION: {stopId}
                  </p>
                </div>
              </div>

              {/* Live indicator */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <StatusIndicator status="normal" size="sm" pulse label="EN DIRECT" />
                </div>
                <LiveClock showSeconds className="text-xs" />
              </div>
            </div>

            {/* Line badges */}
            {stopInfo.lines.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
                <span className="text-xs font-mono text-muted-foreground mr-2">LIGNES:</span>
                {stopInfo.lines.map((line) => (
                  <GlowBadge key={line} color={getLineColor(line)} className="text-base px-3 py-1">
                    {line}
                  </GlowBadge>
                ))}
              </div>
            )}
          </GlassPanel>
        </motion.div>

        {/* Departures Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold tracking-wide">
                PROCHAINS DÉPARTS
              </h2>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10">
                <Radio className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-xs font-mono text-primary">EN DIRECT</span>
              </div>
            </div>
          </div>

          <PassageBoard
            stopId={stopId}
            stopName=""
            maxItems={10}
            variant="default"
          />
        </motion.div>

        {/* Real-time info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GlassPanel className="mt-6 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIndicator status="normal" size="sm" pulse />
                <span className="text-xs font-mono text-muted-foreground">
                  ACTUALISATION AUTO: 30 SEC
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                PROCHAINE MAJ: <span className="text-primary">--</span>s
              </span>
            </div>
          </GlassPanel>
        </motion.div>
      </main>
    </div>
  );
}
