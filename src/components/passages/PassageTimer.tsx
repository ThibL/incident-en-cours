"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type UrgencyLevel = "relaxed" | "moderate" | "urgent" | "critical" | "arrived";

interface PassageTimerProps {
  expectedTime: Date | string;
  className?: string;
  showProgress?: boolean;
  maxMinutes?: number;
}

// Get urgency level based on time remaining
function getUrgencyLevel(seconds: number): UrgencyLevel {
  if (seconds <= 0) return "arrived";
  if (seconds <= 60) return "critical";
  if (seconds <= 120) return "urgent";
  if (seconds <= 300) return "moderate";
  return "relaxed";
}

// Styling configuration per urgency level
const urgencyConfig: Record<
  UrgencyLevel,
  {
    textClass: string;
    glowClass: string;
    pulseClass: string;
    bgClass: string;
  }
> = {
  relaxed: {
    textClass: "text-[var(--status-normal)]",
    glowClass: "",
    pulseClass: "",
    bgClass: "",
  },
  moderate: {
    textClass: "text-primary",
    glowClass: "text-glow-cyan",
    pulseClass: "",
    bgClass: "",
  },
  urgent: {
    textClass: "text-[var(--status-warning)]",
    glowClass: "text-glow-amber",
    pulseClass: "animate-pulse-slow",
    bgClass: "bg-[var(--status-warning-bg)]",
  },
  critical: {
    textClass: "text-[var(--status-critical)]",
    glowClass: "text-glow-red",
    pulseClass: "animate-pulse-medium",
    bgClass: "bg-[var(--status-critical-bg)]",
  },
  arrived: {
    textClass: "text-[var(--status-critical)]",
    glowClass: "text-glow-red",
    pulseClass: "animate-pulse-fast",
    bgClass: "bg-[var(--status-critical-bg)]",
  },
};

export function PassageTimer({
  expectedTime,
  className,
  showProgress = false,
  maxMinutes = 10,
}: PassageTimerProps) {
  const getTimestamp = (time: Date | string): number => {
    if (typeof time === "string") {
      return new Date(time).getTime();
    }
    return time.getTime();
  };

  const [timeLeft, setTimeLeft] = useState<number>(() =>
    Math.max(0, Math.floor((getTimestamp(expectedTime) - Date.now()) / 1000))
  );

  useEffect(() => {
    const targetTime = getTimestamp(expectedTime);

    const interval = setInterval(() => {
      const newTimeLeft = Math.max(
        0,
        Math.floor((targetTime - Date.now()) / 1000)
      );
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [expectedTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const urgency = getUrgencyLevel(timeLeft);
  const config = urgencyConfig[urgency];

  // Calculate progress percentage
  const progressPercent = showProgress
    ? Math.max(0, Math.min(100, 100 - (timeLeft / (maxMinutes * 60)) * 100))
    : 0;

  // Display format
  let displayValue: string;
  if (timeLeft <= 0) {
    displayValue = "A QUAI";
  } else if (minutes > 0) {
    displayValue = `${minutes}'`;
    if (seconds > 0 && minutes < 3) {
      displayValue += `${seconds.toString().padStart(2, "0")}`;
    }
  } else {
    displayValue = `${seconds}s`;
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={urgency + (urgency === "critical" ? timeLeft : minutes)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "font-mono font-bold tabular-nums text-2xl tracking-tight",
            config.textClass,
            config.glowClass,
            config.pulseClass
          )}
        >
          {displayValue}
        </motion.div>
      </AnimatePresence>

      {/* Urgency indicator dot */}
      {urgency !== "relaxed" && urgency !== "moderate" && (
        <motion.div
          className={cn(
            "absolute -right-1 -top-1 h-2 w-2 rounded-full",
            urgency === "urgent" && "bg-[var(--status-warning)] shadow-[0_0_8px_var(--status-warning-glow)]",
            urgency === "critical" && "bg-[var(--status-critical)] shadow-[0_0_8px_var(--status-critical-glow)]",
            urgency === "arrived" && "bg-[var(--status-critical)] shadow-[0_0_8px_var(--status-critical-glow)]",
            config.pulseClass
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}

      {/* Progress bar */}
      {showProgress && (
        <div className="mt-2 h-1 w-full bg-border/50 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              urgency === "relaxed" && "bg-[var(--status-normal)]",
              urgency === "moderate" && "bg-primary",
              urgency === "urgent" && "bg-[var(--status-warning)]",
              (urgency === "critical" || urgency === "arrived") && "bg-[var(--status-critical)]"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}

interface PassageTimerCompactProps {
  waitingMinutes: number;
  className?: string;
}

export function PassageTimerCompact({
  waitingMinutes,
  className,
}: PassageTimerCompactProps) {
  const seconds = waitingMinutes * 60;
  const urgency = getUrgencyLevel(seconds);
  const config = urgencyConfig[urgency];

  return (
    <span
      className={cn(
        "font-mono font-bold tabular-nums text-lg",
        config.textClass,
        config.glowClass,
        className
      )}
    >
      {waitingMinutes <= 0 ? "A QUAI" : `${waitingMinutes}'`}
    </span>
  );
}

// Large countdown display for hero sections
interface PassageTimerLargeProps {
  expectedTime: Date | string;
  label?: string;
  className?: string;
}

export function PassageTimerLarge({
  expectedTime,
  label,
  className,
}: PassageTimerLargeProps) {
  const getTimestamp = (time: Date | string): number => {
    if (typeof time === "string") {
      return new Date(time).getTime();
    }
    return time.getTime();
  };

  const [timeLeft, setTimeLeft] = useState<number>(() =>
    Math.max(0, Math.floor((getTimestamp(expectedTime) - Date.now()) / 1000))
  );

  useEffect(() => {
    const targetTime = getTimestamp(expectedTime);

    const interval = setInterval(() => {
      const newTimeLeft = Math.max(
        0,
        Math.floor((targetTime - Date.now()) / 1000)
      );
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [expectedTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const urgency = getUrgencyLevel(timeLeft);
  const config = urgencyConfig[urgency];

  return (
    <div className={cn("text-center", className)}>
      {label && (
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
          {label}
        </p>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={urgency + (urgency === "critical" ? timeLeft : minutes)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "font-[family-name:var(--font-orbitron)] font-bold tabular-nums",
            "text-5xl md:text-6xl tracking-tight",
            config.textClass,
            config.glowClass,
            config.pulseClass
          )}
        >
          {timeLeft <= 0 ? (
            "A QUAI"
          ) : (
            <>
              <span>{minutes.toString().padStart(2, "0")}</span>
              <span className="animate-blink">:</span>
              <span>{seconds.toString().padStart(2, "0")}</span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
