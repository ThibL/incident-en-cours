import { NextRequest, NextResponse } from "next/server";
import { fetchPassages } from "@/lib/api/prim-client";
import { PRIMAPIError, PRIMValidationError } from "@/lib/api/prim-client";
import type { Passage } from "@/types/prim";

export const dynamic = "force-dynamic";

const MAX_STOPS = 10;

interface BulkPassagesResult {
  stopId: string;
  passages: Passage[];
  error?: string;
}

/**
 * GET /api/passages/bulk?stops=stopId1,stopId2,stopId3
 * Récupère les prochains passages pour plusieurs arrêts en parallèle
 * Maximum 10 arrêts par requête
 */
export async function GET(request: NextRequest) {
  try {
    const stopsParam = request.nextUrl.searchParams.get("stops");

    if (!stopsParam) {
      return NextResponse.json(
        { error: "stops query parameter is required (comma-separated list)" },
        { status: 400 }
      );
    }

    const stopIds = stopsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (stopIds.length === 0) {
      return NextResponse.json(
        { error: "At least one stop ID is required" },
        { status: 400 }
      );
    }

    if (stopIds.length > MAX_STOPS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_STOPS} stops allowed per request` },
        { status: 400 }
      );
    }

    // Fetch all stops in parallel using Promise.allSettled
    const results = await Promise.allSettled(
      stopIds.map(async (stopId): Promise<BulkPassagesResult> => {
        const passages = await fetchPassages(stopId);
        return { stopId, passages };
      })
    );

    // Process results
    const bulkResults: BulkPassagesResult[] = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      // Handle rejected promises
      const error = result.reason;
      let errorMessage = "Unknown error";

      if (error instanceof PRIMAPIError) {
        errorMessage = `API Error: ${error.status} ${error.statusText}`;
      } else if (error instanceof PRIMValidationError) {
        errorMessage = "Invalid response from PRIM API";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        stopId: stopIds[index],
        passages: [],
        error: errorMessage,
      };
    });

    const successCount = bulkResults.filter((r) => !r.error).length;
    const errorCount = bulkResults.filter((r) => r.error).length;

    return NextResponse.json(
      {
        results: bulkResults,
        summary: {
          requested: stopIds.length,
          success: successCount,
          errors: errorCount,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching bulk passages:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
