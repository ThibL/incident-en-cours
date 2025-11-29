# Feature — État des sources et de l’app

Objectif : afficher la santé des sources (PRIM/Navitia) et de l’app (latence, taux d’erreurs) pour diagnostiquer rapidement un problème d’affichage mural.

## Contexte & données
- Mesures disponibles : succès/erreurs/latence des routes API Next (trafic, passages, messages), statut HTTP, éventuels 429.
- Pas d’accès aux métriques externes : se baser sur logs/compteurs locaux (cf. plan F observabilité).

## Spécifications
- Widget compact “Santé” : PRIM OK/KO, Navitia OK/KO, latence moyenne des derniers appels, taux d’erreurs (%), dernier 429 vu.
- Affiché dans le bandeau haut ou en encart dédié, rafraîchi toutes les 60–120 s (ou à chaque appel réussi/raté via cache).
- Codes couleur simples : vert/orange/rouge selon seuils.
- Aucune fuite d’ID ou de secrets.

## Tâches pour l’IA
- Créer un store léger ou hook (`useApiHealth`) qui collecte les stats depuis un module d’observabilité (compteurs/latence par endpoint).
- Exposer un composant `HealthWidget` affichant les indicateurs et l’horodatage de la dernière mesure.
- Intégrer le widget dans la vue mur/preset wall (feature wall dashboard).
- UI/UX : si front demandé, utiliser le plugin `frontend-plugin` pour produire le widget (compact, contraste élevé).

## Critères de succès
- Visibilité claire de l’état PRIM/Navitia et des erreurs récentes.
- Rafraîchissement sans surcharger le réseau (idéalement piggyback sur appels existants).
- Codes couleur cohérents avec le reste de l’UI.
