import { NextRequest, NextResponse } from "next/server";
import { fetchScreenMessages } from "@/lib/api/prim-client";
import { PRIMAPIError, PRIMValidationError } from "@/lib/api/prim-client";
import type { ScreenMessageChannel } from "@/types/prim";

export const dynamic = "force-dynamic";

const VALID_CHANNELS: ScreenMessageChannel[] = ["Information", "Perturbation", "Commercial"];

/**
 * GET /api/messages/affichage
 * Récupère les messages affichés sur les écrans des stations
 *
 * Query params:
 * - lineId (optional): Filtrer par ligne
 * - channel (optional): Filtrer par type (Information, Perturbation, Commercial)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get("lineId");
    const channel = searchParams.get("channel") as ScreenMessageChannel | null;

    // Valider le channel si fourni
    if (channel && !VALID_CHANNELS.includes(channel)) {
      return NextResponse.json(
        {
          error: "Invalid channel",
          message: `Channel must be one of: ${VALID_CHANNELS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    let messages = await fetchScreenMessages(lineId || undefined);

    // Filtrer par channel si spécifié
    if (channel) {
      messages = messages.filter((m) => m.channel === channel);
    }

    return NextResponse.json(
      {
        messages,
        filters: { lineId, channel },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching screen messages:", error);

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
