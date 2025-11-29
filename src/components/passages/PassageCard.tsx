"use client";

import { GlassPanel, GlowBadge } from "@/components/ui/glass-panel";
import { PassageTimer, PassageTimerCompact } from "./PassageTimer";
import type { Passage } from "@/types/prim";
import { getLineColor } from "@/types/prim";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface PassageCardProps {
  passage: Passage;
  variant?: "default" | "compact";
  className?: string;
  index?: number;
}

export function PassageCard({
  passage,
  variant = "default",
  className,
  index = 0,
}: PassageCardProps) {
  const lineColor = getLineColor(passage.lineName);
  const isDelayed = passage.status === "delayed";
  const isCancelled = passage.status === "cancelled";

  // Determine urgency based on waiting time
  const waitingSeconds = passage.waitingTime * 60;
  const isUrgent = waitingSeconds <= 120 && waitingSeconds > 0;
  const isCritical = waitingSeconds <= 60 && waitingSeconds > 0;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className={cn(
          "flex items-center justify-between py-3 px-4",
          "rounded-lg border border-border/50",
          "bg-[var(--glass-bg)] backdrop-blur-sm",
          "transition-all duration-200",
          "hover:border-primary/30 hover:bg-background/60",
          isCancelled && "opacity-50",
          className
        )}
        style={{
          borderLeftWidth: "3px",
          borderLeftColor: lineColor,
        }}
      >
        <div className="flex items-center gap-3">
          <GlowBadge color={lineColor} glow={!isCancelled}>
            {passage.lineName}
          </GlowBadge>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-[150px]">
              {passage.destination}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCancelled ? (
            <span className="text-sm font-mono text-[var(--status-critical)]">SUPPRIME</span>
          ) : (
            <PassageTimerCompact waitingMinutes={passage.waitingTime} />
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <GlassPanel
        accentColor={lineColor}
        className={cn(
          "transition-all duration-300",
          "hover:scale-[1.01] hover:shadow-lg",
          isCancelled && "opacity-50",
          isCritical && !isCancelled && "border-[var(--status-critical)]/30",
          isUrgent && !isCritical && !isCancelled && "border-[var(--status-warning)]/30",
          className
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Line badge and destination */}
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <GlowBadge
                color={lineColor}
                glow={!isCancelled}
                className="text-base min-w-[3rem] shrink-0"
              >
                {passage.lineName}
              </GlowBadge>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                  <p className="font-medium truncate text-foreground">
                    {passage.destination}
                  </p>
                </div>
                {passage.direction && (
                  <p className="text-sm text-muted-foreground truncate">
                    {passage.direction}
                  </p>
                )}
              </div>
            </div>

            {/* Wait time */}
            <div className="flex flex-col items-end shrink-0">
              {isCancelled ? (
                <div className="flex items-center gap-2 text-[var(--status-critical)]">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-mono font-bold">SUPPRIME</span>
                </div>
              ) : (
                <>
                  <PassageTimer
                    expectedTime={passage.expectedTime}
                    showProgress
                  />
                  {isDelayed && (
                    <div className="flex items-center gap-1 text-[var(--status-warning)] text-xs mt-2">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">RETARD</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scanline effect overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] rounded-xl overflow-hidden"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            )`,
          }}
        />
      </GlassPanel>
    </motion.div>
  );
}

interface PassageListProps {
  passages: Passage[];
  variant?: "default" | "compact";
  maxItems?: number;
  className?: string;
}

export function PassageList({
  passages,
  variant = "default",
  maxItems = 5,
  className,
}: PassageListProps) {
  const displayedPassages = passages.slice(0, maxItems);

  return (
    <motion.div
      className={cn("space-y-3", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05 },
        },
      }}
    >
      {displayedPassages.map((passage, index) => (
        <PassageCard
          key={passage.id}
          passage={passage}
          variant={variant}
          index={index}
        />
      ))}
      {passages.length > maxItems && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-mono text-muted-foreground text-center py-3 border-t border-border/50"
        >
          +{passages.length - maxItems} autres passages
        </motion.p>
      )}
    </motion.div>
  );
}
