"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassPanel, StatusIndicator, LiveClock, DataCounter, GlowBadge } from "@/components/ui/glass-panel";
import { TraficStatusLarge } from "@/components/trafic/TraficStatus";
import { LateChanceWidget } from "@/components/home/LateChanceWidget";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTraficSummary } from "@/lib/hooks/useTraficInfo";
import { getLineColor } from "@/types/prim";

// Demo stops (real IDFM IDs)
const DEMO_STOPS = [
  { id: "22087", name: "Châtelet", lines: ["1"] },
  { id: "21959", name: "Châtelet", lines: ["14"] },
  { id: "22092", name: "Châtelet", lines: ["4"] },
  { id: "21966", name: "Châtelet", lines: ["11"] },
];

export default function HomePage() {
  const { summary, isLoading } = useTraficSummary();

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* System status */}
              <motion.div
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <StatusIndicator status="normal" size="sm" pulse />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Système en ligne
                </span>
                <span className="text-muted-foreground/50">|</span>
                <LiveClock showSeconds />
              </motion.div>

              {/* Main title */}
              <h1 className="font-[family-name:var(--font-orbitron)] font-bold text-4xl md:text-6xl lg:text-7xl tracking-tight mb-4 text-glow-cyan">
                INCIDENT VOYAGEUR
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Surveillance temps réel des transports Île-de-France.
                <br />
                Métro • RER • Tramway • Bus
              </p>

              {/* Quick stats */}
              <motion.div
                className="flex flex-wrap justify-center gap-4 md:gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GlassPanel className="px-6 py-4">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    Lignes Actives
                  </p>
                  <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-primary">
                    {isLoading ? "---" : <DataCounter value={summary?.total || 0} />}
                  </p>
                </GlassPanel>
                <GlassPanel className="px-6 py-4">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    Taux Normal
                  </p>
                  <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[var(--status-normal)]">
                    {isLoading ? "---" : (
                      <DataCounter
                        value={summary && summary.total > 0 ? Math.round((summary.normal / summary.total) * 100) : 0}
                        suffix="%"
                      />
                    )}
                  </p>
                </GlassPanel>
                <GlassPanel className="px-6 py-4">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    Alertes
                  </p>
                  <p className={`font-[family-name:var(--font-orbitron)] text-3xl font-bold ${
                    summary && (summary.perturbe + summary.interrompu) > 0
                      ? "text-[var(--status-warning)]"
                      : "text-muted-foreground"
                  }`}>
                    {isLoading ? "---" : (
                      <DataCounter value={(summary?.perturbe || 0) + (summary?.interrompu || 0)} />
                    )}
                  </p>
                </GlassPanel>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Network Status */}
        <section className="py-8 border-y border-border/30 bg-background/50">
          <div className="container px-4 max-w-6xl mx-auto">
            <TraficStatusLarge />
          </div>
        </section>

        <div className="container px-4 py-12 max-w-6xl mx-auto space-y-16">
          {/* Late Chance Widget */}
          <section>
            <LateChanceWidget humorMode={false} />
          </section>

          {/* Demo Stops */}
          <section>
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div>
                <h2 className="font-[family-name:var(--font-orbitron)] text-xl font-bold tracking-wide">
                  STATIONS
                </h2>
                <p className="text-sm text-muted-foreground">
                  Accédez aux prochains passages en temps réel
                </p>
              </div>
              <StatusIndicator status="normal" label="PRÊT" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_STOPS.map((stop, index) => (
                <motion.div
                  key={stop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/arret/${stop.id}`}>
                    <GlassPanel
                      accentColor={getLineColor(stop.lines[0])}
                      className="p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <GlowBadge color={getLineColor(stop.lines[0])}>
                            {stop.lines[0]}
                          </GlowBadge>
                          <div>
                            <h3 className="font-medium text-foreground">{stop.name}</h3>
                            <p className="text-xs font-mono text-muted-foreground">
                              ID: {stop.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-mono">ACCÉDER</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </GlassPanel>
                  </Link>
                </motion.div>
              ))}
            </div>
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
