# Plans PRIM/IDFM — vue d’ensemble

| Plan | Nom | Portée | Statut |
|------|-----|--------|--------|
| A | [Préliminaires & sécurité](./prim-plan-A-preliminaires.md) | Quotas, formats d’ID (sans gestion de clé) | Terminé |
| B | [Cartographie & schémas](./prim-plan-B-cartographie-schemas.md) | Endpoints + Zod + fixtures | À faire |
| C | [Client PRIM](./prim-plan-C-client.md) | Méthodes, parseurs, erreurs | À faire |
| D | [Routes API Next.js](./prim-plan-D-api-routes.md) | Passages, trafic, messages, search | À faire |
| E | [Hooks & UX](./prim-plan-E-hooks-ux.md) | Hooks, pages, fallbacks UX | À faire |
| F | [Observabilité & quotas](./prim-plan-F-observabilite.md) | Logs, compteurs, throttle | À faire |
| G | [Qualité & documentation](./prim-plan-G-qualite.md) | Tests, docs, checklist | À faire |

Ordre recommandé : A → B → C → D → E → F → G (B/C/D enchaînés rapidement après A).

## Features affichage mural / presets

| Feature | Portée | Fichier |
|---------|--------|---------|
| Vue mur dashboard (open space) | Layout plein écran, modules trafic/incidents/favoris | [feature-wall-dashboard.md](./feature-wall-dashboard.md) |
| Bandeau ticker incidents | Ticker horizontal perturbations | [feature-ticker-incidents.md](./feature-ticker-incidents.md) |
| Rotation de widgets | Auto-cycle des modules (trafic/incidents/favoris/KPI) | [feature-rotation-widgets.md](./feature-rotation-widgets.md) |
| Presets & customisation | Presets mur/bureau, params URL/localStorage | [feature-presets-custom.md](./feature-presets-custom.md) |
| État des sources | Widget santé PRIM/Navitia/erreurs | [feature-health-status.md](./feature-health-status.md) |

Notes : pour toute partie UI/UX générée par l’IA, utiliser le plugin `frontend-plugin`. Chaque feature est conçue pour être one-shot par une IA avec le contexte fourni.
