# CLAUDE.md — Contexte projet pour Claude Code

> Ce fichier est lu automatiquement par Claude Code à chaque session.

---

## Projet

**SEMOUS** — Site web custom de commande directe (semous.fr)
Restaurant halal spécialisé dans les bols à la semoule, Toulouse, France.

## Stack technique cible

- **Frontend :** React + Vite + Tailwind CSS (mobile-first)
- **Backend :** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Hébergement :** Netlify (déjà utilisé pour les outils existants)
- **Dépôt :** GitHub privé (SEMOUS/Hounivers)

## Fichiers de référence

| Fichier | Lire en priorité pour... |
|---------|--------------------------|
| `README.md` | Vision, contexte, architecture générale |
| `FUNCTIONAL_SPEC.md` | Parcours client, commande, livraison, paiement, entreprises |
| `ADMIN_SPEC.md` | Dashboard, back-office, cuisine, livraison, stocks, codes |
| `DATABASE_SCHEMA.md` | Toutes les tables Supabase, relations, RLS |
| `SECURITY_RGPD.md` | Sécurité, RGPD, rôles, droits utilisateurs |
| `TEST_PLAN.md` | Scénarios de test, performance, sauvegardes |
| `ROADMAP.md` | MVP V1, V2 immédiate, futur |
| `OPEN_POINTS.md` | Points non bloquants mais à surveiller |

## Règles de développement

1. **Mobile-first obligatoire** — L'audience principale est sur iPhone/Safari.
2. **Self-contained** — Chaque fonctionnalité doit fonctionner sans dépendance externe non validée.
3. **RLS Supabase** — Activer Row Level Security sur toutes les tables sensibles dès le début.
4. **Pas de stockage carte bancaire** — L'architecture paiement doit être déléguée au prestataire final.
5. **Réaltime Supabase** — Utiliser Supabase Realtime sur la table `orders` pour le dashboard cuisine.
6. **Validation côté serveur** — Prix, codes, stocks, permissions : toujours validés côté serveur.
7. **Historique des statuts** — Chaque changement de statut commande doit être logué dans `order_status_history`.
8. **Propriété des comptes** — Tous les comptes techniques appartiennent à SEMOUS/Hounivers.

## Informations opérationnelles

- **Adresse restaurant :** 32 avenue Honoré Serres, 31000 Toulouse
- **Coordonnées GPS :** 43.5993, 1.4327
- **Zone livraison max :** 7 km
- **Minimum commande livraison :** 15 EUR
- **Livraison offerte à partir de :** 20 EUR
- **Commandes via :** WhatsApp +33623233677 / Snapchat semous.31 (en attendant le site)
- **Horaires :** Lun–Jeu et Dim 19h00–00h00 ; Ven–Sam 19h00–02h00

## Tarifs livraison

| Zone | Frais | Temps estimé |
|------|-------|--------------|
| 0–3 km | 3 EUR | 10–12 min |
| 3–5 km | 4 EUR | 12–15 min |
| 5–7 km | 5 EUR | 15–17 min |
| +7 km | Bloqué | — |

## Ce qui est hors scope MVP

- SEMOUS CLUB complet (jeux, points, récompenses)
- Application stock/HACCP interne
- Application livreur native
- Agents SEO externes
- Multi-ville / franchise

## Instruction principale

> Construire l'ADN/MVP du site custom semous.fr selon ce cahier des charges, puis enchaîner sur la V2 prévue, avec tests complets, environnement de test, documentation, sauvegardes, rollback et préparation à la mise en production.
