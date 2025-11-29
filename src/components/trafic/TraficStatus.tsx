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
export function TraficStatusLarge() {
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

  return (
    <motion.div
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl glass",
        "border-l-4",
        level === "normal" && "border-l-[var(--status-normal)]",
        level === "perturbe" && "border-l-[var(--status-warning)]",
        level === "interrompu" && "border-l-[var(--status-critical)]"
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-lg",
          level === "normal" && "bg-[var(--status-normal-bg)]",
          level === "perturbe" && "bg-[var(--status-warning-bg)]",
          level === "interrompu" && "bg-[var(--status-critical-bg)]"
        )}
      >
        <Icon className={cn("h-5 w-5", config.textClass)} />
      </div>
      <div>
        <p className={cn("font-mono font-bold text-sm tracking-wider", config.textClass)}>
          {config.label.toUpperCase()}
        </p>
        <p className="text-xs text-muted-foreground">
          {summary.total} lignes surveillées • {summary.normal} normales
        </p>
      </div>
      {summary.hasActiveDisruptions && (
        <div className="ml-auto text-right">
          <p className={cn("font-mono text-2xl font-bold", config.textClass)}>
            {summary.perturbe + summary.interrompu}
          </p>
          <p className="text-xs text-muted-foreground">alertes</p>
        </div>
      )}
    </motion.div>
  );
}
