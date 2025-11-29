import { z } from "zod";

// ============================================
// Schemas Zod pour la recherche
// ============================================

export const SearchResultSchema = z.object({
  id: z.string(), // Ref complet (stop_area:IDFM:* ou line:IDFM:*)
  numericId: z.string().optional(), // ID numérique extrait pour compatibilité
  name: z.string(),
  type: z.enum(["stop", "line"]),
  // Pour les stops
  lines: z.array(z.string()).optional(),
  coords: z.object({
    lat: z.number(),
    lon: z.number()
  }).optional(),
  city: z.string().optional(),
  // Pour les lignes
  mode: z.enum(["Metro", "RER", "Tramway", "Bus", "Transilien"]).optional(),
  code: z.string().optional(),
  color: z.string().optional(),
});

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  query: z.string(),
});

// ============================================
// Types TypeScript inferes
// ============================================

export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// ============================================
// Schema PRIM Places (reponse API /places)
// ============================================

const PRIMPlaceLineSchema = z.object({
  id: z.string(),
  shortName: z.string().optional(),
  color: z.string().optional(),
  textColor: z.string().optional(),
  mode: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
});

export const PRIMPlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["StopArea", "City", "Address", "Line"]),
  quality: z.number().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  insee: z.string().optional(),
  lines: z.array(PRIMPlaceLineSchema).optional(),
  modes: z.array(z.string()).optional(),
  // Pour les lignes (type = Line)
  shortName: z.string().optional(),
  color: z.string().optional(),
  textColor: z.string().optional(),
  mode: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
}).passthrough();

export const PRIMPlacesResponseSchema = z.object({
  places: z.array(PRIMPlaceSchema).optional(),
}).passthrough();

export type PRIMPlace = z.infer<typeof PRIMPlaceSchema>;
export type PRIMPlacesResponse = z.infer<typeof PRIMPlacesResponseSchema>;
