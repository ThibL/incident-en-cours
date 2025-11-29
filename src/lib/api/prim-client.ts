import { z } from "zod";
import {
  SIRILiteResponseSchema,
  TrafficInfoResponseSchema,
  GeneralMessageResponseSchema,
  type SIRILiteResponse,
  type TrafficInfoResponse,
  type GeneralMessageResponse,
  type Passage,
  type TraficInfo,
  type SimplifiedDisruption,
  type ScreenMessage,
  type TransportMode,
  type MonitoredStopVisit,
} from "@/types/prim";

// ============================================
// Configuration API PRIM
// ============================================

const PRIM_BASE_URL = "https://prim.iledefrance-mobilites.fr/marketplace";

// Quotas API
const QUOTAS = {
  passages: { limit: 1_000_000, windowMs: 24 * 60 * 60 * 1000 },
  trafic: { limit: 20_000, windowMs: 24 * 60 * 60 * 1000 },
};

// ============================================
// Erreurs personnalisées
// ============================================

export class PRIMAPIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: string
  ) {
    super(`PRIM API Error: ${status} ${statusText}`);
    this.name = "PRIMAPIError";
  }
}

export class PRIMValidationError extends Error {
  constructor(
    public zodError: z.ZodError,
    public endpoint: string
  ) {
    super(`Validation Error on ${endpoint}: ${zodError.message}`);
    this.name = "PRIMValidationError";
  }
}

export class PRIMRateLimitError extends Error {
  constructor(public endpoint: string) {
    super(`Rate limit exceeded for ${endpoint}`);
    this.name = "PRIMRateLimitError";
  }
}

// ============================================
// Client API PRIM
// ============================================

