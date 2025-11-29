"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePassages } from "@/lib/hooks/usePassages";
import { getLineColor } from "@/types/prim";

interface WaitingTimeChartProps {
  stopId: string;
  stopName?: string;
}

export function WaitingTimeChart({ stopId, stopName }: WaitingTimeChartProps) {
  const { data: passages, isLoading } = usePassages(stopId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!passages || passages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temps d'attente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucun passage à venir
          </p>
        </CardContent>
      </Card>
    );
  }

  // Préparer les données pour le graphique
  const chartData = passages.slice(0, 10).map((passage, index) => ({
    name: `${passage.lineName} → ${passage.destination.slice(0, 15)}`,
    waitingTime: passage.waitingTime,
    line: passage.lineName,
    destination: passage.destination,
    color: getLineColor(passage.lineName),
    index,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Prochains passages {stopName && `- ${stopName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="waitingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0064B0" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0064B0" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={{
                value: "Minutes",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="font-semibold">Ligne {data.line}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {data.destination}
                      </p>
                      <p className="text-lg font-bold mt-1">
                        {data.waitingTime} min
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="waitingTime"
              stroke="#0064B0"
              fill="url(#waitingGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Version compacte pour afficher plusieurs arrêts
interface MultiStopWaitingChartProps {
  stops: { id: string; name: string }[];
}

export function MultiStopWaitingChart({ stops }: MultiStopWaitingChartProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stops.map((stop) => (
        <WaitingTimeChart key={stop.id} stopId={stop.id} stopName={stop.name} />
      ))}
    </div>
  );
}
