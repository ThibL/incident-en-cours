import { NextRequest, NextResponse } from "next/server";
import { fetchPassages } from "@/lib/api/prim-client";
import { PRIMAPIError, PRIMValidationError } from "@/lib/api/prim-client";
import { REFRESH_INTERVALS } from "@/lib/api/prim-config";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    stopId: string;
  }>;
}

/**
 * GET /api/passages/[stopId]
 * Récupère les prochains passages à un arrêt
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stopId } = await params;

    if (!stopId) {
      return NextResponse.json(
        { error: "stopId is required" },
        { status: 400 }
      );
    }

    const passages = await fetchPassages(stopId);

    const { serverRevalidate, swr } = REFRESH_INTERVALS.stopMonitoring;
    return NextResponse.json(
      { passages, timestamp: new Date().toISOString() },
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${serverRevalidate}, stale-while-revalidate=${swr}`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching passages:", error);

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
