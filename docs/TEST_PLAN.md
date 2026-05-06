# SEMOUS — Plan de test

---

## 10. Performance, sauvegardes et tests

### Performance attendue

| Indicateur | Valeur cible |
|---|---|
| Visiteurs simultanés | 1 000 |
| Utilisateurs connectés | 1 000 |
| Créations/connexions de comptes | 1 000 sur courte période |
| Paniers actifs | 1 000 |
| Commandes simultanées | 1 000 |

Back-office, cuisine et livraison doivent rester utilisables pendant les pics.

### Priorité en charge

1. Commande
2. Paiement
3. Stock
4. Admin
5. Cuisine
6. Livraison
7. Emails
8. Statistiques
9. SEMOUS CLUB futur

> Les tâches secondaires passent en file d'attente : emails, statistiques, points futurs, récompenses futures, synchronisations, exports, notifications.

---

## Scénarios de test fonctionnels

### Parcours client
- [ ] Commande invitée complète (livraison)
- [ ] Commande invitée complète (retrait)
- [ ] Commande avec compte (livraison)
- [ ] Commande avec compte (retrait)
- [ ] Panier : ajouter, modifier quantité, supprimer
- [ ] Code promo valide, expiré, déjà utilisé, non cumulable
- [ ] Minimum commande 15 EUR bloquant
- [ ] Livraison offerte à partir de 20 EUR
- [ ] Zone hors livraison (>7 km) bloquée
- [ ] Message hors zone affiché

### Paiement
- [ ] Préautorisation au moment de la commande
- [ ] Capture après acceptation SEMOUS
- [ ] Lien de paiement envoyé et utilisé
- [ ] Paiement refusé
- [ ] Remboursement total
- [ ] Remboursement partiel
- [ ] Paiement sur place (retrait)

### Back-office admin
- [ ] Dashboard en temps réel (commandes entrantes)
- [ ] Sonnerie : upload, test, activation/désactivation
- [ ] Validation commande sous 2 min (pas de warning)
- [ ] Warning à 1 min, statut "en retard" à 3 min
- [ ] CA TTC / HT / TVA corrects
- [ ] Coût livraison estimé visible par commande
- [ ] Filtres commandes (date, statut, type, zone, produit, code...)
- [ ] Historique de chaque changement de statut
- [ ] Note interne sur commande

### Cuisine (plein écran)
- [ ] Affichage commandes acceptées
- [ ] Détail produits, options, sauces, toppings
- [ ] Impression ticket automatique et manuelle
- [ ] Ajout délai +10/+20/+30 min
- [ ] Passage statut : préparation → prête
- [ ] Proposition alternative en rupture de stock

### Livraison
- [ ] Liste commandes à livrer
- [ ] Bouton Waze pour chaque adresse
- [ ] Appel client depuis back-office
- [ ] Plusieurs commandes simultanées
- [ ] Suggestion de regroupement (2–3 commandes proches, créneau 30 min)
- [ ] Regroupement validé manuellement
- [ ] Statut : en livraison → livrée → terminée
- [ ] Signalement problème

### Stocks
- [ ] Déduction stock après acceptation commande
- [ ] Alerte seuil 5 unités
- [ ] Rupture à 0 : produit indisponible
- [ ] Alternative proposée en rupture
- [ ] Mise à jour stock toutes les heures

### Codes
- [ ] Création de code (tous types)
- [ ] Code avec date d'expiration
- [ ] Non-cumul : un seul code par commande
- [ ] Limite d'usage total respectée
- [ ] Limite par client respectée
- [ ] Historique des usages
- [ ] Tentative d'abus détectée et bloquée

### Entreprises
- [ ] Formulaire groupe soumis
- [ ] Validation admin obligatoire
- [ ] Minimum 70 EUR bloquant
- [ ] Délai 24h avant requis
- [ ] Acompte 30 % généré
- [ ] Acompte désactivé pour compte validé
- [ ] Annulation/suppression jusqu'à 12h avant
- [ ] Ajout jusqu'à 2h avant (sous réserve)
- [ ] Facture générée si demandée
- [ ] Paiement sur facture réservé aux comptes validés
- [ ] Pénalité retard 40 EUR

### SEO, contenus, RGPD
- [ ] Pages juridiques toutes présentes
- [ ] Bandeau cookies : accepter, refuser, personnaliser
- [ ] Consentements séparés fonctionnels
- [ ] Droits utilisateur : accès, correction, suppression
- [ ] Rôles et accès corrects (admin, cuisine, livreur, client)
- [ ] Export réservé aux rôles autorisés
- [ ] Logs actions sensibles enregistrés

### Charge
- [ ] Simulation 100 visiteurs simultanés
- [ ] Simulation 500 visiteurs simultanés
- [ ] Simulation 1 000 visiteurs simultanés
- [ ] 1 000 commandes quasi-simultanées
- [ ] Files d'attente tâches secondaires fonctionnelles

### Sauvegarde et rollback
- [ ] Sauvegarde base de données automatique fonctionnelle
- [ ] Sauvegarde médias fonctionnelle
- [ ] Sauvegarde avant mise à jour majeure
- [ ] Restauration complète testée avant lancement
- [ ] Rollback documenté et testé

---

## Sauvegardes

- GitHub privé appartenant à SEMOUS/Hounivers
- Sauvegardes automatiques de la base de données (Supabase)
- Sauvegardes médias : images, logo, sons, factures, documents
- Sauvegarde avant toute mise à jour majeure
- Restauration testée avant lancement
- Exports CSV / Excel / PDF selon besoin
