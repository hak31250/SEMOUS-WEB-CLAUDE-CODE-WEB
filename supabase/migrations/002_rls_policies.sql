-- =============================================
-- SEMOUS — Row Level Security Policies
-- =============================================

-- Activer RLS sur toutes les tables sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Tables publiques (lecture anonyme OK)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Fonction helper: obtenir le rôle de l'utilisateur courant
-- =============================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =============================================
-- POLICIES — Tables publiques
-- =============================================

CREATE POLICY "produits_lecture_publique" ON products FOR SELECT USING (visible = true);
CREATE POLICY "categories_lecture_publique" ON product_categories FOR SELECT USING (visible = true);
CREATE POLICY "options_lecture_publique" ON product_options FOR SELECT USING (true);
CREATE POLICY "menus_lecture_publique" ON menus FOR SELECT USING (visible = true);
CREATE POLICY "faqs_lecture_publique" ON faqs FOR SELECT USING (visible = true);
CREATE POLICY "pages_lecture_publique" ON pages FOR SELECT USING (publiee = true);
CREATE POLICY "popups_lecture_publique" ON popups FOR SELECT USING (actif = true);

-- Admin: accès complet aux produits
CREATE POLICY "produits_admin_full" ON products FOR ALL USING (get_user_role() IN ('admin'));
CREATE POLICY "categories_admin_full" ON product_categories FOR ALL USING (get_user_role() IN ('admin'));
CREATE POLICY "options_admin_full" ON product_options FOR ALL USING (get_user_role() IN ('admin'));

-- =============================================
-- POLICIES — Users & Profils
-- =============================================

-- Un user voit son propre profil
CREATE POLICY "users_own_profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_own" ON customer_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "profiles_own_update" ON customer_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "profiles_insert" ON customer_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin: accès complet aux users
CREATE POLICY "users_admin_full" ON users FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "profiles_admin_full" ON customer_profiles FOR ALL USING (get_user_role() = 'admin');

-- =============================================
-- POLICIES — Commandes
-- =============================================

-- Client: voit ses propres commandes
CREATE POLICY "orders_own_select" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "orders_guest_insert" ON orders FOR INSERT WITH CHECK (true);

-- Cuisine: voit les commandes actives
CREATE POLICY "orders_cuisine_select" ON orders FOR SELECT USING (
  get_user_role() IN ('cuisine') AND
  statut IN ('acceptee', 'en_preparation', 'prete')
);
CREATE POLICY "orders_cuisine_update" ON orders FOR UPDATE USING (
  get_user_role() IN ('cuisine') AND
  statut IN ('acceptee', 'en_preparation', 'prete')
);

-- Livreur: voit les commandes à livrer
CREATE POLICY "orders_livreur_select" ON orders FOR SELECT USING (
  get_user_role() IN ('livreur') AND
  type = 'livraison' AND
  statut IN ('prete', 'en_livraison')
);
CREATE POLICY "orders_livreur_update" ON orders FOR UPDATE USING (
  get_user_role() IN ('livreur') AND
  type = 'livraison' AND
  statut IN ('prete', 'en_livraison', 'livree')
);

-- Admin: accès complet
CREATE POLICY "orders_admin_full" ON orders FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "order_items_admin_full" ON order_items FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "order_items_own" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_status_admin_full" ON order_status_history FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "order_status_insert" ON order_status_history FOR INSERT WITH CHECK (true);
CREATE POLICY "order_notes_admin_full" ON order_notes FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "order_notes_insert" ON order_notes FOR INSERT WITH CHECK (true);

-- =============================================
-- POLICIES — Paiements
-- =============================================

CREATE POLICY "payments_admin_full" ON payments FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "payments_own_select" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = payments.order_id AND user_id = auth.uid())
);
CREATE POLICY "refunds_admin_full" ON refunds FOR ALL USING (get_user_role() = 'admin');

-- =============================================
-- POLICIES — Stocks
-- =============================================

CREATE POLICY "stocks_admin_full" ON stocks FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "stocks_cuisine_select" ON stocks FOR SELECT USING (get_user_role() IN ('cuisine', 'livreur'));
CREATE POLICY "stock_movements_admin_full" ON stock_movements FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "stock_movements_insert" ON stock_movements FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'cuisine'));

-- =============================================
-- POLICIES — Entreprises
-- =============================================

CREATE POLICY "companies_admin_full" ON companies FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "companies_insert" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "company_orders_admin_full" ON company_orders FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "company_orders_insert" ON company_orders FOR INSERT WITH CHECK (true);

-- =============================================
-- POLICIES — Codes
-- =============================================

CREATE POLICY "codes_admin_full" ON codes FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "codes_lecture_actifs" ON codes FOR SELECT USING (actif = true);
CREATE POLICY "code_usages_admin_full" ON code_usages FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "code_usages_insert" ON code_usages FOR INSERT WITH CHECK (true);

-- =============================================
-- POLICIES — Adresses
-- =============================================

CREATE POLICY "addresses_own" ON addresses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "addresses_insert" ON addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "addresses_admin_full" ON addresses FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "guests_insert" ON guest_customers FOR INSERT WITH CHECK (true);
CREATE POLICY "guests_admin_full" ON guest_customers FOR ALL USING (get_user_role() = 'admin');

-- =============================================
-- POLICIES — Settings & Logs
-- =============================================

CREATE POLICY "settings_read" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON settings FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "admin_logs_admin_full" ON admin_logs FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "admin_logs_insert" ON admin_logs FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'cuisine', 'livreur'));
CREATE POLICY "system_logs_admin_full" ON system_logs FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "system_logs_insert" ON system_logs FOR INSERT WITH CHECK (true);
