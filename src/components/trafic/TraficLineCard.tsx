"use client";

import { GlassPanel, GlowBadge, StatusIndicator } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertOctagon
} from "lucide-react";
import { cn, cleanHtmlContent } from "@/lib/utils";
import type { TraficInfo } from "@/types/prim";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TraficLineCardProps {
  line: TraficInfo;
  compact?: boolean;
  index?: number;
}

const statusConfig = {
  normal: {
    icon: CheckCircle,
    label: "NORMAL",
    status: "normal" as const,
    borderClass: "border-l-[var(--status-normal)]",
    bgClass: "bg-[var(--status-normal-bg)]",
    textClass: "text-[var(--status-normal)]",
  },
  perturbe: {
    icon: AlertTriangle,
    label: "PERTURBE",
    status: "warning" as const,
    borderClass: "border-l-[var(--status-warning)]",
    bgClass: "bg-[var(--status-warning-bg)]",
    textClass: "text-[var(--status-warning)]",
  },
  interrompu: {
    icon: XCircle,
    label: "INTERROMPU",
    status: "critical" as const,
    borderClass: "border-l-[var(--status-critical)]",
    bgClass: "bg-[var(--status-critical-bg)]",
    textClass: "text-[var(--status-critical)]",
  },
};

export function TraficLineCard({ line, compact = false, index = 0 }: TraficLineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[line.status];
  const Icon = config.icon;
  const hasDisruptions = line.disruptions.length > 0;

  // Calculate contrast color for text
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg",
          "bg-background/30 border border-border/30",
          "hover:bg-background/50 hover:border-border/50",
          "transition-all duration-200 cursor-pointer"
        )}
        onClick={() => hasDisruptions && setIsExpanded(!isExpanded)}
      >
        <GlowBadge
          color={line.lineColor}
          glow={line.status !== "normal"}
          className="min-w-[2.5rem] text-sm"
        >
          {line.lineCode || line.lineName}
        </GlowBadge>
        <StatusIndicator status={config.status} size="sm" pulse={line.status !== "normal"} />
        {hasDisruptions && (
          <span className="text-xs text-muted-foreground truncate flex-1">
            {cleanHtmlContent(line.disruptions[0]?.message || "").slice(0, 50)}...
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <GlassPanel
        accentColor={
          line.status === "normal"
            ? "var(--status-normal)"
            : line.status === "perturbe"
            ? "var(--status-warning)"
            : "var(--status-critical)"
        }
        className={cn(
          "transition-all duration-300 cursor-pointer",
          "hover:scale-[1.01]",
          hasDisruptions && "hover:shadow-lg"
        )}
      >
        <div
          className="p-4"
          onClick={() => hasDisruptions && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlowBadge
                color={line.lineColor}
                glow={line.status !== "normal"}
                className="min-w-[3.5rem] text-base px-3 py-1.5"
              >
                {line.lineCode || line.lineName}
              </GlowBadge>
              <div>
                <p className="font-medium text-sm text-foreground">{line.lineName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIndicator
                    status={config.status}
                    size="sm"
                    pulse={line.status !== "normal"}
                  />
                  <span className={cn("text-xs font-mono font-medium", config.textClass)}>
                    {config.label}
                  </span>
                </div>
              </div>
            </div>

            {hasDisruptions && (
              <div className="flex items-center gap-3">
                {/* Alert count badge */}
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md",
                  config.bgClass
                )}>
                  <AlertOctagon className={cn("h-3 w-3", config.textClass)} />
                  <span className={cn("text-xs font-mono font-bold", config.textClass)}>
                    {line.disruptions.length}
                  </span>
                </div>

                {/* Expand indicator */}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </div>
            )}
          </div>

          {/* Expanded disruption details */}
          <AnimatePresence>
            {isExpanded && hasDisruptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 pt-4 border-t border-border/30">
                  {line.disruptions.map((disruption, idx) => (
                    <motion.div
                      key={disruption.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "p-3 rounded-lg",
                        disruption.severity === "critical" && "bg-[var(--status-critical-bg)] border-l-2 border-l-[var(--status-critical)]",
                        disruption.severity === "warning" && "bg-[var(--status-warning-bg)] border-l-2 border-l-[var(--status-warning)]",
                        disruption.severity === "info" && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={cn(
                          "h-4 w-4 mt-0.5 shrink-0",
                          disruption.severity === "critical" && "text-[var(--status-critical)]",
                          disruption.severity === "warning" && "text-[var(--status-warning)]",
                          disruption.severity === "info" && "text-primary"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground mb-1">
                            {cleanHtmlContent(disruption.title)}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                            {cleanHtmlContent(disruption.message)}
                          </p>
                          {disruption.endTime && (
                            <p className="text-xs text-muted-foreground mt-2 font-mono">
                              Fin prévue: {new Date(disruption.endTime).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

// Grid view of line statuses for overview
interface TraficLineGridProps {
  lines: TraficInfo[];
  className?: string;
}

export function TraficLineGrid({ lines, className }: TraficLineGridProps) {
  // Sort by status: critical first, then warning, then normal
  const sortedLines = [...lines].sort((a, b) => {
    const order = { interrompu: 0, perturbe: 1, normal: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <motion.div
      className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.02 },
        },
      }}
    >
      {sortedLines.map((line, index) => (
        <TraficLineCard key={line.lineId} line={line} compact index={index} />
      ))}
    </motion.div>
  );
}
