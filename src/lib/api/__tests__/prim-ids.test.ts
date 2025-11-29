import { describe, it, expect } from "vitest";
import {
  toCanonicalStop,
  toCanonicalLine,
  extractLineDisplayName,
  extractLineCode,
  extractNumericStopId,
  detectTransportMode,
  isStifStopFormat,
  isNavitiaStopFormat,
  isNavitiaStopAreaFormat,
  isMonomodalStopFormat,
  isNavitiaLineFormat,
  isStifLineFormat,
  isLineCode,
} from "../prim-ids";

// ============================================
// Tests de détection de format
// ============================================

describe("Format detection", () => {
  describe("isStifStopFormat", () => {
    it("detects valid STIF stop format", () => {
      expect(isStifStopFormat("STIF:StopPoint:Q:22089:")).toBe(true);
      expect(isStifStopFormat("STIF:StopPoint:Q:71264:")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isStifStopFormat("22089")).toBe(false);
      expect(isStifStopFormat("stop_point:IDFM:22089")).toBe(false);
      expect(isStifStopFormat("STIF:StopPoint:Q:22089")).toBe(false); // Missing trailing colon
    });
  });

  describe("isNavitiaStopFormat", () => {
    it("detects valid Navitia stop_point format", () => {
      expect(isNavitiaStopFormat("stop_point:IDFM:22089")).toBe(true);
      expect(isNavitiaStopFormat("stop_point:IDFM:monomodalStopPlace:47918")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isNavitiaStopFormat("22089")).toBe(false);
      expect(isNavitiaStopFormat("stop_area:IDFM:71264")).toBe(false);
    });
  });

  describe("isNavitiaStopAreaFormat", () => {
    it("detects valid Navitia stop_area format", () => {
      expect(isNavitiaStopAreaFormat("stop_area:IDFM:71264")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isNavitiaStopAreaFormat("stop_point:IDFM:22089")).toBe(false);
      expect(isNavitiaStopAreaFormat("71264")).toBe(false);
    });
  });

  describe("isMonomodalStopFormat", () => {
    it("detects monomodalStopPlace format", () => {
      expect(isMonomodalStopFormat("monomodalStopPlace:47918")).toBe(true);
    });

    it("rejects other formats", () => {
      expect(isMonomodalStopFormat("stop_point:IDFM:monomodalStopPlace:47918")).toBe(false);
      expect(isMonomodalStopFormat("47918")).toBe(false);
    });
  });

  describe("isNavitiaLineFormat", () => {
    it("detects valid Navitia line format", () => {
      expect(isNavitiaLineFormat("line:IDFM:C01371")).toBe(true);
      expect(isNavitiaLineFormat("line:IDFM:C01742")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isNavitiaLineFormat("C01371")).toBe(false);
      expect(isNavitiaLineFormat("STIF:Line::C01371:")).toBe(false);
    });
  });

  describe("isStifLineFormat", () => {
    it("detects valid STIF line format", () => {
      expect(isStifLineFormat("STIF:Line::C01371:")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isStifLineFormat("line:IDFM:C01371")).toBe(false);
      expect(isStifLineFormat("C01371")).toBe(false);
    });
  });

  describe("isLineCode", () => {
    it("detects valid line codes", () => {
      expect(isLineCode("C01371")).toBe(true);
      expect(isLineCode("C01742")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isLineCode("line:IDFM:C01371")).toBe(false);
      expect(isLineCode("01371")).toBe(false);
    });
  });
});

// ============================================
// Tests d'extraction
// ============================================

describe("extractLineCode", () => {
  it("extracts code from Navitia format", () => {
    expect(extractLineCode("line:IDFM:C01371")).toBe("C01371");
    expect(extractLineCode("line:IDFM:C01742")).toBe("C01742");
  });

  it("extracts code from STIF format", () => {
    expect(extractLineCode("STIF:Line::C01371:")).toBe("C01371");
  });

  it("returns code directly if already a code", () => {
    expect(extractLineCode("C01371")).toBe("C01371");
  });

  it("extracts code from generic pattern", () => {
    expect(extractLineCode("some:prefix:C01371:suffix")).toBe("C01371");
  });

  it("returns null for invalid input", () => {
    expect(extractLineCode("invalid")).toBe(null);
    expect(extractLineCode("12345")).toBe(null);
  });
});

