-- =============================================================================
-- 004_seed_data.sql — Données initiales SEMOUS
-- À appliquer après 001, 002, 003
-- =============================================================================

-- Settings par défaut
INSERT INTO settings (cle, valeur) VALUES
  ('sonnerie_active', 'true'),
  ('sonnerie_fichier', '/sounds/notification.mp3'),
  ('livraison_active', 'true'),
  ('retrait_actif', 'true'),
  ('commandes_actives', 'true'),
  ('message_fermeture', ''),
  ('minimum_livraison', '15'),
  ('livraison_offerte_a', '20'),
  ('zone_max_km', '7'),
  ('tva_taux', '10'),
  ('acompte_pct', '30')
ON CONFLICT (cle) DO NOTHING;

-- Pages SEO de base
INSERT INTO pages (slug, titre, meta_description, publiee) VALUES
  ('accueil', 'SEMOUS — Bols à la semoule halal · Toulouse', 'SEMOUS, restaurant halal spécialisé dans les bols à la semoule à Toulouse. Commandez en ligne pour la livraison ou le retrait.', true),
  ('menu', 'Menu SEMOUS — Bols semoule halal', 'Découvrez les bols SEMOUS : semoule fine, toppings généreux, sauces maison. 100% halal. Livraison à Toulouse.', true),
  ('faq', 'FAQ SEMOUS — Questions fréquentes', 'Toutes vos questions sur les commandes SEMOUS : zone de livraison, frais, horaires, paiement, produits halal.', true),
  ('contact', 'Contact SEMOUS', 'Contactez SEMOUS par WhatsApp ou Snapchat. Adresse : 32 av. Honoré Serres, 31000 Toulouse.', true),
  ('entreprises', 'Commandes entreprises SEMOUS', 'Formules entreprise et groupes dès 70 EUR. Livraison ou retrait à Toulouse.', true),
  ('cgv', 'Conditions Générales de Vente', 'Conditions générales de vente SEMOUS.', true),
  ('mentions-legales', 'Mentions Légales', 'Mentions légales SEMOUS.', true),
  ('confidentialite', 'Politique de Confidentialité', 'Politique de confidentialité et traitement des données personnelles SEMOUS.', true),
  ('cookies', 'Politique de Cookies', 'Politique de cookies SEMOUS.', true)
ON CONFLICT (slug) DO NOTHING;

-- FAQs de base
INSERT INTO faqs (question, reponse, ordre, visible) VALUES
  ('Quelle est la zone de livraison ?', 'SEMOUS livre dans un rayon de 7 km autour du restaurant (32 av. Honoré Serres, Toulouse). Au-delà, le retrait à emporter est disponible.', 1, true),
  ('Quel est le minimum de commande pour la livraison ?', 'Le minimum de commande pour la livraison est de 15 €. La livraison est offerte à partir de 20 €.', 2, true),
  ('Quels sont les frais de livraison ?', '3 € pour 0–3 km, 4 € pour 3–5 km, 5 € pour 5–7 km. Gratuit dès 20 € de commande.', 3, true),
  ('Comment fonctionnent les commandes groupes ?', 'Les commandes groupes doivent être demandées au moins 24h à l''avance, avec un minimum de 70 €. Un acompte de 30 % peut être demandé.', 4, true),
  ('Puis-je commander sans créer de compte ?', 'Oui, vous pouvez commander en tant qu''invité en fournissant simplement votre email, prénom et téléphone. Créer un compte vous permet de retrouver votre historique.', 5, true),
  ('Les produits sont-ils halal ?', 'Oui, tous les produits SEMOUS sont halal certifiés.', 6, true),
  ('Comment utiliser un code promo ?', 'Entrez votre code promo au moment du paiement dans le champ prévu. Un seul code par commande.', 7, true),
  ('Quels sont les horaires ?', 'Lundi–Jeudi et Dimanche : 19h00–00h00. Vendredi–Samedi : 19h00–02h00.', 8, true)
ON CONFLICT DO NOTHING;

-- Règles de livraison
INSERT INTO delivery_rules (distance_min_km, distance_max_km, tarif, temps_estime_min) VALUES
  (0, 3, 3.00, 11),
  (3, 5, 4.00, 13),
  (5, 7, 5.00, 16)
ON CONFLICT DO NOTHING;

-- Catégories produits de démonstration
INSERT INTO product_categories (nom, slug, ordre, visible) VALUES
  ('Bols Signature', 'bols-signature', 1, true),
  ('Extras', 'extras', 2, true),
  ('Boissons', 'boissons', 3, true)
ON CONFLICT (slug) DO NOTHING;
