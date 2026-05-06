# SEMOUS — Spécifications fonctionnelles

> Parcours client, commande, livraison, retrait, paiements, entreprises

---

## 3. Parcours client et commande

### Commande invitée

Le client peut commander **sans créer de compte complet** afin de ne pas freiner l'achat.

Collecte minimale obligatoire :
- Email obligatoire
- Téléphone obligatoire en livraison
- Prénom ou nom de commande
- Adresse obligatoire en livraison
- Acceptation des CGV obligatoire
- Consentement RGPD minimum

Règles :
- Pas de points SEMOUS CLUB pour les commandes invitées
- Historique interne conservé ; rattachement futur possible si compte créé avec le même email
- Pas de limite stricte du nombre de commandes invitées
- La dernière commande peut être mise en avant pour simplifier une future commande

### Compte SEMOUS

- Création de compte optionnelle en V1
- Permet de commander plus vite, enregistrer les adresses et consulter l'historique
- Prépare l'affiliation future à SEMOUS CLUB
- Peut recevoir un code client unique
- Peut recevoir des offres si consentement marketing donné

### Panier

- Ajouter / supprimer / modifier quantités
- Choisir options, sauces, toppings, desserts, boissons ou menus selon produit
- Afficher total TTC, HT et TVA si applicable
- Afficher frais livraison, réduction, total final
- Permettre code promo/récompense selon règles de non-cumul
- Vérifier minimum livraison de **15 EUR** et livraison offerte à partir de **20 EUR**

---

## 4. Paiement et titres-restaurant

### Prestataire paiement

Le prestataire final reste à choisir. L'architecture doit rester compatible avec :
- Banque / TPE
- Paiement à distance
- Lien de paiement
- Paiement en ligne
- Paiement au retrait
- Titres-restaurant si plateforme compatible

### Livraison — flux paiement idéal

1. Paiement sécurisé avant préparation
2. Préautorisation au moment de la commande
3. Capture/débit réel uniquement après acceptation par SEMOUS
4. Si commande refusée : annulation de l'autorisation sans remboursement inutile
5. Alternative si préautorisation impossible : validation SEMOUS → envoi d'un lien de paiement → préparation uniquement après paiement confirmé

### Retrait — modes acceptés

- Paiement en ligne possible
- Paiement sur place possible
- TPE possible
- Titres-restaurant possibles si compatibles avec la plateforme choisie

### Statuts paiement

| Statut | Description |
|--------|-------------|
| Non initié | Aucun paiement commencé |
| En attente | Paiement ou lien de paiement en cours |
| Préautorisé | Paiement autorisé mais non capturé |
| Capturé | Paiement encaissé après acceptation |
| Échoué | Paiement refusé ou erreur |
| Autorisation annulée | Préautorisation annulée après refus |
| Remboursement en attente | Remboursement à traiter |
| Remboursé | Remboursement effectué |
| Paiement manuel validé | Paiement validé par admin ou TPE |
| Acompte payé | Acompte entreprise/groupe encaissé |
| Solde en attente | Solde entreprise/groupe restant |
| Solde payé | Solde réglé |

---

## 5. Livraison et temps de préparation

### Adresse de départ

**32 avenue Honoré Serres, 31000 Toulouse**

### Zone et tarifs

| Distance | Frais client | Temps livraison estimé |
|----------|--------------|------------------------|
| 0 à 3 km | 3 EUR | 10–12 min |
| 3 à 5 km | 4 EUR | 12–15 min |
| 5 à 7 km | 5 EUR | 15–17 min |
| +7 km | Bloqué | Indisponible |