describe("extractNumericStopId", () => {
  it("extracts from STIF format", () => {
    expect(extractNumericStopId("STIF:StopPoint:Q:22089:")).toBe("22089");
  });

  it("extracts from stop_area format", () => {
    expect(extractNumericStopId("stop_area:IDFM:71264")).toBe("71264");
  });

  it("extracts from stop_point numeric format", () => {
    expect(extractNumericStopId("stop_point:IDFM:22089")).toBe("22089");
  });

  it("returns input if already numeric", () => {
    expect(extractNumericStopId("22089")).toBe("22089");
  });

  it("returns input as fallback for unknown format", () => {
    expect(extractNumericStopId("unknown:format")).toBe("unknown:format");
  });
});

// ============================================
// Tests toCanonicalStop
// ============================================

describe("toCanonicalStop", () => {
  it("handles numeric ID", () => {
    const result = toCanonicalStop("22089");
    expect(result.numericId).toBe("22089");
    expect(result.stifRef).toBe("STIF:StopPoint:Q:22089:");
    expect(result.navitiaRef).toBe("stop_point:IDFM:22089");
    expect(result.original).toBe("22089");
  });

  it("handles STIF format", () => {
    const result = toCanonicalStop("STIF:StopPoint:Q:22089:");
    expect(result.numericId).toBe("22089");
    expect(result.stifRef).toBe("STIF:StopPoint:Q:22089:");
    expect(result.navitiaRef).toBe("stop_point:IDFM:22089");
  });

  it("handles stop_area format", () => {
    const result = toCanonicalStop("stop_area:IDFM:71264");
    expect(result.numericId).toBe("71264");
    expect(result.stopAreaRef).toBe("stop_area:IDFM:71264");
    expect(result.stifRef).toBe("STIF:StopPoint:Q:71264:");
  });

  it("handles stop_point numeric format", () => {
    const result = toCanonicalStop("stop_point:IDFM:22089");
    expect(result.numericId).toBe("22089");
    expect(result.navitiaRef).toBe("stop_point:IDFM:22089");
  });

  it("handles monomodalStopPlace format", () => {
    const result = toCanonicalStop("stop_point:IDFM:monomodalStopPlace:47918");
    expect(result.numericId).toBe("47918");
    expect(result.navitiaRef).toBe("stop_point:IDFM:monomodalStopPlace:47918");
  });

  it("handles bare monomodalStopPlace format", () => {
    const result = toCanonicalStop("monomodalStopPlace:47918");
    expect(result.numericId).toBe("47918");
    expect(result.navitiaRef).toBe("stop_point:IDFM:monomodalStopPlace:47918");
  });

  it("trims whitespace", () => {
    const result = toCanonicalStop("  22089  ");
    expect(result.numericId).toBe("22089");
    expect(result.original).toBe("  22089  ");
  });
});

// ============================================
// Tests toCanonicalLine
// ============================================

describe("toCanonicalLine", () => {
  it("handles code only", () => {
    const result = toCanonicalLine("C01371");
    expect(result.code).toBe("C01371");
    expect(result.navitiaRef).toBe("line:IDFM:C01371");
    expect(result.stifRef).toBe("STIF:Line::C01371:");
    expect(result.displayName).toBe("Métro 1");
    expect(result.mode).toBe("Metro");
  });

  it("handles Navitia format", () => {
    const result = toCanonicalLine("line:IDFM:C01742");
    expect(result.code).toBe("C01742");
    expect(result.displayName).toBe("RER A");
    expect(result.mode).toBe("RER");
  });

  it("handles STIF format", () => {
    const result = toCanonicalLine("STIF:Line::C01743:");
    expect(result.code).toBe("C01743");
    expect(result.displayName).toBe("RER B");
    expect(result.mode).toBe("RER");
  });

  it("preserves original input", () => {
    const result = toCanonicalLine("line:IDFM:C01371");
    expect(result.original).toBe("line:IDFM:C01371");
  });
});

// ============================================
// Tests detectTransportMode
// ============================================

