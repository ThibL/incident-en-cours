import { LINE_COLORS } from "@/types/prim";

// ============================================
// Données des lignes (métadonnées uniquement)
// Les stations sont chargées dynamiquement via l'API PRIM
// ============================================

export interface LineInfo {
  id: string;
  code: string;
  name: string;
  mode: "Metro" | "RER" | "Tramway" | "Bus" | "Transilien";
  color: string;
  directions: string[]; // Terminus possibles
}

// Note: StationInfo est gardé pour la rétrocompatibilité mais n'est plus utilisé
export interface StationInfo {
  id: string;
  name: string;
}

// ============================================
// Métro - 14 lignes
// ============================================

export const METRO_LINES_DATA: LineInfo[] = [
  {
    id: "line:IDFM:C01371",
    code: "1",
    name: "Métro 1",
    mode: "Metro",
    color: LINE_COLORS["1"],
    directions: ["La Défense (Grande Arche)", "Château de Vincennes"],
  },
  {
    id: "line:IDFM:C01372",
    code: "2",
    name: "Métro 2",
    mode: "Metro",
    color: LINE_COLORS["2"],
    directions: ["Porte Dauphine", "Nation"],
  },
  {
    id: "line:IDFM:C01373",
    code: "3",
    name: "Métro 3",
    mode: "Metro",
    color: LINE_COLORS["3"],
    directions: ["Pont de Levallois - Bécon", "Gallieni"],
  },
  {
    id: "line:IDFM:C01386",
    code: "3bis",
    name: "Métro 3bis",
    mode: "Metro",
    color: LINE_COLORS["3bis"],
    directions: ["Gambetta", "Porte des Lilas"],
  },
  {
    id: "line:IDFM:C01374",
    code: "4",
    name: "Métro 4",
    mode: "Metro",
    color: LINE_COLORS["4"],
    directions: ["Porte de Clignancourt", "Bagneux - Lucie Aubrac"],
  },
  {
    id: "line:IDFM:C01375",
    code: "5",
    name: "Métro 5",
    mode: "Metro",
    color: LINE_COLORS["5"],
    directions: ["Bobigny - Pablo Picasso", "Place d'Italie"],
  },
  {
    id: "line:IDFM:C01376",
    code: "6",
    name: "Métro 6",
    mode: "Metro",
    color: LINE_COLORS["6"],
    directions: ["Charles de Gaulle - Étoile", "Nation"],
  },
  {
    id: "line:IDFM:C01377",
    code: "7",
    name: "Métro 7",
    mode: "Metro",
    color: LINE_COLORS["7"],
    directions: ["La Courneuve - 8 Mai 1945", "Villejuif - Louis Aragon", "Mairie d'Ivry"],
  },
  {
    id: "line:IDFM:C01387",
    code: "7bis",
    name: "Métro 7bis",
    mode: "Metro",
    color: LINE_COLORS["7bis"],
    directions: ["Louis Blanc", "Pré-Saint-Gervais"],
  },
  {
    id: "line:IDFM:C01378",
    code: "8",
    name: "Métro 8",
    mode: "Metro",
    color: LINE_COLORS["8"],
    directions: ["Balard", "Pointe du Lac"],
  },
  {
    id: "line:IDFM:C01379",
    code: "9",
    name: "Métro 9",
    mode: "Metro",
    color: LINE_COLORS["9"],
    directions: ["Pont de Sèvres", "Mairie de Montreuil"],
  },
  {
    id: "line:IDFM:C01380",
    code: "10",
    name: "Métro 10",
    mode: "Metro",
    color: LINE_COLORS["10"],
    directions: ["Boulogne - Pont de Saint-Cloud", "Gare d'Austerlitz"],
  },
  {
    id: "line:IDFM:C01381",
    code: "11",
    name: "Métro 11",
    mode: "Metro",
    color: LINE_COLORS["11"],
    directions: ["Châtelet", "Mairie des Lilas"],
  },
  {
    id: "line:IDFM:C01382",
    code: "12",
    name: "Métro 12",
    mode: "Metro",
    color: LINE_COLORS["12"],
    directions: ["Front Populaire", "Mairie d'Issy"],
  },
  {
    id: "line:IDFM:C01383",
    code: "13",
    name: "Métro 13",
    mode: "Metro",
    color: LINE_COLORS["13"],
    directions: ["Saint-Denis - Université", "Asnières - Gennevilliers", "Châtillon - Montrouge"],
  },
  {
    id: "line:IDFM:C01384",
    code: "14",
    name: "Métro 14",
    mode: "Metro",
    color: LINE_COLORS["14"],
    directions: ["Saint-Denis Pleyel", "Aéroport d'Orly"],
  },
];

