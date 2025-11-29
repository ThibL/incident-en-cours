"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTraficSummary } from "@/lib/hooks/useTraficInfo";
import { motion } from "framer-motion";

// Control Room neon colors
const STATUS_COLORS = {
  normal: "#22c55e",    // Emerald green
  perturbe: "#f59e0b",  // Amber
  interrompu: "#ef4444", // Red
};

const STATUS_GLOWS = {
  normal: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))",
  perturbe: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))",
  interrompu: "drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))",
};

export function TrafficStatusPieChart() {
  const { summary, isLoading } = useTraficSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full border-4 border-border animate-pulse" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!summary || summary.total === 0) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <p className="text-muted-foreground font-mono text-sm">AUCUNE DONNÉE</p>
      </div>
    );
  }

  const data = [
    { name: "Normal", value: summary.normal, color: STATUS_COLORS.normal, glow: STATUS_GLOWS.normal },
    { name: "Perturbé", value: summary.perturbe, color: STATUS_COLORS.perturbe, glow: STATUS_GLOWS.perturbe },
    { name: "Interrompu", value: summary.interrompu, color: STATUS_COLORS.interrompu, glow: STATUS_GLOWS.interrompu },
  ].filter((d) => d.value > 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-mono font-bold text-sm"
        style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <filter key={`glow-${index}`} id={`glow-${index}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            innerRadius={50}
            dataKey="value"
            paddingAngle={3}
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={2}
                style={{ filter: entry.glow }}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="glass rounded-lg p-3 border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: d.color,
                          boxShadow: `0 0 10px ${d.color}`,
                        }}
                      />
                      <span className="font-mono font-medium text-foreground">{d.name}</span>
                    </div>
                    <p className="text-2xl font-[family-name:var(--font-orbitron)] font-bold" style={{ color: d.color }}>
                      {d.value}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">lignes</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs font-mono text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-primary">
          {summary.total}
        </p>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          LIGNES SURVEILLEES
        </p>
      </div>
    </motion.div>
  );
}
