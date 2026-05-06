-- =============================================
-- Trigger : créer automatiquement un stock à 0
-- quand un nouveau produit est inséré
-- =============================================

CREATE OR REPLACE FUNCTION create_stock_for_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.stocks (product_id, quantite, seuil_alerte)
  VALUES (NEW.id, 0, 5)
  ON CONFLICT (product_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_stock_init ON products;
CREATE TRIGGER product_stock_init
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION create_stock_for_product();

-- =============================================
-- Trigger : incrémenter usage_count des codes
-- =============================================

CREATE OR REPLACE FUNCTION increment_code_usage_on_use()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.codes SET usage_count = usage_count + 1 WHERE id = NEW.code_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS code_usage_increment ON code_usages;
CREATE TRIGGER code_usage_increment
  AFTER INSERT ON code_usages
  FOR EACH ROW EXECUTE FUNCTION increment_code_usage_on_use();

-- =============================================
-- Trigger : déduire stock après acceptation commande
-- =============================================

CREATE OR REPLACE FUNCTION deduct_stock_on_order_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'acceptee' AND (OLD.statut IS NULL OR OLD.statut <> 'acceptee') THEN
    UPDATE public.stocks s
    SET quantite = GREATEST(0, s.quantite - oi.quantite),
        updated_at = NOW()
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = s.product_id;

    -- Marquer produits en rupture
    UPDATE public.products p
    SET disponible = false
    FROM public.stocks s
    WHERE s.product_id = p.id AND s.quantite = 0 AND p.disponible = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_accept_stock_deduct ON orders;
CREATE TRIGGER order_accept_stock_deduct
  AFTER UPDATE OF statut ON orders
  FOR EACH ROW EXECUTE FUNCTION deduct_stock_on_order_accept();

-- =============================================
-- Fonction RPC : increment_code_usage (appelé manuellement si besoin)
-- =============================================

CREATE OR REPLACE FUNCTION increment_code_usage(code_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.codes SET usage_count = usage_count + 1 WHERE id = code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
