// ============================================
// Helpers ID canoniques PRIM
// ============================================

import { ID_FORMATS } from "./prim-config";

// ============================================
// Types
// ============================================

export type TransportMode = "Metro" | "RER" | "Tramway" | "Bus" | "Transilien";

export interface CanonicalStop {
  /** ID numérique extrait (ex: "22089") */
  numericId: string;
  /** Format STIF pour SIRI Lite (ex: "STIF:StopPoint:Q:22089:") */
  stifRef: string;
  /** Format Navitia (ex: "stop_point:IDFM:22089") */
  navitiaRef: string;
  /** Format stop_area si disponible (ex: "stop_area:IDFM:71264") */
  stopAreaRef?: string;
  /** Input original */
  original: string;
}

export interface CanonicalLine {
  /** Code IDFM (ex: "C01371") */
  code: string;
  /** Format Navitia (ex: "line:IDFM:C01371") */
  navitiaRef: string;
  /** Format STIF pour SIRI Lite (ex: "STIF:Line::C01371:") */
  stifRef: string;
  /** Nom affiché (ex: "Métro 1", "RER A", "Bus 67") */
  displayName: string;
  /** Mode de transport */
  mode: TransportMode;
  /** Input original */
  original: string;
}

// ============================================
// Détection de format
// ============================================

export function isStifStopFormat(id: string): boolean {
  return ID_FORMATS.patterns.stifStop.test(id);
}

export function isNavitiaStopFormat(id: string): boolean {
  return ID_FORMATS.patterns.navitiaStopPoint.test(id);
}

export function isNavitiaStopAreaFormat(id: string): boolean {
  return ID_FORMATS.patterns.navitiaStopArea.test(id);
}

export function isMonomodalStopFormat(id: string): boolean {
  return id.startsWith("monomodalStopPlace:");
}

export function isNavitiaLineFormat(id: string): boolean {
  return ID_FORMATS.patterns.navitiaLine.test(id);
}

export function isStifLineFormat(id: string): boolean {
  return ID_FORMATS.patterns.stifLine.test(id);
}

export function isLineCode(id: string): boolean {
  return ID_FORMATS.patterns.lineCode.test(id);
}

// ============================================
// Extraction de code
// ============================================

/**
 * Extrait le code ligne depuis n'importe quel format
 * Ex: "line:IDFM:C01371" -> "C01371"
 * Ex: "STIF:Line::C01371:" -> "C01371"
 * Ex: "C01371" -> "C01371"
 */
export function extractLineCode(lineRef: string): string | null {
  // Format Navitia
  const navitiaMatch = lineRef.match(ID_FORMATS.patterns.navitiaLine);
  if (navitiaMatch) return navitiaMatch[1];

  // Format STIF
  const stifMatch = lineRef.match(ID_FORMATS.patterns.stifLine);
  if (stifMatch) return stifMatch[1];

  // Code simple
  if (ID_FORMATS.patterns.lineCode.test(lineRef)) return lineRef;

  // Pattern générique C suivi de chiffres
  const genericMatch = lineRef.match(/C\d+/);
  if (genericMatch) return genericMatch[0];

  return null;
}

/**
 * Extrait l'ID numérique depuis un format stop
 * Ex: "STIF:StopPoint:Q:22089:" -> "22089"
 * Ex: "stop_area:IDFM:71264" -> "71264"
 * Ex: "stop_point:IDFM:22089" -> "22089"
 */
export function extractNumericStopId(stopRef: string): string {
  // Format STIF
  const stifMatch = stopRef.match(ID_FORMATS.patterns.stifStop);
  if (stifMatch) return stifMatch[1];

  // Format stop_area Navitia
  const stopAreaMatch = stopRef.match(ID_FORMATS.patterns.navitiaStopArea);
  if (stopAreaMatch) return stopAreaMatch[1];

  // Format stop_point Navitia - extraction numérique
  const numericMatch = stopRef.match(/IDFM:(\d+)$/);
  if (numericMatch) return numericMatch[1];

  // Format numérique simple
  if (ID_FORMATS.patterns.numericStop.test(stopRef)) return stopRef;

  // Fallback: retourner l'input
  return stopRef;
}

