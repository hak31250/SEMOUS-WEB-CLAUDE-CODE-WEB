# SEMOUS — Roadmap

---

## ADN / MVP (V1)

Objectif : **site fonctionnel, testable, déployable en production**

### Front client
- [ ] Page d'accueil
- [ ] Carte / menu
- [ ] Panier
- [ ] Commande invitée (livraison + retrait)
- [ ] Compte SEMOUS (création, connexion, historique, adresses)
- [ ] Livraison (zone, calcul frais, adresse)
- [ ] Retrait à emporter
- [ ] Codes promotionnels (saisie + validation panier)
- [ ] Page entreprises / commandes groupées
- [ ] Page SEMOUS CLUB — "Bientôt disponible" (sans fonctionnalité)
- [ ] Contact, FAQ
- [ ] Pages SEO de base

### Back-office
- [ ] Dashboard temps réel (commandes entrantes, CA)
- [ ] Sonnerie personnalisable
- [ ] Gestion commandes complète (tous statuts, historique)
- [ ] Espace cuisine (plein écran)
- [ ] Espace livraison (avec Waze)
- [ ] Gestion produits et carte
- [ ] Gestion stocks simples
- [ ] Générateur de codes
- [ ] Gestion clients et invités
- [ ] Gestion entreprises / commandes groupées
- [ ] Gestion paiements et remboursements
- [ ] Pages SEO et contenus
- [ ] Popups
- [ ] Paramètres généraux
- [ ] Gestion des rôles
- [ ] Logs admin et système
- [ ] Impression ticket

### Technique
- [ ] Paiement connectable (architecture prête)
- [ ] Sécurité HTTPS + RLS Supabase
- [ ] RGPD : consentements, bandeau cookies, droits utilisateurs
- [ ] Pages juridiques complètes
- [ ] Sauvegardes automatiques
- [ ] Tests fonctionnels complets
- [ ] Environnement de test séparé

---

## V2 immédiate

Après validation du MVP en production :

- Automatisations avancées
- Statistiques plus poussées
- Module entreprises plus complet
- Paniers abandonnés, recommander dernière commande, favoris
- Upsell intelligent
- Popups ciblées
- Livraisons mieux regroupées (optimisation semi-auto)
- Préparation SEMOUS CLUB renforcée (hooks, structure points)
- Optimisation performance et corrections
- Finitions UI

---

## Futur (hors MVP)

| Fonctionnalité | Dépendance |
|---|---|
| SEMOUS CLUB complet (jeux, points, récompenses, classements, missions, badges) | Application SEMOUS CLUB prête |
| Application interne stock/DLC/HACCP/fournisseurs/factures/production | Développement séparé |
| Application livreur dédiée | Volume suffisant |
| Agents SEO externes via API sécurisée | — |
| Multi-enseignes Hounivers, multi-villes, franchise | — |
| Optimisation automatique avancée des tournées | API de routage |
| Caisse complète, comptabilité complète | — |

---

## Décision structurante (rappel)

> Le site doit fonctionner seul dès la V1. SEMOUS CLUB et l'application stock/HACCP sont prévus en affiliation/synchronisation futures, mais **ne bloquent pas le MVP**.
