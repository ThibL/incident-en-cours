// ============================================
// Configuration API PRIM - Plan A
// ============================================

export const PRIM_BASE_URL = "https://prim.iledefrance-mobilites.fr/marketplace";

// ============================================
// Quotas officiels PRIM (par 24h)
// Source: https://prim.iledefrance-mobilites.fr/
// ============================================

export const PRIM_QUOTAS = {
  // SIRI Lite - Prochains passages
  stopMonitoring: {
    limit: 1_000_000,
    windowMs: 24 * 60 * 60 * 1000,
    description: "Prochains passages temps réel",
  },
  // SIRI Lite - Messages généraux
  generalMessage: {
    limit: 20_000,
    windowMs: 24 * 60 * 60 * 1000,
    description: "Messages affichés sur écrans",
  },
  // Navitia - Info trafic
  lineReports: {
    limit: 20_000,
    windowMs: 24 * 60 * 60 * 1000,
    description: "État du trafic par ligne",
  },
  // Navitia - Perturbations bulk
  disruptionsBulk: {
    limit: 18_000,
    windowMs: 24 * 60 * 60 * 1000,
    description: "Toutes perturbations en cours",
  },
  // Navitia - Référentiel (stops, lines)
  referential: {
    limit: 100_000,
    windowMs: 24 * 60 * 60 * 1000,
    description: "Données de référence (arrêts, lignes)",
  },
  // PRIM Places - Recherche
  places: {
    limit: 100_000,
    windowMs: 24 * 60 * 60 * 1000,
    description: "Recherche d'arrêts et lignes",
  },
} as const;

// ============================================
// Cadences de rafraîchissement
// serverRevalidate: secondes (Next.js ISR)
// clientRefetch: millisecondes (React Query refetchInterval)
// clientStale: millisecondes (React Query staleTime)
// swr: secondes (stale-while-revalidate HTTP header)
// ============================================

export const REFRESH_INTERVALS = {
  // Données temps réel - rafraîchissement fréquent
  stopMonitoring: {
    serverRevalidate: 30,
    clientRefetch: 30_000,
    clientStale: 15_000,
    swr: 15,
  },
  // Info trafic - rafraîchissement modéré
  lineReports: {
    serverRevalidate: 60,
    clientRefetch: 60_000,
    clientStale: 30_000,
    swr: 30,
  },
  // Messages écrans - rafraîchissement modéré
  generalMessage: {
    serverRevalidate: 60,
    clientRefetch: 60_000,
    clientStale: 30_000,
    swr: 30,
  },
  // Perturbations bulk - rafraîchissement moins fréquent
  disruptionsBulk: {
    serverRevalidate: 120,
    clientRefetch: 120_000,
    clientStale: 60_000,
    swr: 60,
  },
  // Données de référence - cache long
  lineStops: {
    serverRevalidate: 86_400, // 24h
    clientRefetch: 0, // Pas de refetch auto
    clientStale: 86_400_000, // 24h
    swr: 3_600, // 1h
  },
  // Recherche - cache moyen
  search: {
    serverRevalidate: 300, // 5 min
    clientRefetch: 0,
    clientStale: 300_000,
    swr: 60,
  },
} as const;

// ============================================
// Formats d'identifiants IDFM/STIF/Navitia
// ============================================

/**
 * FORMATS D'IDENTIFIANTS
 *
 * ## Arrêts (Stops)
 *
 * | Source      | Format                                    | Exemple                              |
 * |-------------|-------------------------------------------|--------------------------------------|
 * | STIF        | STIF:StopPoint:Q:{id}:                    | STIF:StopPoint:Q:22089:              |
 * | Navitia     | stop_point:IDFM:{id}                      | stop_point:IDFM:22089                |
 * | Navitia     | stop_point:IDFM:monomodalStopPlace:{id}   | stop_point:IDFM:monomodalStopPlace:47918 |
 * | stop_area   | stop_area:IDFM:{id}                       | stop_area:IDFM:71264                 |
 * | Simplifié   | {id} (numérique)                          | 22089                                |
 *
 * ## Lignes (Lines)
 *
 * | Source      | Format                                    | Exemple                              |
 * |-------------|-------------------------------------------|--------------------------------------|
 * | STIF        | STIF:Line::{code}:                        | STIF:Line::C01371:                   |
 * | Navitia     | line:IDFM:{code}                          | line:IDFM:C01371                     |
 * | Simplifié   | {code}                                    | C01371                               |
 *
 * ## Codes lignes IDFM -> Noms affichés
 *
 * Métro: C01371=1, C01372=2, ..., C01384=14, C01386=3bis, C01387=7bis
 * RER: C01742=A, C01743=B, C01727=C, C01728=D, C01729=E
 * Tramway: C01389=T1, C01390=T2, etc.
 */

export const ID_FORMATS = {
  // Patterns regex pour la détection
  patterns: {
    stifStop: /^STIF:StopPoint:Q:(\d+):$/,
    navitiaStopPoint: /^stop_point:IDFM:(.+)$/,
    navitiaStopArea: /^stop_area:IDFM:(\d+)$/,
    monomodalStop: /^monomodalStopPlace:(\d+)$/,
    numericStop: /^\d+$/,
    stifLine: /^STIF:Line::([A-Z]\d+):$/,
    navitiaLine: /^line:IDFM:([A-Z]\d+)$/,
    lineCode: /^[A-Z]\d+$/,
  },
  // Templates pour la construction
  templates: {
    stifStop: (id: string) => `STIF:StopPoint:Q:${id}:`,
    navitiaStopPoint: (id: string) => `stop_point:IDFM:${id}`,
    stifLine: (code: string) => `STIF:Line::${code}:`,
    navitiaLine: (code: string) => `line:IDFM:${code}`,
  },
} as const;

