# SEMOUS — Site web custom (semous.fr)

> Document de travail pour Claude Code — Vision générale et contexte

---

## Contexte

**SEMOUS** est un restaurant halal spécialisé dans les bols à la semoule, basé à Toulouse (32 avenue Honoré Serres, 31000 Toulouse).

Le projet consiste à créer le **site officiel de commande directe de SEMOUS** : une application web custom avec back-office, commande directe, livraison, retrait, stocks simples, entreprises/groupes, codes promotionnels, et préparation SEMOUS CLUB.

---

## Décision structurante

> **Le site doit fonctionner seul dès la V1.**
> SEMOUS CLUB et l'application stock/HACCP sont prévus en affiliation/synchronisation futures, mais ne bloquent pas le MVP.

---

## Domaine

- **Domaine final :** `semous.fr` (non encore acheté au moment du développement)
- **Développement :** domaine temporaire / environnement de test
- **Domaine institutionnel futur :** `hounivers.fr` (groupe Hounivers)

---

## Identité visuelle

- Logo SEMOUS fourni par l'utilisateur (base officielle + icône PWA)
- Fond blanc dominant
- Noir et vert très foncé chic comme couleurs principales
- Boutons noirs ou vert très foncé
- Design moderne, premium, **mobile-first**, lisible, sans effet prototype
- Photos produits finales fournies plus tard et remplaçables depuis l'admin

---

## Architecture générale

| Bloc | Contenu |
|------|---------|
| **Front client** | Accueil, carte, panier, commande, livraison, retrait, compte client, commande invitée, entreprises, SEMOUS CLUB (bientôt disponible), contact, FAQ, pages SEO |
| **Back-office** | Dashboard, commandes, cuisine, livraison, produits, stocks, clients, invités, entreprises, paiements, codes, pages SEO, popups, support, statistiques, paramètres, rôles, logs |
| **Base centrale** | Clients, invités, commandes, produits, stocks simples, paiements, codes, livraisons, entreprises, contenus, logs, paramètres |
| **Connexions futures** | Paiement final, titres-restaurant, SEMOUS CLUB, app stock/HACCP, outils SEO, app livreur |

---

## Ce qui est hors MVP

- SEMOUS CLUB complet (jeux, points, récompenses, classements, missions, badges)
- Application interne stock/HACCP complète
- Application livreur native séparée
- Agents SEO externes ou application agent IA
- Optimisation automatique avancée des tournées
- Multi-ville, franchise, caisse complète, comptabilité complète

---

## Instruction principale pour Claude Code

> Construire l'ADN/MVP du site custom semous.fr selon ce cahier des charges, puis enchaîner sur la V2 prévue, avec tests complets, environnement de test, documentation, sauvegardes, rollback et préparation à la mise en production.

---

## Fichiers du dossier

| Fichier | Contenu |
|---------|---------|
| `README.md` | Ce fichier — vision, contexte, domaine, décisions structurantes |
| `FUNCTIONAL_SPEC.md` | Parcours client, commande, livraison, retrait, paiements, entreprises |
| `ADMIN_SPEC.md` | Dashboard, modules admin, cuisine, livraison, rôles, permissions |
| `DATABASE_SCHEMA.md` | Tables principales, champs, relations, logs, intégrations |
| `SECURITY_RGPD.md` | Sécurité, RGPD, cookies, droits utilisateurs, logs |
| `TEST_PLAN.md` | Plan de test complet, charge, sauvegarde, rollback |
| `ROADMAP.md` | ADN/MVP, V2 immédiate, futur |
| `OPEN_POINTS.md` | Points à finaliser plus tard (non bloquants) |
