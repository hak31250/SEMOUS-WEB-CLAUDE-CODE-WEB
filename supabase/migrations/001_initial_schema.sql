-- =============================================
-- SEMOUS — Migration initiale complète
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- UTILISATEURS & PROFILS
-- =============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin', 'cuisine', 'livreur')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prenom TEXT,
  nom TEXT,
  telephone TEXT,
  code_client TEXT UNIQUE,
  consentement_marketing BOOLEAN DEFAULT false,
  semous_club_ready BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guest_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  telephone TEXT,
  prenom TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES guest_customers(id) ON DELETE SET NULL,
  rue TEXT NOT NULL,
  complement TEXT,
  code_postal TEXT,
  ville TEXT,
  latitude FLOAT,
  longitude FLOAT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PRODUITS & CARTE
-- =============================================

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  ordre INT DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  description TEXT,
  prix_ttc NUMERIC(10,2) NOT NULL,
  tva_percent NUMERIC(5,2) DEFAULT 10,
  photo_url TEXT,
  visible BOOLEAN DEFAULT true,
  disponible BOOLEAN DEFAULT true,
  eligible_promo BOOLEAN DEFAULT true,
  alternative_id UUID REFERENCES products(id) ON DELETE SET NULL,
  allergenes TEXT[] DEFAULT '{}',
  ordre INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('taille', 'sauce', 'topping', 'extra', 'boisson', 'dessert')),
  nom TEXT NOT NULL,
  prix_supplement NUMERIC(10,2) DEFAULT 0,
  disponible BOOLEAN DEFAULT true,
  ordre INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  description TEXT,
  prix_ttc NUMERIC(10,2),
  visible BOOLEAN DEFAULT true,
  produits JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- COMMANDES
-- =============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES guest_customers(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('livraison', 'retrait', 'entreprise')),
  statut TEXT NOT NULL DEFAULT 'en_attente_validation'
    CHECK (statut IN ('en_attente_validation', 'acceptee', 'en_preparation', 'prete',
                      'en_livraison', 'livree', 'terminee', 'refusee', 'annulee', 'litige')),
  address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  instructions TEXT,
  sous_total_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  frais_livraison NUMERIC(10,2) DEFAULT 0,
  reduction NUMERIC(10,2) DEFAULT 0,
  total_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_ht NUMERIC(10,2),
  tva NUMERIC(10,2),
  code_id UUID,
  livreur_id UUID REFERENCES users(id) ON DELETE SET NULL,
  zone_km FLOAT,
  cout_livraison_interne NUMERIC(10,2),
  note_interne TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  quantite INT NOT NULL DEFAULT 1,
  prix_unitaire_ttc NUMERIC(10,2) NOT NULL,
  options JSONB DEFAULT '{}',
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ancien_statut TEXT,
  nouveau_statut TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contenu TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PAIEMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  statut TEXT NOT NULL DEFAULT 'non_initie'
    CHECK (statut IN ('non_initie', 'en_attente', 'preautorise', 'capture', 'echoue',
                      'autorisation_annulee', 'remboursement_attente', 'rembourse',
                      'paiement_manuel', 'acompte_paye', 'solde_attente', 'solde_paye')),
  montant NUMERIC(10,2) NOT NULL,
  methode TEXT CHECK (methode IN ('carte', 'tpe', 'titre_restaurant', 'lien', 'facture', 'virement')),
  prestataire TEXT,
  reference_externe TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  montant NUMERIC(10,2) NOT NULL,
  motif TEXT,
  statut TEXT DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- LIVRAISONS
-- =============================================

CREATE TABLE IF NOT EXISTS delivery_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distance_min_km FLOAT NOT NULL,
  distance_max_km FLOAT NOT NULL,
  frais_client NUMERIC(10,2) NOT NULL,
  temps_estime_min INT,
  temps_estime_max INT,
  actif BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  livreur_id UUID REFERENCES users(id) ON DELETE SET NULL,
  statut TEXT DEFAULT 'en_attente',
  adresse_destination TEXT,
  distance_km FLOAT,
  cout_interne_estime NUMERIC(10,2),
  depart_at TIMESTAMPTZ,
  arrivee_at TIMESTAMPTZ,
  waze_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livreur_id UUID REFERENCES users(id) ON DELETE SET NULL,
  commandes JSONB DEFAULT '[]',
  statut TEXT DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- STOCKS
-- =============================================

CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  quantite INT NOT NULL DEFAULT 0,
  seuil_alerte INT DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('entree', 'sortie', 'correction', 'rupture')),
  quantite INT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ENTREPRISES
