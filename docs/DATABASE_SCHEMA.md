# SEMOUS — Schéma de base de données

> Tables principales, champs, relations, logs, intégrations (Supabase)

---

## Stack recommandée

- **Base de données :** Supabase (PostgreSQL)
- **Auth :** Supabase Auth
- **Stockage médias :** Supabase Storage
- **Temps réel :** Supabase Realtime (dashboard commandes)

---

## Tables principales

### Utilisateurs et profils

```sql
-- Comptes utilisateurs (liés à Supabase Auth)
users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz,
  role text -- 'client', 'admin', 'cuisine', 'livreur'
)

-- Profils clients
customer_profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  prenom text,
  nom text,
  telephone text,
  code_client text UNIQUE,
  consentement_marketing boolean DEFAULT false,
  semous_club_ready boolean DEFAULT false,
  created_at timestamptz
)

-- Clients invités (sans compte)
guest_customers (
  id uuid PRIMARY KEY,
  email text,
  telephone text,
  prenom text,
  created_at timestamptz
)

-- Adresses
addresses (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  guest_id uuid REFERENCES guest_customers(id),
  rue text,
  complement text,
  code_postal text,
  ville text,
  latitude float,
  longitude float,
  is_default boolean DEFAULT false
)
```

### Produits et carte

```sql
product_categories (
  id uuid PRIMARY KEY,
  nom text,
  ordre int,
  visible boolean DEFAULT true
)

products (
  id uuid PRIMARY KEY,
  category_id uuid REFERENCES product_categories(id),
  nom text,
  description text,
  prix_ttc numeric,
  tva_percent numeric,
  photo_url text,
  visible boolean DEFAULT true,
  disponible boolean DEFAULT true,
  eligible_promo boolean DEFAULT true,
  alternative_id uuid REFERENCES products(id),
  allergenes text[],
  ordre int
)

product_options (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  type text, -- 'taille', 'sauce', 'topping', 'extra', 'boisson', 'dessert'
  nom text,
  prix_supplement numeric DEFAULT 0,
  disponible boolean DEFAULT true
)

menus (
  id uuid PRIMARY KEY,
  nom text,
  description text,
  prix_ttc numeric,
  visible boolean DEFAULT true,
  produits jsonb -- liste des produits inclus
)
```

### Commandes

```sql
orders (
  id uuid PRIMARY KEY,
  numero text UNIQUE, -- ex: SEM-20250101-0001
  user_id uuid REFERENCES users(id),
  guest_id uuid REFERENCES guest_customers(id),
  type text, -- 'livraison', 'retrait', 'entreprise'
  statut text, -- voir statuts ci-dessous
  address_id uuid REFERENCES addresses(id),
  instructions text,
  sous_total_ttc numeric,
  frais_livraison numeric DEFAULT 0,
  reduction numeric DEFAULT 0,
  total_ttc numeric,
  total_ht numeric,
  tva numeric,
  code_id uuid REFERENCES codes(id),
  livreur_id uuid REFERENCES users(id),
  zone_km float,
  cout_livraison_interne numeric,
  note_interne text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Statuts commande possibles :
-- 'en_attente_validation', 'acceptee', 'en_preparation', 'prete',
-- 'en_livraison', 'livree', 'terminee', 'refusee', 'annulee', 'litige'

order_items (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  menu_id uuid REFERENCES menus(id),
  quantite int,
  prix_unitaire_ttc numeric,
  options jsonb, -- sauces, toppings, taille...
  instructions text
)

order_status_history (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  ancien_statut text,
  nouveau_statut text,
  user_id uuid REFERENCES users(id), -- qui a fait le changement
  note text,
  created_at timestamptz
)

order_notes (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  user_id uuid REFERENCES users(id),
  contenu text,
  created_at timestamptz
)
```

### Paiements

```sql
payments (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  statut text, -- voir statuts paiement dans FUNCTIONAL_SPEC.md
  montant numeric,
  methode text, -- 'carte', 'tpe', 'titre_restaurant', 'lien', 'facture'
  prestataire text,
  reference_externe text,
  created_at timestamptz,
  updated_at timestamptz
)

refunds (
  id uuid PRIMARY KEY,
  payment_id uuid REFERENCES payments(id),
  order_id uuid REFERENCES orders(id),
  montant numeric,
  motif text,
  statut text,
  created_at timestamptz
)

invoices (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  company_id uuid REFERENCES companies(id),
  numero text,
  montant_ttc numeric,
  statut text, -- 'en_attente', 'payee', 'retard'
  echeance_at timestamptz,
  pdf_url text,
  created_at timestamptz
)
```

### Livraisons

