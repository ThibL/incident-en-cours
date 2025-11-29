"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DisruptionsByModeChart } from "@/components/charts/DisruptionsByModeChart";
import { TrafficStatusPieChart } from "@/components/charts/TrafficStatusPieChart";
import { WaitingTimeChart } from "@/components/charts/WaitingTimeChart";
import { GlassPanel, StatusIndicator, DataCounter, LiveClock } from "@/components/ui/glass-panel";
import { useTraficSummary } from "@/lib/hooks/useTraficInfo";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Radio
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Stops for waiting time charts
const DEMO_STOPS = [
  { id: "22087", name: "Châtelet (L1)" },
  { id: "21959", name: "Châtelet (L14)" },
];

export default function StatsPage() {
  const { summary, isLoading } = useTraficSummary();

  // Calculate normal percentage
  const normalPercentage = summary
    ? Math.round((summary.normal / summary.total) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 container px-4 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold tracking-wide flex items-center gap-3">
                <Activity className="h-6 w-6 text-primary" />
                STATISTIQUES
              </h1>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10">
                <Radio className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-xs font-mono text-primary">TEMPS RÉEL</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Visualisations en temps réel du réseau de transport
            </p>
          </div>
          <LiveClock showSeconds className="hidden sm:flex" />
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Active Lines */}
          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <StatusIndicator status="normal" size="sm" pulse />
            </div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Lignes Actives
            </p>
            <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-foreground">
              {isLoading ? "--" : <DataCounter value={summary?.total || 0} />}
            </p>
          </GlassPanel>

          {/* Normal Rate */}
          <GlassPanel accentColor="var(--status-normal)" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-[var(--status-normal-bg)]">
                <Activity className="h-5 w-5 text-[var(--status-normal)]" />
              </div>
              <span className="text-xs font-mono text-[var(--status-normal)]">OK</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Taux Normal
            </p>
            <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[var(--status-normal)]">
              {isLoading ? "--" : <DataCounter value={normalPercentage} suffix="%" />}
            </p>
          </GlassPanel>

          {/* Perturbations */}
          <GlassPanel accentColor="var(--status-warning)" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-[var(--status-warning-bg)]">
                <AlertTriangle className="h-5 w-5 text-[var(--status-warning)]" />
              </div>
              <StatusIndicator status="warning" size="sm" pulse />
            </div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Perturbations
            </p>
            <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[var(--status-warning)]">
              {isLoading ? "--" : <DataCounter value={summary?.perturbe || 0} />}
            </p>
          </GlassPanel>

          {/* Interruptions */}
          <GlassPanel accentColor="var(--status-critical)" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-[var(--status-critical-bg)]">
                <Clock className="h-5 w-5 text-[var(--status-critical)]" />
              </div>
              <StatusIndicator status="critical" size="sm" pulse />
            </div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Interruptions
            </p>
            <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[var(--status-critical)]">
              {isLoading ? "--" : <DataCounter value={summary?.interrompu || 0} />}
            </p>
          </GlassPanel>
        </motion.div>

        {/* Main Charts */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wide">
                  DISTRIBUTION RÉSEAU
                </h3>
                <p className="text-xs text-muted-foreground">État global du réseau</p>
              </div>
            </div>
            <TrafficStatusPieChart />
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wide">
                  ANALYSE PAR MODE
                </h3>
                <p className="text-xs text-muted-foreground">Perturbations par mode</p>
              </div>
            </div>
            <DisruptionsByModeChart />
          </GlassPanel>
        </motion.div>

        {/* Waiting Time Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wide">
                  TEMPS D'ATTENTE
                </h3>
                <p className="text-xs text-muted-foreground">Temps d'attente en direct</p>
              </div>
              <div className="ml-auto flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10">
                <Radio className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-xs font-mono text-primary">EN DIRECT</span>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {DEMO_STOPS.map((stop) => (
                <div key={stop.id} className="p-4 rounded-lg bg-background/50 border border-border/30">
                  <p className="text-xs font-mono text-muted-foreground mb-2">
                    STATION: {stop.name}
                  </p>
                  <WaitingTimeChart stopId={stop.id} stopName={stop.name} />
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GlassPanel className="mt-6 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIndicator status="normal" size="sm" pulse />
                <span className="text-xs font-mono text-muted-foreground">
                  ACTUALISATION AUTO ACTIVÉE
                </span>
              </div>
              <LiveClock showSeconds className="text-xs" />
            </div>
          </GlassPanel>
        </motion.div>
      </main>
    </div>
  );
}