export class PRIMClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PRIM_API_KEY || "";
    if (!this.apiKey) {
      console.warn(
        "PRIM_API_KEY not set. API calls will fail. Get your key at https://prim.iledefrance-mobilites.fr"
      );
    }
  }

  /**
   * Requête générique vers l'API PRIM avec logging
   */
  private async fetch<T>(
    endpoint: string,
    schema: z.ZodSchema<T>,
    options: {
      revalidate?: number;
      tags?: string[];
    } = {}
  ): Promise<T> {
    const url = `${PRIM_BASE_URL}${endpoint}`;
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          apiKey: this.apiKey,
          Accept: "application/json",
        },
        next: {
          revalidate: options.revalidate ?? 60,
          tags: options.tags,
        },
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const body = await response.text();
        console.warn(
          `[PRIM] ERROR ${response.status} ${endpoint} (${durationMs}ms)`,
          body.slice(0, 200)
        );
        throw new PRIMAPIError(response.status, response.statusText, body);
      }

      const data = await response.json();

      // Validation Zod
      const result = schema.safeParse(data);
      if (!result.success) {
        console.warn(
          `[PRIM] VALIDATION_ERROR ${endpoint} (${durationMs}ms)`,
          result.error.issues.slice(0, 3)
        );
        throw new PRIMValidationError(result.error, endpoint);
      }

      // Log succès (niveau info pour le debug)
      if (process.env.NODE_ENV === "development") {
        console.log(`[PRIM] OK ${endpoint} (${durationMs}ms)`);
      }

      return result.data;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      if (
        error instanceof PRIMAPIError ||
        error instanceof PRIMValidationError
      ) {
        throw error;
      }

      console.warn(`[PRIM] FETCH_ERROR ${endpoint} (${durationMs}ms)`, error);
      throw new Error(`Failed to fetch ${endpoint}: ${error}`);
    }
  }

  // ============================================
  // API Prochains Passages (SIRI Lite)
  // ============================================

  /**
   * Récupère les prochains passages à un arrêt
   * @param stopId - ID de l'arrêt (format STIF ou IDFM)
   */
  async getNextDepartures(stopId: string): Promise<SIRILiteResponse> {
    // Normaliser l'ID de l'arrêt
    const normalizedStopId = this.normalizeStopId(stopId);

    return this.fetch(
      `/stop-monitoring?MonitoringRef=${normalizedStopId}`,
      SIRILiteResponseSchema,
      { revalidate: 30, tags: ["passages", `stop-${stopId}`] }
    );
  }

  /**
   * Transforme la réponse SIRI Lite en passages simplifiés
   */
  parsePassages(response: SIRILiteResponse): Passage[] {
    const visits =
      response.Siri.ServiceDelivery.StopMonitoringDelivery[0]?.MonitoredStopVisit ||
      [];

    return visits.map((visit: MonitoredStopVisit, index: number) => {
      const journey = visit.MonitoredVehicleJourney;
      const call = journey.MonitoredCall;

      const expectedTime = new Date(
        call.ExpectedDepartureTime || call.ExpectedArrivalTime || ""
      );
      const aimedTime = call.AimedDepartureTime
        ? new Date(call.AimedDepartureTime)
        : undefined;

      const waitingTime = Math.max(
        0,
        Math.round((expectedTime.getTime() - Date.now()) / 60000)
      );

      return {
        id: `${journey.LineRef.value}-${index}`,
        lineId: journey.LineRef.value,
        lineName: this.extractLineName(journey.LineRef.value),
        destination: journey.DestinationName?.[0]?.value || "Terminus",
        direction: journey.DirectionName?.[0]?.value || "",
        expectedTime,
        aimedTime,
        status: call.DepartureStatus || call.ArrivalStatus || "noReport",
        waitingTime,
      };
    });
  }

  // ============================================
  // API Info Trafic (Navitia)
  // ============================================

  /**
   * Récupère les infos trafic pour un mode de transport
   */
  async getTrafficInfo(mode?: TransportMode): Promise<TrafficInfoResponse> {
    // Mapping des modes vers les identifiants Navitia
    const modeMapping: Record<TransportMode, string> = {
      Metro: "Metro",
      RER: "RapidTransit",
      Tramway: "Tramway",
      Bus: "Bus",
      Transilien: "LocalTrain",
    };

    const navitiaMode = mode ? modeMapping[mode] : undefined;
    const endpoint = navitiaMode
      ? `/v2/navitia/line_reports/physical_modes/physical_mode:${navitiaMode}/line_reports?count=100`
      : `/v2/navitia/line_reports/line_reports?count=100`;

    return this.fetch(endpoint, TrafficInfoResponseSchema, {
      revalidate: 60,
      tags: ["trafic", mode ? `mode-${mode}` : "all-modes"],
    });
  }

  /**
   * Récupère les infos trafic pour une ligne spécifique
   */
  async getLineTrafficInfo(lineId: string): Promise<TrafficInfoResponse> {
    const normalizedLineId = this.normalizeLineId(lineId);

    return this.fetch(
      `/v2/navitia/line_reports/lines/${normalizedLineId}/line_reports`,
      TrafficInfoResponseSchema,
      { revalidate: 60, tags: ["trafic", `line-${lineId}`] }
    );
  }

  // ============================================
  // API Passages par Ligne
  // ============================================

  /**
   * Récupère les passages pour une ligne spécifique (tous les arrêts)
   * @param lineId - ID de la ligne (format C01371 ou line:IDFM:C01371)
   */
  async getLinePassages(lineId: string): Promise<SIRILiteResponse> {
    const normalizedLineId = this.normalizeLineRef(lineId);
    return this.fetch(
      `/stop-monitoring?LineRef=${normalizedLineId}`,
      SIRILiteResponseSchema,
      { revalidate: 30, tags: ["passages", `line-${lineId}`] }
    );
  }

  // ============================================
  // API Messages Écrans (General Message)
  // ============================================

  /**
   * Récupère les messages affichés sur les écrans
   * @param lineId - ID de la ligne (optionnel, sinon toutes les lignes)
   */
  async getScreenMessages(lineId?: string): Promise<GeneralMessageResponse> {
    const lineRef = lineId
      ? `LineRef=${this.normalizeLineRef(lineId)}`
      : "LineRef=ALL";

    return this.fetch(
      `/general-message?${lineRef}`,
      GeneralMessageResponseSchema,
      { revalidate: 60, tags: ["messages", lineId ? `line-${lineId}` : "all"] }
    );
  }

  /**
   * Transforme la réponse General Message en messages simplifiés
   */
  parseScreenMessages(response: GeneralMessageResponse): ScreenMessage[] {
    const messages =
      response.Siri.ServiceDelivery.GeneralMessageDelivery[0]?.InfoMessage || [];

    return messages.map((msg) => ({
      id: msg.InfoMessageIdentifier,
      channel: msg.InfoChannelRef as ScreenMessage["channel"],
      message: msg.Content.Message[0]?.MessageText.value || "",
      validUntil: msg.ValidUntilTime ? new Date(msg.ValidUntilTime) : undefined,
      affectedLines:
        msg.Content.LineRef?.map((l) => this.extractLineName(l.value)) || [],
      recordedAt: new Date(msg.RecordedAtTime),
    }));
  }

  // ============================================
  // API Disruptions Bulk
  // ============================================

  /**
   * Récupère toutes les perturbations en cours (bulk)
   * Quota: 18,000 req/jour pour utilisateurs établis
   */
  async getBulkDisruptions(): Promise<TrafficInfoResponse> {
    return this.fetch(
      `/disruptions_bulk`,
      TrafficInfoResponseSchema,
      { revalidate: 120, tags: ["disruptions", "bulk"] }
    );
  }

  /**
   * Transforme la réponse Navitia en infos trafic simplifiées
   * Extrait les lignes depuis les disruptions (l'API ne retourne pas line_reports)
   */
  parseTrafficInfo(response: TrafficInfoResponse): TraficInfo[] {
    const disruptions = response.disruptions || [];

    // Si line_reports existe (ancien format), l'utiliser
    if (response.line_reports && response.line_reports.length > 0) {
      return response.line_reports.map((report) => {
        const lineDisruptions = disruptions.filter((d) =>
          d.impacted_objects?.some((obj) => obj.pt_object.id === report.line.id)
        );
        const status = this.computeLineStatus(lineDisruptions);
        return {
          lineId: report.line.id,
          lineName: report.line.name,
          lineCode: report.line.code || "",
          lineColor: report.line.color ? `#${report.line.color}` : "#808080",
          status,
          disruptions: lineDisruptions.map((d) => this.simplifyDisruption(d)),
        };
      });
    }

    // Nouveau format: extraire les lignes depuis les disruptions
    const linesMap = new Map<string, {
      id: string;
      name: string;
      code: string;
      color: string;
      disruptions: typeof disruptions;
    }>();

    for (const disruption of disruptions) {
      for (const impact of disruption.impacted_objects || []) {
        // Vérifier si l'objet impacté est une ligne
        const ptObj = impact.pt_object;
        if (ptObj.embedded_type === "line" && "line" in ptObj && ptObj.line) {
          const line = ptObj.line as {
            id: string;
            name: string;
            code?: string;
            color?: string;
          };

          if (!linesMap.has(line.id)) {
            linesMap.set(line.id, {
              id: line.id,
              name: line.name,
              code: line.code || "",
              color: line.color || "",
              disruptions: [],
            });
          }
          linesMap.get(line.id)!.disruptions.push(disruption);
        }
      }
    }

    return Array.from(linesMap.values()).map((lineData) => {
      const status = this.computeLineStatus(lineData.disruptions);
      return {
        lineId: lineData.id,
        lineName: lineData.name,
        lineCode: lineData.code,
        lineColor: lineData.color ? `#${lineData.color}` : "#808080",
        status,
        disruptions: lineData.disruptions.map((d) => this.simplifyDisruption(d)),
      };
    });
  }

  // ============================================
  // Méthodes utilitaires
  // ============================================

  private normalizeStopId(stopId: string): string {
    // Si l'ID est déjà au format STIF, le retourner tel quel
    if (stopId.startsWith("STIF:StopPoint:") || stopId.startsWith("stop_point:")) {
      return encodeURIComponent(stopId);
    }
    // Sinon, construire l'ID au format STIF
    return encodeURIComponent(`STIF:StopPoint:Q:${stopId}:`);
  }

  private normalizeLineId(lineId: string): string {
    if (lineId.startsWith("line:IDFM:")) {
      return lineId;
    }
    return `line:IDFM:${lineId}`;
  }

  private normalizeLineRef(lineId: string): string {
    // Si déjà au format STIF, le retourner tel quel
    if (lineId.startsWith("STIF:Line::")) {
      return encodeURIComponent(lineId);
    }
    // Extraire le code (ex: "line:IDFM:C01371" -> "C01371")
    const code = lineId.replace("line:IDFM:", "");
    // Format STIF: STIF:Line::C01371:
    return encodeURIComponent(`STIF:Line::${code}:`);
  }

  private extractLineName(lineRef: string): string {
    // Mapping des codes ligne IDFM vers les noms affichés
    const lineMapping: Record<string, string> = {
      // Métro
      "C01371": "1", "C01372": "2", "C01373": "3", "C01386": "3bis",
      "C01374": "4", "C01375": "5", "C01376": "6", "C01377": "7",
      "C01387": "7bis", "C01378": "8", "C01379": "9", "C01380": "10",
      "C01381": "11", "C01382": "12", "C01383": "13", "C01384": "14",
      // RER
      "C01742": "A", "C01743": "B", "C01727": "C", "C01728": "D", "C01729": "E",
      // Tramway
      "C01389": "T1", "C01390": "T2", "C01391": "T3a", "C01679": "T3b",
      "C01843": "T4", "C02317": "T5", "C01394": "T6", "C01774": "T7",
      "C01795": "T8", "C02344": "T9", "C02528": "T10", "C01999": "T11",
      "C02529": "T12", "C02530": "T13",
    };

    // Extraire le code ligne (ex: "STIF:Line::C01371:" -> "C01371")
    const match = lineRef.match(/C\d+/);
    if (match) {
      const code = match[0];
      return lineMapping[code] || code;
    }
    return lineRef.split(":").pop() || lineRef;
  }

  private computeLineStatus(
    disruptions: TrafficInfoResponse["disruptions"]
  ): "normal" | "perturbe" | "interrompu" {
    if (!disruptions || disruptions.length === 0) {
      return "normal";
    }

    const activeDisruptions = disruptions.filter((d) => d.status === "active");

    if (activeDisruptions.some((d) => d.severity?.effect === "NO_SERVICE")) {
      return "interrompu";
    }

    if (
      activeDisruptions.some(
        (d) =>
          d.severity?.effect === "SIGNIFICANT_DELAYS" ||
          d.severity?.effect === "REDUCED_SERVICE"
      )
    ) {
      return "perturbe";
    }

    return "normal";
  }

  private simplifyDisruption(
    disruption: NonNullable<TrafficInfoResponse["disruptions"]>[0]
  ): SimplifiedDisruption {
    const severity = this.mapSeverity(disruption.severity?.effect);
    const message =
      disruption.messages?.[0]?.text || disruption.cause || "Perturbation en cours";

    return {
      id: disruption.id,
      title: disruption.category || "Information trafic",
      message,
      severity,
      startTime: new Date(
        disruption.application_periods?.[0]?.begin || Date.now()
      ),
      endTime: disruption.application_periods?.[0]?.end
        ? new Date(disruption.application_periods[0].end)
        : undefined,
      affectedLines:
        disruption.impacted_objects?.map((obj) => obj.pt_object.name) || [],
    };
  }

  private mapSeverity(
    effect?: string
  ): "info" | "warning" | "critical" {
    switch (effect) {
      case "NO_SERVICE":
        return "critical";
      case "SIGNIFICANT_DELAYS":
      case "REDUCED_SERVICE":
        return "warning";
      default:
        return "info";
    }
  }
}

