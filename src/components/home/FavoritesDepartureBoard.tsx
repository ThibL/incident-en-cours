"use client";

import { useEffect, useState, useMemo } from "react";
import { GlassPanel, GlowBadge, StatusIndicator } from "@/components/ui/glass-panel";
import { useFavoritesStore, type FavoriteJourney } from "@/lib/stores/favorites-store";
import { useBulkPassages } from "@/lib/hooks/usePassages";
import { MapPin, Clock, ArrowRight, AlertCircle, RefreshCw, Navigation, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Passage } from "@/types/prim";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const REFRESH_INTERVAL = 15000; // 15 seconds
const MAX_DEPARTURES_PER_JOURNEY = 3;

interface JourneyWithDepartures {
  journey: FavoriteJourney;
  departures: Passage[];
  error?: string;
}

function formatWaitTime(minutes: number): string {
  if (minutes <= 0) return "A quai";
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}

function getDelayInfo(passage: Passage): { isDelayed: boolean; delayMinutes: number } {
  if (!passage.aimedTime || !passage.expectedTime) {
    return { isDelayed: false, delayMinutes: 0 };
  }

  const aimed = new Date(passage.aimedTime).getTime();
  const expected = new Date(passage.expectedTime).getTime();
  const delayMs = expected - aimed;
  const delayMinutes = Math.round(delayMs / 60000);

  return {
    isDelayed: delayMinutes > 2,
    delayMinutes,
  };
}

function DepartureRow({ passage }: { passage: Passage }) {
  const { isDelayed, delayMinutes } = getDelayInfo(passage);
  const waitTime = passage.waitingTime;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-2"
    >
      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="flex-1 text-sm truncate">{passage.destination}</span>
      <div className="flex items-center gap-2 shrink-0">
        {isDelayed && (
          <span className="text-xs text-[var(--status-warning)] font-mono">
            +{delayMinutes}min
          </span>
        )}
        <span
          className={`font-mono font-bold text-sm tabular-nums ${
            waitTime <= 1
              ? "text-[var(--status-warning)] animate-pulse"
              : waitTime <= 3
              ? "text-primary"
              : "text-foreground"
          }`}
        >
          {formatWaitTime(waitTime)}
        </span>
        {waitTime <= 1 && (
          <Clock className="h-3 w-3 text-[var(--status-warning)] animate-pulse" />
        )}
      </div>
    </motion.div>
  );
}

function JourneyCard({ data, onRemove }: { data: JourneyWithDepartures; onRemove: () => void }) {
  const { journey, departures, error } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <Link href={`/arret/${journey.stop.id}`}>
        <GlassPanel
          accentColor={journey.line.color}
          className="p-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <GlowBadge color={journey.line.color} className="text-sm px-2.5 py-1">
              {journey.line.code}
            </GlowBadge>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{journey.stop.name}</h4>
              {journey.direction && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  vers {journey.direction}
                </p>
              )}
            </div>
            {/* Action icons container - arrow transforms to trash on hover */}
            <div className="relative h-8 w-8 flex items-center justify-center shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }}
                className="peer absolute inset-0 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 hover:bg-destructive/90 text-destructive-foreground transition-all duration-200 z-10"
                title="Retirer des favoris"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 peer-hover:opacity-0 transition-all duration-200" />
            </div>
          </div>

          {/* Departures */}
          {error ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <AlertCircle className="h-4 w-4 text-[var(--status-warning)]" />
              <span>Données indisponibles</span>
            </div>
          ) : departures.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              Aucun passage prévu
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {departures.map((passage, idx) => (
                <DepartureRow key={passage.id || idx} passage={passage} />
              ))}
            </div>
          )}
        </GlassPanel>
      </Link>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <GlassPanel className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-7 w-10 rounded-md" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </GlassPanel>
  );
}

export function FavoritesDepartureBoard() {
  const getJourneys = useFavoritesStore((state) => state.getJourneys);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const favoriteJourneys = getJourneys();

  // Get unique stop IDs from journeys
  const stopIds = useMemo(() => {
    return [...new Set(favoriteJourneys.map((j) => j.stop.id))];
  }, [favoriteJourneys]);

  const {
    data: bulkData,
    isLoading,
    isRefetching,
    dataUpdatedAt,
  } = useBulkPassages(stopIds, {
    refetchInterval: REFRESH_INTERVAL,
    enabled: stopIds.length > 0,
  });

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdate(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  if (favoriteJourneys.length === 0) {
    return null;
  }

  // Map journeys to their departures
  // Note: Station IDs are line-specific, so no line filtering is needed
  const journeysWithDepartures: JourneyWithDepartures[] = favoriteJourneys.map((journey) => {
    const result = bulkData?.results?.find((r) => r.stopId === journey.stop.id);
    const allDepartures = result?.passages || [];

    // If no departures, return early
    if (allDepartures.length === 0) {
      return {
        journey,
        departures: [],
        error: result?.error,
      };
    }

    // Filter by direction if specified (optional)
    let departures = allDepartures;
    if (journey.direction) {
      const dirLower = journey.direction.toLowerCase();
      const filtered = allDepartures.filter((p) => {
        const destLower = p.destination?.toLowerCase() || "";
        // Match if direction contains destination or destination contains direction
        return destLower.includes(dirLower) || dirLower.includes(destLower);
      });
      // Only apply filter if we still have results
      if (filtered.length > 0) {
        departures = filtered;
      }
    }

    return {
      journey,
      departures: departures.slice(0, MAX_DEPARTURES_PER_JOURNEY),
      error: result?.error,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <GlassPanel className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wide">
                MES PROCHAINS DEPARTS
              </h3>
              <p className="text-xs text-muted-foreground">
                {favoriteJourneys.length} trajet{favoriteJourneys.length > 1 ? "s" : ""} • MAJ toutes les 15s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isRefetching && (
              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            )}
            {lastUpdate && !isLoading && (
              <span className="text-xs font-mono text-muted-foreground">
                {lastUpdate.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Journeys Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <>
                {favoriteJourneys.map((journey) => (
                  <LoadingSkeleton key={`loading-${journey.id}`} />
                ))}
              </>
            ) : (
              journeysWithDepartures.map((data) => (
                <JourneyCard
                  key={data.journey.id}
                  data={data}
                  onRemove={() => removeFavorite(data.journey.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
