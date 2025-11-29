import { NextRequest, NextResponse } from "next/server";
import { fetchLineStops } from "@/lib/api/prim-client";
import { PRIMAPIError, PRIMValidationError } from "@/lib/api/prim-client";
import { REFRESH_INTERVALS } from "@/lib/api/prim-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lineId: string }> }
) {
  const { lineId } = await params;

  if (!lineId) {
    return NextResponse.json(
      { error: "Missing lineId parameter" },
      { status: 400 }
    );
  }

  try {
    const stops = await fetchLineStops(lineId);

    const { serverRevalidate, swr } = REFRESH_INTERVALS.lineStops;
    return NextResponse.json(
      { stops, lineId, count: stops.length },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${serverRevalidate}, stale-while-revalidate=${swr}`,
        },
      }
    );
  } catch (error) {
    console.error(`[API] Error fetching stops for line ${lineId}:`, error);

    if (error instanceof PRIMAPIError) {
      return NextResponse.json(
        { error: "PRIM API error", details: error.message },
        { status: error.status }
      );
    }

    if (error instanceof PRIMValidationError) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
