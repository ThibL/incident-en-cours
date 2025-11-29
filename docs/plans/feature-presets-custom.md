# Feature — Presets & customisation (mur / bureau)

Objectif : permettre de charger facilement des presets d’affichage (mur open space, bureau perso) et de personnaliser l’écran.

## Contexte & données
- Besoin : basculer entre “mur” (plein écran, rotation widgets) et “bureau” (vue interactive) via URL ou UI légère.
- Paramètres à exposer : scope (mes lignes/tout), intervalle de rotation, modules visibles, thème (clair/sombre déjà forcé dark ?), tailles de texte.

## Spécifications
- Lecture de paramètres dans l’URL (`preset=wall|desk`, `scope=my|all`, `rotate=true`, `interval=20`, `modules=trafic,incidents,favoris,kpi`).
- Possibilité de sauvegarder un preset local (localStorage) et de le restaurer au chargement.
- UI légère (panneau latéral ou modal) pour ajuster les options, avec aperçu instantané.
- Les options modifient seulement l’agencement/affichage, pas la logique de données (réutilise les hooks existants).

## Tâches pour l’IA
- Créer un module `usePreset` (hook) qui lit/écrit les paramètres URL + localStorage.
- Exposer un composant `PresetSwitcher` (mur/bureau/custom) avec quelques options clés (scope, rotation on/off, intervalle, modules inclus).
- Relier les presets à `AutoRotatePanel` (feature rotation) et à la vue mur (feature wall dashboard).
- UI/UX : si front demandé, utiliser le plugin `frontend-plugin` pour générer le panneau de config.

## Critères de succès
- Changement de preset sans rechargement complet, avec persistance locale.
- Les modules s’affichent/masquent selon la config, l’intervalle de rotation prend effet.
- Paramètres partageables via URL pour un affichage mural rapide.
