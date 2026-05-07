import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdminLayout from '@/components/layout/AdminLayout'
import CookieBanner from '@/components/ui/CookieBanner'
import PopupDisplay from '@/components/ui/PopupDisplay'

// Client pages
import Home from '@/pages/client/Home'
import Menu from '@/pages/client/Menu'
import Checkout from '@/pages/client/Checkout'
import OrderConfirmation from '@/pages/client/OrderConfirmation'
import Account from '@/pages/client/Account'
import Enterprise from '@/pages/client/Enterprise'
import SemousClub from '@/pages/client/SemousClub'
import FAQ from '@/pages/client/FAQ'
import Contact from '@/pages/client/Contact'
import OrderTracking from '@/pages/client/OrderTracking'

// Legal pages
import MentionsLegales from '@/pages/legal/MentionsLegales'
import CGV from '@/pages/legal/CGV'
import Confidentialite from '@/pages/legal/Confidentialite'
import Cookies from '@/pages/legal/Cookies'

// Admin pages
import AdminLogin from '@/pages/admin/AdminLogin'
import Dashboard from '@/pages/admin/Dashboard'
import Orders from '@/pages/admin/Orders'
import Kitchen from '@/pages/admin/Kitchen'
import Delivery from '@/pages/admin/Delivery'
import Products from '@/pages/admin/Products'
import Stocks from '@/pages/admin/Stocks'
import Clients from '@/pages/admin/Clients'
import Companies from '@/pages/admin/Companies'
import Payments from '@/pages/admin/Payments'
import Codes from '@/pages/admin/Codes'
import Content from '@/pages/admin/Content'
import Statistics from '@/pages/admin/Statistics'
import Support from '@/pages/admin/Support'
import Roles from '@/pages/admin/Roles'
import Settings from '@/pages/admin/Settings'
import Logs from '@/pages/admin/Logs'

function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <PopupDisplay />
    </div>
  )
}

function AdminGuard() {
  const { user, role, loading } = useAuthStore()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-semous-gray">
        <p className="text-semous-gray-text text-sm">Chargement...</p>
      </div>
    )
  }
  if (!user || !['admin', 'cuisine', 'livreur'].includes(role)) {
    return <Navigate to="/admin/login" replace />
  }
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <Routes>
        {/* Client routes */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/commande" element={<Checkout />} />
          <Route path="/commande/confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/compte" element={<Account />} />
          <Route path="/entreprises" element={<Enterprise />} />
          <Route path="/semous-club" element={<SemousClub />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/suivi" element={<OrderTracking />} />
          <Route path="/suivi/:numero" element={<OrderTracking />} />
          <Route path="/legal/mentions-legales" element={<MentionsLegales />} />
          <Route path="/legal/cgv" element={<CGV />} />
          <Route path="/legal/confidentialite" element={<Confidentialite />} />
          <Route path="/legal/cookies" element={<Cookies />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/commandes" element={<Orders />} />
          <Route path="/admin/cuisine" element={<Kitchen />} />
          <Route path="/admin/livraison" element={<Delivery />} />
          <Route path="/admin/produits" element={<Products />} />
          <Route path="/admin/stocks" element={<Stocks />} />
          <Route path="/admin/clients" element={<Clients />} />
          <Route path="/admin/entreprises" element={<Companies />} />
          <Route path="/admin/paiements" element={<Payments />} />
          <Route path="/admin/codes" element={<Codes />} />
          <Route path="/admin/statistiques" element={<Statistics />} />
          <Route path="/admin/contenus" element={<Content />} />
          <Route path="/admin/support" element={<Support />} />
          <Route path="/admin/roles" element={<Roles />} />
          <Route path="/admin/parametres" element={<Settings />} />
          <Route path="/admin/logs" element={<Logs />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
