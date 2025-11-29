# Plan E — Hooks & UX

Objectif: exposer des hooks robustes et améliorer l’UX (pages, favoris, messages) en s’appuyant sur les routes API PRIM.

## Tâches
- Passages: mettre à jour `usePassages` (stop/line/bulk) avec clés de cache stables, intervalles configurables, invalidations ciblées.
- Messages trafic: créer `useTrafficMessages` (messages écrans + info trafic v2) avec polling ajusté et filtrage par ligne/channel.
- Pages: sur `/arret/[stopId]`, résoudre nom/lignes via `searchPlaces` (plus de dictionnaire fixe) et afficher les lignes dans l’en-tête; fallback UX si arrêt inconnu.
- Fallbacks: indicateur de source (Navitia vs PRIM), affichage clair en cas de validation error ou 429, pourcentage trafic sécurisé quand `total=0`.
- Favoris: s’assurer que la board “Mes trajets” et la palette de recherche exploitent les données PRIM (IDs normalisés).

## Critères de succès
- Hooks stables (pas de requêtes 404/400 quand les paramètres sont absents).
- Pages arrêt/trafic affichent des données nommées (pas d’IDs bruts) et gèrent les états d’erreur.
- UX explicite en cas de quota ou validation KO.