// ============================================
// Conversion canonique - Stops
// ============================================

/**
 * Convertit n'importe quel format d'ID d'arrêt en format canonique
 */
export function toCanonicalStop(input: string): CanonicalStop {
  const trimmed = input.trim();

  // Format STIF complet
  if (isStifStopFormat(trimmed)) {
    const match = trimmed.match(ID_FORMATS.patterns.stifStop)!;
    const numericId = match[1];
    return {
      numericId,
      stifRef: trimmed,
      navitiaRef: `stop_point:IDFM:${numericId}`,
      original: input,
    };
  }

  // Format stop_area Navitia
  if (isNavitiaStopAreaFormat(trimmed)) {
    const match = trimmed.match(ID_FORMATS.patterns.navitiaStopArea)!;
    const numericId = match[1];
    return {
      numericId,
      stifRef: `STIF:StopPoint:Q:${numericId}:`,
      navitiaRef: `stop_point:IDFM:${numericId}`,
      stopAreaRef: trimmed,
      original: input,
    };
  }

  // Format stop_point Navitia
  if (isNavitiaStopFormat(trimmed)) {
    const match = trimmed.match(ID_FORMATS.patterns.navitiaStopPoint)!;
    const suffix = match[1];

    // Si monomodalStopPlace, garder tel quel
    if (suffix.startsWith("monomodalStopPlace:")) {
      return {
        numericId: suffix.replace("monomodalStopPlace:", ""),
        stifRef: `STIF:StopPoint:Q:${suffix.replace("monomodalStopPlace:", "")}:`,
        navitiaRef: trimmed,
        original: input,
      };
    }

    // Si numérique simple
    return {
      numericId: suffix,
      stifRef: `STIF:StopPoint:Q:${suffix}:`,
      navitiaRef: trimmed,
      original: input,
    };
  }

  // Format monomodalStopPlace sans préfixe
  if (isMonomodalStopFormat(trimmed)) {
    const numericId = trimmed.replace("monomodalStopPlace:", "");
    return {
      numericId,
      stifRef: `STIF:StopPoint:Q:${numericId}:`,
      navitiaRef: `stop_point:IDFM:${trimmed}`,
      original: input,
    };
  }

  // Format numérique simple
  if (ID_FORMATS.patterns.numericStop.test(trimmed)) {
    return {
      numericId: trimmed,
      stifRef: `STIF:StopPoint:Q:${trimmed}:`,
      navitiaRef: `stop_point:IDFM:${trimmed}`,
      original: input,
    };
  }

  // Fallback: essayer d'extraire un numérique
  const numericId = extractNumericStopId(trimmed);
  return {
    numericId,
    stifRef: `STIF:StopPoint:Q:${numericId}:`,
    navitiaRef: `stop_point:IDFM:${numericId}`,
    original: input,
  };
}

// ============================================
// Détection du mode de transport
// ============================================

/**
 * Détecte le mode de transport depuis un code ligne IDFM
 * Utilise les patterns documentés dans prim-config.ts
 */
export function detectTransportMode(lineCode: string): TransportMode {
  if (!lineCode) return "Bus";

  // Métro: C01371-C01384 (lignes 1-14), C01386 (3bis), C01387 (7bis)
  if (lineCode.startsWith("C013")) {
    const num = parseInt(lineCode.slice(4), 10);
    if ((num >= 71 && num <= 84) || num === 86 || num === 87) {
      return "Metro";
    }
    // Tramway: C01389-C0139x (T1, T2, etc.)
    if (num >= 89) {
      return "Tramway";
    }
  }

  // RER: C01742=A, C01743=B, C01727=C, C01728=D, C01729=E
  if (lineCode.startsWith("C017")) {
    const suffix = lineCode.slice(4);
    if (["42", "43", "27", "28", "29"].includes(suffix)) {
      return "RER";
    }
  }

  // Transilien: C02xxx
  if (lineCode.startsWith("C02")) {
    return "Transilien";
  }

  // Par défaut: Bus
  return "Bus";
}

