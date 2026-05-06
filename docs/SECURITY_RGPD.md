# SEMOUS — Sécurité, RGPD et données

---

## 9. Données, sécurité et RGPD

### Sécurité technique

- **HTTPS obligatoire** sur tout le site
- Mots de passe hashés (délégué à Supabase Auth)
- **Rôles et permissions** : admin, cuisine, livreur, client, invité
- Limitation des tentatives de connexion (rate limiting)
- Validation côté serveur pour : prix, codes, stock, paiements, permissions
- **Pas de stockage des données sensibles de carte bancaire**
- Logs des actions sensibles (table `admin_logs`)
- Protection formulaires et anti-spam
- Exports réservés aux rôles autorisés

### RLS Supabase (Row Level Security)

Activer RLS sur toutes les tables. Exemples de policies :

```sql
-- Un client ne voit que ses propres commandes
CREATE POLICY "client_own_orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Cuisine voit toutes les commandes acceptées
CREATE POLICY "cuisine_view_orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'cuisine'
    )
  );

-- Admin accès complet
CREATE POLICY "admin_full_access" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## RGPD et légal

### Collecte de données

Collecte limitée aux données nécessaires uniquement.

### Consentements séparés

| Consentement | Obligatoire |
|---|---|
| CGV | Oui |
| Politique de confidentialité | Oui |
| Cookies | Oui (bandeau) |
| Marketing / offres | Non (optionnel) |
| Notifications | Non (optionnel) |
| SEMOUS CLUB futur | Non (préparé, pas actif en V1) |

### Droits utilisateur

- Accès à ses données
- Correction de ses données
- Suppression / anonymisation
- Retrait de consentement
- Export si prévu

### Bandeau cookies

- Accepter tout
- Refuser tout
- Personnaliser

### Pages juridiques obligatoires

- Mentions légales
- CGV
- Politique de confidentialité
- Politique cookies
- Conditions livraison
- Conditions retrait
- Conditions entreprises
- Conditions remboursement
- Allergènes
- Médiation consommation
- *(SEMOUS CLUB conditions — plus tard)*

### Classements SEMOUS CLUB (futur)

Les classements ne doivent afficher que :
- Pseudo
- Rang
- Score ou badge

**Jamais :** email, téléphone, adresse ou montant dépensé.

---

## Propriété des comptes techniques

Tous les comptes techniques doivent appartenir à **SEMOUS / Hounivers** :

- Domaine (`semous.fr`)
- Hébergement
- Base de données (Supabase)
- Stockage médias
- Paiement
- Email transactionnel
- Géocodage / adresses
- Monitoring / analytics
- GitHub (dépôt privé)
