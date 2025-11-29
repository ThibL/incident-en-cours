import { describe, it, expect } from "vitest";
import {
  SIRILiteResponseSchema,
  TrafficInfoResponseSchema,
  GeneralMessageResponseSchema,
  MonitoredCallSchema,
  MonitoredVehicleJourneySchema,
  MonitoredStopVisitSchema,
  DisruptionSchema,
  LineReportSchema,
  InfoMessageSchema,
  LineStopsResponseSchema,
} from "@/types/prim";
import { PRIMPlacesResponseSchema } from "@/types/search";

import siriFixture from "./fixtures/siri-response.json";
import trafficFixture from "./fixtures/traffic-response.json";
import generalMessageFixture from "./fixtures/general-message-response.json";
import lineStopsFixture from "./fixtures/line-stops-response.json";
import placesFixture from "./fixtures/places-response.json";
import trafficExtendedFixture from "./fixtures/traffic-extended.json";

describe("PRIM API Zod Schemas", () => {
  describe("SIRILiteResponseSchema (Stop Monitoring)", () => {
    it("should parse a valid SIRI Lite response", () => {
      const result = SIRILiteResponseSchema.safeParse(siriFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.Siri.ServiceDelivery.ResponseTimestamp).toBe(
          "2024-01-15T10:30:00Z"
        );
        expect(
          result.data.Siri.ServiceDelivery.StopMonitoringDelivery
        ).toHaveLength(1);
      }
    });

    it("should extract MonitoredStopVisit array", () => {
      const result = SIRILiteResponseSchema.safeParse(siriFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const visits =
          result.data.Siri.ServiceDelivery.StopMonitoringDelivery[0]
            ?.MonitoredStopVisit;
        expect(visits).toHaveLength(2);
        expect(visits?.[0].MonitoredVehicleJourney.LineRef.value).toBe(
          "STIF:Line::C01371:"
        );
      }
    });

    it("should reject invalid SIRI response", () => {
      const invalid = { Siri: { ServiceDelivery: {} } };
      const result = SIRILiteResponseSchema.safeParse(invalid);

      expect(result.success).toBe(false);
    });

    it("should parse MonitoredCall with all fields", () => {
      const call = {
        ExpectedDepartureTime: "2024-01-15T10:35:00Z",
        AimedDepartureTime: "2024-01-15T10:34:00Z",
        DepartureStatus: "onTime",
        VehicleAtStop: false,
      };

      const result = MonitoredCallSchema.safeParse(call);
      expect(result.success).toBe(true);
    });

    it("should parse MonitoredCall with minimal fields", () => {
      const call = {};
      const result = MonitoredCallSchema.safeParse(call);
      expect(result.success).toBe(true);
    });
  });

  describe("TrafficInfoResponseSchema (Navitia)", () => {
    it("should parse a valid traffic info response", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.disruptions).toHaveLength(2);
        expect(result.data.line_reports).toHaveLength(2);
      }
    });

    it("should parse disruptions with severity effects", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const disruption = result.data.disruptions?.[0];
        expect(disruption?.severity.effect).toBe("SIGNIFICANT_DELAYS");
        expect(disruption?.status).toBe("active");
      }
    });

    it("should parse NO_SERVICE severity", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const disruption = result.data.disruptions?.[1];
        expect(disruption?.severity.effect).toBe("NO_SERVICE");
      }
    });

    it("should parse line reports with colors", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const line = result.data.line_reports?.[0].line;
        expect(line?.code).toBe("1");
        expect(line?.color).toBe("FFCE00");
      }
    });

    it("should handle empty disruptions array", () => {
      const result = TrafficInfoResponseSchema.safeParse({
        disruptions: [],
        line_reports: [],
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid disruption status", () => {
      const invalid = {
        disruptions: [
          {
            id: "test",
            status: "invalid_status", // Not a valid status
            severity: { name: "test" },
          },
        ],
      };

      const result = TrafficInfoResponseSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("GeneralMessageResponseSchema (Screen Messages)", () => {
    it("should parse a valid general message response", () => {
      const result =
        GeneralMessageResponseSchema.safeParse(generalMessageFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.Siri.ServiceDelivery.ResponseTimestamp).toBe(
          "2024-01-15T10:30:00Z"
        );
      }
    });

    it("should extract InfoMessage array", () => {
      const result =
        GeneralMessageResponseSchema.safeParse(generalMessageFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const messages =
          result.data.Siri.ServiceDelivery.GeneralMessageDelivery[0]
            ?.InfoMessage;
        expect(messages).toHaveLength(3);
      }
    });

    it("should parse different channel types", () => {
      const result =
        GeneralMessageResponseSchema.safeParse(generalMessageFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const messages =
          result.data.Siri.ServiceDelivery.GeneralMessageDelivery[0]
            ?.InfoMessage;
        const channels = messages?.map((m) => m.InfoChannelRef);
        expect(channels).toContain("Perturbation");
        expect(channels).toContain("Information");
        expect(channels).toContain("Commercial");
      }
    });

    it("should parse message content with LineRef", () => {
      const result =
        GeneralMessageResponseSchema.safeParse(generalMessageFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const message =
          result.data.Siri.ServiceDelivery.GeneralMessageDelivery[0]
            ?.InfoMessage?.[0];
        expect(message?.Content.LineRef).toHaveLength(1);
        expect(message?.Content.LineRef?.[0].value).toBe("STIF:Line::C01371:");
      }
    });

    it("should handle message without LineRef", () => {
      const result =
        GeneralMessageResponseSchema.safeParse(generalMessageFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const commercialMessage =
          result.data.Siri.ServiceDelivery.GeneralMessageDelivery[0]
            ?.InfoMessage?.[2];
        expect(commercialMessage?.Content.LineRef).toBeUndefined();
      }
    });
  });

  describe("Individual schema validation", () => {
    it("should parse a valid Disruption", () => {
      const disruption = trafficFixture.disruptions[0];
      const result = DisruptionSchema.safeParse(disruption);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("disruption-123");
        expect(result.data.impacted_objects).toHaveLength(1);
      }
    });

    it("should parse a valid LineReport", () => {
      const lineReport = trafficFixture.line_reports[0];
      const result = LineReportSchema.safeParse(lineReport);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.line.id).toBe("line:IDFM:C01371");
        expect(result.data.line.physical_modes).toHaveLength(1);
      }
    });

    it("should parse a valid InfoMessage", () => {
      const infoMessage =
        generalMessageFixture.Siri.ServiceDelivery.GeneralMessageDelivery[0]
          .InfoMessage[0];
      const result = InfoMessageSchema.safeParse(infoMessage);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.InfoMessageIdentifier).toBe("msg-001");
        expect(result.data.InfoChannelRef).toBe("Perturbation");
      }
    });

    it("should parse MonitoredVehicleJourney", () => {
      const journey =
        siriFixture.Siri.ServiceDelivery.StopMonitoringDelivery[0]
          .MonitoredStopVisit[0].MonitoredVehicleJourney;
      const result = MonitoredVehicleJourneySchema.safeParse(journey);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.LineRef.value).toBe("STIF:Line::C01371:");
        expect(result.data.DestinationName?.[0].value).toBe(
          "La Défense (Grande Arche)"
        );
      }
    });

    it("should parse MonitoredStopVisit", () => {
      const visit =
        siriFixture.Siri.ServiceDelivery.StopMonitoringDelivery[0]
          .MonitoredStopVisit[0];
      const result = MonitoredStopVisitSchema.safeParse(visit);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ItemIdentifier).toBe("item-1");
        expect(result.data.MonitoringRef?.value).toBe(
          "STIF:StopPoint:Q:12345:"
        );
      }
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle null/undefined gracefully", () => {
      const resultNull = SIRILiteResponseSchema.safeParse(null);
      const resultUndefined = SIRILiteResponseSchema.safeParse(undefined);

      expect(resultNull.success).toBe(false);
      expect(resultUndefined.success).toBe(false);
    });

    it("should handle empty response structures", () => {
      const emptyDelivery = {
        Siri: {
          ServiceDelivery: {
            ResponseTimestamp: "2024-01-15T10:30:00Z",
            StopMonitoringDelivery: [{}],
          },
        },
      };

      const result = SIRILiteResponseSchema.safeParse(emptyDelivery);
      expect(result.success).toBe(true);
    });

    it("should allow passthrough of unknown fields", () => {
      const withExtra = {
        ...siriFixture.Siri.ServiceDelivery.StopMonitoringDelivery[0]
          .MonitoredStopVisit[0].MonitoredVehicleJourney.MonitoredCall,
        UnknownField: "extra data",
      };

      const result = MonitoredCallSchema.safeParse(withExtra);
      expect(result.success).toBe(true);
    });
  });

  describe("LineStopsResponseSchema (Navitia stop_points)", () => {
    it("should parse a valid line stops response", () => {
      const result = LineStopsResponseSchema.safeParse(lineStopsFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stop_points).toHaveLength(5);
      }
    });

    it("should handle monomodalStopPlace format", () => {
      const result = LineStopsResponseSchema.safeParse(lineStopsFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const firstStop = result.data.stop_points?.[0];
        expect(firstStop?.id).toContain("monomodalStopPlace");
        expect(firstStop?.name).toBe("Châtelet");
        expect(firstStop?.coord?.lat).toBe("48.858393");
      }
    });

    it("should handle simple numeric stop_point IDs", () => {
      const result = LineStopsResponseSchema.safeParse(lineStopsFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const simpleStop = result.data.stop_points?.find(
          (s) => s.id === "stop_point:IDFM:22089"
        );
        expect(simpleStop?.name).toBe("Tuileries");
      }
    });

    it("should handle empty stop_points array", () => {
      const result = LineStopsResponseSchema.safeParse({ stop_points: [] });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stop_points).toHaveLength(0);
      }
    });
  });

  describe("PRIMPlacesResponseSchema (Search results)", () => {
    it("should parse a valid places response", () => {
      const result = PRIMPlacesResponseSchema.safeParse(placesFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.places).toHaveLength(4);
      }
    });

    it("should parse StopArea results with lines", () => {
      const result = PRIMPlacesResponseSchema.safeParse(placesFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const stopArea = result.data.places?.find((p) => p.type === "StopArea");
        expect(stopArea?.name).toBe("Châtelet");
        expect(stopArea?.city).toBe("Paris");
        expect(stopArea?.lines).toHaveLength(5);
        expect(stopArea?.lines?.[0].shortName).toBe("1");
      }
    });

    it("should parse Line results", () => {
      const result = PRIMPlacesResponseSchema.safeParse(placesFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const line = result.data.places?.find((p) => p.type === "Line");
        expect(line?.name).toBe("Métro 1");
        expect(line?.shortName).toBe("1");
        expect(line?.color).toBe("FFCE00");
        expect(line?.mode).toHaveLength(1);
      }
    });

    it("should handle coordinates for stops", () => {
      const result = PRIMPlacesResponseSchema.safeParse(placesFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const stopArea = result.data.places?.[0];
        expect(stopArea?.x).toBe(2.347118);
        expect(stopArea?.y).toBe(48.858393);
      }
    });

    it("should handle empty places array", () => {
      const result = PRIMPlacesResponseSchema.safeParse({ places: [] });

      expect(result.success).toBe(true);
    });
  });

  describe("Extended Disruption Effects", () => {
    it("should parse DETOUR effect", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficExtendedFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const detour = result.data.disruptions?.find(
          (d) => d.severity.effect === "DETOUR"
        );
        expect(detour).toBeDefined();
        expect(detour?.id).toBe("disruption-detour-001");
        expect(detour?.cause).toBe("travaux voirie");
      }
    });

    it("should parse MODIFIED_SERVICE effect", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficExtendedFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const modified = result.data.disruptions?.find(
          (d) => d.severity.effect === "MODIFIED_SERVICE"
        );
        expect(modified).toBeDefined();
        expect(modified?.category).toBe("Information");
      }
    });

    it("should parse STOP_MOVED effect", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficExtendedFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const stopMoved = result.data.disruptions?.find(
          (d) => d.severity.effect === "STOP_MOVED"
        );
        expect(stopMoved).toBeDefined();
        expect(stopMoved?.impacted_objects?.[0].pt_object.embedded_type).toBe(
          "stop_area"
        );
      }
    });

    it("should parse ADDITIONAL_SERVICE effect", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficExtendedFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const additional = result.data.disruptions?.find(
          (d) => d.severity.effect === "ADDITIONAL_SERVICE"
        );
        expect(additional).toBeDefined();
        expect(additional?.category).toBe("Événement");
      }
    });

    it("should parse REDUCED_SERVICE effect with future status", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficExtendedFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const reduced = result.data.disruptions?.find(
          (d) => d.severity.effect === "REDUCED_SERVICE"
        );
        expect(reduced).toBeDefined();
        expect(reduced?.status).toBe("future");
      }
    });

    it("should parse OTHER_EFFECT", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficExtendedFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const other = result.data.disruptions?.find(
          (d) => d.severity.effect === "OTHER_EFFECT"
        );
        expect(other).toBeDefined();
        expect(other?.impacted_objects).toHaveLength(0);
      }
    });

    it("should parse nested line object in impacted_objects", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficExtendedFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        const disruption = result.data.disruptions?.[0];
        const ptObject = disruption?.impacted_objects?.[0].pt_object;

        expect(ptObject?.embedded_type).toBe("line");
        // The line object is nested and should be accessible via passthrough
        expect(ptObject).toHaveProperty("line");
      }
    });

    it("should parse all 6 disruptions in extended fixture", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficExtendedFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.disruptions).toHaveLength(6);

        const effects = result.data.disruptions?.map((d) => d.severity.effect);
        expect(effects).toContain("DETOUR");
        expect(effects).toContain("MODIFIED_SERVICE");
        expect(effects).toContain("STOP_MOVED");
        expect(effects).toContain("ADDITIONAL_SERVICE");
        expect(effects).toContain("REDUCED_SERVICE");
        expect(effects).toContain("OTHER_EFFECT");
      }
    });

    it("should parse line_reports in extended fixture", () => {
      const result = TrafficInfoResponseSchema.safeParse(trafficExtendedFixture);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.line_reports).toHaveLength(3);

        const lineCodes = result.data.line_reports?.map((r) => r.line.code);
        expect(lineCodes).toContain("1");
        expect(lineCodes).toContain("A");
        expect(lineCodes).toContain("B");
      }
    });
  });
});
