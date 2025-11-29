"use client";

import { useQuery } from "@tanstack/react-query";
import type { SearchResult, SearchResponse } from "@/types/search";
import { REFRESH_INTERVALS } from "@/lib/api/prim-config";

type SearchType = "stop" | "line" | "all";

interface UseSearchOptions {
  type?: SearchType;
  enabled?: boolean;
}

async function fetchSearchResults(
  query: string,
  type: SearchType
): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    type,
  });

  const response = await fetch(`/api/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  const data: SearchResponse & { count: number } = await response.json();
  return data.results;
}

/**
 * Hook pour rechercher des stations et lignes
 * @param query - Terme de recherche (min 2 caractères pour activer)
 * @param options - Options de recherche
 */
export function useSearch(query: string, options: UseSearchOptions = {}) {
  const { type = "all", enabled = true } = options;

  return useQuery({
    queryKey: ["search", query, type],
    queryFn: () => fetchSearchResults(query, type),
    enabled: enabled && query.length >= 2,
    staleTime: REFRESH_INTERVALS.search.clientStale,
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour rechercher uniquement des stations
 */
export function useSearchStops(query: string, enabled = true) {
  return useSearch(query, { type: "stop", enabled });
}

/**
 * Hook pour rechercher uniquement des lignes
 */
export function useSearchLines(query: string, enabled = true) {
  return useSearch(query, { type: "line", enabled });
}
