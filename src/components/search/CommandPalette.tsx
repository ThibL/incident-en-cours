"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useSearch } from "@/lib/hooks/useSearch";
import { useCommandK } from "@/lib/hooks/useKeyboardShortcut";
import { GlowBadge } from "@/components/ui/glass-panel";
import { MapPin, Train, Search, Loader2, X, ExternalLink } from "lucide-react";
import { getLineColor } from "@/types/prim";
import type { SearchResult } from "@/types/search";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// Context pour controle global de la palette
// ============================================

interface CommandPaletteContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return context;
}

// ============================================
// Provider
// ============================================

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Raccourci Cmd+K
  useCommandK(toggle);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      <CommandPaletteDialog />
    </CommandPaletteContext.Provider>
  );
}

// ============================================
// Dialog principal
// ============================================

function CommandPaletteDialog() {
  const { isOpen, close } = useCommandPalette();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: results, isLoading, error } = useSearch(debouncedQuery);

  // Debounce la query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset query quand la palette ferme
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [isOpen]);

  // Separer les resultats par type
  const stops = results?.filter((r) => r.type === "stop") || [];
  const lines = results?.filter((r) => r.type === "line") || [];

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === "stop") {
        // Naviguer vers la page de l'arret
        router.push(`/arret/${result.id}`);
      } else if (result.type === "line") {
        // Pour les lignes, on pourrait naviguer vers /trafic?line=X
        // Pour l'instant, on va sur la page trafic
        router.push("/trafic");
      }
      close();
    },
    [router, close]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={close}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <Command
              className={cn(
                "rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl",
                "ring-1 ring-primary/20"
              )}
              shouldFilter={false}
            >
              {/* Input */}
              <div className="flex items-center border-b border-border/50 px-4">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Rechercher une station ou ligne..."
                  className={cn(
                    "flex-1 bg-transparent py-4 px-3 text-sm outline-none",
                    "placeholder:text-muted-foreground"
                  )}
                  autoFocus
                />
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {query && !isLoading && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 rounded-md hover:bg-accent"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Results */}
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                {/* Empty state */}
                {debouncedQuery.length >= 2 && !isLoading && results?.length === 0 && (
                  <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                    Aucun resultat pour &quot;{debouncedQuery}&quot;
                  </Command.Empty>
                )}

                {/* Hint before searching */}
                {debouncedQuery.length < 2 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <p>Tapez au moins 2 caracteres pour rechercher</p>
                    <p className="text-xs mt-2">
                      Ex: &quot;Chatelet&quot;, &quot;Ligne 14&quot;, &quot;RER A&quot;
                    </p>
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="py-6 text-center text-sm text-destructive">
                    Erreur lors de la recherche
                  </div>
                )}

                {/* Stations */}
                {stops.length > 0 && (
                  <Command.Group heading="Stations" className="mb-2">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Stations
                    </div>
                    {stops.map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        onSelect={handleSelect}
                      />
                    ))}
                  </Command.Group>
                )}

                {/* Lignes */}
                {lines.length > 0 && (
                  <Command.Group heading="Lignes" className="mb-2">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Lignes
                    </div>
                    {lines.map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        onSelect={handleSelect}
                      />
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              {/* Footer */}
              <div className="border-t border-border/50 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↵</kbd>
                    <span>voir</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">esc</kbd>
                    <span>fermer</span>
                  </span>
                </div>
                <span>
                  {results?.length || 0} resultat{(results?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Item de resultat
// ============================================

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  const isStop = result.type === "stop";
  const Icon = isStop ? MapPin : Train;

  // Couleur pour les lignes ou la premiere ligne d'une station
  const color = isStop
    ? getLineColor(result.lines?.[0] || "")
    : result.color || getLineColor(result.code || "");

  return (
    <Command.Item
      value={`${result.type}-${result.id}`}
      onSelect={() => onSelect(result)}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
        "transition-colors duration-150",
        "hover:bg-accent data-[selected=true]:bg-accent"
      )}
    >
      {/* Icon */}
      <div
        className="p-1.5 rounded-md"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{result.name}</span>
          {result.city && (
            <span className="text-xs text-muted-foreground truncate">
              {result.city}
            </span>
          )}
        </div>
        {/* Lines for stations */}
        {isStop && result.lines && result.lines.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            {result.lines.slice(0, 5).map((line) => (
              <GlowBadge
                key={line}
                color={getLineColor(line)}
                glow={false}
                className="text-[10px] px-1.5 py-0"
              >
                {line}
              </GlowBadge>
            ))}
            {result.lines.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{result.lines.length - 5}
              </span>
            )}
          </div>
        )}
        {/* Mode for lines */}
        {!isStop && result.mode && (
          <span className="text-xs text-muted-foreground">{result.mode}</span>
        )}
      </div>

      {/* Line badge or arrow */}
      {!isStop && result.code ? (
        <GlowBadge color={color} glow={false} className="text-sm px-2 py-0.5">
          {result.code}
        </GlowBadge>
      ) : (
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      )}
    </Command.Item>
  );
}
