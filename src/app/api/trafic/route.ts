import { NextRequest, NextResponse } from "next/server";
import { fetchTrafficInfo, fetchLineTrafficInfo } from "@/lib/api/prim-client";
import { PRIMAPIError, PRIMValidationError } from "@/lib/api/prim-client";
import type { TransportMode } from "@/types/prim";

export const dynamic = "force-dynamic";

const VALID_MODES: TransportMode[] = ["Metro", "RER", "Tramway", "Bus", "Transilien"];

/**
 * GET /api/trafic
 * Récupère les infos trafic
 *
 * Query params:
 * - mode: TransportMode (optional) - Filtrer par mode de transport
 * - lineId: string (optional) - Filtrer par ligne spécifique
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get("mode") as TransportMode | null;
    const lineId = searchParams.get("lineId");

    // Validation du mode
    if (mode && !VALID_MODES.includes(mode)) {
      return NextResponse.json(
        {
          error: "Invalid mode",
          validModes: VALID_MODES,
        },
        { status: 400 }
      );
    }

    let trafficInfo;

    if (lineId) {
      // Récupérer les infos pour une ligne spécifique
      trafficInfo = await fetchLineTrafficInfo(lineId);
    } else {
      // Récupérer les infos par mode ou globales
      trafficInfo = await fetchTrafficInfo(mode || undefined);
    }

    return NextResponse.json(
      {
        trafficInfo,
        timestamp: new Date().toISOString(),
        mode: mode || "all",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
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
