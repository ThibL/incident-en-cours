import type { TraficInfo } from "@/types/prim";
import type { FavoriteStop } from "@/lib/stores/favorites-store";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface AffectedFavoriteLine {
  lineId: string;
  lineName: string;
  severity: string;
  impact: string;
  status: "normal" | "perturbe" | "interrompu";
}

export interface LateChanceResult {
  percentage: number; // 0-100
  risk: RiskLevel;
  affectedFavorites: AffectedFavoriteLine[];
  recommendation: string;
  humorQuote?: string;
}

/**
 * Calculate the chance of being late based on favorite lines and current traffic
 */
export function calculateLateChance(
  favorites: FavoriteStop[],
  traffic: TraficInfo[]
): LateChanceResult {
  if (favorites.length === 0) {
    return {
      percentage: 0,
      risk: "low",
      affectedFavorites: [],
      recommendation: "Ajoutez des lignes favorites pour voir votre risque de retard.",
    };
  }

  // Extract unique line codes from favorites
  const favoriteLineCodes = new Set<string>();
  favorites.forEach((fav) => fav.lines.forEach((line) => favoriteLineCodes.add(line)));

  // Find traffic info for favorite lines
  const affectedFavorites: AffectedFavoriteLine[] = [];
  let totalRisk = 0;

  traffic.forEach((lineInfo) => {
    if (!favoriteLineCodes.has(lineInfo.lineCode)) {
      return; // Not a favorite line
    }

    if (lineInfo.status === "normal") {
      return; // Line is fine
    }

    // Calculate risk contribution based on status and severity
    let riskContribution = 0;
    let severity = "info";
    let impact = "";

    if (lineInfo.status === "interrompu") {
      riskContribution = 40; // 40% risk per interrupted line
      severity = "critical";
      impact = "Trafic interrompu";
    } else if (lineInfo.status === "perturbe") {
      // Check disruption severity
      const criticalDisruptions = lineInfo.disruptions.filter((d) => d.severity === "critical");
      const warningDisruptions = lineInfo.disruptions.filter((d) => d.severity === "warning");

      if (criticalDisruptions.length > 0) {
        riskContribution = 30;
        severity = "critical";
        impact = criticalDisruptions[0].message.substring(0, 50) + "...";
      } else if (warningDisruptions.length > 0) {
        riskContribution = 20;
        severity = "warning";
        impact = warningDisruptions[0].message.substring(0, 50) + "...";
      } else {
        riskContribution = 5;
        severity = "info";
        impact = "Perturbation mineure";
      }
    }

    totalRisk += riskContribution;

    affectedFavorites.push({
      lineId: lineInfo.lineId,
      lineName: lineInfo.lineCode,
      severity,
      impact,
      status: lineInfo.status,
    });
  });

  // Cap at 95% (never 100%)
  const percentage = Math.min(totalRisk, 95);

  // Determine risk level
  let risk: RiskLevel;
  if (percentage < 20) {
    risk = "low";
  } else if (percentage < 50) {
    risk = "moderate";
  } else if (percentage < 75) {
    risk = "high";
  } else {
    risk = "critical";
  }

  // Generate recommendation
  const recommendation = generateRecommendation(risk, affectedFavorites);

  return {
    percentage,
    risk,
    affectedFavorites,
    recommendation,
  };
}

/**
 * Generate a recommendation based on risk level
 */
function generateRecommendation(
  risk: RiskLevel,
  affectedLines: AffectedFavoriteLine[]
): string {
  if (risk === "low") {
    return "Trafic normal sur vos lignes. Bon voyage !";
  }

  if (risk === "moderate") {
    return "Quelques perturbations mineures. Prévoyez quelques minutes supplémentaires.";
  }

  if (risk === "high") {
    const interruptedLines = affectedLines.filter((l) => l.status === "interrompu");

    if (interruptedLines.length > 0) {
      return `Attention : ${interruptedLines.length} ligne(s) interrompue(s). Cherchez un itinéraire alternatif.`;
    }

    return "Perturbations significatives. Anticipez des retards importants.";
  }

  // critical
  return "Risque critique de retard. Envisagez un mode de transport alternatif.";
}

/**
 * Generate a humor quote based on context
 */
export function generateHumorQuote(
  risk: RiskLevel,
  affectedLines: AffectedFavoriteLine[]
): string {
  const hasRERB = affectedLines.some((l) => l.lineName === "B");

  if (risk === "low") {
    return "Miracle : tout fonctionne. Méfiance.";
  }

  if (risk === "moderate") {
    return "Pas encore de quoi perdre son sang-froid.";
  }

  if (hasRERB && risk === "high") {
    return "Oui, encore le RER B. Non, personne n'est surpris.";
  }

  if (risk === "high") {
    return "Temps de réviser votre playlist \"coincé dans le métro\".";
  }

  // critical
  if (hasRERB) {
    return "Le RER B a décidé de prendre sa journée.";
  }

  return "Aujourd'hui, c'est vélo.";
}

/**
 * Get risk color for UI
 */
export function getRiskColor(risk: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: "var(--status-normal)",
    moderate: "#f59e0b", // amber-500
    high: "var(--status-warning)",
    critical: "var(--status-critical)",
  };

  return colors[risk];
}
