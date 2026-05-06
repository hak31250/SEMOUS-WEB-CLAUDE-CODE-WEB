import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { useCartTotals } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import CartDrawer from '@/components/cart/CartDrawer'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCartTotals()
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    toast.success('Déconnexion réussie')
    navigate('/')
    setMobileOpen(false)
  }

  const links = [
    { to: '/menu', label: 'Notre carte' },
    { to: '/entreprises', label: 'Entreprises' },
    { to: '/semous-club', label: 'SEMOUS CLUB' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-semous-gray-mid">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-tight text-semous-black">SEMOUS</Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className="text-sm font-medium text-semous-gray-text hover:text-semous-black transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/compte" className="flex items-center gap-1.5 text-sm font-medium text-semous-gray-text hover:text-semous-black">
                  <User size={16} />Mon compte
                </Link>
                <button onClick={handleSignOut} className="text-semous-gray-text hover:text-semous-black p-1.5" title="Déconnexion">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/compte" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-semous-gray-text hover:text-semous-black">
                <User size={16} />Connexion
              </Link>
            )}

            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-semous-black text-white hover:bg-semous-green transition-colors"
              aria-label={`Panier${itemCount > 0 ? ` (${itemCount})` : ''}`}>
              <ShoppingCart size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-semous-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-semous-black">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-semous-gray-mid bg-white px-4 py-3 flex flex-col gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className="text-sm font-medium py-2.5 text-semous-black border-b border-semous-gray-mid/50 last:border-0"
                onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              {user ? (
                <div className="flex flex-col gap-1">
                  <Link to="/compte" className="text-sm font-medium py-2 text-semous-black" onClick={() => setMobileOpen(false)}>
                    Mon compte
                  </Link>
                  <button onClick={handleSignOut} className="text-sm text-left py-2 text-red-600 font-medium">
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link to="/compte" className="text-sm font-medium py-2 text-semous-black block" onClick={() => setMobileOpen(false)}>
                  Connexion / Créer un compte
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
