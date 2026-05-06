import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, ChefHat, Truck, Package,
  BarChart3, Users, Building2, CreditCard, Tag, FileText,
  Settings, ScrollText, LogOut, Menu, X, AlertTriangle
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/cuisine', label: 'Cuisine', icon: ChefHat },
  { to: '/admin/livraison', label: 'Livraison', icon: Truck },
  { to: '/admin/produits', label: 'Produits', icon: Package },
  { to: '/admin/stocks', label: 'Stocks', icon: BarChart3 },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/entreprises', label: 'Entreprises', icon: Building2 },
  { to: '/admin/paiements', label: 'Paiements', icon: CreditCard },
  { to: '/admin/codes', label: 'Codes promo', icon: Tag },
  { to: '/admin/contenus', label: 'Contenus SEO', icon: FileText },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
  { to: '/admin/logs', label: 'Logs', icon: ScrollText },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, role } = useAuthStore()

  async function handleSignOut() {
    await signOut()
    toast.success('Déconnexion')
    navigate('/admin/login')
  }

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <div className="min-h-screen bg-semous-gray flex">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen z-40 w-64 bg-semous-black text-white flex flex-col
        transition-transform duration-300 md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link to="/admin" className="font-bold text-lg">SEMOUS Admin</Link>
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
                ${isActive(item)
                  ? 'bg-white/15 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-2 capitalize">Rôle : {role}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-semous-gray-mid px-4 h-14 flex items-center gap-3 sticky top-0 z-20">
          <button
            className="md:hidden text-semous-black"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="text-xs text-semous-gray-text hover:text-semous-black ml-auto">
            ← Voir le site
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