-- =============================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  siret TEXT,
  email_referent TEXT,
  telephone_referent TEXT,
  prenom_referent TEXT,
  nom_referent TEXT,
  adresse TEXT,
  valide BOOLEAN DEFAULT false,
  paiement_facture BOOLEAN DEFAULT false,
  acompte_requis BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  nombre_personnes INT,
  budget_approximatif NUMERIC(10,2),
  demande_facture BOOLEAN DEFAULT false,
  statut_validation TEXT DEFAULT 'en_attente'
    CHECK (statut_validation IN ('en_attente', 'acceptee', 'refusee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  numero TEXT,
  montant_ttc NUMERIC(10,2),
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'payee', 'retard')),
  echeance_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CODES PROMOTIONNELS
-- =============================================

CREATE TABLE IF NOT EXISTS codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reduction_eur', 'reduction_pct', 'livraison_offerte',
                                      'produit_offert', 'menu_offert')),
  valeur NUMERIC(10,2),
  produit_id UUID REFERENCES products(id) ON DELETE SET NULL,
  categorie_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  campagne TEXT,
  influenceur TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  date_debut TIMESTAMPTZ,
  date_fin TIMESTAMPTZ,
  limite_total INT,
  limite_par_client INT,
  usage_count INT DEFAULT 0,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS code_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_id UUID NOT NULL REFERENCES codes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CONTENUS & SEO
-- =============================================

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  titre TEXT,
  contenu TEXT,
  meta_title TEXT,
  meta_description TEXT,
  publiee BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  titre TEXT,
  contenu TEXT,
  publie BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  reponse TEXT NOT NULL,
  ordre INT DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT,
  contenu TEXT,
  actif BOOLEAN DEFAULT false,
  date_debut TIMESTAMPTZ,
  date_fin TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SUPPORT & LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_email TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  sujet TEXT,
  statut TEXT DEFAULT 'ouvert' CHECK (statut IN ('ouvert', 'en_cours', 'ferme')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contenu TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cle TEXT UNIQUE NOT NULL,
  valeur TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entite TEXT,
  entite_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niveau TEXT NOT NULL DEFAULT 'info' CHECK (niveau IN ('info', 'warning', 'error')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  statut TEXT DEFAULT 'inactif',
  config JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_orders_statut ON orders(statut);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(type);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_visible ON products(visible, disponible);
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- =============================================
-- TRIGGER: updated_at automatique
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TRIGGER: Créer profil user automatiquement
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'client')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- DONNÉES PAR DÉFAUT
-- =============================================

-- Paramètres par défaut
INSERT INTO settings (cle, valeur) VALUES
  ('livraison_minimum_eur', '15'),
  ('livraison_offerte_a_partir_de_eur', '20'),
  ('sonnerie_active', 'true'),
  ('sonnerie_fichier', NULL),
  ('validation_timeout_minutes', '2'),
  ('stock_mise_a_jour_interval_minutes', '60'),
  ('restaurant_nom', 'SEMOUS'),
  ('restaurant_adresse', '32 avenue Honoré Serres, 31000 Toulouse'),
  ('restaurant_telephone', '+33623233677'),
  ('restaurant_lat', '43.5993'),
  ('restaurant_lng', '1.4327')
ON CONFLICT (cle) DO NOTHING;

-- Règles de livraison
INSERT INTO delivery_rules (distance_min_km, distance_max_km, frais_client, temps_estime_min, temps_estime_max) VALUES
  (0, 3, 3.00, 10, 12),
  (3, 5, 4.00, 12, 15),
  (5, 7, 5.00, 15, 17)
ON CONFLICT DO NOTHING;

-- Catégories par défaut
INSERT INTO product_categories (nom, ordre) VALUES
  ('Bols', 1),
  ('Menus', 2),
  ('Desserts', 3),
  ('Boissons', 4),
  ('Extras', 5)
ON CONFLICT DO NOTHING;

-- FAQs par défaut
INSERT INTO faqs (question, reponse, ordre) VALUES
  ('Quelle est la zone de livraison ?', 'SEMOUS livre dans un rayon de 7 km autour du restaurant (32 av. Honoré Serres, Toulouse). Au-delà, choisissez le retrait ou consultez Uber Eats / Deliveroo.', 1),
  ('Quel est le minimum de commande pour la livraison ?', 'Le minimum de commande pour la livraison est de 15 EUR. La livraison est offerte à partir de 20 EUR.', 2),
  ('Puis-je commander sans créer de compte ?', 'Oui, vous pouvez commander en tant qu''invité avec votre email, prénom et téléphone.', 3),
  ('Les produits sont-ils halal ?', 'Oui, tous les produits SEMOUS sont halal.', 4),
  ('Comment utiliser un code promo ?', 'Saisissez votre code lors du récapitulatif de commande. Un seul code par commande.', 5)
ON CONFLICT DO NOTHING;
