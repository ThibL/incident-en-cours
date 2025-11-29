"use client";

import Dexie, { type Table } from "dexie";
import { type StoredIncident } from "@/types/incident";
import { useState, useEffect } from "react";

// Define the database
class IncidentsDatabase extends Dexie {
  incidents!: Table<StoredIncident, string>;

  constructor() {
    super("IncidentVoyageurDB");

    this.version(1).stores({
      incidents:
        "id, startTime, category, severity, status, *affectedLines, archived",
    });
  }
}

// Create the database instance
export const db = new IncidentsDatabase();

// Hook to get incident history
export function useIncidentHistory(options?: {
  includeArchived?: boolean;
  limit?: number;
}) {
  const [incidents, setIncidents] = useState<StoredIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        let query = db.incidents.orderBy("startTime").reverse();

        if (!options?.includeArchived) {
          query = query.filter((incident) => !incident.archived);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const results = await query.toArray();
        setIncidents(results);
      } catch (error) {
        console.error("Error fetching incident history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncidents();

    // Refetch on interval for updates
    const interval = setInterval(fetchIncidents, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [options?.includeArchived, options?.limit]);

  return { incidents, isLoading };
}

// Hook to save an incident
export function useSaveIncident() {
  return async (incident: StoredIncident) => {
    try {
      await db.incidents.put(incident);
    } catch (error) {
      console.error("Error saving incident:", error);
      throw error;
    }
  };
}

// Hook to archive an incident
export function useArchiveIncident() {
  return async (id: string) => {
    try {
      await db.incidents.update(id, { archived: true });
    } catch (error) {
      console.error("Error archiving incident:", error);
      throw error;
    }
  };
}

// Hook to delete an incident
export function useDeleteIncident() {
  return async (id: string) => {
    try {
      await db.incidents.delete(id);
    } catch (error) {
      console.error("Error deleting incident:", error);
      throw error;
    }
  };
}

// Utility function to cleanup old incidents
export async function cleanupOldIncidents(daysToKeep: number = 30) {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    const count = await db.incidents
      .where("startTime")
      .below(cutoff)
      .and((incident) => incident.status === "resolved")
      .modify({ archived: true });

    console.log(`Archived ${count} old incidents`);
    return count;
  } catch (error) {
    console.error("Error cleaning up old incidents:", error);
    return 0;
  }
}

// Hook to trigger cleanup on mount
export function useIncidentCleanup(daysToKeep: number = 30) {
  useEffect(() => {
    cleanupOldIncidents(daysToKeep);
  }, [daysToKeep]);
}

// Hook to get incident by ID
export function useIncident(id: string | null) {
  const [incident, setIncident] = useState<StoredIncident | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIncident(null);
      setIsLoading(false);
      return;
    }

    const fetchIncident = async () => {
      try {
        const result = await db.incidents.get(id);
        setIncident(result || null);
      } catch (error) {
        console.error("Error fetching incident:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  return { incident, isLoading };
}

// Hook to get incidents filtered by line
export function useLineIncidents(lineId: string) {
  const [incidents, setIncidents] = useState<StoredIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const results = await db.incidents
          .where("affectedLines")
          .equals(lineId)
          .and((incident) => !incident.archived && incident.status === "active")
          .reverse()
          .sortBy("startTime");

        setIncidents(results);
      } catch (error) {
        console.error("Error fetching line incidents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncidents();
  }, [lineId]);

  return { incidents, isLoading };
}
