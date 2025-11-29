"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ScreenMessage, ScreenMessageChannel } from "@/types/prim";
import { REFRESH_INTERVALS } from "@/lib/api/prim-config";

interface ScreenMessagesResponse {
  messages: ScreenMessage[];
  filters: {
    lineId: string | null;
    channel: ScreenMessageChannel | null;
  };
  timestamp: string;
}

interface UseScreenMessagesOptions {
  lineId?: string;
  channel?: ScreenMessageChannel;
  enabled?: boolean;
  refetchInterval?: number;
}

async function fetchScreenMessagesFromAPI(
  options: Pick<UseScreenMessagesOptions, "lineId" | "channel">
): Promise<ScreenMessagesResponse> {
  const params = new URLSearchParams();
  if (options.lineId) params.set("lineId", options.lineId);
  if (options.channel) params.set("channel", options.channel);

  const response = await fetch(`/api/messages/affichage?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch screen messages: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook pour récupérer les messages affichés sur les écrans des stations
 * @param options - Options de configuration (lineId, channel, enabled, refetchInterval)
 */
export function useScreenMessages(options: UseScreenMessagesOptions = {}) {
  const {
    lineId,
    channel,
    enabled = true,
    refetchInterval = REFRESH_INTERVALS.generalMessage.clientRefetch,
  } = options;

  return useQuery({
    queryKey: ["screenMessages", lineId, channel],
    queryFn: () => fetchScreenMessagesFromAPI({ lineId, channel }),
    enabled,
    refetchInterval,
    staleTime: REFRESH_INTERVALS.generalMessage.clientStale,
    select: (data) => data.messages,
  });
}

/**
 * Hook pour récupérer uniquement les messages de perturbation
 */
export function useDisruptionMessages(lineId?: string) {
  return useScreenMessages({
    lineId,
    channel: "Perturbation",
  });
}

/**
 * Hook pour récupérer uniquement les messages d'information
 */
export function useInfoMessages(lineId?: string) {
  return useScreenMessages({
    lineId,
    channel: "Information",
  });
}

/**
 * Hook pour prefetch les messages écrans
 */
export function usePrefetchScreenMessages() {
  const queryClient = useQueryClient();

  return (options: Pick<UseScreenMessagesOptions, "lineId" | "channel">) => {
    queryClient.prefetchQuery({
      queryKey: ["screenMessages", options.lineId, options.channel],
      queryFn: () => fetchScreenMessagesFromAPI(options),
      staleTime: REFRESH_INTERVALS.generalMessage.clientStale,
    });
  };
}

/**
 * Hook pour invalider le cache des messages écrans
 */
export function useInvalidateScreenMessages() {
  const queryClient = useQueryClient();

  return (lineId?: string) => {
    if (lineId) {
      queryClient.invalidateQueries({
        queryKey: ["screenMessages", lineId],
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["screenMessages"] });
    }
  };
}
