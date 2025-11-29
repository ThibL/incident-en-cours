"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassPanel, StatusIndicator, LiveClock, DataCounter } from "@/components/ui/glass-panel";
import { IncidentList } from "@/components/incidents/IncidentList";
import { useTraficInfo } from "@/lib/hooks/useTraficInfo";
import { disruptionsToIncidents } from "@/lib/utils/disruption-to-incident";
import { useMemo } from "react";
import { Activity, AlertTriangle, Info, Radio } from "lucide-react";
import { motion } from "framer-motion";

export default function IncidentsPage() {
  const { data: traffic, isLoading } = useTraficInfo({ refetchInterval: 15000 });

  // Convert traffic disruptions to incidents
  const incidents = useMemo(() => {
    if (!traffic) return [];

    const allIncidents: any[] = [];
    traffic.forEach((line) => {
      line.disruptions.forEach((disruption) => {
        // Convert SimplifiedDisruption to a format compatible with Incident
        allIncidents.push({
          id: disruption.id,
          title: disruption.title,
          message: disruption.message,
          category: "autre" as const,
          severity: disruption.severity,
          status: "active" as const,
          affectedLines: [line.lineCode],
          startTime: disruption.startTime,
          endTime: disruption.endTime,
          lastUpdate: new Date(),
          source: "prim" as const,
        });
      });
    });

    // Sort by severity (critical first)
    return allIncidents.sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [traffic]);

  const stats = useMemo(() => {
    if (!incidents) return { total: 0, critical: 0, warning: 0, info: 0 };

    return {
      total: incidents.length,
      critical: incidents.filter((i) => i.severity === "critical").length,
      warning: incidents.filter((i) => i.severity === "warning").length,
      info: incidents.filter((i) => i.severity === "info").length,
    };
  }, [incidents]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 container px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold tracking-wide flex items-center gap-3">
                <Activity className="h-6 w-6 text-primary" />
                SURVEILLANCE INCIDENTS
              </h1>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10">
                <Radio className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-xs font-mono text-primary">EN DIRECT</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Surveillance en temps réel des perturbations
            </p>
          </div>
          <LiveClock showSeconds className="hidden sm:flex" />
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassPanel className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase">
                TOTAL
              </span>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-foreground">
              {isLoading ? "--" : <DataCounter value={stats.total} />}
            </p>
          </GlassPanel>

          <GlassPanel accentColor="var(--status-critical)" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-[var(--status-critical)]" />
              <span className="text-xs font-mono text-muted-foreground uppercase">
                Critique
              </span>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-[var(--status-critical)]">
              {isLoading ? "--" : <DataCounter value={stats.critical} />}
            </p>
          </GlassPanel>

          <GlassPanel accentColor="var(--status-warning)" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-[var(--status-warning)]" />
              <span className="text-xs font-mono text-muted-foreground uppercase">
                Alerte
              </span>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-[var(--status-warning)]">
              {isLoading ? "--" : <DataCounter value={stats.warning} />}
            </p>
          </GlassPanel>

          <GlassPanel accentColor="var(--primary)" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase">
                Info
              </span>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-primary">
              {isLoading ? "--" : <DataCounter value={stats.info} />}
            </p>
          </GlassPanel>
        </motion.div>

        {/* Incidents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <GlassPanel className="p-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <StatusIndicator status="normal" size="md" pulse />
                  <span className="text-sm font-mono text-muted-foreground">
                    Chargement des incidents...
                  </span>
                </div>
              </div>
            </GlassPanel>
          ) : (
            <IncidentList
              incidents={incidents}
              emptyMessage="Aucun incident actif - Trafic normal sur l'ensemble du réseau"
            />
          )}
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
                  ACTUALISATION AUTO: 15 SEC
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                MISE À JOUR: À L'INSTANT
              </span>
            </div>
          </GlassPanel>
        </motion.div>
      </main>
    </div>
  );
}
