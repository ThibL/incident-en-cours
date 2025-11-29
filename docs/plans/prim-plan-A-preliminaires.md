# Plan A — Préliminaires & sécurité (Terminé)

Objectif : assainir les secrets, cadrer les quotas/cadences et documenter les formats d’identifiants avant d’appeler les endpoints PRIM.

## Tâches

- Quotas/cadences : consigner pour chaque endpoint les quotas officiels et la cadence cible (stop-monitoring 30s, line_reports 60s, general-message 60s, disruptions_bulk 120s) et définir un délai minimum de refetch. ✅
- Formats d’ID : documenter le mapping IDFM/STIF pour stops (`STIF:StopPoint:Q:{id}:`) et lignes (`STIF:Line::{code}:`), plus l’ID Navitia (`line:IDFM:{code}`). ✅
- Inventaire des dépendances réseau : lister les endpoints qui exigent la clé PRIM vs ceux publics, et noter les en-têtes requis. ✅
- Remarque : la gestion/préparation des clés API a été volontairement exclue de ce plan.

## Critères de succès

- Tableau quotas/cadences validé et utilisé par les plans suivants. ✅
- Guide de normalisation d’IDs prêt à être référencé par les hooks/API. ✅
