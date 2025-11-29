# Plan technique — couverture complète des endpoints PRIM/IDFM

Objectif : intégrer et exploiter l’ensemble des endpoints utiles PRIM/IDFM (départs, messages trafic, messages écrans) en complément ou remplacement de Navitia, avec gestion des quotas et des clés.

## Tâches (ordre recommandé)

1) Cartographier et sécuriser les accès
- Vérifier les clés et quotas dans `.env.local`/`.env.example` (PRIM_API_KEY, éventuels scopes).
- Lister les endpoints manquants avec URL exacte, paramètres, quotas (passages ligne, passages globaux, messages écrans, messages info trafic v2, messages info trafic globaux).
- Décider pour chaque endpoint s’il complète ou remplace Navitia (critère : fraîcheur, wording officiel, couverture).

2) Implémenter les wrappers client PRIM manquants
- Ajouter dans `src/lib/api/prim-client.ts` les méthodes pour :
  - Passages par ligne (récupérer les prochains passages pour tous les arrêts d’une ligne).
  - Passages globaux (si supporté) pour précharger un set d’arrêts.
  - Messages affichés sur écrans (récupération des messages voyageurs).
  - Messages Info Trafic v2 (calculateur IDFM) + requête globale.
- Définir les schémas Zod pour chaque réponse (nouveaux types dans `src/types/prim.ts`).

3) Exposer des routes API Next.js
- Créer/mettre à jour `/api/passages/line/[lineId]` (et éventuellement `/api/passages/bulk`) pour la consommation UI.
- Créer `/api/messages/affichage` (messages écrans) et `/api/messages/trafic` (info trafic v2 / globale).
- Ajouter validation des query params + gestion des erreurs/quotas (retours 429/502/500 cohérents).

4) Utilisation côté UI / hooks
- Étendre `usePassages` pour supporter la source “ligne”/“bulk” (utile aux favoris).
- Créer un hook `useTrafficMessages` pour consommer messages écrans/info trafic v2, avec polling adapté.
- Documenter quels écrans utilisent Navitia vs PRIM et prévoir un toggle/feature flag si nécessaire.

5) Monitoring et qualité
- Logguer les codes/erreurs PRIM côté serveur (niveau warn) + métriques basiques (compteur appels par endpoint).
- Ajouter tests unitaires de parsing (schémas Zod) pour les nouvelles réponses.
- Mettre à jour `README.md`/`docs` avec les endpoints utilisés, les quotas et les modes de fallback.
