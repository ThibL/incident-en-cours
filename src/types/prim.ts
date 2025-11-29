import { z } from "zod";

// ============================================
// Schémas Zod pour l'API PRIM
// ============================================

// Schéma pour un passage (prochain départ)
export const MonitoredCallSchema = z.object({
  ExpectedDepartureTime: z.string().optional(),
  ExpectedArrivalTime: z.string().optional(),
  AimedDepartureTime: z.string().optional(),
  AimedArrivalTime: z.string().optional(),
  DepartureStatus: z.string().optional(),
  ArrivalStatus: z.string().optional(),
  StopPointName: z.array(z.object({ value: z.string() })).optional(),
  VehicleAtStop: z.boolean().optional(),
  DestinationDisplay: z.array(z.object({ value: z.string() })).optional(),
}).passthrough();

export const MonitoredVehicleJourneySchema = z.object({
  LineRef: z.object({ value: z.string() }),
  OperatorRef: z.object({ value: z.string() }).optional(),
  DirectionName: z.array(z.object({ value: z.string() })).optional(),
  DestinationRef: z.object({ value: z.string() }).optional(),
  DestinationName: z.array(z.object({ value: z.string() })).optional(),
  DestinationShortName: z.array(z.object({ value: z.string() })).optional(),
  MonitoredCall: MonitoredCallSchema,
}).passthrough();

export const MonitoredStopVisitSchema = z.object({
  MonitoredVehicleJourney: MonitoredVehicleJourneySchema,
  RecordedAtTime: z.string().optional(),
  ItemIdentifier: z.string().optional(),
  MonitoringRef: z.object({ value: z.string() }).optional(),
}).passthrough();

export const StopMonitoringDeliverySchema = z.object({
  ResponseTimestamp: z.string().optional(),
  Version: z.string().optional(),
  Status: z.string().optional(),
  MonitoredStopVisit: z.array(MonitoredStopVisitSchema).optional(),
}).passthrough();

export const SIRILiteResponseSchema = z.object({
  Siri: z.object({
    ServiceDelivery: z.object({
      ResponseTimestamp: z.string(),
      ProducerRef: z.string().optional(),
      ResponseMessageIdentifier: z.string().optional(),
      StopMonitoringDelivery: z.array(StopMonitoringDeliverySchema),
    }).passthrough(),
  }),
});

// ============================================
// Schémas pour Info Trafic (Navitia)
// ============================================

export const DisruptionSeveritySchema = z.object({
  name: z.string(),
  effect: z.enum([
    "NO_SERVICE",
    "REDUCED_SERVICE",
    "SIGNIFICANT_DELAYS",
    "DETOUR",
    "ADDITIONAL_SERVICE",
    "MODIFIED_SERVICE",
    "OTHER_EFFECT",
    "UNKNOWN_EFFECT",
    "STOP_MOVED",
  ]).optional(),
  priority: z.number().optional(),
  color: z.string().optional(),
});

export const DisruptionMessageSchema = z.object({
  text: z.string(),
  channel: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
});

export const ApplicationPeriodSchema = z.object({
  begin: z.string(),
  end: z.string(),
});

export const ImpactedObjectSchema = z.object({
  pt_object: z.object({
    id: z.string(),
    name: z.string(),
    embedded_type: z.string().optional(),
    // Nested line object when embedded_type === "line"
    line: z.object({
      id: z.string(),
      name: z.string(),
      code: z.string().optional(),
      color: z.string().optional(),
      text_color: z.string().optional(),
    }).optional(),
  }).passthrough(),
});

export const DisruptionSchema = z.object({
  id: z.string(),
  status: z.enum(["active", "past", "future"]),
  severity: DisruptionSeveritySchema,
  messages: z.array(DisruptionMessageSchema).optional(),
  application_periods: z.array(ApplicationPeriodSchema).optional(),
  impacted_objects: z.array(ImpactedObjectSchema).optional(),
  cause: z.string().optional(),
  category: z.string().optional(),
  updated_at: z.string().optional(),
});

export const LineReportSchema = z.object({
  line: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string().optional(),
    color: z.string().optional(),
    text_color: z.string().optional(),
    physical_modes: z.array(z.object({
      id: z.string(),
      name: z.string(),
    })).optional(),
  }),
  pt_objects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    embedded_type: z.string().optional(),
  })).optional(),
});

export const TrafficInfoResponseSchema = z.object({
  disruptions: z.array(DisruptionSchema).optional(),
  line_reports: z.array(LineReportSchema).optional(),
});

// ============================================
// Schémas pour General Message (Messages Écrans)
// ============================================

export const InfoMessageContentSchema = z.object({
  Message: z.array(z.object({
    MessageType: z.string(),
    MessageText: z.object({
      value: z.string(),
    }),
  })),
  LineRef: z.array(z.object({
    value: z.string(),
  })).optional(),
}).passthrough();

export const InfoMessageSchema = z.object({
  RecordedAtTime: z.string(),
  InfoMessageIdentifier: z.string(),
  InfoMessageVersion: z.number().optional(),
  InfoChannelRef: z.string(),
  ValidUntilTime: z.string().optional(),
  Content: InfoMessageContentSchema,
}).passthrough();

