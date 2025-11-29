"use client";

import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode } from "react";
import { CommandPaletteProvider } from "@/components/search/CommandPalette";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Données fraîches pendant 30 secondes
        staleTime: 30 * 1000,
        // Garder en cache 5 minutes
        gcTime: 5 * 60 * 1000,
        // Réessayer 1 fois en cas d'erreur
        retry: 1,
        // Refetch au focus de la fenêtre
        refetchOnWindowFocus: true,
        // Ne pas refetch au reconnect automatiquement
        refetchOnReconnect: "always",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Toujours créer un nouveau client côté serveur
    return makeQueryClient();
  } else {
    // Réutiliser le client existant côté client
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // NOTE: Éviter useState pour créer le queryClient si vous n'avez pas
  // besoin de la logique de suspension car cela peut causer des problèmes
  // de performance lors de l'hydratation
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <CommandPaletteProvider>
        {children}
      </CommandPaletteProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
