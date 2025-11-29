# IncidentVoyageur — Plan fonctionnel complet

## Vision

Une application ultra efficace, pensée pour les usagers franciliens fatigués et les devs qui aiment comprendre pourquoi ils seront en retard. Tonalité légère, fonctionnement sérieux.

---

## 1. Page d’accueil

### 1.1 Dashboard instantané

* Liste des incidents en cours
* Catégorie (technique, voyageur malade, intrusion sur voies, etc.)
* Ligne concernée + couleur officielle
* Horodatage (depuis combien de temps ça sent le roussi)
* Niveau de sévérité

### 1.2 Bloc «Vos lignes favorites»

* Prochains passages
* État du trafic
* Indication immédiate : OK / Perturbé / Démerde-toi

### 1.3 Widget «Chance d’être en retard»

* Analyse des lignes favorites
* Résultat en phrase courte

### 1.4 Recherche rapide

* Lignes, stations, itinéraires basiques

---

## 2. Lignes favorites

* Sélection multi-lignes
* Possibilité d’ajouter plusieurs stations par ligne
* Classement manuel
* Épinglage sur la homepage

---

## 3. Incidents

### 3.1 Liste en temps quasi-réel

* Polling intelligent 10–30s
* Filtrage par ligne
* Filtrage par type d’incident

### 3.2 Détails d’un incident

* Description complète
* Étapes RATP
* Dernière mise à jour
* Estimation de résolution

### 3.3 Historique

* Archive chronologique
* Durée de chaque incident
* Stats : fréquence, durée moyenne, lignes les plus instables

---

## 4. Notifications

* Incident sur ligne favorite
* Reprise du trafic
* Variation importante du temps d’attente
* Mode humour désactivable

---

## 5. Temps réel / Techniques

### 5.1 Polling intelligent

* Rafraîchissement différencié entre pages
* Cache local

### 5.2 SSE (optionnel)

* Streaming des passages quand l’API le permet
* Reconnexion automatique

### 5.3 Offline-first

* Données favorites visibles sans réseau
* Derniers horaires connus

---

## 6. Itinéraire simple

* Point A → Point B
* Temps estimé
* Incidents impactant le trajet
* Recommandations de ligne alternative

---

## 7. Carte interactive (optionnel)

* Affichage des lignes RATP
* Localisation des perturbations
* Zoom sur station

---

## 8. Mode Trajet Quotidien

* Vue minimaliste
* Ligne → Station → Prochains passages
* Alertes intelligentes
* Texte humoristique optionnel

---

## 9. UI / UX

* Mode sombre par défaut
* Interface compacte
* Couleurs officielles RATP pour cohérence
* Animations légères

---

## 10. Admin / Debug (facultatif)

* Logs internes
* Temps de réponse de l’API
* Nombre d’échecs de refresh

---

## 11. Roadmap possible

* Widgets iOS / Android
* Export PDF des incidents (pour justifier un retard)
* Statistiques avancées utilisateur
* Partage d’incidents entre utilisateurs

---

## 12. Ton humour (optionnel mais recommandé)

* Messages courts, secs, jamais méchants
* Exemples :

    * «Oui, encore le RER B. Non, personne n’est surpris»
    * «Temps d’attente : 12 min. Temps avant pétage de câble : 6 min.»
    * «Trafic normal. Profite, ça ne va pas durer.»
