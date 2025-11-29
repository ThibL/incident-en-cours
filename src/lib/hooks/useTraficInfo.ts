"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TraficInfo, TransportMode } from "@/types/prim";
import { REFRESH_INTERVALS } from "@/lib/api/prim-config";

interface TraficResponse {
  trafficInfo: TraficInfo[];
  timestamp: string;
  mode: string;
}

async function fetchTraficFromAPI(
  mode?: TransportMode,
  lineId?: string
): Promise<TraficResponse> {
  const params = new URLSearchParams();
  if (mode) params.set("mode", mode);
  if (lineId) params.set("lineId", lineId);

  const url = `/api/trafic${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch traffic info: ${response.statusText}`);
  }

  return response.json();
}

interface UseTraficInfoOptions {
  enabled?: boolean;
  refetchInterval?: number;
  mode?: TransportMode;
  lineId?: string;
}

/**
 * Hook pour récupérer les infos trafic en temps réel
 * @param options - Options de configuration
 */
export function useTraficInfo(options: UseTraficInfoOptions = {}) {
  const {
    enabled = true,
    refetchInterval = REFRESH_INTERVALS.lineReports.clientRefetch,
    mode,
    lineId,
  } = options;

  return useQuery({
    queryKey: ["trafic", mode || "all", lineId],
    queryFn: () => fetchTraficFromAPI(mode, lineId),
    enabled,
    refetchInterval,
    staleTime: REFRESH_INTERVALS.lineReports.clientStale,
    select: (data) => data.trafficInfo,
  });
}

/**
 * Hook pour récupérer les infos trafic de toutes les lignes Metro
 */
export function useMetroTrafic() {
  return useTraficInfo({ mode: "Metro" });
}

/**
 * Hook pour récupérer les infos trafic de toutes les lignes RER
 */
export function useRERTrafic() {
  return useTraficInfo({ mode: "RER" });
}

/**
 * Hook pour récupérer les infos trafic de toutes les lignes Tramway
 */
export function useTramwayTrafic() {
  return useTraficInfo({ mode: "Tramway" });
}

/**
 * Hook pour récupérer un résumé global du trafic
 */
export function useTraficSummary() {
  const { data: trafficInfo, ...rest } = useTraficInfo();

  const summary = trafficInfo
    ? {
        total: trafficInfo.length,
        normal: trafficInfo.filter((t) => t.status === "normal").length,
        perturbe: trafficInfo.filter((t) => t.status === "perturbe").length,
        interrompu: trafficInfo.filter((t) => t.status === "interrompu").length,
        hasActiveDisruptions: trafficInfo.some(
          (t) => t.status !== "normal"
        ),
      }
    : null;

  return { summary, trafficInfo, ...rest };
}

/**
 * Hook pour prefetch les infos trafic
 */
export function usePrefetchTraficInfo() {
  const queryClient = useQueryClient();

  return (mode?: TransportMode) => {
    queryClient.prefetchQuery({
      queryKey: ["trafic", mode || "all", undefined],
      queryFn: () => fetchTraficFromAPI(mode),
      staleTime: REFRESH_INTERVALS.lineReports.clientStale,
    });
  };
}

/**
 * Hook pour invalider le cache trafic
 */
export function useInvalidateTrafic() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["trafic"] });
  };
}
