"use client";

import { useEffect, useRef } from "react";
import { useTraficInfo } from "./useTraficInfo";
import { db } from "@/lib/db/incidents-db";
import {
  disruptionToIncident,
  incidentToStoredIncident,
} from "@/lib/utils/disruption-to-incident";

/**
 * Hook to automatically sync incidents from PRIM API to IndexedDB
 * Should be used in a top-level component (like layout or a provider)
 */
export function useIncidentSync() {
  const { data: traffic } = useTraficInfo({ refetchInterval: 15000 });
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!traffic) return;

    const syncIncidents = async () => {
      for (const line of traffic) {
        for (const disruption of line.disruptions) {
          // Skip if already processed in this session
          if (processedIds.current.has(disruption.id)) {
            continue;
          }

          try {
            // Check if incident already exists in DB
            const existing = await db.incidents.get(disruption.id);

            if (existing) {
              // Update if status changed
              const isNowResolved = disruption.endTime && disruption.endTime < new Date();

              if (isNowResolved && existing.status !== "resolved") {
                await db.incidents.update(disruption.id, {
                  status: "resolved",
                  resolvedAt: disruption.endTime || new Date(),
                  duration: disruption.endTime
                    ? disruption.endTime.getTime() - existing.startTime.getTime()
                    : undefined,
                  lastUpdate: new Date(),
                });
              } else {
                // Just update lastUpdate
                await db.incidents.update(disruption.id, {
                  lastUpdate: new Date(),
                });
              }
            } else {
              // New incident - convert and save
              const incident = disruptionToIncident(
                {
                  ...disruption,
                  status: "active",
                  severity: {
                    name: disruption.severity,
                    effect: mapSeverityToEffect(disruption.severity),
                  },
                  messages: [{ text: disruption.message }],
                  application_periods: [
                    {
                      begin: disruption.startTime.toISOString(),
                      end: disruption.endTime?.toISOString() || "",
                    },
                  ],
                  impacted_objects: disruption.affectedLines.map((line) => ({
                    pt_object: {
                      id: line,
                      name: line,
                    },
                  })),
                } as any,
                line.lineCode
              );

              const storedIncident = incidentToStoredIncident(incident);
              await db.incidents.add(storedIncident);
            }

            processedIds.current.add(disruption.id);
          } catch (error) {
            console.error(`Error syncing incident ${disruption.id}:`, error);
          }
        }
      }
    };

    syncIncidents();
  }, [traffic]);
}

function mapSeverityToEffect(severity: string): string {
  const severityMap: Record<string, string> = {
    critical: "NO_SERVICE",
    warning: "SIGNIFICANT_DELAYS",
    info: "OTHER_EFFECT",
  };

  return severityMap[severity] || "OTHER_EFFECT";
}
