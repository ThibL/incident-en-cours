import { NextRequest, NextResponse } from "next/server";
import { fetchTrafficInfo, fetchBulkDisruptions } from "@/lib/api/prim-client";
import { PRIMAPIError, PRIMValidationError } from "@/lib/api/prim-client";

export const dynamic = "force-dynamic";

/**
 * GET /api/messages/trafic
 * Récupère les informations trafic
 *
 * Query params:
 * - bulk (optional): Si "true", utilise l'endpoint disruptions_bulk
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bulk = searchParams.get("bulk") === "true";

    const trafficInfo = bulk
      ? await fetchBulkDisruptions()
      : await fetchTrafficInfo();

    return NextResponse.json(
      {
        trafficInfo,
        source: bulk ? "bulk" : "line_reports",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": bulk
            ? "public, s-maxage=120, stale-while-revalidate=60"
            : "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching traffic info:", error);

    if (error instanceof PRIMAPIError) {
      return NextResponse.json(
        {
          error: "API Error",
          message: error.statusText,
          status: error.status,
        },
        { status: error.status }
      );
    }

    if (error instanceof PRIMValidationError) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid response from PRIM API",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
