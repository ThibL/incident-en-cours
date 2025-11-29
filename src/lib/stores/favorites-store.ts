import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FavoriteStop {
  id: string;
  name: string;
  lines: string[];
  addedAt: number;
}

interface FavoritesState {
  favorites: FavoriteStop[];

  // Actions
  addFavorite: (stop: Omit<FavoriteStop, "addedAt">) => void;
  removeFavorite: (stopId: string) => void;
  isFavorite: (stopId: string) => boolean;
  reorderFavorites: (fromIndex: number, toIndex: number) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (stop) => {
        const exists = get().favorites.some((f) => f.id === stop.id);
        if (!exists) {
          set((state) => ({
            favorites: [
              ...state.favorites,
              { ...stop, addedAt: Date.now() },
            ],
          }));
        }
      },

      removeFavorite: (stopId) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== stopId),
        }));
      },

      isFavorite: (stopId) => {
        return get().favorites.some((f) => f.id === stopId);
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
    }),
    {
      name: "idfm-favorites",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// Hook utilitaire pour les actions fréquentes
export function useFavoriteActions() {
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

  const toggleFavorite = (stop: Omit<FavoriteStop, "addedAt">) => {
    if (isFavorite(stop.id)) {
      removeFavorite(stop.id);
    } else {
      addFavorite(stop);
    }
  };

  return { addFavorite, removeFavorite, toggleFavorite, isFavorite };
}
