import { z } from "zod";
import {
  SIRILiteResponseSchema,
  TrafficInfoResponseSchema,
  GeneralMessageResponseSchema,
  LineStopsResponseSchema,
  type SIRILiteResponse,
  type TrafficInfoResponse,
  type GeneralMessageResponse,
  type LineStopsResponse,
  type Passage,
  type TraficInfo,
  type SimplifiedDisruption,
  type ScreenMessage,
  type TransportMode,
  type MonitoredStopVisit,
  type LineStop,
} from "@/types/prim";
import {
  PRIMPlacesResponseSchema,
  type PRIMPlacesResponse,
  type PRIMPlace,
  type SearchResult,
} from "@/types/search";
import {
  PRIM_BASE_URL,
  REFRESH_INTERVALS,
  PRIM_HEADERS,
} from "./prim-config";
import {
  extractLineDisplayName,
  extractNumericStopId,
  logPrimRequest,
} from "./prim-ids";

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
          [PRIM_HEADERS.required.apiKey]: this.apiKey,
          [PRIM_HEADERS.required.accept]: PRIM_HEADERS.values.accept,
        },
        next: {
          revalidate: options.revalidate ?? 60,
          tags: options.tags,
        },
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const body = await response.text();

        // Détection 429 Rate Limit
        if (response.status === 429) {
          logPrimRequest("RATE_LIMIT", endpoint, durationMs);
          throw new PRIMRateLimitError(endpoint);
        }

        logPrimRequest("ERROR", endpoint, durationMs, `${response.status} ${body.slice(0, 100)}`);
        throw new PRIMAPIError(response.status, response.statusText, body);
      }

      const data = await response.json();

      // Validation Zod
      const result = schema.safeParse(data);
      if (!result.success) {
        logPrimRequest("VALIDATION", endpoint, durationMs, `${result.error.issues.length} issues`);
        throw new PRIMValidationError(result.error, endpoint);
      }

      // Log succès
      logPrimRequest("OK", endpoint, durationMs);

      return result.data;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      if (
        error instanceof PRIMAPIError ||
        error instanceof PRIMValidationError ||
        error instanceof PRIMRateLimitError
      ) {
        throw error;
      }

      logPrimRequest("FETCH_ERROR", endpoint, durationMs, String(error));
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
      { revalidate: REFRESH_INTERVALS.stopMonitoring.serverRevalidate, tags: ["passages", `stop-${stopId}`] }
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
      revalidate: REFRESH_INTERVALS.lineReports.serverRevalidate,
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
      { revalidate: REFRESH_INTERVALS.lineReports.serverRevalidate, tags: ["trafic", `line-${lineId}`] }
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
      { revalidate: REFRESH_INTERVALS.stopMonitoring.serverRevalidate, tags: ["passages", `line-${lineId}`] }
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
      { revalidate: REFRESH_INTERVALS.generalMessage.serverRevalidate, tags: ["messages", lineId ? `line-${lineId}` : "all"] }
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
      { revalidate: REFRESH_INTERVALS.disruptionsBulk.serverRevalidate, tags: ["disruptions", "bulk"] }
    );
  }

  // ============================================
  // API Arrêts par Ligne (Navitia)
  // ============================================

  /**
   * Récupère tous les arrêts d'une ligne
   * @param lineId - ID de la ligne (format C01737 ou line:IDFM:C01737)
   */
  async getLineStops(lineId: string): Promise<LineStopsResponse> {
    const normalizedLineId = this.normalizeLineId(lineId);

    // On utilise stop_points au lieu de stop_areas car les IDs de stop_points
    // sont compatibles avec l'endpoint stop-monitoring
    return this.fetch(
      `/v2/navitia/lines/${normalizedLineId}/stop_points?count=500`,
      LineStopsResponseSchema,
      { revalidate: REFRESH_INTERVALS.lineStops.serverRevalidate, tags: ["line-stops", `line-${lineId}`] }
    );
  }

  /**
   * Transforme la réponse Navitia en arrêts simplifiés
   * Déduplique par nom de station (plusieurs stop_points peuvent avoir le même nom)
   */
  parseLineStops(response: LineStopsResponse): LineStop[] {
    if (!response.stop_points) {
      return [];
    }

    // Dédupliquer par nom - on garde le premier stop_point pour chaque nom
    const seenNames = new Set<string>();
    const uniqueStops: LineStop[] = [];

    for (const stop of response.stop_points) {
      // Normaliser le nom pour la comparaison
      const normalizedName = stop.name.toLowerCase().trim();

      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueStops.push({
          id: this.extractStopPointId(stop.id),
          name: stop.name,
          coords: stop.coord
            ? {
                lat: parseFloat(stop.coord.lat),
                lon: parseFloat(stop.coord.lon),
              }
            : undefined,
        });
      }
    }

    // Trier par nom
    return uniqueStops.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }

  /**
   * Extrait l'ID d'un stop_point PRIM
   * Ex: "stop_point:IDFM:monomodalStopPlace:47918" -> "monomodalStopPlace:47918"
   * Ex: "stop_point:IDFM:22089" -> "22089"
   */
  private extractStopPointId(primId: string): string {
    // Format: stop_point:IDFM:monomodalStopPlace:47918 ou stop_point:IDFM:22089
    const match = primId.match(/stop_point:IDFM:(.+)/);
    return match ? match[1] : primId;
  }

  // ============================================
  // API Recherche (PRIM Places)
  // ============================================

  /**
   * Recherche des stations et lignes via l'API PRIM
   * @param query - Terme de recherche (min 2 caractères)
   * @param type - Type de résultat souhaité (stop, line, ou all)
   */
  async search(
    query: string,
    type: "stop" | "line" | "all" = "all"
  ): Promise<PRIMPlacesResponse> {
    const endpoint = `/places?q=${encodeURIComponent(query)}&count=20`;

    return this.fetch(endpoint, PRIMPlacesResponseSchema, {
      revalidate: REFRESH_INTERVALS.search.serverRevalidate,
      tags: ["search"],
    });
  }

  /**
   * Parse la réponse PRIM Places en résultats de recherche simplifiés
   */
  parseSearchResults(response: PRIMPlacesResponse, type: "stop" | "line" | "all" = "all"): SearchResult[] {
    if (!response.places) {
      return [];
    }

    return response.places
      .filter((place) => {
        // Filtrer par type si demandé
        if (type === "stop") return place.type === "StopArea";
        if (type === "line") return place.type === "Line";
        // Pour "all", on ne garde que StopArea (pas City ni Address)
        return place.type === "StopArea" || place.type === "Line";
      })
      .slice(0, 10) // Limiter à 10 résultats
      .map((place): SearchResult => this.mapPlaceToSearchResult(place));
  }

  /**
   * Convertit un PRIMPlace en SearchResult
   * Garde le ref complet et ajoute numericId pour compatibilité
   */
  private mapPlaceToSearchResult(place: PRIMPlace): SearchResult {
    if (place.type === "StopArea") {
      return {
        id: place.id, // Garde le ref complet (stop_area:IDFM:71264)
        numericId: extractNumericStopId(place.id), // ID numérique pour compat
        name: place.name,
        type: "stop",
        city: place.city,
        lines: place.lines?.map((l) => l.shortName || l.id) || [],
        coords: place.x && place.y
          ? { lat: place.y, lon: place.x } // Note: x=lon, y=lat dans la projection Lambert
          : undefined,
      };
    } else if (place.type === "Line") {
      return {
        id: place.id, // Garde le ref complet (line:IDFM:C01371)
        name: place.name,
        type: "line",
        code: place.shortName,
        color: place.color ? `#${place.color}` : undefined,
        mode: this.extractModeFromArray(place.mode),
      };
    }

    // Fallback
    return {
      id: place.id,
      name: place.name,
      type: "stop",
    };
  }


  /**
   * Extrait le mode de transport depuis un tableau de modes
   */
  private extractModeFromArray(
    modes?: Array<{ id: string; name: string }>
  ): "Metro" | "RER" | "Tramway" | "Bus" | "Transilien" | undefined {
    if (!modes || modes.length === 0) {
      return undefined;
    }

    const modeId = modes[0].id;
    if (modeId.includes("Metro")) return "Metro";
    if (modeId.includes("RapidTransit")) return "RER";
    if (modeId.includes("Tramway")) return "Tramway";
    if (modeId.includes("LocalTrain")) return "Transilien";
    if (modeId.includes("Bus")) return "Bus";

    return undefined;
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
    // Si l'ID est déjà au format STIF complet, le retourner tel quel
    if (stopId.startsWith("STIF:StopPoint:") || stopId.startsWith("stop_point:")) {
      return encodeURIComponent(stopId);
    }

    // Format monomodalStopPlace:47918 -> utiliser stop_point:IDFM:monomodalStopPlace:47918
    if (stopId.startsWith("monomodalStopPlace:")) {
      return encodeURIComponent(`stop_point:IDFM:${stopId}`);
    }

    // Format numérique simple (ex: 22089) -> format STIF
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

  /**
   * Extrait le nom affiché d'une ligne
   * Utilise le helper centralisé de prim-ids.ts
   */
  private extractLineName(lineRef: string): string {
    return extractLineDisplayName(lineRef);
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

export async function searchPlaces(
  query: string,
  type: "stop" | "line" | "all" = "all"
): Promise<SearchResult[]> {
  const client = getPRIMClient();
  const response = await client.search(query, type);
  return client.parseSearchResults(response, type);
}

export async function fetchLineStops(lineId: string): Promise<LineStop[]> {
  const client = getPRIMClient();
  const response = await client.getLineStops(lineId);
  return client.parseLineStops(response);
}