// ============================================
// RER - 5 lignes
// ============================================

export const RER_LINES_DATA: LineInfo[] = [
  {
    id: "line:IDFM:C01742",
    code: "A",
    name: "RER A",
    mode: "RER",
    color: LINE_COLORS["A"],
    directions: ["Saint-Germain-en-Laye", "Cergy-Le Haut", "Poissy", "Boissy-Saint-Léger", "Marne-la-Vallée Chessy"],
  },
  {
    id: "line:IDFM:C01743",
    code: "B",
    name: "RER B",
    mode: "RER",
    color: LINE_COLORS["B"],
    directions: ["Aéroport CDG 2", "Mitry-Claye", "Robinson", "Saint-Rémy-lès-Chevreuse"],
  },
  {
    id: "line:IDFM:C01727",
    code: "C",
    name: "RER C",
    mode: "RER",
    color: LINE_COLORS["C"],
    directions: ["Pontoise", "Versailles Château", "Saint-Quentin-en-Yvelines", "Dourdan"],
  },
  {
    id: "line:IDFM:C01728",
    code: "D",
    name: "RER D",
    mode: "RER",
    color: LINE_COLORS["D"],
    directions: ["Creil", "Orry-la-Ville", "Melun", "Malesherbes"],
  },
  {
    id: "line:IDFM:C01729",
    code: "E",
    name: "RER E",
    mode: "RER",
    color: LINE_COLORS["E"],
    directions: ["Haussmann Saint-Lazare", "Chelles-Gournay", "Tournan"],
  },
];

// ============================================
// Transilien - 8 lignes
// ============================================

export const TRANSILIEN_LINES_DATA: LineInfo[] = [
  {
    id: "line:IDFM:C01737",
    code: "H",
    name: "Transilien H",
    mode: "Transilien",
    color: LINE_COLORS["H"],
    directions: ["Gare du Nord", "Luzarches", "Pontoise", "Persan-Beaumont"],
  },
  {
    id: "line:IDFM:C01739",
    code: "J",
    name: "Transilien J",
    mode: "Transilien",
    color: LINE_COLORS["J"],
    directions: ["Saint-Lazare", "Ermont-Eaubonne", "Mantes-la-Jolie", "Gisors"],
  },
  {
    id: "line:IDFM:C01738",
    code: "K",
    name: "Transilien K",
    mode: "Transilien",
    color: LINE_COLORS["K"],
    directions: ["Gare du Nord", "Crépy-en-Valois"],
  },
  {
    id: "line:IDFM:C01740",
    code: "L",
    name: "Transilien L",
    mode: "Transilien",
    color: LINE_COLORS["L"],
    directions: ["Saint-Lazare", "Saint-Nom-la-Bretèche", "Versailles-Rive-Droite", "Cergy-Le Haut"],
  },
  {
    id: "line:IDFM:C01736",
    code: "N",
    name: "Transilien N",
    mode: "Transilien",
    color: LINE_COLORS["N"],
    directions: ["Montparnasse", "Dreux", "Mantes-la-Jolie", "Rambouillet"],
  },
  {
    id: "line:IDFM:C01730",
    code: "P",
    name: "Transilien P",
    mode: "Transilien",
    color: LINE_COLORS["P"],
    directions: ["Gare de l'Est", "Meaux", "Château-Thierry", "Provins"],
  },
  {
    id: "line:IDFM:C01731",
    code: "R",
    name: "Transilien R",
    mode: "Transilien",
    color: LINE_COLORS["R"],
    directions: ["Gare de Lyon", "Montereau", "Montargis"],
  },
  {
    id: "line:IDFM:C01735",
    code: "U",
    name: "Transilien U",
    mode: "Transilien",
    color: LINE_COLORS["U"],
    directions: ["La Défense", "La Verrière"],
  },
];

// ============================================
// Regroupement de toutes les lignes
// ============================================

export const ALL_LINES_DATA: LineInfo[] = [
  ...METRO_LINES_DATA,
  ...RER_LINES_DATA,
  ...TRANSILIEN_LINES_DATA,
];

// Fonction utilitaire pour trouver une ligne par code
export function getLineByCode(code: string): LineInfo | undefined {
  return ALL_LINES_DATA.find((l) => l.code === code);
}

// Fonction utilitaire pour trouver une ligne par ID
export function getLineById(id: string): LineInfo | undefined {
  return ALL_LINES_DATA.find((l) => l.id === id);
}
