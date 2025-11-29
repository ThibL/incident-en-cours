"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Passage } from "@/types/prim";

interface PassagesResponse {
  passages: Passage[];
  timestamp: string;
}

interface LinePassagesResponse {
  passages: Passage[];
  lineId: string;
  timestamp: string;
}

async function fetchPassagesFromAPI(stopId: string): Promise<PassagesResponse> {
  const response = await fetch(`/api/passages/${encodeURIComponent(stopId)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch passages: ${response.statusText}`);
  }

  return response.json();
}

async function fetchLinePassagesFromAPI(lineId: string): Promise<LinePassagesResponse> {
  const response = await fetch(`/api/passages/line/${encodeURIComponent(lineId)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch line passages: ${response.statusText}`);
  }

  return response.json();
}

interface UsePassagesOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

/**
 * Hook pour récupérer les prochains passages en temps réel
 * @param stopId - ID de l'arrêt
 * @param options - Options de configuration
 */
export function usePassages(
  stopId: string | null,
  options: UsePassagesOptions = {}
) {
  const { enabled = true, refetchInterval = 30000 } = options;

  return useQuery({
    queryKey: ["passages", stopId],
    queryFn: () => fetchPassagesFromAPI(stopId!),
    enabled: enabled && !!stopId,
    refetchInterval,
    staleTime: 15000, // 15 secondes
    select: (data) => data.passages,
  });
}

/**
 * Hook pour prefetch les passages d'un arrêt
 */
export function usePrefetchPassages() {
  const queryClient = useQueryClient();

  return (stopId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["passages", stopId],
      queryFn: () => fetchPassagesFromAPI(stopId),
      staleTime: 15000,
    });
  };
}

/**
 * Hook pour invalider le cache des passages
 */
export function useInvalidatePassages() {
  const queryClient = useQueryClient();

  return (stopId?: string) => {
    if (stopId) {
      queryClient.invalidateQueries({ queryKey: ["passages", stopId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["passages"] });
    }
  };
}

/**
 * Hook pour récupérer les prochains passages d'une ligne (tous les arrêts)
 * @param lineId - ID de la ligne (ex: "C01371" pour M1)
 * @param options - Options de configuration
 */
export function useLinePassages(
  lineId: string | null,
  options: UsePassagesOptions = {}
) {
  const { enabled = true, refetchInterval = 30000 } = options;

  return useQuery({
    queryKey: ["passages", "line", lineId],
    queryFn: () => fetchLinePassagesFromAPI(lineId!),
    enabled: enabled && !!lineId,
    refetchInterval,
    staleTime: 15000,
    select: (data) => data.passages,
  });
}

/**
 * Hook pour prefetch les passages d'une ligne
 */
export function usePrefetchLinePassages() {
  const queryClient = useQueryClient();

  return (lineId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["passages", "line", lineId],
      queryFn: () => fetchLinePassagesFromAPI(lineId),
      staleTime: 15000,
    });
  };
}

// ============================================
// Bulk Passages (pour les favoris)
// ============================================

interface BulkPassagesResult {
  stopId: string;
  passages: Passage[];
  error?: string;
}

interface BulkPassagesResponse {
  results: BulkPassagesResult[];
  summary: {
    requested: number;
    success: number;
    errors: number;
  };
  timestamp: string;
}

async function fetchBulkPassagesFromAPI(
  stopIds: string[]
): Promise<BulkPassagesResponse> {
  const stopsParam = stopIds.map((s) => encodeURIComponent(s)).join(",");
  const response = await fetch(`/api/passages/bulk?stops=${stopsParam}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch bulk passages: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook pour récupérer les passages de plusieurs arrêts en parallèle
 * Utile pour les favoris ou tableaux de bord multi-arrêts
 * @param stopIds - Liste des IDs d'arrêts (max 10)
 * @param options - Options de configuration
 */
export function useBulkPassages(
  stopIds: string[],
  options: UsePassagesOptions = {}
) {
  const { enabled = true, refetchInterval = 30000 } = options;

  // Trier les IDs pour une clé de cache stable
  const sortedIds = [...stopIds].sort();

  return useQuery({
    queryKey: ["passages", "bulk", sortedIds],
    queryFn: () => fetchBulkPassagesFromAPI(sortedIds),
    enabled: enabled && sortedIds.length > 0,
    refetchInterval,
    staleTime: 15000,
  });
}

/**
 * Hook pour prefetch les passages de plusieurs arrêts
 */
export function usePrefetchBulkPassages() {
  const queryClient = useQueryClient();

  return (stopIds: string[]) => {
    const sortedIds = [...stopIds].sort();
    queryClient.prefetchQuery({
      queryKey: ["passages", "bulk", sortedIds],
      queryFn: () => fetchBulkPassagesFromAPI(sortedIds),
      staleTime: 15000,
    });
  };
}
