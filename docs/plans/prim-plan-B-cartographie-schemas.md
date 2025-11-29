# Plan B — Cartographie & schémas de données **(terminé)**

Objectif: cartographier précisément les endpoints PRIM/IDFM et verrouiller les schémas Zod/fixtures pour fiabiliser le parsing.

## Tâches
- Cartographie: lister les endpoints et paramètres exacts (stop-monitoring stop/line, general-message ALL/LineRef, navitia line_reports global/mode/line, disruptions_bulk, places).
- Schémas: mettre à jour `src/types/prim.ts` pour couvrir tous les effets (DETOUR, STOP_MOVED, MODIFIED_SERVICE, ADDITIONAL_SERVICE, etc.) et les structures spécifiques (GeneralMessageDelivery, application_periods, impacted_objects).
- Fixtures: créer/rafraîchir des fixtures de test représentatives (trafic v2 avec disruptions multiples, general-message multi-lignes, passages par ligne).
- Types dérivés: s’assurer que les types métier simplifiés (Passage, TraficInfo, ScreenMessage) couvrent les nouveaux champs nécessaires côté UI.

## Critères de succès
- Liste des endpoints et paramètres validée.
- Tests Vitest sur schémas/fixtures verts.
- Aucun champ “unknown” bloquant lors du parsing des fixtures.
