"use client";

import { useTraficSummary } from "@/lib/hooks/useTraficInfo";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Loader2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type TraficLevel = "normal" | "perturbe" | "interrompu";

const statusConfig: Record<
  TraficLevel,
  {
    icon: typeof CheckCircle;
    label: string;
    shortLabel: string;
    dotClass: string;
    textClass: string;
    glowClass: string;
    pulseClass: string;
  }
> = {
  normal: {
    icon: CheckCircle,
    label: "Trafic normal",
    shortLabel: "NORMAL",
    dotClass: "bg-[var(--status-normal)]",
    textClass: "text-[var(--status-normal)]",
    glowClass: "shadow-[0_0_10px_var(--status-normal-glow)]",
    pulseClass: "animate-pulse-slow",
  },
  perturbe: {
    icon: AlertTriangle,
    label: "Perturbations",
    shortLabel: "PERTURBE",
    dotClass: "bg-[var(--status-warning)]",
    textClass: "text-[var(--status-warning)]",
    glowClass: "shadow-[0_0_10px_var(--status-warning-glow)]",
    pulseClass: "animate-pulse-medium",
  },
  interrompu: {
    icon: XCircle,
    label: "Interruptions",
    shortLabel: "CRITIQUE",
    dotClass: "bg-[var(--status-critical)]",
    textClass: "text-[var(--status-critical)]",
    glowClass: "shadow-[0_0_10px_var(--status-critical-glow)]",
    pulseClass: "animate-pulse-fast",
  },
};

export function TraficStatus() {
  const { summary, isLoading, isError } = useTraficSummary();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 border border-border">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">CHARGEMENT...</span>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 border border-[var(--status-critical)]/30">
        <div className="h-2 w-2 rounded-full bg-[var(--status-critical)] animate-pulse" />
        <span className="text-xs font-mono text-[var(--status-critical)]">ERREUR</span>
      </div>
    );
  }

  // Determine overall traffic level
  let level: TraficLevel = "normal";
  if (summary.interrompu > 0) {
    level = "interrompu";
  } else if (summary.perturbe > 0) {
    level = "perturbe";
  }

  const config = statusConfig[level];
  const disruptionCount = summary.perturbe + summary.interrompu;

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg",
        "bg-background/50 border",
        level === "normal" && "border-[var(--status-normal)]/30",
        level === "perturbe" && "border-[var(--status-warning)]/30",
        level === "interrompu" && "border-[var(--status-critical)]/30"
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Status dot with glow */}
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          config.dotClass,
          config.glowClass,
          config.pulseClass
        )}
      />

      {/* Status text */}
      <span className={cn("text-xs font-mono font-medium tracking-wider", config.textClass)}>
        {config.shortLabel}
      </span>

      {/* Disruption count badge */}
      {disruptionCount > 0 && (
        <span
          className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold",
            "bg-[var(--status-warning)]/20 text-[var(--status-warning)]",
            level === "interrompu" && "bg-[var(--status-critical)]/20 text-[var(--status-critical)]"
          )}
        >
          {disruptionCount}
        </span>
      )}
    </motion.div>
  );
}

export function TraficStatusCompact() {
  const { summary, isLoading } = useTraficSummary();

  if (isLoading || !summary) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  let level: TraficLevel = "normal";
  if (summary.interrompu > 0) {
    level = "interrompu";
  } else if (summary.perturbe > 0) {
    level = "perturbe";
  }

  const config = statusConfig[level];
  const disruptionCount = summary.perturbe + summary.interrompu;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          config.dotClass,
          config.glowClass,
          config.pulseClass
        )}
      />
      <span className={cn("text-xs font-mono", config.textClass)}>
        {summary.hasActiveDisruptions
          ? `${disruptionCount} alerte${disruptionCount > 1 ? "s" : ""}`
          : "OK"}
      </span>
    </div>
  );
}

// Large status display for pages
interface TraficStatusLargeProps {
  showMigratedStats?: boolean;
}

export function TraficStatusLarge({ showMigratedStats = false }: TraficStatusLargeProps) {
  const { summary, isLoading } = useTraficSummary();

  if (isLoading || !summary) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl glass">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-mono text-sm text-muted-foreground">Chargement du statut...</span>
      </div>
    );
  }

  let level: TraficLevel = "normal";
  if (summary.interrompu > 0) {
    level = "interrompu";
  } else if (summary.perturbe > 0) {
    level = "perturbe";
  }

  const config = statusConfig[level];
  const Icon = config.icon;

  const stats = [
    {
      label: "Lignes",
      value: summary.total,
      color: "text-primary",
      delay: 0,
    },
    {
      label: "Taux Normal",
      value: summary.total > 0 ? Math.round((summary.normal / summary.total) * 100) : 0,
      suffix: "%",
      color: "text-[var(--status-normal)]",
      delay: 0.15,
    },
  ];

  return (
    <motion.div
      className={cn(
        "rounded-xl glass overflow-hidden",
        "border-l-4",
        level === "normal" && "border-l-[var(--status-normal)]",
        level === "perturbe" && "border-l-[var(--status-warning)]",
        level === "interrompu" && "border-l-[var(--status-critical)]"
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Single row with status + migrated stats */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Status icon */}
        <div
          className={cn(
            "flex items-center justify-center h-10 w-10 rounded-lg shrink-0",
            level === "normal" && "bg-[var(--status-normal-bg)]",
            level === "perturbe" && "bg-[var(--status-warning-bg)]",
            level === "interrompu" && "bg-[var(--status-critical-bg)]"
          )}
        >
          <Icon className={cn("h-5 w-5", config.textClass)} />
        </div>

        {/* Status text */}
        <div className="shrink-0">
          <p className={cn("font-mono font-bold text-sm tracking-wider", config.textClass)}>
            {config.label.toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground">
            {summary.total} lignes • {summary.normal} normales
          </p>
        </div>

        {/* Migrated stats - inline */}
        {showMigratedStats && (
          <div className="flex items-center gap-6 ml-auto">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="relative text-center"
                initial={{
                  opacity: 0,
                  x: -20,
                  filter: "blur(6px)",
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 0.4,
                  delay: stat.delay,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              >
                {/* Scanline effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-lg"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: stat.delay + 0.35, duration: 0.2 }}
                >
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    transition={{
                      delay: stat.delay,
                      duration: 0.3,
                      ease: "linear",
                    }}
                    style={{
                      boxShadow: "0 0 6px var(--primary-glow), 0 0 12px var(--primary-glow)",
                    }}
                  />
                </motion.div>

                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p className={cn("font-[family-name:var(--font-orbitron)] text-2xl font-bold", stat.color)}>
                  {stat.value}{stat.suffix || ""}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Alerts count - always visible when disruptions exist */}
        {summary.hasActiveDisruptions && !showMigratedStats && (
          <div className="ml-auto text-center">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Alertes</p>
            <p className={cn("font-[family-name:var(--font-orbitron)] text-2xl font-bold", config.textClass)}>
              {summary.perturbe + summary.interrompu}
            </p>
          </div>
        )}

        {/* Alerts count when stats are shown */}
        {summary.hasActiveDisruptions && showMigratedStats && (
          <div className="text-center pl-6 border-l border-border/30">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Alertes</p>
            <p className={cn("font-[family-name:var(--font-orbitron)] text-2xl font-bold", config.textClass)}>
              {summary.perturbe + summary.interrompu}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
