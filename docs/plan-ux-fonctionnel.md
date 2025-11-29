# Plan UX/Fonctionnel — Favoris, recherche, incidents et vues quotidiennes

Objectif : combler les gaps UX identifiés (favoris, recherche, incidents, trafic ciblé) et livrer des vues centrées usage quotidien avec messages clairs et données live.

## Tâches (ordre recommandé)

1) Recherche/lookup unifié (stations + lignes)
- Implémenter `/api/search` (Navitia coverage/places ou équivalent PRIM) avec validation des params et sérialisation (id, nom, type, lignes associées).
- Ajouter une palette de commande (⌘K) intégrée dans `DashboardHeader` (utiliser `onSearchClick`) avec résultats tap-to-add en favori.
- Persister nom + lignes dans le store favoris au moment de l’ajout; fallback si aucun stop trouvé.

2) Bloc “Mes favoris” sur la home
- Remplacer `DEMO_STOPS` par les favoris réels; afficher passages en `variant="compact"` + statut trafic par ligne.
- Ajouter CTA “Ajouter un arrêt” qui ouvre la palette de recherche; état vide explicite (pas de favoris, comment en ajouter).
- Implémenter drag & drop sur `reorderFavorites` pour prioriser l’affichage.

3) Page arrêt robuste
- Supprimer `KNOWN_STOPS`; au chargement, résoudre nom + lignes via lookup (caching local).
- Afficher badge “dernière mise à jour” réel (timer de refresh) et bouton refresh; conserver toggle favori.
- Gérer états d’erreur (id inconnu) avec propositions de recherche.

4) Trafic centré sur l’usage
- Ajouter un filtre “Mes lignes / Tout” sur `/trafic`; vue “Mes lignes” filtre `TraficBoard` sur les codes présents en favoris.
- Afficher dernière mise à jour globale (trafic) et compteur de lignes suivies.
- Préparer un flag pour utiliser messages PRIM v2 si disponibles (ou rester sur Navitia).

5) Incidents enrichis
- Ajouter filtres (ligne, sévérité) et tri critique→info sur `/incidents`.
- Lier chaque incident vers la ligne/arrêt concerné (ou recherche) + badge durée (temps depuis début).
- Préparer persistance locale d’un mini-historique (timestamp, durée, ligne) pour récurrences.

6) Offline/cache et notifications locales
- Activer persistance React Query pour passages/trafic (localStorage) et afficher badge “dernière donnée connue”.
- Proposer opt-in notifications locales pour favoris quand statut passe à `perturbe/interrompu` (base hook + permission check).
- Documenter les comportements offline (ce qui est disponible, ce qui ne l’est pas) dans l’UI et la doc.
