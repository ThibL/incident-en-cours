"use client";

import { GlassPanel, GlowBadge, StatusIndicator, DataCounter } from "@/components/ui/glass-panel";
import { useLateChance } from "@/lib/hooks/useLateChance";
import { getRiskColor } from "@/lib/utils/late-chance-calculator";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function LateChanceWidget({ humorMode = false }: { humorMode?: boolean }) {
  const { result, isLoading } = useLateChance({ humorMode });

  if (isLoading) {
    return (
      <GlassPanel className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wide">
              RISQUE DE RETARD
            </h3>
            <p className="text-xs text-muted-foreground">Analyse en cours...</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </GlassPanel>
    );
  }

  if (!result) {
    return (
      <GlassPanel className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wide">
            RISQUE DE RETARD
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Ajoutez des lignes favorites pour voir votre risque de retard.
        </p>
      </GlassPanel>
    );
  }

  const riskColor = getRiskColor(result.risk);

  const RiskIcon = result.risk === "low" ? CheckCircle : result.risk === "critical" ? AlertTriangle : TrendingUp;

  // Traduction des niveaux de risque
  const riskLabels: Record<string, string> = {
    low: "FAIBLE",
    moderate: "MODÉRÉ",
    high: "ÉLEVÉ",
    critical: "CRITIQUE",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassPanel accentColor={riskColor} className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wide">
                RISQUE DE RETARD
              </h3>
              <p className="text-xs text-muted-foreground">Basé sur vos lignes favorites</p>
            </div>
          </div>
          <StatusIndicator
            status={result.risk === "low" ? "normal" : result.risk === "critical" ? "critical" : "warning"}
            pulse
            size="sm"
          />
        </div>

        {/* Main Risk Display */}
        <div className="flex items-center gap-6 mb-6">
          {/* Percentage Circle */}
          <div className="relative flex items-center justify-center">
            <div
              className="h-24 w-24 rounded-full border-4 flex items-center justify-center"
              style={{
                borderColor: riskColor,
                boxShadow: `0 0 20px ${riskColor}40`,
              }}
            >
              <div className="text-center">
                <div className="text-3xl font-[family-name:var(--font-orbitron)] font-bold" style={{ color: riskColor }}>
                  <DataCounter value={result.percentage} suffix="%" />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <RiskIcon className="h-5 w-5" style={{ color: riskColor }} />
              <GlowBadge color={riskColor} className="text-sm font-bold">
                {riskLabels[result.risk]}
              </GlowBadge>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {result.recommendation}
            </p>
          </div>
        </div>

        {/* Affected Lines */}
        {result.affectedFavorites.length > 0 && (
          <div className="border-t border-border/30 pt-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
              LIGNES AFFECTÉES:
            </p>
            <div className="space-y-2">
              {result.affectedFavorites.map((line) => (
                <motion.div
                  key={line.lineId}
                  className="flex items-center gap-3 p-2 rounded-lg bg-background/30"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <GlowBadge color={getRiskColor(line.severity as any)} className="text-sm">
                    {line.lineName}
                  </GlowBadge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground font-mono truncate">
                      {line.impact}
                    </p>
                  </div>
                  <StatusIndicator
                    status={line.status === "interrompu" ? "critical" : "warning"}
                    size="sm"
                    pulse
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Humor Quote */}
        {humorMode && result.humorQuote && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs italic text-primary/70 font-mono text-center">
              \u00ab {result.humorQuote} \u00bb
            </p>
          </div>
        )}
      </GlassPanel>
    </motion.div>
  );
}
