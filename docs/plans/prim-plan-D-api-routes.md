# Plan D — Routes API Next.js

Objectif: exposer des routes Next.js stables, validées et cacheables pour consommer PRIM côté UI.

## Tâches
- Passages: `/api/passages/[stopId]` (validation, cache 30s) et **création** de `/api/passages/line/[lineId]` (tous arrêts, même politique), `/api/passages/bulk` (max 10, rapport succès/erreurs).
- Trafic: `/api/trafic` support `mode` + `lineId`, statuts cohérents (400 mode invalide, 502 validation).
- Messages: `/api/messages/affichage` (filtre `lineId` + `channel`), `/api/messages/trafic` (switch `bulk=true` vers disruptions_bulk).
- Recherche: `/api/search` min 2 caractères, filtrage `type`.
- Gestion des erreurs: réponses structurées (message/status) et headers `Cache-Control` adaptés (SWR).

## Critères de succès
- Toutes les routes répondent avec validation stricte et codes HTTP cohérents.
- Cache headers alignés sur les cadences du plan A.
- Tests manuels simples (curl) documentés ou automatisés.

