# Feature — Bandeau Ticker Incidents

Objectif : afficher en continu un ticker des perturbations critiques/perturbées, pour un écran mural ou une page dashboard.

## Contexte & données
- Source : `/api/messages/trafic?bulk=true` (disruptions_bulk) ou `/api/trafic`.
- Champs requis : titre/categorie, lignes impactées (codes lisibles), sévérité, heure de début/fin estimée.

## Spécifications
- Bandeau horizontal (haut ou bas) qui défile ou “pagine” les incidents actifs (severity critical/warning).
- Affichage compact : badge sévérité couleur, lignes impactées (codes), message court (80–120 caractères), temps écoulé depuis début.
- Bouton pause/reprise (optionnel) et indicateur “en direct HH:MM:SS”.
- Style compatible avec GlassPanel/GlowBadge, contraste élevé.

## Tâches pour l’IA
- Créer un composant `IncidentTicker` consommant les données trafic/disruptions, filtrant sur status `interrompu/perturbe`.
- Implémenter défilement ou pagination auto (5–10 s par item), boucle infinie.
- Gérer états : loading (squelette), aucun incident (message “RAS”), erreur (erreur réseau).
- Respecter cadences de polling (60–120 s) et éviter les refetchs trop rapides.
- UI/UX : si front demandé, utiliser le plugin `frontend-plugin` pour générer le composant et les styles.

## Critères de succès
- Le ticker reste lisible sur grand écran sans scroll manuel.
- Aucun ID brut affiché, uniquement noms/codes de lignes.
- Rotation continue sans blocage, avec état RAS clair.