// ============================================
// Nom affiché des lignes
// ============================================

/**
 * Génère le nom affiché d'une ligne depuis son code IDFM
 * Couvre Métro, RER, Tramway, Bus, Transilien
 */
export function extractLineDisplayName(lineRef: string, lineCode?: string): string {
  const code = lineCode ?? extractLineCode(lineRef);
  if (!code) return lineRef;

  // Tramway avec codes spéciaux (T4-T13) - vérifier EN PREMIER car ils chevauchent les patterns Bus
  const tramwayMap: Record<string, string> = {
    "C01843": "T4",
    "C02317": "T5",
    "C01394": "T6",
    "C01774": "T7",
    "C01795": "T8",
    "C02344": "T9",
    "C02528": "T10",
    "C01999": "T11",
    "C02529": "T12",
    "C02530": "T13",
  };
  if (tramwayMap[code]) return tramwayMap[code];

  // Métro: C01371-C01384 -> "Métro 1"-"Métro 14"
  if (code.startsWith("C013")) {
    const num = parseInt(code.slice(4), 10);
    if (num >= 71 && num <= 84) return `Métro ${num - 70}`;
    if (num === 86) return "Métro 3bis";
    if (num === 87) return "Métro 7bis";
    // Tramway: C01389-C0139x -> T1, T2, T3a, etc.
    if (num >= 89 && num <= 99) return `T${num - 88}`;
  }

  // RER: C017xx
  if (code.startsWith("C017")) {
    const rerMap: Record<string, string> = {
      "42": "A",
      "43": "B",
      "27": "C",
      "28": "D",
      "29": "E",
    };
    const suffix = code.slice(4);
    if (rerMap[suffix]) return `RER ${rerMap[suffix]}`;
  }

  // Transilien: C02xxx - on affiche juste le code brut
  // L'UI devrait utiliser le shortName de l'API si disponible
  if (code.startsWith("C02")) {
    return code;
  }

  // Bus: C01xxx où xxx est le numéro de la ligne (20+)
  const busMatch = code.match(/^C01(\d{3,4})$/);
  if (busMatch) {
    const busNum = parseInt(busMatch[1], 10);
    // Les numéros de bus vont généralement de 20 à 399+
    if (busNum >= 20) return `Bus ${busNum}`;
  }

  // Fallback: retourner le code brut
  return code;
}

// ============================================
// Conversion canonique - Lignes
// ============================================

/**
 * Convertit n'importe quel format d'ID de ligne en format canonique
 */
export function toCanonicalLine(input: string): CanonicalLine {
  const trimmed = input.trim();

  // Extraire le code
  const code = extractLineCode(trimmed);
  if (!code) {
    // Fallback si pas de code extractible
    return {
      code: trimmed,
      navitiaRef: `line:IDFM:${trimmed}`,
      stifRef: `STIF:Line::${trimmed}:`,
      displayName: trimmed,
      mode: "Bus",
      original: input,
    };
  }

  const mode = detectTransportMode(code);
  const displayName = extractLineDisplayName(trimmed, code);

  return {
    code,
    navitiaRef: `line:IDFM:${code}`,
    stifRef: `STIF:Line::${code}:`,
    displayName,
    mode,
    original: input,
  };
}

// ============================================
// Helpers pour logging
// ============================================

/**
 * Formate un log PRIM standardisé
 * Format: [PRIM] STATUS ENDPOINT (Xms) [EXTRA]
 */
export function logPrimRequest(
  status: "OK" | "ERROR" | "RATE_LIMIT" | "VALIDATION" | "FETCH_ERROR",
  endpoint: string,
  durationMs: number,
  extra?: string
): void {
  const msg = `[PRIM] ${status} ${endpoint} (${durationMs}ms)${extra ? ` ${extra}` : ""}`;

  if (status === "OK") {
    if (process.env.NODE_ENV === "development") {
      console.log(msg);
    }
  } else {
    console.warn(msg);
  }
}