export const GeneralMessageDeliverySchema = z.object({
  ResponseTimestamp: z.string().optional(),
  Version: z.string().optional(),
  Status: z.string().optional(),
  InfoMessage: z.array(InfoMessageSchema).optional(),
}).passthrough();

export const GeneralMessageResponseSchema = z.object({
  Siri: z.object({
    ServiceDelivery: z.object({
      ResponseTimestamp: z.string(),
      ProducerRef: z.string().optional(),
      ResponseMessageIdentifier: z.string().optional(),
      GeneralMessageDelivery: z.array(GeneralMessageDeliverySchema),
    }).passthrough(),
  }),
});

// ============================================
// Types TypeScript inférés
// ============================================

export type SIRILiteResponse = z.infer<typeof SIRILiteResponseSchema>;
export type MonitoredStopVisit = z.infer<typeof MonitoredStopVisitSchema>;
export type MonitoredVehicleJourney = z.infer<typeof MonitoredVehicleJourneySchema>;
export type MonitoredCall = z.infer<typeof MonitoredCallSchema>;

export type TrafficInfoResponse = z.infer<typeof TrafficInfoResponseSchema>;
export type Disruption = z.infer<typeof DisruptionSchema>;
export type DisruptionSeverity = z.infer<typeof DisruptionSeveritySchema>;
export type LineReport = z.infer<typeof LineReportSchema>;

export type GeneralMessageResponse = z.infer<typeof GeneralMessageResponseSchema>;
export type InfoMessage = z.infer<typeof InfoMessageSchema>;

// ============================================
// Types métier simplifiés
// ============================================

export interface Passage {
  id: string;
  lineId: string;
  lineName: string;
  destination: string;
  direction: string;
  expectedTime: Date | string; // Peut être string après JSON serialization
  aimedTime?: Date | string;
  status: "onTime" | "delayed" | "early" | "cancelled" | "noReport" | string;
  waitingTime: number; // en minutes
}

export interface TraficInfo {
  lineId: string;
  lineName: string;
  lineCode: string;
  lineColor: string;
  status: "normal" | "perturbe" | "interrompu";
  disruptions: SimplifiedDisruption[];
}

export interface SimplifiedDisruption {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  startTime: Date;
  endTime?: Date;
  affectedLines: string[];
}

export type ScreenMessageChannel = "Information" | "Perturbation" | "Commercial";

export interface ScreenMessage {
  id: string;
  channel: ScreenMessageChannel;
  message: string;
  validUntil?: Date;
  affectedLines: string[];
  recordedAt: Date;
}

// ============================================
// Types pour les modes de transport
// ============================================

export type TransportMode = "Metro" | "RER" | "Tramway" | "Bus" | "Transilien";

export const TRANSPORT_MODES: TransportMode[] = ["Metro", "RER", "Tramway", "Bus", "Transilien"];

// ============================================
// Couleurs officielles des lignes RATP/IDFM
// ============================================

export const LINE_COLORS: Record<string, string> = {
  // Métro
  "1": "#FFCE00",
  "2": "#0064B0",
  "3": "#9F9825",
  "3bis": "#98D4E2",
  "4": "#C04191",
  "5": "#F28E42",
  "6": "#83C491",
  "7": "#F3A4BA",
  "7bis": "#83C491",
  "8": "#CEADD2",
  "9": "#D5C900",
  "10": "#E3B32A",
  "11": "#8D5E2A",
  "12": "#00814F",
  "13": "#98D4E2",
  "14": "#662483",
  // RER
  "A": "#E3051C",
  "B": "#5291CE",
  "C": "#FFCE00",
  "D": "#00814F",
  "E": "#BD76A1",
  // Tramway
  "T1": "#0064B0",
  "T2": "#C04191",
  "T3a": "#F28E42",
  "T3b": "#00814F",
  "T4": "#F28E42",
  "T5": "#6E6E00",
  "T6": "#E3051C",
  "T7": "#8D5E2A",
  "T8": "#837902",
  "T9": "#5291CE",
  "T10": "#E3B32A",
  "T11": "#F28E42",
  "T12": "#00814F",
  "T13": "#CEADD2",
  // Transilien
  "H": "#8D5E2A",
  "J": "#D5C900",
  "K": "#9F9825",
  "L": "#CEADD2",
  "N": "#00814F",
  "P": "#F28E42",
  "R": "#F3A4BA",
  "U": "#E3051C",
};

export function getLineColor(lineCode: string): string {
  return LINE_COLORS[lineCode] || "#808080";
}

// ============================================
// Schémas pour les arrêts d'une ligne (Navitia)
// ============================================

export const NavitiaStopPointSchema = z.object({
  id: z.string(),
  name: z.string(),
  coord: z.object({
    lat: z.string(),
    lon: z.string(),
  }).optional(),
  label: z.string().optional(),
}).passthrough();

export const LineStopsResponseSchema = z.object({
  stop_points: z.array(NavitiaStopPointSchema).optional(),
}).passthrough();

export type LineStopsResponse = z.infer<typeof LineStopsResponseSchema>;
export type NavitiaStopPoint = z.infer<typeof NavitiaStopPointSchema>;

// Type simplifié pour les stations d'une ligne
export interface LineStop {
  id: string;
  name: string;
  coords?: {
    lat: number;
    lon: number;
  };
}
