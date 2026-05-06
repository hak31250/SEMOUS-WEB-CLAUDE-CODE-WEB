import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, ChefHat, Truck, Package,
  BarChart3, Users, Building2, CreditCard, Tag, FileText,
  Settings, ScrollText, LogOut, Menu, X, UserCog, HeadphonesIcon
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
  { to: '/admin/support', label: 'Support', icon: HeadphonesIcon },
  { to: '/admin/roles', label: 'Rôles', icon: UserCog },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
  { to: '/admin/logs', label: 'Logs', icon: ScrollText },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, role, user } = useAuthStore()

  async function handleSignOut() {
    await signOut()
    toast.success('Déconnexion')
    navigate('/admin/login')
  }

  const isActive = (item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)

  // Cuisine et Livreur voient un menu réduit
  const visibleItems = navItems.filter(item => {
    if (role === 'cuisine') return ['/admin', '/admin/cuisine', '/admin/commandes'].includes(item.to)
    if (role === 'livreur') return ['/admin', '/admin/livraison'].includes(item.to)
    return true
  })

  return (
    <div className="min-h-screen bg-semous-gray flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen z-40 w-64 bg-semous-black text-white flex flex-col
        transition-transform duration-300 md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link to="/admin" className="font-bold text-lg tracking-tight">SEMOUS Admin</Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {visibleItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
                ${isActive(item) ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-1 truncate">{user?.email}</p>
          <p className="text-xs text-gray-500 mb-3 capitalize">Rôle : {role}</p>
          <div className="flex gap-2">
            <Link to="/" className="text-xs text-gray-400 hover:text-white flex-1">← Site</Link>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
              <LogOut size={13} />Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-semous-gray-mid px-4 h-14 flex items-center sticky top-0 z-20">
          <button className="md:hidden text-semous-black mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold text-semous-gray-text capitalize">{role}</span>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
