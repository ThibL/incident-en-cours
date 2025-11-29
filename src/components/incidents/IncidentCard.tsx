"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel, StatusIndicator, GlowBadge } from "@/components/ui/glass-panel";
import { type Incident, getSeverityColor, getCategoryLabel } from "@/types/incident";
import { ChevronDown, ChevronUp, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface IncidentCardProps {
  incident: Incident;
  defaultExpanded?: boolean;
}

export function IncidentCard({ incident, defaultExpanded = false }: IncidentCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const severityColor = getSeverityColor(incident.severity);
  const categoryLabel = getCategoryLabel(incident.category);

  const timeAgo = formatDistanceToNow(new Date(incident.lastUpdate), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <GlassPanel
        accentColor={severityColor}
        className="overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left side */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <StatusIndicator
                  status={incident.severity === "critical" ? "critical" : incident.severity === "warning" ? "warning" : "normal"}
                  size="sm"
                  pulse={incident.status === "active"}
                />
                <GlowBadge
                  color={severityColor}
                  className="text-xs font-bold"
                >
                  {incident.severity.toUpperCase()}
                </GlowBadge>
                <span className="text-xs font-mono text-muted-foreground">
                  {categoryLabel}
                </span>
              </div>

              <h3 className="text-base font-semibold text-foreground mb-1">
                {incident.title}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {incident.message}
              </p>

              {/* Lines */}
              <div className="flex flex-wrap gap-2 mt-3">
                {incident.affectedLines.map((line) => (
                  <GlowBadge key={line} color="var(--primary)" className="text-xs">
                    {line}
                  </GlowBadge>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border/30"
            >
              <div className="p-4 space-y-4">
                {/* Timing Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                      DÉBUT
                    </p>
                    <p className="text-sm font-mono text-foreground">
                      {new Date(incident.startTime).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  {incident.endTime && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                        FIN ESTIMÉE
                      </p>
                      <p className="text-sm font-mono text-foreground">
                        {new Date(incident.endTime).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Cause */}
                {incident.cause && (
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                      CAUSE
                    </p>
                    <p className="text-sm text-foreground">{incident.cause}</p>
                  </div>
                )}

                {/* Impact */}
                {incident.impact && (
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                      IMPACT
                    </p>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm text-foreground">{incident.impact}</p>
                    </div>
                  </div>
                )}

                {/* Full Message */}
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    INFORMATIONS COMPLÈTES
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {incident.message}
                  </p>
                </div>

                {/* Steps (if available) */}
                {incident.steps && incident.steps.length > 0 && (
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                      PROGRESSION
                    </p>
                    <div className="space-y-2">
                      {incident.steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-2 rounded-lg bg-background/30"
                        >
                          <div
                            className={`h-2 w-2 rounded-full mt-2 ${
                              step.status === "resolution"
                                ? "bg-green-500"
                                : step.status === "worsening"
                                ? "bg-red-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-mono text-muted-foreground">
                              {new Date(step.timestamp).toLocaleString("fr-FR")}
                            </p>
                            <p className="text-sm text-foreground mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">STATUT:</span>
                    <GlowBadge
                      color={incident.status === "active" ? severityColor : "var(--status-normal)"}
                      className="text-xs"
                    >
                      {incident.status === "active" ? "ACTIF" : "RÉSOLU"}
                    </GlowBadge>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    ID: {incident.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </motion.div>
  );
}
