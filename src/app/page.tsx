"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassPanel, StatusIndicator, LiveClock, DataCounter } from "@/components/ui/glass-panel";
import { TraficStatusLarge } from "@/components/trafic/TraficStatus";
import { FavoritesDepartureBoard } from "@/components/home/FavoritesDepartureBoard";
import { AddJourneyWizard } from "@/components/home/AddJourneyWizard";
import { Button } from "@/components/ui/button";
import { Plus, Star, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTraficSummary } from "@/lib/hooks/useTraficInfo";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { summary, isLoading } = useTraficSummary();
  const { getJourneys } = useFavoritesStore();
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [heroExiting, setHeroExiting] = useState(false);

  // Avoid hydration mismatch - favorites are loaded from localStorage on client only
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Timer pour faire disparaître le Hero après 2 secondes avec effet "Data Collapse"
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroExiting(true);
      // Attendre la fin de l'animation avant de retirer le Hero
      setTimeout(() => {
        setShowHero(false);
      }, 800);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const favoriteJourneys = hasMounted ? getJourneys() : [];
  const hasFavorites = favoriteJourneys.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <main className="flex-1">
        {/* Hero Section with Data Collapse Animation */}
        <AnimatePresence mode="sync">
          {showHero && (
            <motion.section
              key="hero-section"
              className="relative overflow-hidden origin-top"
              initial={{ opacity: 1, height: "auto" }}
              animate={{
                opacity: heroExiting ? 0 : 1,
                scaleY: heroExiting ? 0.3 : 1,
                filter: heroExiting ? "blur(8px)" : "blur(0px)",
                y: heroExiting ? -20 : 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                marginTop: 0,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0,
              }}
              transition={{
                duration: heroExiting ? 0.6 : 0.3,
                ease: heroExiting ? [0.4, 0, 0.2, 1] : "easeOut",
              }}
              style={{ transformOrigin: "top center" }}
            >
              {/* Scanline effect during exit */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: heroExiting ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                  initial={{ top: "0%" }}
                  animate={{
                    top: heroExiting ? "100%" : "0%",
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "linear",
                  }}
                  style={{
                    boxShadow: "0 0 20px var(--primary-glow), 0 0 40px var(--primary-glow)",
                  }}
                />
              </motion.div>

              <div className="py-16 md:py-24">
                {/* Animated background grid */}
                <div className="absolute inset-0 opacity-30">
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      opacity: heroExiting ? 0 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      backgroundImage: `
                        linear-gradient(var(--primary) 1px, transparent 1px),
                        linear-gradient(90deg, var(--primary) 1px, transparent 1px)
                      `,
                      backgroundSize: "60px 60px",
                      maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
                    }}
                  />
                </div>

                <div className="container px-4 max-w-6xl mx-auto relative">
                  <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                      opacity: heroExiting ? 0 : 1,
                      y: heroExiting ? -30 : 0,
                      scale: heroExiting ? 0.95 : 1,
                    }}
                    transition={{
                      duration: heroExiting ? 0.4 : 0.6,
                      delay: heroExiting ? 0 : 0,
                    }}
                  >
                    {/* System status */}
                    <motion.div
                      className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass mb-8"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: heroExiting ? 0 : 1,
                        scale: heroExiting ? 0.8 : 1,
                        y: heroExiting ? -20 : 0,
                      }}
                      transition={{
                        duration: heroExiting ? 0.3 : 0.4,
                        delay: heroExiting ? 0.05 : 0.2,
                      }}
                    >
                      <StatusIndicator status="normal" size="sm" pulse />
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                        Système en ligne
                      </span>
                      <span className="text-muted-foreground/50">|</span>
                      <LiveClock showSeconds />
                    </motion.div>

                    {/* Main title with intensified glow on exit */}
                    <motion.h1
                      className="font-[family-name:var(--font-orbitron)] font-bold text-4xl md:text-6xl lg:text-7xl tracking-tight mb-4"
                      initial={{ opacity: 1 }}
                      animate={{
                        opacity: heroExiting ? 0 : 1,
                        scale: heroExiting ? 0.9 : 1,
                        y: heroExiting ? -15 : 0,
                      }}
                      transition={{
                        duration: heroExiting ? 0.4 : 0.5,
                        delay: heroExiting ? 0.1 : 0,
                      }}
                      style={{
                        textShadow: heroExiting
                          ? "0 0 30px var(--primary-glow), 0 0 60px var(--primary-glow), 0 0 90px var(--primary-glow)"
                          : "0 0 10px var(--primary-glow)",
                      }}
                    >
                      INCIDENT VOYAGEUR
                    </motion.h1>
                    <motion.p
                      className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
                      initial={{ opacity: 1 }}
                      animate={{
                        opacity: heroExiting ? 0 : 1,
                        y: heroExiting ? -10 : 0,
                      }}
                      transition={{
                        duration: heroExiting ? 0.35 : 0.5,
                        delay: heroExiting ? 0.15 : 0,
                      }}
                    >
                      Surveillance temps réel des transports Île-de-France.
                      <br />
                      Métro • RER • Tramway • Transilien
                    </motion.p>

                    {/* Quick stats with staggered collapse */}
                    <motion.div
                      className="flex flex-wrap justify-center gap-4 md:gap-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {[
                        {
                          label: "Lignes Actives",
                          value: isLoading ? "---" : <DataCounter value={summary?.total || 0} />,
                          color: "text-primary",
                          delay: 0.2,
                        },
                        {
                          label: "Taux Normal",
                          value: isLoading ? "---" : (
                            <DataCounter
                              value={summary && summary.total > 0 ? Math.round((summary.normal / summary.total) * 100) : 0}
                              suffix="%"
                            />
                          ),
                          color: "text-[var(--status-normal)]",
                          delay: 0.25,
                        },
                        {
                          label: "Alertes",
                          value: isLoading ? "---" : (
                            <DataCounter value={(summary?.perturbe || 0) + (summary?.interrompu || 0)} />
                          ),
                          color: summary && (summary.perturbe + summary.interrompu) > 0
                            ? "text-[var(--status-warning)]"
                            : "text-muted-foreground",
                          delay: 0.3,
                        },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          animate={{
                            opacity: heroExiting ? 0 : 1,
                            scale: heroExiting ? 0.8 : 1,
                            y: heroExiting ? -20 - index * 5 : 0,
                            rotate: heroExiting ? (index % 2 === 0 ? -2 : 2) : 0,
                          }}
                          transition={{
                            duration: heroExiting ? 0.35 : 0.4,
                            delay: heroExiting ? stat.delay : 0,
                          }}
                        >
                          <GlassPanel
                            className="px-6 py-4"
                            style={{
                              boxShadow: heroExiting
                                ? "0 0 20px var(--primary-glow)"
                                : undefined,
                            }}
                          >
                            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                              {stat.label}
                            </p>
                            <p className={`font-[family-name:var(--font-orbitron)] text-3xl font-bold ${stat.color}`}>
                              {stat.value}
                            </p>
                          </GlassPanel>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Network Status */}
        <section className="py-8 border-y border-border/30 bg-background/50">
          <div className="container px-4 max-w-6xl mx-auto">
            <TraficStatusLarge showMigratedStats={!showHero} />
          </div>
        </section>

        <div className="container px-4 py-12 max-w-6xl mx-auto space-y-8">
          {/* Mes Trajets Section */}
          <section>
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-[family-name:var(--font-orbitron)] text-xl font-bold tracking-wide">
                    MES TRAJETS
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {hasFavorites
                      ? `${favoriteJourneys.length} trajet${favoriteJourneys.length !== 1 ? 's' : ''} enregistré${favoriteJourneys.length !== 1 ? 's' : ''}`
                      : "Ajoutez vos trajets quotidiens"
                    }
                  </p>
                </div>
              </div>
              {!showAddWizard && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddWizard(true)}
                  className="gap-2 font-mono text-xs"
                >
                  <Plus className="h-4 w-4" />
                  AJOUTER
                </Button>
              )}
            </motion.div>

            {/* Add Journey Wizard */}
            <AnimatePresence>
              {showAddWizard && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <AddJourneyWizard
                    onComplete={() => setShowAddWizard(false)}
                    onCancel={() => setShowAddWizard(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Favorites Dashboard - Departures only */}
            {hasFavorites && !showAddWizard && (
              <FavoritesDepartureBoard />
            )}

            {/* Empty State */}
            {!hasFavorites && !showAddWizard && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassPanel className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-[family-name:var(--font-orbitron)] text-lg font-bold mb-2">
                    AUCUN TRAJET
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Ajoutez vos trajets quotidiens pour voir les prochains départs
                    et l&apos;état de vos lignes en temps réel.
                  </p>
                  <Button onClick={() => setShowAddWizard(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un trajet
                  </Button>
                </GlassPanel>
              </motion.div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StatusIndicator status="normal" size="sm" pulse />
              <span className="text-xs font-mono text-muted-foreground">
                SYSTÈME OPÉRATIONNEL
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Données fournies par{" "}
              <Link
                href="https://prim.iledefrance-mobilites.fr"
                target="_blank"
                className="text-primary hover:underline"
              >
                Île-de-France Mobilités
              </Link>
            </p>
            <LiveClock showSeconds className="text-xs" />
          </div>
        </div>
      </footer>
    </div>
  );
}
