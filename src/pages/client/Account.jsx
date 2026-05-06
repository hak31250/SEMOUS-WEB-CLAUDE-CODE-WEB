import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor } from '@/utils/format'
import { User, LogOut, ShoppingBag, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'

export default function Account() {
  const { user, profile, signIn, signUp, signOut, loading } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ email: '', password: '', prenom: '', nom: '', telephone: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setOrdersLoading(true)
      supabase
        .from('orders')
        .select('*, order_items(quantite, prix_unitaire_ttc, products(nom))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => { setOrders(data || []); setOrdersLoading(false) })
    }
  }, [user])

  async function handleLogin(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signIn(loginForm)
      toast.success('Connexion réussie')
    } catch (err) {
      toast.error(err.message || 'Identifiants incorrects')
    } finally { setSubmitting(false) }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signUp(signupForm)
      toast.success('Compte créé ! Vérifiez votre email.')
    } catch (err) {
      toast.error(err.message || 'Erreur à la création du compte')
    } finally { setSubmitting(false) }
  }

  async function handleSignOut() {
    await signOut()
    toast.success('Déconnexion réussie')
    navigate('/')
  }

  if (loading) return <div className="flex items-center justify-center min-h-64"><Loader2 size={28} className="animate-spin" /></div>

  if (user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Mon compte</h1>
            <p className="text-sm text-semous-gray-text mt-1">{user.email}</p>
          </div>
          <button onClick={handleSignOut} className="btn-secondary flex items-center gap-2 text-sm">
            <LogOut size={14} />Déconnexion
          </button>
        </div>

        {/* Profile card */}
        <div className="card p-5 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-semous-black text-white flex items-center justify-center font-bold text-lg">
            {profile?.prenom?.[0] || user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{profile?.prenom} {profile?.nom}</p>
            <p className="text-sm text-semous-gray-text">{profile?.telephone}</p>
          </div>
        </div>

        {/* Orders */}
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <ShoppingBag size={18} />Mes commandes
        </h2>

        {ordersLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center text-semous-gray-text">
            <p className="mb-4">Vous n'avez pas encore de commande.</p>
            <Link to="/menu" className="btn-primary inline-block">Commander maintenant</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <div key={order.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm">{order.numero}</p>
                  <span className={`badge ${orderStatusColor(order.statut)}`}>
                    {orderStatusLabel(order.statut)}
                  </span>
                </div>
                <div className="text-xs text-semous-gray-text mb-2">{formatDate(order.created_at)}</div>
                <div className="text-sm flex justify-between font-medium">
                  <span>{order.order_items?.length} article(s)</span>
                  <span>{formatPrice(order.total_ttc)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="section-title text-center mb-2">Mon compte SEMOUS</h1>
      <p className="text-sm text-semous-gray-text text-center mb-8">
        Commandez plus vite, accédez à votre historique et préparez-vous pour le SEMOUS CLUB.
      </p>

      <div className="flex rounded-xl overflow-hidden border border-semous-gray-mid mb-6">
        {[{ key: 'login', label: 'Connexion' }, { key: 'signup', label: 'Créer un compte' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors
              ${tab === t.key ? 'bg-semous-black text-white' : 'text-semous-gray-text hover:text-semous-black'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Email</label>
            <input required type="email" className="input-field" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Mot de passe</label>
            <input required type="password" className="input-field" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            Se connecter
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Prénom *</label>
              <input required className="input-field" value={signupForm.prenom} onChange={e => setSignupForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Prénom" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Nom</label>
              <input className="input-field" value={signupForm.nom} onChange={e => setSignupForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nom" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Email *</label>
            <input required type="email" className="input-field" value={signupForm.email} onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Téléphone</label>
            <input className="input-field" value={signupForm.telephone} onChange={e => setSignupForm(f => ({ ...f, telephone: e.target.value }))} placeholder="06 XX XX XX XX" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Mot de passe *</label>
            <input required type="password" minLength={8} className="input-field" value={signupForm.password} onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))} placeholder="8 caractères minimum" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            Créer mon compte
          </button>
        </form>
      )}

      <p className="text-xs text-semous-gray-text text-center mt-6">
        Vous pouvez aussi commander{' '}
        <Link to="/commande" className="underline">sans créer de compte</Link>.
      </p>
    </div>
  )
}
