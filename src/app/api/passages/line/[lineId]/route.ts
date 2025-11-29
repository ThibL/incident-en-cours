import { NextRequest, NextResponse } from "next/server";
import { fetchLinePassages } from "@/lib/api/prim-client";
import { PRIMAPIError, PRIMValidationError } from "@/lib/api/prim-client";
import { REFRESH_INTERVALS } from "@/lib/api/prim-config";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    lineId: string;
  }>;
}

/**
 * GET /api/passages/line/[lineId]
 * Récupère les prochains passages pour une ligne spécifique
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { lineId } = await params;

    if (!lineId) {
      return NextResponse.json(
        { error: "lineId is required" },
        { status: 400 }
      );
    }

    const passages = await fetchLinePassages(lineId);

    const { serverRevalidate, swr } = REFRESH_INTERVALS.stopMonitoring;
    return NextResponse.json(
      { passages, lineId, timestamp: new Date().toISOString() },
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${serverRevalidate}, stale-while-revalidate=${swr}`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching line passages:", error);

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
