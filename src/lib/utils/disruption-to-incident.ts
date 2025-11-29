// Utility to convert PRIM Disruption to full Incident type

import type { Disruption } from "@/types/prim";
import {
  type Incident,
  type StoredIncident,
  detectIncidentCategory,
  type IncidentSeverity,
  type IncidentStatus,
} from "@/types/incident";

/**
 * Convert a PRIM Disruption to a full Incident object
 */
export function disruptionToIncident(
  disruption: Disruption,
  lineCode?: string
): Incident {
  // Map PRIM severity effect to our severity levels
  const severity: IncidentSeverity = mapPRIMSeverity(
    disruption.severity?.effect
  );

  // Map PRIM status to our status
  const status: IncidentStatus =
    disruption.status === "active" ? "active" : "resolved";

  // Extract affected lines from impacted objects
  const affectedLines =
    disruption.impacted_objects?.map((obj) => obj.pt_object.name) || [];

  // Add current line code if provided and not already in the list
  if (lineCode && !affectedLines.includes(lineCode)) {
    affectedLines.push(lineCode);
  }

  // Extract stops if available
  const affectedStops = disruption.impacted_objects
    ?.filter((obj) => obj.pt_object.embedded_type === "stop_point")
    .map((obj) => obj.pt_object.id);

  // Get primary message
  const primaryMessage =
    disruption.messages?.find((m) => m.channel?.name === "web")?.text ||
    disruption.messages?.[0]?.text ||
    disruption.cause ||
    "Perturbation en cours";

  // Get category
  const category = detectIncidentCategory(primaryMessage, disruption.cause);

  // Get timing
  const startTime = disruption.application_periods?.[0]?.begin
    ? new Date(disruption.application_periods[0].begin)
    : new Date();

  const endTime = disruption.application_periods?.[0]?.end
    ? new Date(disruption.application_periods[0].end)
    : undefined;

  const lastUpdate = disruption.updated_at
    ? new Date(disruption.updated_at)
    : new Date();

  // Build impact description
  const impact = mapSeverityToImpact(disruption.severity?.effect);

  return {
    id: disruption.id,
    title: disruption.category || disruption.severity?.name || "Information trafic",
    message: primaryMessage,
    category,
    severity,
    status,
    affectedLines,
    affectedStops,
    startTime,
    endTime,
    lastUpdate,
    cause: disruption.cause,
    impact,
    source: "prim",
  };
}

/**
 * Convert Incident to StoredIncident for IndexedDB
 */
export function incidentToStoredIncident(
  incident: Incident
): StoredIncident {
  const resolvedAt =
    incident.status === "resolved" && incident.endTime
      ? incident.endTime
      : undefined;

  const duration =
    resolvedAt && incident.startTime
      ? resolvedAt.getTime() - incident.startTime.getTime()
      : undefined;

  return {
    ...incident,
    resolvedAt,
    duration,
    archived: false,
  };
}

/**
 * Map PRIM severity effect to our severity levels
 */
function mapPRIMSeverity(effect?: string): IncidentSeverity {
  switch (effect) {
    case "NO_SERVICE":
      return "critical";
    case "SIGNIFICANT_DELAYS":
    case "REDUCED_SERVICE":
      return "warning";
    case "DETOUR":
    case "MODIFIED_SERVICE":
    case "STOP_MOVED":
      return "warning";
    default:
      return "info";
  }
}

/**
 * Map severity effect to human-readable impact
 */
function mapSeverityToImpact(effect?: string): string {
  switch (effect) {
    case "NO_SERVICE":
      return "Trafic interrompu";
    case "SIGNIFICANT_DELAYS":
      return "Retards importants";
    case "REDUCED_SERVICE":
      return "Service réduit";
    case "DETOUR":
      return "Déviation";
    case "MODIFIED_SERVICE":
      return "Service modifié";
    case "STOP_MOVED":
      return "Arrêt déplacé";
    case "ADDITIONAL_SERVICE":
      return "Service supplémentaire";
    default:
      return "Information";
  }
}

/**
 * Batch convert multiple disruptions to incidents
 */
export function disruptionsToIncidents(
  disruptions: Disruption[],
  lineCode?: string
): Incident[] {
  return disruptions.map((d) => disruptionToIncident(d, lineCode));
}
