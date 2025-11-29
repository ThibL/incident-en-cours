import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Types pour les favoris
export interface FavoriteStop {
  type: "stop";
  id: string;
  name: string;
  lines: string[];
  addedAt: number;
}

export interface FavoriteLine {
  type: "line";
  id: string;
  code: string;
  name: string;
  mode: "Metro" | "RER" | "Tramway" | "Bus" | "Transilien";
  color: string;
  addedAt: number;
}

// Nouveau type: Trajet favori (ligne + station + direction)
export interface FavoriteJourney {
  type: "journey";
  id: string; // Format: "journey:{lineCode}:{stopId}:{direction}"
  line: {
    id: string;
    code: string;
    name: string;
    color: string;
    mode: "Metro" | "RER" | "Tramway" | "Bus" | "Transilien";
  };
  stop: {
    id: string;
    name: string;
  };
  direction?: string; // Destination optionnelle pour filtrer (ex: "Olympiades")
  addedAt: number;
}

export type Favorite = FavoriteStop | FavoriteLine | FavoriteJourney;

interface FavoritesState {
  favorites: Favorite[];

  // Actions génériques
  addFavorite: (item: Omit<Favorite, "addedAt">) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  reorderFavorites: (fromIndex: number, toIndex: number) => void;
  clearFavorites: () => void;

  // Getters filtrés
  getStops: () => FavoriteStop[];
  getLines: () => FavoriteLine[];
  getJourneys: () => FavoriteJourney[];
  getLinesCodes: () => string[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (item) => {
        const exists = get().favorites.some((f) => f.id === item.id);
        if (!exists) {
          set((state) => ({
            favorites: [
              ...state.favorites,
              { ...item, addedAt: Date.now() } as Favorite,
            ],
          }));
        }
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },

      isFavorite: (id) => {
        return get().favorites.some((f) => f.id === id);
      },

      reorderFavorites: (fromIndex, toIndex) => {
        set((state) => {
          const newFavorites = [...state.favorites];
          const [removed] = newFavorites.splice(fromIndex, 1);
          newFavorites.splice(toIndex, 0, removed);
          return { favorites: newFavorites };
        });
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },

      getStops: () => {
        return get().favorites.filter((f): f is FavoriteStop => f.type === "stop");
      },

      getLines: () => {
        return get().favorites.filter((f): f is FavoriteLine => f.type === "line");
      },

      getJourneys: () => {
        return get().favorites.filter((f): f is FavoriteJourney => f.type === "journey");
      },

      getLinesCodes: () => {
        return get()
          .favorites.filter((f): f is FavoriteLine => f.type === "line")
          .map((l) => l.code);
      },
    }),
    {
      name: "idfm-favorites",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted, version) => {
        if (version === 1) {
          // Migration depuis v1: ajouter type: "stop" aux anciens favoris
          const old = persisted as { favorites: Omit<FavoriteStop, "type">[] };
          return {
            favorites: old.favorites.map((f) => ({ ...f, type: "stop" as const })),
          };
        }
        // v2 → v3: pas de changement de structure, juste ajout du type "journey"
        return persisted as FavoritesState;
      },
    }
  )
);

// Hook utilitaire pour les actions fréquentes
export function useFavoriteActions() {
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

  const toggleFavorite = (item: Omit<Favorite, "addedAt">) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  return { addFavorite, removeFavorite, toggleFavorite, isFavorite };
}
