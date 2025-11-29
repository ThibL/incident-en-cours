"use client";

import { useState } from "react";
import { GlassPanel, GlowBadge } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { useFavoritesStore, type FavoriteJourney } from "@/lib/stores/favorites-store";
import {
  METRO_LINES_DATA,
  RER_LINES_DATA,
  TRANSILIEN_LINES_DATA,
  type LineInfo,
} from "@/lib/data/line-stations";
import { useLineStations } from "@/lib/hooks/useLineStations";
import type { LineStop } from "@/types/prim";
import { ArrowLeft, ArrowRight, Check, Train, MapPin, Navigation, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type WizardStep = "line" | "station" | "direction" | "confirm";

interface AddJourneyWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function AddJourneyWizard({ onComplete, onCancel }: AddJourneyWizardProps) {
  const [step, setStep] = useState<WizardStep>("line");
  const [selectedLine, setSelectedLine] = useState<LineInfo | null>(null);
  const [selectedStation, setSelectedStation] = useState<LineStop | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);

  const addFavorite = useFavoritesStore((state) => state.addFavorite);

  // Chargement dynamique des stations via l'API PRIM
  const {
    data: stations,
    isLoading: stationsLoading,
    error: stationsError,
  } = useLineStations(selectedLine?.id || null);

  const handleSelectLine = (line: LineInfo) => {
    setSelectedLine(line);
    setSelectedStation(null);
    setSelectedDirection(null);
    setStep("station");
  };

  const handleSelectStation = (station: LineStop) => {
    setSelectedStation(station);
    setStep("direction");
  };

  const handleSelectDirection = (direction: string | null) => {
    setSelectedDirection(direction);
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!selectedLine || !selectedStation) return;

    const journeyId = `journey:${selectedLine.code}:${selectedStation.id}${
      selectedDirection ? `:${selectedDirection}` : ""
    }`;

    const journey: Omit<FavoriteJourney, "addedAt"> = {
      type: "journey",
      id: journeyId,
      line: {
        id: selectedLine.id,
        code: selectedLine.code,
        name: selectedLine.name,
        color: selectedLine.color,
        mode: selectedLine.mode,
      },
      stop: {
        id: selectedStation.id,
        name: selectedStation.name,
      },
      direction: selectedDirection || undefined,
    };

    addFavorite(journey);
    onComplete();
  };

  const handleBack = () => {
    if (step === "station") {
      setStep("line");
      setSelectedLine(null);
    } else if (step === "direction") {
      setStep("station");
      setSelectedStation(null);
    } else if (step === "confirm") {
      setStep("direction");
      setSelectedDirection(null);
    }
  };

  const stepNumber = step === "line" ? 1 : step === "station" ? 2 : step === "direction" ? 3 : 4;

  return (
    <GlassPanel className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Train className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wide">
              NOUVEAU TRAJET
            </h3>
            <p className="text-xs text-muted-foreground">
              Étape {stepNumber}/4
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Annuler
        </Button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= stepNumber ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Choose Line */}
        {step === "line" && (
          <motion.div
            key="line"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Train className="h-4 w-4" />
              Choisir une ligne
            </h4>

            <div className="space-y-4">
              {/* Métro */}
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Métro
                </p>
                <div className="flex flex-wrap gap-2">
                  {METRO_LINES_DATA.map((line) => (
                    <button
                      key={line.id}
                      onClick={() => handleSelectLine(line)}
                      className="transition-transform hover:scale-105"
                    >
                      <GlowBadge color={line.color} className="text-sm px-3 py-1.5">
                        {line.code}
                      </GlowBadge>
                    </button>
                  ))}
                </div>
              </div>

              {/* RER */}
              {RER_LINES_DATA.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                    RER
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {RER_LINES_DATA.map((line) => (
                      <button
                        key={line.id}
                        onClick={() => handleSelectLine(line)}
                        className="transition-transform hover:scale-105"
                      >
                        <GlowBadge color={line.color} className="text-sm px-3 py-1.5">
                          {line.code}
                        </GlowBadge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Transilien */}
              {TRANSILIEN_LINES_DATA.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                    Transilien
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TRANSILIEN_LINES_DATA.map((line) => (
                      <button
                        key={line.id}
                        onClick={() => handleSelectLine(line)}
                        className="transition-transform hover:scale-105"
                      >
                        <GlowBadge color={line.color} className="text-sm px-3 py-1.5">
                          {line.code}
                        </GlowBadge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Choose Station */}
        {step === "station" && selectedLine && (
          <motion.div
            key="station"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <GlowBadge color={selectedLine.color} className="text-sm">
                {selectedLine.code}
              </GlowBadge>
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Choisir une station
              </h4>
            </div>

            {/* Loading state */}
            {stationsLoading && (
              <div className="flex items-center justify-center py-8 gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Chargement des stations...
                </span>
              </div>
            )}

            {/* Error state */}
            {stationsError && (
              <div className="py-6 text-center text-sm text-destructive">
                Erreur lors du chargement des stations
              </div>
            )}

            {/* Stations list */}
            {!stationsLoading && !stationsError && stations && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {stations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleSelectStation(station)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{station.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!stationsLoading && !stationsError && stations?.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucune station trouvée pour cette ligne
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Choose Direction */}
        {step === "direction" && selectedLine && selectedStation && (
          <motion.div
            key="direction"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <GlowBadge color={selectedLine.color} className="text-sm">
                {selectedLine.code}
              </GlowBadge>
              <span className="text-sm text-muted-foreground">→</span>
              <span className="text-sm">{selectedStation.name}</span>
            </div>

            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Choisir une direction (optionnel)
            </h4>

            <div className="space-y-2">
              {selectedLine.directions.map((direction) => (
                <button
                  key={direction}
                  onClick={() => handleSelectDirection(direction)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">vers {direction}</span>
                </button>
              ))}
              <button
                onClick={() => handleSelectDirection(null)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 text-left transition-all hover:border-primary/50 hover:bg-primary/5 text-muted-foreground"
              >
                <span className="text-sm">Toutes les directions</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === "confirm" && selectedLine && selectedStation && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h4 className="text-sm font-medium">Confirmer le trajet</h4>
            </div>

            <GlassPanel accentColor={selectedLine.color} className="p-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Train className="h-4 w-4 text-muted-foreground" />
                  <GlowBadge color={selectedLine.color} className="text-sm">
                    {selectedLine.code}
                  </GlowBadge>
                  <span className="text-sm">{selectedLine.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedStation.name}</span>
                </div>
                {selectedDirection && (
                  <div className="flex items-center gap-3">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">vers {selectedDirection}</span>
                  </div>
                )}
              </div>
            </GlassPanel>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleConfirm} className="flex-1 gap-2">
                <Check className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
