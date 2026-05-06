# SEMOUS — Spécifications Back-office et Admin

> Dashboard, modules admin, cuisine, livraison, rôles, permissions

---

## 6. Back-office et modules admin

### Dashboard principal

- Page d'accueil du back-office
- Affichage commandes temps réel sous forme de **cartes type Uber/Deliveroo**
- CA TTC, CA HT, TVA, panier moyen, remboursements, ventes livraison/retrait/entreprises
- Coût estimé livraison visible sur chaque commande
- Sonnerie automatique personnalisable : upload MP3/WAV/OGG, test, activation/désactivation
- **Validation idéale commande sous 2 minutes** ; warning 1 minute ; après 3 minutes → statut "validation en retard / attente prolongée" ; pas d'annulation automatique
- Alertes internes uniquement en V1 : pas d'alerte email pour les commandes

### Espaces opérationnels

| Espace | Fonctions |
|--------|-----------|
| **Administrateur** | Accès complet selon rôle : dashboard, commandes, produits, stocks, clients, entreprises, paiements, codes, contenus, statistiques, paramètres |
| **Cuisine** | Mode plein écran sans statistiques : accepter, refuser, ajouter délai, préparation, prête, imprimer, contacter client, proposer alternative en rupture |
| **Livraison** | Commandes à livrer, adresse, téléphone, montant payé, coût estimé, distance, Waze, appeler, en livraison, livrée, problème, plusieurs commandes |

### Module commandes détaillées

- Liste et fiches commandes complètes
- Filtres par : date, statut, livraison, retrait, entreprise, invité, compte, paiement, zone, livreur, produit, code, litige
- Actions : accepter, refuser, +10/+20/+30 min, préparation, prête, assigner livreur, livraison, livrée, terminée, annuler, rembourser, imprimer, contacter, litige, note interne
- **Historique obligatoire de chaque changement de statut**
- Refusée = avant acceptation ; Annulée = après acceptation ou cas exceptionnel ; Remboursée = remboursement total/partiel

### Impression ticket / étiquette

- Impression automatique après acceptation si activée **ou** bouton manuel
- Compatibilité imprimante Bluetooth ou réseau à confirmer
- Ticket placé sur la poche commande
- **Contenu du ticket :** numéro, date/heure, client, téléphone/adresse si livraison, produits, options, sauces, toppings, instructions, total, statut paiement, code, note interne

---

## 7. Produits, stocks et codes

### Produits / carte

Gestion de :
- Catégories, produits, menus, tailles, sauces, toppings, extras, prix, TVA, photos, descriptions, allergènes, visibilité, ordre d'affichage
- Catégories possibles : bols, menus, desserts, boissons, sauces, extras, offres, entreprises/groupes
- Chaque produit peut être : visible/masqué, disponible/indisponible, éligible promo/récompense, associé à une alternative

### Stock V1

- Stock simple par produit
- **Seuil alerte : 5 unités**
- **Rupture à 0**
- Pas d'affichage "plus que X disponibles" côté client
- Alternative proposée en rupture
- Stock déduit après acceptation
- Mise à jour stock toutes les heures
- Pas de stock séparé entreprises en V1
- Synchronisation future avec application interne stock/HACCP

### Générateur sécurisé de codes

Types de codes :
- Réduction EUR
- Réduction %
- Livraison offerte
- Produit offert
- Menu offert
- Produit, catégorie, campagne, influenceur, entreprise, parrainage, récompense

Règles :
- Codes uniques, traçables, non devinables si générés automatiquement
- Date début/fin, limite usage total, limite par client/email/téléphone, produit/catégorie lié, statut
- **Non-cumul par défaut : une commande = un seul code promotionnel/récompense**
- Historique complet et anti-abus