// ============================================
// Instance singleton
// ============================================

let clientInstance: PRIMClient | null = null;

export function getPRIMClient(): PRIMClient {
  if (!clientInstance) {
    clientInstance = new PRIMClient();
  }
  return clientInstance;
}

// ============================================
// Fonctions utilitaires pour les composants
// ============================================

export async function fetchPassages(stopId: string): Promise<Passage[]> {
  const client = getPRIMClient();
  const response = await client.getNextDepartures(stopId);
  return client.parsePassages(response);
}

export async function fetchTrafficInfo(
  mode?: TransportMode
): Promise<TraficInfo[]> {
  const client = getPRIMClient();
  const response = await client.getTrafficInfo(mode);
  return client.parseTrafficInfo(response);
}

export async function fetchLineTrafficInfo(
  lineId: string
): Promise<TraficInfo[]> {
  const client = getPRIMClient();
  const response = await client.getLineTrafficInfo(lineId);
  return client.parseTrafficInfo(response);
}

export async function fetchLinePassages(lineId: string): Promise<Passage[]> {
  const client = getPRIMClient();
  const response = await client.getLinePassages(lineId);
  return client.parsePassages(response);
}

export async function fetchScreenMessages(
  lineId?: string
): Promise<ScreenMessage[]> {
  const client = getPRIMClient();
  const response = await client.getScreenMessages(lineId);
  return client.parseScreenMessages(response);
}

export async function fetchBulkDisruptions(): Promise<TraficInfo[]> {
  const client = getPRIMClient();
  const response = await client.getBulkDisruptions();
  return client.parseTrafficInfo(response);
}
