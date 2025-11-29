import { NextRequest, NextResponse } from "next/server";
import { searchPlaces, PRIMAPIError, PRIMValidationError } from "@/lib/api/prim-client";
import { REFRESH_INTERVALS } from "@/lib/api/prim-config";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["stop", "line", "all"] as const;
type SearchType = (typeof VALID_TYPES)[number];

/**
 * GET /api/search
 * Recherche de stations et lignes
 *
 * Query params:
 * - q: string (required) - Terme de recherche (min 2 caractères)
 * - type: "stop" | "line" | "all" (optional, default: "all")
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const type = (searchParams.get("type") || "all") as SearchType;

    // Validation: query requise et min 2 caractères
    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          error: "Invalid query",
          message: "Query parameter 'q' is required and must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    // Validation du type
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        {
          error: "Invalid type",
          validTypes: VALID_TYPES,
        },
        { status: 400 }
      );
    }

    const results = await searchPlaces(query, type);

    const { serverRevalidate, swr } = REFRESH_INTERVALS.search;
    return NextResponse.json(
      {
        results,
        query,
        type,
        count: results.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${serverRevalidate}, stale-while-revalidate=${swr}`,
        },
      }
    );
  } catch (error) {
    console.error("Error searching:", error);

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
