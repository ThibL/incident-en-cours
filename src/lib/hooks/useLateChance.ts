"use client";

import { useMemo } from "react";
import { useTraficInfo } from "./useTraficInfo";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { calculateLateChance, generateHumorQuote, type LateChanceResult } from "@/lib/utils/late-chance-calculator";

export function useLateChance(options?: { humorMode?: boolean }) {
  const { favorites } = useFavoritesStore();
  const { data: traffic, isLoading } = useTraficInfo({ refetchInterval: 30000 });

  const result: LateChanceResult | null = useMemo(() => {
    if (!traffic) return null;

    const baseResult = calculateLateChance(favorites, traffic);

    // Add humor quote if enabled
    if (options?.humorMode) {
      return {
        ...baseResult,
        humorQuote: generateHumorQuote(baseResult.risk, baseResult.affectedFavorites),
      };
    }

    return baseResult;
  }, [favorites, traffic, options?.humorMode]);

  return { result, isLoading };
}
