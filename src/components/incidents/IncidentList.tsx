"use client";

import { IncidentCard } from "./IncidentCard";
import { type Incident } from "@/types/incident";
import { motion } from "framer-motion";

interface IncidentListProps {
  incidents: Incident[];
  emptyMessage?: string;
}

export function IncidentList({
  incidents,
  emptyMessage = "Aucun incident à afficher",
}: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm font-mono text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-4">
      {incidents.map((incident, index) => (
        <motion.div
          key={`${incident.id}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <IncidentCard incident={incident} />
        </motion.div>
      ))}
    </motion.div>
  );
}
