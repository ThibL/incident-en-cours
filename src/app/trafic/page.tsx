"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TraficBoard } from "@/components/trafic/TraficBoard";
import { GlassPanel, StatusIndicator, DataCounter, LiveClock } from "@/components/ui/glass-panel";
import { useTraficSummary, useInvalidateTrafic } from "@/lib/hooks/useTraficInfo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Train,
  Bus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Radio,
  Activity
} from "lucide-react";
import type { TransportMode } from "@/types/prim";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TRANSPORT_TABS: { value: TransportMode | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "Tout", icon: <Activity className="h-4 w-4" /> },
  { value: "Metro", label: "Métro", icon: <span className="text-sm">🚇</span> },
  { value: "RER", label: "RER", icon: <span className="text-sm">🚆</span> },
  { value: "Tramway", label: "Tram", icon: <span className="text-sm">🚊</span> },
  { value: "Transilien", label: "Train", icon: <span className="text-sm">🚈</span> },
  { value: "Bus", label: "Bus", icon: <Bus className="h-4 w-4" /> },
];

export default function TraficPage() {
  const [activeTab, setActiveTab] = useState<TransportMode | "all">("all");
  const { summary, isLoading } = useTraficSummary();
  const invalidateTrafic = useInvalidateTrafic();

  // Calculate percentages
  const normalPercent = summary ? Math.round((summary.normal / summary.total) * 100) : 0;
  const perturbePercent = summary ? Math.round((summary.perturbe / summary.total) * 100) : 0;
  const interrompuPercent = summary ? Math.round((summary.interrompu / summary.total) * 100) : 0;

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
              <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold tracking-wide">
                ÉTAT DU RÉSEAU
              </h1>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10">
                <Radio className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-xs font-mono text-primary">SURVEILLANCE</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Surveillance en temps réel du réseau de transport
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveClock showSeconds className="hidden sm:flex" />
            <Button
              variant="outline"
              size="sm"
              onClick={invalidateTrafic}
              className="gap-2 font-mono text-xs"
            >
              <RefreshCw className="h-4 w-4" />
              ACTUALISER
            </Button>
          </div>
        </motion.div>

        {/* Status Summary Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Normal */}
          <GlassPanel accentColor="var(--status-normal)" className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StatusIndicator status="normal" size="md" pulse={false} />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    NORMAL
                  </span>
                </div>
                <p className="font-[family-name:var(--font-orbitron)] text-4xl font-bold text-[var(--status-normal)]">
                  {isLoading ? "--" : <DataCounter value={summary?.normal || 0} />}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {normalPercent}% du réseau
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-[var(--status-normal)]/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[var(--status-normal)]" />
              </div>
            </div>
          </GlassPanel>

          {/* Perturbé */}
          <GlassPanel accentColor="var(--status-warning)" className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StatusIndicator status="warning" size="md" pulse />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    PERTURBE
                  </span>
                </div>
                <p className="font-[family-name:var(--font-orbitron)] text-4xl font-bold text-[var(--status-warning)]">
                  {isLoading ? "--" : <DataCounter value={summary?.perturbe || 0} />}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {perturbePercent}% du réseau
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-[var(--status-warning)]/30 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-[var(--status-warning)]" />
              </div>
            </div>
          </GlassPanel>

          {/* Interrompu */}
          <GlassPanel accentColor="var(--status-critical)" className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StatusIndicator status="critical" size="md" pulse />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    INTERROMPU
                  </span>
                </div>
                <p className="font-[family-name:var(--font-orbitron)] text-4xl font-bold text-[var(--status-critical)]">
                  {isLoading ? "--" : <DataCounter value={summary?.interrompu || 0} />}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {interrompuPercent}% du réseau
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-[var(--status-critical)]/30 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-[var(--status-critical)]" />
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TransportMode | "all")}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold tracking-wide">
                ÉTAT DES LIGNES
              </h2>
            </div>

            <TabsList className="mb-4 w-full justify-start overflow-x-auto bg-background/50 border border-border/50 p-1">
              {TRANSPORT_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "gap-2 font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary",
                    "transition-all duration-200"
                  )}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <TraficBoard showHeader={false} />
            </TabsContent>

            {TRANSPORT_TABS.filter((t) => t.value !== "all").map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <TraficBoard
                  mode={tab.value as TransportMode}
                  title={`Lignes ${tab.label}`}
                  showHeader={false}
                />
              </TabsContent>
            ))}
          </Tabs>
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
                  ACTUALISATION AUTO: 60 SEC
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {summary?.total || 0} LIGNES SURVEILLÉES
              </span>
            </div>
          </GlassPanel>
        </motion.div>
      </main>
    </div>
  );
}