// ============================================
// Inventaire des endpoints et authentification
// ============================================

export const PRIM_ENDPOINTS = {
  // Endpoints nécessitant la clé API (header: apiKey)
  authenticated: {
    stopMonitoring: {
      path: "/stop-monitoring",
      method: "GET",
      params: ["MonitoringRef", "LineRef"],
      description: "Prochains passages temps réel (SIRI Lite)",
    },
    generalMessage: {
      path: "/general-message",
      method: "GET",
      params: ["LineRef"],
      description: "Messages affichés sur écrans (SIRI Lite)",
    },
    lineReports: {
      path: "/v2/navitia/line_reports",
      method: "GET",
      params: ["physical_mode", "line_id"],
      description: "État du trafic par ligne (Navitia)",
    },
    disruptionsBulk: {
      path: "/disruptions_bulk",
      method: "GET",
      params: [],
      description: "Toutes perturbations en cours (Navitia)",
    },
    lineStops: {
      path: "/v2/navitia/lines/{lineId}/stop_points",
      method: "GET",
      params: ["count"],
      description: "Arrêts d'une ligne (Navitia)",
    },
    places: {
      path: "/places",
      method: "GET",
      params: ["q", "count"],
      description: "Recherche d'arrêts et lignes",
    },
  },
  // Endpoints publics (sans clé API)
  public: {
    // Note: Tous les endpoints PRIM nécessitent la clé API
    // Il n'y a pas d'endpoint public dans cette API
  },
} as const;

// Headers requis pour l'API PRIM
export const PRIM_HEADERS = {
  required: {
    apiKey: "apiKey", // Header obligatoire avec la clé API
    accept: "Accept", // application/json recommandé
  },
  values: {
    accept: "application/json",
  },
} as const;

// ============================================
// Cartographie détaillée des endpoints (Plan B)
// ============================================

/**
 * URLs et paramètres détaillés de chaque endpoint PRIM
 * Utilisé pour documentation et construction des requêtes
 */
export const PRIM_ENDPOINTS_DETAILED = {
  stopMonitoring: {
    // Par arrêt (SIRI Lite)
    byStop: "/stop-monitoring?MonitoringRef={stopId}",
    // Par ligne - tous les passages de la ligne (SIRI Lite)
    byLine: "/stop-monitoring?LineRef={lineRef}",
    params: {
      MonitoringRef: {
        description: "ID de l'arrêt",
        formats: [
          "STIF:StopPoint:Q:{id}:",
          "stop_point:IDFM:{id}",
          "stop_point:IDFM:monomodalStopPlace:{id}",
        ],
        example: "STIF:StopPoint:Q:22089:",
      },
      LineRef: {
        description: "ID de la ligne",
        format: "STIF:Line::{code}:",
        example: "STIF:Line::C01371:",
      },
    },
  },
  generalMessage: {
    // Tous les messages (SIRI Lite)
    all: "/general-message?LineRef=ALL",
    // Messages d'une ligne spécifique
    byLine: "/general-message?LineRef={lineRef}",
    params: {
      LineRef: {
        description: "ID de la ligne ou ALL pour toutes",
        format: "STIF:Line::{code}: ou ALL",
        example: "STIF:Line::C01371:",
      },
    },
  },
  lineReports: {
    // Toutes les lignes (Navitia)
    global: "/v2/navitia/line_reports/line_reports?count=100",
    // Par mode de transport
    byMode: "/v2/navitia/line_reports/physical_modes/physical_mode:{mode}/line_reports?count=100",
    // Par ligne spécifique
    byLine: "/v2/navitia/line_reports/lines/{lineId}/line_reports",
    params: {
      mode: {
        description: "Mode de transport Navitia",
        values: ["Metro", "RapidTransit", "Tramway", "Bus", "LocalTrain"],
        example: "Metro",
      },
      lineId: {
        description: "ID Navitia de la ligne",
        format: "line:IDFM:{code}",
        example: "line:IDFM:C01371",
      },
      count: {
        description: "Nombre max de résultats",
        default: 100,
      },
    },
  },
  disruptionsBulk: {
    // Toutes les perturbations en cours (Navitia)
    all: "/disruptions_bulk",
    params: {},
  },
  places: {
    // Recherche d'arrêts et lignes (PRIM)
    search: "/places?q={query}&count={count}",
    params: {
      q: {
        description: "Terme de recherche",
        minLength: 2,
        example: "chatelet",
      },
      count: {
        description: "Nombre max de résultats",
        default: 20,
      },
    },
  },
  lineStops: {
    // Arrêts d'une ligne (Navitia)
    byLine: "/v2/navitia/lines/{lineId}/stop_points?count={count}",
    params: {
      lineId: {
        description: "ID Navitia de la ligne",
        format: "line:IDFM:{code}",
        example: "line:IDFM:C01371",
      },
      count: {
        description: "Nombre max de résultats",
        default: 500,
      },
    },
  },
} as const;

// ============================================
// Types exportés
// ============================================

export type EndpointKey = keyof typeof REFRESH_INTERVALS;
export type QuotaKey = keyof typeof PRIM_QUOTAS;