```sql
delivery_rules (
  id uuid PRIMARY KEY,
  distance_min_km float,
  distance_max_km float,
  frais_client numeric,
  temps_estime_min int,
  temps_estime_max int,
  actif boolean DEFAULT true
)

deliveries (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  livreur_id uuid REFERENCES users(id),
  statut text,
  adresse_destination text,
  distance_km float,
  cout_interne_estime numeric,
  depart_at timestamptz,
  arrivee_at timestamptz,
  waze_url text,
  note text
)

delivery_groups (
  id uuid PRIMARY KEY,
  livreur_id uuid REFERENCES users(id),
  commandes jsonb, -- liste order_ids regroupées
  statut text,
  created_at timestamptz
)
```

### Stocks

```sql
stocks (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  quantite int DEFAULT 0,
  seuil_alerte int DEFAULT 5,
  updated_at timestamptz
)

stock_movements (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  type text, -- 'entree', 'sortie', 'correction', 'rupture'
  quantite int,
  order_id uuid REFERENCES orders(id),
  user_id uuid REFERENCES users(id),
  note text,
  created_at timestamptz
)
```

### Entreprises

```sql
companies (
  id uuid PRIMARY KEY,
  nom text,
  siret text,
  email_referent text,
  telephone_referent text,
  prenom_referent text,
  nom_referent text,
  adresse text,
  valide boolean DEFAULT false,
  paiement_facture boolean DEFAULT false,
  acompte_requis boolean DEFAULT true,
  created_at timestamptz
)

company_orders (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  order_id uuid REFERENCES orders(id),
  nombre_personnes int,
  budget_approximatif numeric,
  demande_facture boolean DEFAULT false,
  statut_validation text -- 'en_attente', 'acceptee', 'refusee'
)
```

### Codes promotionnels

```sql
codes (
  id uuid PRIMARY KEY,
  code text UNIQUE,
  type text, -- 'reduction_eur', 'reduction_pct', 'livraison_offerte', 'produit_offert', etc.
  valeur numeric,
  produit_id uuid REFERENCES products(id),
  categorie_id uuid REFERENCES product_categories(id),
  campagne text,
  influenceur text,
  company_id uuid REFERENCES companies(id),
  date_debut timestamptz,
  date_fin timestamptz,
  limite_total int,
  limite_par_client int,
  usage_count int DEFAULT 0,
  actif boolean DEFAULT true,
  created_at timestamptz
)

code_usages (
  id uuid PRIMARY KEY,
  code_id uuid REFERENCES codes(id),
  order_id uuid REFERENCES orders(id),
  user_id uuid REFERENCES users(id),
  guest_email text,
  created_at timestamptz
)
```

### Contenus et SEO

```sql
pages (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  titre text,
  contenu text,
  meta_title text,
  meta_description text,
  publiee boolean DEFAULT false,
  updated_at timestamptz
)

blog_posts (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  titre text,
  contenu text,
  publie boolean DEFAULT false,
  created_at timestamptz
)

faqs (
  id uuid PRIMARY KEY,
  question text,
  reponse text,
  ordre int,
  visible boolean DEFAULT true
)

popups (
  id uuid PRIMARY KEY,
  titre text,
  contenu text,
  actif boolean DEFAULT false,
  date_debut timestamptz,
  date_fin timestamptz
)
```

### Support et logs

```sql
support_tickets (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  guest_email text,
  order_id uuid REFERENCES orders(id),
  sujet text,
  statut text,
  created_at timestamptz
)

support_messages (
  id uuid PRIMARY KEY,
  ticket_id uuid REFERENCES support_tickets(id),
  user_id uuid REFERENCES users(id),
  contenu text,
  created_at timestamptz
)

settings (
  id uuid PRIMARY KEY,
  cle text UNIQUE,
  valeur text,
  updated_at timestamptz
)

admin_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  action text,
  entite text,
  entite_id uuid,
  details jsonb,
  created_at timestamptz
)

system_logs (
  id uuid PRIMARY KEY,
  niveau text, -- 'info', 'warning', 'error'
  message text,
  details jsonb,
  created_at timestamptz
)

integrations (
  id uuid PRIMARY KEY,
  nom text,
  statut text,
  config jsonb,
  updated_at timestamptz
)
```

---

## Paramètres clés (table settings)

| Clé | Valeur par défaut |
|-----|-------------------|
| `livraison_minimum_eur` | `15` |
| `livraison_offerte_a_partir_de_eur` | `20` |
| `sonnerie_active` | `true` |
| `sonnerie_fichier` | `null` |
| `validation_timeout_minutes` | `2` |
| `horaires_ouverture` | `json` |
| `stock_mise_a_jour_interval_minutes` | `60` |

---

## Notes Supabase

- Utiliser **Row Level Security (RLS)** sur toutes les tables sensibles
- Utiliser **Realtime** sur la table `orders` pour le dashboard cuisine/livraison
- Utiliser **Supabase Storage** pour photos produits, logo, sons, factures PDF
- Utiliser **Supabase Auth** pour la gestion des rôles (metadata `role`)
- Les migrations doivent être versionnées dans `/supabase/migrations/`
