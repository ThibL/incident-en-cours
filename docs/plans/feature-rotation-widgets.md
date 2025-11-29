# Feature — Rotation de widgets (auto-cycle)

Objectif : alterner automatiquement plusieurs modules (trafic, incidents, favoris, KPI) sur un écran mural pour tout afficher sans surcharge.

## Contexte & données
- Modules existants : TraficBoard, IncidentList/Disruption cards, FavoritesDepartureBoard, KPI (stats).
- Scénario : écran mural, pas d’interaction, rotation toutes les X secondes.

## Spécifications
- Controller de rotation : liste de modules + durée par module (ex. 15–30 s), pause/reprise optionnelles.
- Transition fluide (fade/slide) entre modules ; pas de flicker.
- Conserver les cadences de polling internes des hooks (ne pas refetch à chaque rotation, réutiliser le cache React Query).
- Paramètres via URL ou config (`?preset=wall&rotate=true&interval=20`).

## Tâches pour l’IA
- Créer un composant `AutoRotatePanel` qui prend une liste de composants enfants (ou render props) et un intervalle.
- Intégrer 3–4 modules : trafic (mes lignes), incidents (critique→warning), favoris live (compact), KPI journaliers.
- Assurer qu’au changement de slide, les données restent issues du cache (pas de refetch forcé).
- Fournir un indicateur visuel du module courant (petits points/steps).
- UI/UX : si front demandé, utiliser le plugin `frontend-plugin` pour produire le markup/animation.

## Critères de succès
- Rotation autonome, sans rafraîchissements réseau inutiles.
- Modules lisibles en plein écran, transitions fluides.
- Configuration simple via props/params.
