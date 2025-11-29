"use client";

import { useQuery } from "@tanstack/react-query";
import type { LineStop } from "@/types/prim";
import { REFRESH_INTERVALS } from "@/lib/api/prim-config";

interface LineStopsResponse {
  stops: LineStop[];
  lineId: string;
  count: number;
}

async function fetchLineStations(lineId: string): Promise<LineStop[]> {
  const response = await fetch(`/api/line-stops/${encodeURIComponent(lineId)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stops for line ${lineId}`);
  }

  const data: LineStopsResponse = await response.json();
  return data.stops;
}

interface UseLineStationsOptions {
  enabled?: boolean;
}

export function useLineStations(
  lineId: string | null,
  options: UseLineStationsOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["line-stations", lineId],
    queryFn: () => fetchLineStations(lineId!),
    enabled: enabled && !!lineId,
    staleTime: REFRESH_INTERVALS.lineStops.clientStale,
    gcTime: 7 * 24 * 60 * 60 * 1000, // Garder en cache 7 jours
  });
}
