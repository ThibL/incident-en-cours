// Incident types for IncidentVoyageur application

export enum IncidentCategory {
  TECHNICAL = "technique",
  PASSENGER = "voyageur_malade",
  INTRUSION = "intrusion_voies",
  STRIKE = "mouvement_social",
  WEATHER = "conditions_meteo",
  SECURITY = "alerte_securite",
  MAINTENANCE = "travaux",
  OTHER = "autre",
}

export type IncidentSeverity = "info" | "warning" | "critical";
export type IncidentStatus = "active" | "resolved";

export interface IncidentStep {
  timestamp: Date;
  description: string;
  status: "info" | "resolution" | "worsening";
}

export interface Incident {
  id: string; // Unique ID from PRIM
  title: string; // Short title
  message: string; // Full description
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;

  // Affected scope
  affectedLines: string[]; // Line codes ["1", "14", "RER A"]
  affectedStops?: string[]; // Optional stop IDs

  // Timing
  startTime: Date;
  endTime?: Date;
  lastUpdate: Date;
  estimatedResolution?: Date;

  // Details
  cause?: string; // "Voyageur malade", "Panne technique"
  impact?: string; // "Trafic interrompu", "Retards de 15min"
  steps?: IncidentStep[]; // RATP progress updates

  // Metadata
  source: "prim" | "manual"; // For future manual reports
}

export interface StoredIncident extends Incident {
  resolvedAt?: Date;
  duration?: number; // milliseconds
  archived: boolean;
  userNotes?: string; // Optional user annotations
}

// Helper function to detect category from message/cause
export function detectIncidentCategory(
  message: string,
  cause?: string
): IncidentCategory {
  const text = `${message} ${cause || ""}`.toLowerCase();

  if (
    text.includes("voyageur malade") ||
    text.includes("malaise") ||
    text.includes("personne sur") ||
    text.includes("personne blessée")
  ) {
    return IncidentCategory.PASSENGER;
  }

  if (
    text.includes("intrusion") ||
    text.includes("colis suspect") ||
    text.includes("bagages abandonné")
  ) {
    return IncidentCategory.INTRUSION;
  }

  if (
    text.includes("mouvement social") ||
    text.includes("grève") ||
    text.includes("préavis")
  ) {
    return IncidentCategory.STRIKE;
  }

  if (
    text.includes("intempéries") ||
    text.includes("météo") ||
    text.includes("inondation") ||
    text.includes("neige") ||
    text.includes("verglas")
  ) {
    return IncidentCategory.WEATHER;
  }

  if (
    text.includes("alerte") ||
    text.includes("sécurité") ||
    text.includes("intervention police")
  ) {
    return IncidentCategory.SECURITY;
  }

  if (
    text.includes("travaux") ||
    text.includes("maintenance") ||
    text.includes("rénovation")
  ) {
    return IncidentCategory.MAINTENANCE;
  }

  if (
    text.includes("panne") ||
    text.includes("défaillance") ||
    text.includes("incident technique") ||
    text.includes("problème électrique") ||
    text.includes("problème de signalisation")
  ) {
    return IncidentCategory.TECHNICAL;
  }

  return IncidentCategory.OTHER;
}

// Helper to get category display name
export function getCategoryLabel(category: IncidentCategory): string {
  const labels: Record<IncidentCategory, string> = {
    [IncidentCategory.TECHNICAL]: "Technique",
    [IncidentCategory.PASSENGER]: "Voyageur Malade",
    [IncidentCategory.INTRUSION]: "Intrusion",
    [IncidentCategory.STRIKE]: "Mouvement Social",
    [IncidentCategory.WEATHER]: "Météo",
    [IncidentCategory.SECURITY]: "Sécurité",
    [IncidentCategory.MAINTENANCE]: "Travaux",
    [IncidentCategory.OTHER]: "Autre",
  };

  return labels[category];
}

// Helper to get severity color
export function getSeverityColor(severity: IncidentSeverity): string {
  const colors: Record<IncidentSeverity, string> = {
    info: "var(--primary)", // Cyan
    warning: "var(--status-warning)", // Amber
    critical: "var(--status-critical)", // Red
  };

  return colors[severity];
}
