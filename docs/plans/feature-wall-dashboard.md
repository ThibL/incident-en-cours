# Feature — Vue Mur Dashboard (open space)

Objectif : afficher en plein écran un tableau de bord “mur” (open space) clair et lisible avec les infos trafic, incidents et favoris clés. L’IA doit pouvoir générer l’UI en un seul passage.

## Contexte & données
- Sources : routes Next `/api/trafic`, `/api/messages/trafic`, `/api/messages/affichage`, `/api/passages/bulk` (favoris).
- Données à montrer : statut des lignes suivies (mes lignes + tout réseau), incidents critiques/perturbés, passages des trajets favoris.
- Cible : écran 1080p/4K, affichage sans interaction, rafraîchissement auto.

## Spécifications
- Layout plein écran avec 2–3 colonnes : (1) bloc “Réseau” (statut lignes suivies + compteur), (2) bloc “Incidents” (critiques en tête), (3) bloc “Favoris live” (passages compact), plus un bandeau haut avec horloge et source de données.
- Mode “mes lignes / tout” commutable via paramètre (`?preset=wall&scope=my`).
- Rafraîchissement auto aligné sur les cadences (trafic 60s, messages 60s, passages favoris 15–30s) + horodatage visible.
- Palette couleurs existante (GlassPanel/GlowBadge) mais contrastes renforcés pour distance (polices 18–32px).
- Accessibilité visuelle : pas d’IDs bruts, uniquement noms/codes de lignes et stations.

## Tâches pour l’IA
- Créer une page/preset `wall` ou une variante de la page d’accueil avec le layout décrit.
- Utiliser les hooks existants (`useTraficInfo`, `useBulkPassages`, messages) en mode scope “mes lignes” (codes favoris) puis fallback “tout”.
- Ajouter un bandeau top (horloge, statut des sources, dernière synchro).
- Afficher un bloc “Incidents” en liste condensée (titre, lignes, sévérité couleur).
- Bloc “Favoris live” : passages compact, rotation si > N trajets.
- Respecter les cadences de polling du plan A ; pas de refetch < délai min.
- UI/UX : si front demandé, utiliser le plugin `frontend-plugin` pour générer le markup/styles.

## Critères de succès
- Affichage lisible à 2–3 m, sans scroll, avec horodatage des données.
- Aucun identifiant brut (IDs, refs STIF) visible.
- Scope “mes lignes” opérationnel avec fallback “tout”.
- Pas de flood réseau (cadences respectées).
