"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTraficInfo } from "@/lib/hooks/useTraficInfo";
import type { TransportMode } from "@/types/prim";

interface ModeStats {
  mode: string;
  modeLabel: string;
  normal: number;
  perturbe: number;
  interrompu: number;
  total: number;
}

const MODE_CONFIG: Record<TransportMode, { label: string; color: string }> = {
  Metro: { label: "Métro", color: "#0064B0" },
  RER: { label: "RER", color: "#E3051C" },
  Tramway: { label: "Tramway", color: "#00814F" },
  Bus: { label: "Bus", color: "#83C491" },
  Transilien: { label: "Transilien", color: "#5291CE" },
};

export function DisruptionsByModeChart() {
  // Récupérer les données de tous les modes
  const { data: allLines, isLoading } = useTraficInfo({ refetchInterval: 60000 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!allLines || allLines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perturbations par mode</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucune donnée disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  // Agréger les stats par mode (basé sur le préfixe du lineId)
  const modeStats: ModeStats[] = Object.entries(MODE_CONFIG).map(([mode, config]) => {
    // Filtrer les lignes par mode (heuristique basée sur le nom/code de ligne)
    const modeLines = allLines.filter((line) => {
      const code = line.lineCode.toUpperCase();
      const name = line.lineName.toLowerCase();

      switch (mode) {
        case "Metro":
          return /^(M?\d+|3bis|7bis)$/i.test(code) || name.includes("métro");
        case "RER":
          return /^[A-E]$/i.test(code) || name.includes("rer");
        case "Tramway":
          return /^T\d+/i.test(code) || name.includes("tramway") || name.includes("tram");
        case "Transilien":
          return /^[HJKLNPRU]$/i.test(code) || name.includes("transilien");
        case "Bus":
          return /^\d{2,3}$/.test(code) || name.includes("bus");
        default:
          return false;
      }
    });

    return {
      mode,
      modeLabel: config.label,
      normal: modeLines.filter((l) => l.status === "normal").length,
      perturbe: modeLines.filter((l) => l.status === "perturbe").length,
      interrompu: modeLines.filter((l) => l.status === "interrompu").length,
      total: modeLines.length,
    };
  }).filter((stat) => stat.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perturbations par mode de transport</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={modeStats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis
              dataKey="modeLabel"
              type="category"
              width={80}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ModeStats;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold mb-2">{data.modeLabel}</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-green-600">Normal: {data.normal}</p>
                        <p className="text-orange-600">Perturbé: {data.perturbe}</p>
                        <p className="text-red-600">Interrompu: {data.interrompu}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="normal" name="Normal" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="perturbe" name="Perturbé" stackId="a" fill="#f97316" />
            <Bar dataKey="interrompu" name="Interrompu" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
