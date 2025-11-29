"use client";

import { GlassPanel, GlowBadge, StatusIndicator } from "@/components/ui/glass-panel";
import { useFavoritesStore, type FavoriteLine } from "@/lib/stores/favorites-store";
import { useTraficInfo } from "@/lib/hooks/useTraficInfo";
import { Train, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TraficInfo } from "@/types/prim";

interface LineWithStatus extends FavoriteLine {
  traficStatus: "normal" | "perturbe" | "interrompu";
  disruption?: {
    title: string;
    message: string;
  };
}

function getStatusIndicator(status: "normal" | "perturbe" | "interrompu"): "normal" | "warning" | "critical" {
  switch (status) {
    case "normal":
      return "normal";
    case "perturbe":
      return "warning";
    case "interrompu":
      return "critical";
  }
}

export function FavoritesStatusBoard() {
  const getLines = useFavoritesStore((state) => state.getLines);
  const favoriteLines = getLines();
  const { data: trafficInfo, isLoading } = useTraficInfo({ refetchInterval: 60000 });

  if (favoriteLines.length === 0) {
    return null;
  }

  // Match favorite lines with their traffic status
  const linesWithStatus: LineWithStatus[] = favoriteLines.map((line) => {
    // Find traffic info for this line by matching lineCode
    const trafic = trafficInfo?.find(
      (t: TraficInfo) => t.lineCode === line.code || t.lineCode.toLowerCase() === line.code.toLowerCase()
    );

    const disruption = trafic?.disruptions?.[0];

    return {
      ...line,
      traficStatus: trafic?.status || "normal",
      disruption: disruption
        ? {
            title: disruption.title || `${line.name} perturbé`,
            message: disruption.message || "Perturbation en cours",
          }
        : undefined,
    };
  });

  // Get lines with active disruptions
  const disruptedLines = linesWithStatus.filter((l) => l.traficStatus !== "normal");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassPanel className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Train className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wide">
                MES LIGNES
              </h3>
              <p className="text-xs text-muted-foreground">
                {favoriteLines.length} ligne{favoriteLines.length > 1 ? "s" : ""} suivie{favoriteLines.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {isLoading && (
            <div className="text-xs text-muted-foreground animate-pulse">
              Actualisation...
            </div>
          )}
        </div>

        {/* Lines Grid */}
        <div className="flex flex-wrap gap-3 mb-4">
          {linesWithStatus.map((line) => (
            <div key={line.id} className="relative group">
              <GlowBadge
                color={line.color}
                glow={line.traficStatus !== "normal"}
                className="text-base px-4 py-2"
              >
                {line.code}
              </GlowBadge>
              {/* Status dot overlay */}
              <div
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background"
                style={{
                  backgroundColor:
                    line.traficStatus === "normal"
                      ? "var(--status-normal)"
                      : line.traficStatus === "perturbe"
                      ? "var(--status-warning)"
                      : "var(--status-critical)",
                  boxShadow:
                    line.traficStatus !== "normal"
                      ? `0 0 8px ${line.traficStatus === "perturbe" ? "var(--status-warning)" : "var(--status-critical)"}`
                      : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Disruptions List */}
        <AnimatePresence>
          {disruptedLines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/30 pt-4 space-y-2"
            >
              {disruptedLines.map((line) => (
                <motion.div
                  key={`disruption-${line.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/30"
                >
                  <div className="shrink-0 mt-0.5">
                    <AlertTriangle
                      className="h-4 w-4"
                      style={{
                        color:
                          line.traficStatus === "interrompu"
                            ? "var(--status-critical)"
                            : "var(--status-warning)",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <GlowBadge color={line.color} glow={false} className="text-xs px-2 py-0.5">
                        {line.code}
                      </GlowBadge>
                      <span className="text-xs font-mono uppercase" style={{
                        color: line.traficStatus === "interrompu" ? "var(--status-critical)" : "var(--status-warning)"
                      }}>
                        {line.traficStatus === "interrompu" ? "Interrompu" : "Perturbé"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      {line.disruption?.message || "Perturbation en cours sur cette ligne"}
                    </p>
                  </div>
                  <StatusIndicator
                    status={getStatusIndicator(line.traficStatus)}
                    size="sm"
                    pulse
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* All clear message */}
        {disruptedLines.length === 0 && !isLoading && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              <span className="text-[var(--status-normal)]">●</span> Trafic normal sur toutes vos lignes
            </p>
          </div>
        )}
      </GlassPanel>
    </motion.div>
  );
}
