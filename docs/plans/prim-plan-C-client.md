# Plan C — Client PRIM (IDs canoniques + méthodes)

Objectif : étendre et sécuriser `src/lib/api/prim-client.ts` (passages, trafic, messages, recherche) tout en imposant un système d’identifiants canonique utilisable par l’API et l’UI.

## Contexte (problèmes actuels)
- Page arrêt et favoris utilisent des IDs hétérogènes (numériques ou refs partielles) et un dictionnaire `KNOWN_STOPS`, ce qui empêche d’avoir noms/lignes fiables.
- `extractLineName` ne couvre pas Bus/Transilien et renvoie des codes bruts hors mapping.
- Les résultats de recherche tronquent l’ID `stop_area` à un simple numérique, rendant difficile la reconstruction du ref complet côté UI.

## Tâches
- Méthodes PRIM: passages stop/line/bulk, trafic global/mode/ligne, messages écrans, disruptions bulk, recherche places (couvrir l’ensemble des endpoints cartographiés en B).
- Normalisation ID canonique :
  - Définir les formats stockés : stopId numérique + helper pour produire `STIF:StopPoint:Q:{id}:`; lineId = `line:IDFM:{code}` + `code` court.
  - Étendre `normalizeStopId/normalizeLineRef`, extraction de code ligne/nom (inclure Bus/Transilien), mapping mode.
  - Conserver dans `SearchResult` le ref complet (`stop_area:IDFM:*`) en plus du numérique pour réutilisation UI.
- Parseurs : passages, messages, trafic avec fallback sûr sur les champs manquants et gestion des effets supplémentaires (DETOUR, STOP_MOVED, MODIFIED_SERVICE, ADDITIONAL_SERVICE).
- Erreurs/quotas : détecter 429, lever `PRIMRateLimitError`, logs endpoint+durée+extrait corps, différencier validation (`PRIMValidationError`) vs réseau.
- API utilitaires : exposer des helpers réutilisables par les routes Next.js et les hooks (ex : `toCanonicalStop`, `toCanonicalLine`), avec tests.

## Critères de succès
- Couverture testée des méthodes/parseurs avec les fixtures du plan B.
- Normalisation d’IDs réutilisable (helpers testés) et pas d’ID “orphelin” côté UI.
- Logs exploitables (durée/status/endpoint) en dev, et erreurs levées correctement.
