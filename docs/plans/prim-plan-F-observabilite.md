# Plan F — Observabilité & quotas

Objectif : surveiller la consommation PRIM et prévenir les dépassements de quotas tout en facilitant le debug.

## Tâches
- Logs serveur : endpoint, durée, status, taille réponse approximative; échantillonnage activable en prod.
- Compteurs : minima par endpoint (succès, erreurs, 429) exposés en console dev ou via un module interne.
- Throttle : empêcher les refetchs inférieurs au délai cible par endpoint côté serveur (guard simple).
- Alerting light : message/flag si un quota approche (basé sur comptage local ou en-têtes si fournis).

## Critères de succès
- Journaux lisibles et exploitables sans bruit excessif.
- Refetchs inutiles éliminés (respect des cadences du plan A).
- Signal clair en cas de dépassement ou risque de quota.

