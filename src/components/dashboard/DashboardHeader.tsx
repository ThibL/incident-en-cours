"use client";

import { TraficStatus } from "@/components/trafic/TraficStatus";
import { Button } from "@/components/ui/button";
import { LiveClock, StatusIndicator } from "@/components/ui/glass-panel";
import { Train, RefreshCw, Search, Home, AlertTriangle, BarChart2, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  onSearchClick?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  onSearchClick,
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/trafic", label: "Trafic", icon: AlertTriangle },
    { href: "/incidents", label: "Incidents", icon: Activity },
    { href: "/stats", label: "Stats", icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glass background */}
      <div className="absolute inset-0 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)]" />

      {/* Animated bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative container flex h-16 items-center justify-between px-4">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 border border-primary/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {/* Rotating outer ring */}
              <motion.div
                className="absolute inset-0 rounded-lg border border-primary/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <Train className="h-5 w-5 text-primary" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wider text-foreground">
                INCIDENT VOYAGEUR
              </h1>
              <div className="flex items-center gap-2">
                <StatusIndicator status="normal" size="sm" pulse label="EN LIGNE" />
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "relative gap-2 font-medium transition-all",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{link.label}</span>

                    {/* Active indicator glow */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-2 right-2 h-0.5 bg-primary rounded-full"
                        style={{
                          boxShadow: "0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow)",
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side - Clock, Status, Actions */}
        <div className="flex items-center gap-4">
          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-background/50 border border-border">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            <LiveClock showSeconds />
          </div>

          {/* Traffic Status */}
          <TraficStatus />

          {/* Search Button */}
          {onSearchClick && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2 border-border/50 bg-background/30 hover:bg-background/50 hover:border-primary/50 transition-all"
              onClick={onSearchClick}
            >
              <Search className="h-4 w-4" />
              <span className="text-muted-foreground">Recherche</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="relative group"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 transition-all",
                  isRefreshing ? "animate-spin text-primary" : "text-muted-foreground group-hover:text-primary"
                )}
              />
              {/* Glow effect on hover/active */}
              <div
                className={cn(
                  "absolute inset-0 rounded-md opacity-0 transition-opacity",
                  isRefreshing ? "opacity-100" : "group-hover:opacity-50"
                )}
                style={{
                  boxShadow: "inset 0 0 10px var(--primary-glow)",
                }}
              />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