Règles :
- Livraison directe SEMOUS jusqu'à **7 km** autour de l'adresse de départ
- Au-delà de 7 km : livraison bloquée en V1
- **Minimum livraison : 15 EUR**
- **Livraison offerte à partir de 20 EUR** (paramètre modifiable par l'admin)
- Coût interne estimé : 0,50 EUR/km
- Pas de frais rush en V1, mais frais horaires modifiables plus tard depuis l'admin

### Message hors zone (texte client)

> Votre adresse est hors zone de livraison SEMOUS. Pour le moment, nous livrons uniquement dans un rayon de 7 km autour du restaurant. Vous pouvez choisir le retrait à emporter sur semous.fr, ou vérifier si Uber Eats / Deliveroo peuvent vous livrer à votre adresse.

### Regroupement de livraisons

- En V1 : regroupement manuel assisté
- Sur un créneau d'environ 30 minutes, si 2 ou 3 commandes sont proches → back-office suggère un regroupement
- L'admin ou le livreur valide manuellement
- Bouton Waze pour chaque adresse
- Optimisation automatique possible en V2 via API de routage

### Temps de préparation

- Le délai de préparation est calculé **par commande**, pas par plat
- Temps moyen par commande classique : **10 à 15 minutes** hors livraison
- Une commande avec environ 1 à 2 menus reste estimée à 10–15 minutes
- Ne pas multiplier automatiquement par le nombre de plats
- Si plusieurs commandes arrivent en même temps : estimer selon le nombre de commandes en attente
- L'opérateur peut ajouter +10, +20, +30 minutes ou un délai personnalisé

---

## 8. Entreprises, groupes et repas d'équipe

### Cible

Groupes de salariés, repas d'équipe, entreprises, syndics, associations ou groupes ponctuels. La facture sera souvent optionnelle.

### Règles validées

| Règle | Valeur |
|-------|--------|
| Minimum commande | 70 EUR |
| Délai de demande | 24 heures avant |
| Acompte par défaut | 30 % |
| Acompte désactivable | Pour comptes validés |
| Annulation / suppression | Jusqu'à 12 heures avant |
| Ajout possible | Jusqu'à 2 heures avant (sous réserve d'acceptation) |
| Validation admin | Obligatoire |
| Facture | Optionnelle ; SIRET facultatif |
| Paiement sur facture | Réservé aux comptes validés |
| Délai paiement facture | 7 jours |
| Pénalité retard | 40 EUR (à cadrer juridiquement) |

### Formulaire groupe

- Nom du groupe / entreprise
- Nom référent, email, téléphone
- Adresse livraison
- Date et heure souhaitées
- Nombre de personnes
- Budget approximatif
- Produits souhaités et commentaire
- Case : Je souhaite une facture
- SIRET facultatif
- Mode de paiement souhaité

### Conditions groupes — texte de base

> SEMOUS propose un service de commandes groupées pour les équipes, salariés, entreprises, syndics, associations ou groupes souhaitant commander en quantité. Toute commande groupe doit être demandée au moins 24 heures à l'avance. Le montant minimum est fixé à 70 EUR. Un acompte de 30 % pourra être demandé pour confirmer la commande, sauf compte validé par SEMOUS. Toute annulation ou suppression de plats doit être demandée au moins 12 heures avant l'heure prévue. Les ajouts de plats sont possibles jusqu'à 2 heures avant, sous réserve de disponibilité, de capacité de production et d'acceptation par SEMOUS. Les factures sont optionnelles et peuvent être demandées lors de la commande. Le paiement sur facture est réservé aux comptes professionnels ou groupes validés par SEMOUS. SEMOUS se réserve le droit d'accepter, refuser ou modifier une demande selon les stocks, délais, volume, horaires et capacité de production.

---

## Annexe B — Messages client et textes opérationnels

### Commande en attente de validation

> Votre commande est bien reçue. Elle est en attente de validation par SEMOUS. Vous serez informé dès que la commande sera acceptée ou refusée.

### Commande acceptée

> Votre commande est acceptée. Elle passe en préparation. Le délai estimé combine le temps de préparation et le temps de livraison ou de retrait.

### Commande refusée

> Votre commande n'a pas pu être acceptée. Si un paiement avait été autorisé, il sera annulé ou remboursé selon le moyen de paiement utilisé.

### SEMOUS CLUB bientôt disponible

> SEMOUS CLUB arrive bientôt. Créez votre compte SEMOUS pour être prêt à profiter des futurs avantages, offres, jeux et récompenses.

### Conditions groupes — résumé client

> Les commandes groupes doivent être demandées au moins 24h avant, avec un minimum de 70 EUR. Un acompte de 30 % peut être demandé pour confirmer la commande. Les suppressions ou annulations doivent être faites au moins 12h avant. Les ajouts sont possibles jusqu'à 2h avant, sous réserve d'acceptation par SEMOUS.