describe("detectTransportMode", () => {
  it("detects Metro lines", () => {
    expect(detectTransportMode("C01371")).toBe("Metro"); // Ligne 1
    expect(detectTransportMode("C01384")).toBe("Metro"); // Ligne 14
    expect(detectTransportMode("C01386")).toBe("Metro"); // Ligne 3bis
    expect(detectTransportMode("C01387")).toBe("Metro"); // Ligne 7bis
  });

  it("detects RER lines", () => {
    expect(detectTransportMode("C01742")).toBe("RER"); // RER A
    expect(detectTransportMode("C01743")).toBe("RER"); // RER B
    expect(detectTransportMode("C01727")).toBe("RER"); // RER C
    expect(detectTransportMode("C01728")).toBe("RER"); // RER D
    expect(detectTransportMode("C01729")).toBe("RER"); // RER E
  });

  it("detects Tramway lines", () => {
    expect(detectTransportMode("C01389")).toBe("Tramway"); // T1
    expect(detectTransportMode("C01390")).toBe("Tramway"); // T2
    expect(detectTransportMode("C01391")).toBe("Tramway"); // T3a
  });

  it("detects Transilien lines", () => {
    expect(detectTransportMode("C02000")).toBe("Transilien");
  });

  it("defaults to Bus for unknown codes", () => {
    expect(detectTransportMode("C01067")).toBe("Bus");
    expect(detectTransportMode("unknown")).toBe("Bus");
    expect(detectTransportMode("")).toBe("Bus");
  });
});

// ============================================
// Tests extractLineDisplayName
// ============================================

describe("extractLineDisplayName", () => {
  describe("Metro lines", () => {
    it("handles standard Metro lines (1-14)", () => {
      expect(extractLineDisplayName("line:IDFM:C01371")).toBe("Métro 1");
      expect(extractLineDisplayName("line:IDFM:C01372")).toBe("Métro 2");
      expect(extractLineDisplayName("line:IDFM:C01384")).toBe("Métro 14");
    });

    it("handles Metro 3bis and 7bis", () => {
      expect(extractLineDisplayName("line:IDFM:C01386")).toBe("Métro 3bis");
      expect(extractLineDisplayName("line:IDFM:C01387")).toBe("Métro 7bis");
    });
  });

  describe("RER lines", () => {
    it("handles RER A-E", () => {
      expect(extractLineDisplayName("line:IDFM:C01742")).toBe("RER A");
      expect(extractLineDisplayName("line:IDFM:C01743")).toBe("RER B");
      expect(extractLineDisplayName("line:IDFM:C01727")).toBe("RER C");
      expect(extractLineDisplayName("line:IDFM:C01728")).toBe("RER D");
      expect(extractLineDisplayName("line:IDFM:C01729")).toBe("RER E");
    });
  });

  describe("Tramway lines", () => {
    it("handles T1-T3", () => {
      expect(extractLineDisplayName("line:IDFM:C01389")).toBe("T1");
      expect(extractLineDisplayName("line:IDFM:C01390")).toBe("T2");
      expect(extractLineDisplayName("line:IDFM:C01391")).toBe("T3");
    });

    it("handles T4-T13 (special codes)", () => {
      expect(extractLineDisplayName("line:IDFM:C01843")).toBe("T4");
      expect(extractLineDisplayName("line:IDFM:C02317")).toBe("T5");
      expect(extractLineDisplayName("line:IDFM:C02530")).toBe("T13");
    });
  });

  describe("Bus lines", () => {
    it("handles Bus lines", () => {
      expect(extractLineDisplayName("line:IDFM:C01067")).toBe("Bus 67");
      expect(extractLineDisplayName("line:IDFM:C01147")).toBe("Bus 147");
    });
  });

  describe("Fallback behavior", () => {
    it("returns code for unknown patterns", () => {
      expect(extractLineDisplayName("line:IDFM:C99999")).toBe("C99999");
    });

    it("works with code directly", () => {
      expect(extractLineDisplayName("C01371")).toBe("Métro 1");
    });

    it("accepts optional lineCode parameter", () => {
      expect(extractLineDisplayName("anything", "C01371")).toBe("Métro 1");
    });
  });
});
