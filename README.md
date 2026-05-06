# SEMOUS — Site de commande directe

Application web de commande en ligne pour le restaurant halal SEMOUS (Toulouse).  
Stack : React 18 + Vite + Tailwind CSS + Supabase + Netlify.

---

## Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Netlify](https://netlify.com) (gratuit)
- Compte [Resend](https://resend.com) pour les e-mails transactionnels

---

## Installation locale

```bash
git clone https://github.com/hak31250/semous-web-claude-code-web.git
cd semous-web-claude-code-web
npm install
cp .env.example .env.local
```

Remplir `.env.local` avec vos clés Supabase (voir section suivante).

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

---

## Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Ces valeurs se trouvent dans votre dashboard Supabase → **Settings → API**.

> Ne jamais committer `.env.local`. Il est dans `.gitignore`.

---

## Configuration Supabase

### 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Nommer le projet `semous-prod` (ou `semous-dev` pour un environnement de test)
3. Choisir la région **Frankfurt (eu-central-1)** ou **Paris** pour conformité RGPD

### 2. Appliquer les migrations

Depuis la racine du projet :

```bash
# Installer la CLI Supabase
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet (remplacer par votre project-ref)
supabase link --project-ref xxxxxxxxxxxx

# Appliquer toutes les migrations
supabase db push
```

Ou manuellement via **SQL Editor** dans le dashboard Supabase, en exécutant dans l'ordre :

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/migrations/003_functions.sql`
4. `supabase/migrations/004_seed_data.sql`

### 3. Activer l'authentification

Dans **Authentication → Providers** :
- Activer **Email** (avec confirmation d'email selon votre préférence)

Dans **Authentication → URL Configuration** :
- Site URL : `https://semous.fr`
- Redirect URLs : `https://semous.fr/*`, `http://localhost:5173/*`

### 4. Configurer le Realtime

Dans **Database → Replication**, activer les publications pour les tables :
- `orders`
- `order_status_history`
- `support_tickets`
- `support_messages`

### 5. Configurer le Storage (si photos produits)

Dans **Storage**, créer un bucket `product-images` avec accès public activé.

---

## Déploiement des Edge Functions

Les Edge Functions gèrent les e-mails transactionnels via [Resend](https://resend.com).

### Prérequis

Obtenir une clé API Resend sur [resend.com](https://resend.com) et vérifier votre domaine `semous.fr`.

### Déploiement

```bash
# Déployer toutes les fonctions
supabase functions deploy send-notification
supabase functions deploy order-webhook

# Définir les secrets
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set SITE_URL=https://semous.fr
```

### Configurer les webhooks base de données

Dans **Database → Webhooks**, créer deux webhooks :

**Webhook 1 — Nouvelle commande :**
- Table : `orders`
- Event : `INSERT`
- URL : `https://xxxxxxxxxxxx.supabase.co/functions/v1/order-webhook`
- Headers : `Authorization: Bearer <service_role_key>`

**Webhook 2 — Mise à jour statut :**
- Table : `orders`
- Event : `UPDATE`
- URL : `https://xxxxxxxxxxxx.supabase.co/functions/v1/order-webhook`
- Headers : `Authorization: Bearer <service_role_key>`

---

## Déploiement Netlify

### Option 1 : Via l'interface Netlify

1. **New site → Import from Git** → sélectionner le dépôt GitHub
2. Build settings :
   - Build command : `npm run build`
   - Publish directory : `dist`
3. Variables d'environnement (dans **Site settings → Environment variables**) :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Cliquer **Deploy site**

### Option 2 : Via la CLI Netlify

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Configuration DNS

Dans votre registrar, pointer `semous.fr` vers les serveurs Netlify fournis après déploiement.  
Netlify provisionne automatiquement le certificat SSL Let's Encrypt.

Le fichier `netlify.toml` à la racine gère déjà les redirections SPA :

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Compte administrateur

Après déploiement, créer le premier compte admin manuellement via Supabase :

```sql
-- Dans SQL Editor Supabase
INSERT INTO admin_users (email, role)
VALUES ('votre-email@semous.fr', 'admin');
```

L'utilisateur doit d'abord s'être inscrit via `/login` pour que son `auth.user` existe.

Accéder au backoffice via : `https://semous.fr/admin`

---

## Structure du projet

```
src/
├── components/
│   ├── admin/          OrderTicket (impression thermique)
│   ├── layout/         AdminLayout, Header, Footer
│   └── ui/             PopupDisplay, CartBadge
├── hooks/
│   ├── useStoreStatus  Détection ouverture/fermeture (timezone Paris)
│   └── useSeo          Meta tags dynamiques
├── lib/
│   └── supabase.js     Client Supabase
├── pages/
│   ├── admin/          Dashboard, Orders, Kitchen, Delivery,
│   │                   Products, Statistics, Support, Settings, Content
│   ├── client/         Home, Menu, Checkout, OrderConfirmation,
│   │                   Account, Contact
│   └── legal/          CGV, Confidentialite, Cookies
├── store/
│   └── cartStore.js    Zustand — panier + calculs livraison
└── utils/
    ├── format.js       formatPrice, formatDate, orderStatusLabel
    └── sound.js        playNotificationBeep (Web Audio API)

supabase/
├── functions/
│   ├── send-notification/  Edge Function e-mails (Resend)
│   └── order-webhook/      Trigger DB → e-mail auto
└── migrations/             SQL schema, RLS, functions, seed
```

---

## Scripts disponibles

```bash
npm run dev       # Serveur de développement local
npm run build     # Build de production (dist/)
npm run preview   # Prévisualisation du build
npm run test      # Tests unitaires Vitest
npm run coverage  # Couverture de code
```

---

## Tests

```bash
# Lancer les tests
npm run test

# Mode watch
npm run test -- --watch

# Couverture
npm run coverage
```

Les tests couvrent : `computeCartTotals`, `calcDeliveryFee`, `formatPrice`, `orderStatusLabel`, `generateOrderNumber`.

---

## Architecture sécurité

- **RLS activé** sur toutes les tables sensibles
- Rôles : `customer`, `staff`, `kitchen`, `delivery`, `admin`
- Fonction `get_user_role()` en SECURITY DEFINER pour lire le rôle sans exposer `admin_users`
- Aucune donnée bancaire stockée côté SEMOUS
- HTTPS obligatoire en production (Netlify SSL automatique)
- Variables sensibles jamais dans le code source (`.env.local` + variables Netlify)

---

## Restauration / Rollback

Supabase effectue des sauvegardes automatiques quotidiennes (plan Pro).  
Pour un rollback manuel :

```bash
# Lister les migrations appliquées
supabase migration list

# Revenir à une version précédente
supabase db reset --version <migration_id>
```

---

## Support

- Ouvrir un ticket via le formulaire `/contact` du site
- Email : contact@semous.fr
- WhatsApp : +33 6 23 23 36 77
