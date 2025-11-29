# Plan G — Qualité & documentation

Objectif : garantir la fiabilité via tests et documentation à jour.

## Tâches
- Tests : Vitest sur les schémas/parseurs (fixtures plan B), helpers de normalisation, mapping sévérité → statut ligne.
- Tests manuels : scripts ou checklists pour chaque route (passages stop/line/bulk, trafic mode/ligne, messages, search).
- Documentation : README/docs mis à jour avec endpoints utilisés, quotas, cadences de polling, fallbacks et structure des routes API Next.
- Suivi : ajouter un changelog léger pour les intégrations PRIM (dates, endpoints couverts, régressions connues).

## Critères de succès
- Suites de tests vertes et reproductibles.
- Docs lisibles pour un nouvel arrivant (comment appeler, quotas, limitations).
- Checklist manuelle disponible pour valider une release.

