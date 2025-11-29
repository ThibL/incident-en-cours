"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional accent color for left border glow */
  accentColor?: string;
  /** Whether to show the highlight gradient at top */
  highlight?: boolean;
  /** Intensity of the glass blur effect */
  blur?: "sm" | "md" | "lg" | "xl";
}

const blurClasses = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, accentColor, highlight = true, blur = "xl", children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl",
          "bg-[var(--glass-bg)] border border-[var(--glass-border)]",
          blurClasses[blur],
          "shadow-[0_8px_32px_oklch(0_0_0/0.4)]",
          className
        )}
        style={{
          borderLeftColor: accentColor,
          borderLeftWidth: accentColor ? "3px" : undefined,
          ...style,
        }}
        {...props}
      >
        {/* Top highlight gradient */}
        {highlight && (
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--glass-highlight)] to-transparent opacity-50"
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";

// Status Indicator Component
interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "normal" | "warning" | "critical" | "idle";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  label?: string;
}

const statusConfig = {
  normal: {
    color: "bg-[var(--status-normal)]",
    glow: "shadow-[0_0_10px_var(--status-normal-glow)]",
    pulseClass: "animate-pulse-slow",
  },
  warning: {
    color: "bg-[var(--status-warning)]",
    glow: "shadow-[0_0_10px_var(--status-warning-glow)]",
    pulseClass: "animate-pulse-medium",
  },
  critical: {
    color: "bg-[var(--status-critical)]",
    glow: "shadow-[0_0_10px_var(--status-critical-glow)]",
    pulseClass: "animate-pulse-fast",
  },
  idle: {
    color: "bg-muted-foreground/50",
    glow: "",
    pulseClass: "",
  },
};

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ status, size = "md", pulse = true, label, className, ...props }, ref) => {
    const config = statusConfig[status];

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
        <div
          className={cn(
            "rounded-full",
            sizeClasses[size],
            config.color,
            config.glow,
            pulse && config.pulseClass
          )}
        />
        {label && (
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
    );
  }
);
StatusIndicator.displayName = "StatusIndicator";

// Live Clock Component
interface LiveClockProps extends React.HTMLAttributes<HTMLDivElement> {
  showSeconds?: boolean;
  showMilliseconds?: boolean;
}

function LiveClock({ showSeconds = true, showMilliseconds = false, className, ...props }: LiveClockProps) {
  const [time, setTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    // Set initial time on client only to avoid hydration mismatch
    setTime(new Date());

    const interval = setInterval(
      () => setTime(new Date()),
      showMilliseconds ? 50 : 1000
    );
    return () => clearInterval(interval);
  }, [showMilliseconds]);

  // Show placeholder during SSR and initial client render
  if (!time) {
    return (
      <div className={cn("font-mono tabular-nums text-sm", className)} {...props}>
        <span className="text-primary">--</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-primary">--</span>
        {showSeconds && (
          <>
            <span className="text-muted-foreground">:</span>
            <span className="text-muted-foreground">--</span>
          </>
        )}
      </div>
    );
  }

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const ms = Math.floor(time.getMilliseconds() / 10).toString().padStart(2, "0");

  return (
    <div className={cn("font-mono tabular-nums text-sm", className)} {...props}>
      <span className="text-primary">{hours}</span>
      <span className="text-muted-foreground animate-blink">:</span>
      <span className="text-primary">{minutes}</span>
      {showSeconds && (
        <>
          <span className="text-muted-foreground animate-blink">:</span>
          <span className="text-muted-foreground">{seconds}</span>
        </>
      )}
      {showMilliseconds && (
        <>
          <span className="text-muted-foreground/50">.</span>
          <span className="text-muted-foreground/50">{ms}</span>
        </>
      )}
    </div>
  );
}

// Data Counter Component with animation
interface DataCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  suffix?: string;
  prefix?: string;
  animate?: boolean;
}

function DataCounter({ value, suffix, prefix, animate = true, className, ...props }: DataCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(animate ? 0 : value);

  React.useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000; // 1 second animation
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, animate]);

  return (
    <span className={cn("font-mono tabular-nums", className)} {...props}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

// Glow Badge Component
interface GlowBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  color: string;
  glow?: boolean;
}

const GlowBadge = React.forwardRef<HTMLDivElement, GlowBadgeProps>(
  ({ color, glow = true, children, className, style, ...props }, ref) => {
    // Calculate contrast color for text
    const getContrastColor = (hexColor: string): string => {
      const hex = hexColor.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? "#000000" : "#FFFFFF";
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          "px-2.5 py-1 rounded-md",
          "font-mono font-bold text-sm",
          "transition-shadow duration-300",
          className
        )}
        style={{
          backgroundColor: color,
          color: getContrastColor(color),
          boxShadow: glow ? `0 0 15px ${color}50, 0 0 5px ${color}30` : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlowBadge.displayName = "GlowBadge";

export { GlassPanel, StatusIndicator, LiveClock, DataCounter, GlowBadge };
