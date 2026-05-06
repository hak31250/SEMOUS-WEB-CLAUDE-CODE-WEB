import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor } from '@/utils/format'
import { User, LogOut, ShoppingBag, Loader2, Save, X, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { useSeo } from '@/hooks/useSeo'

export default function Account() {
  useSeo({ title: 'Mon compte', description: 'Gérez votre compte SEMOUS, consultez vos commandes et modifiez vos informations.' })
  const { user, profile, signIn, signUp, signOut, loading } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ prenom: '', nom: '', telephone: '' })
  const [profileSaving, setProfileSaving] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ email: '', password: '', prenom: '', nom: '', telephone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({ prenom: profile?.prenom || '', nom: profile?.nom || '', telephone: profile?.telephone || '' })
      setOrdersLoading(true)
      supabase
        .from('orders')
        .select('*, order_items(quantite, prix_unitaire_ttc, products(nom))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => { setOrders(data || []); setOrdersLoading(false) })
    }
  }, [user, profile])

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
      toast.success('Compte créé ! Connectez-vous.')
      setTab('login')
      setLoginForm({ email: signupForm.email, password: signupForm.password })
    } catch (err) {
      toast.error(err.message || 'Erreur à la création du compte')
    } finally { setSubmitting(false) }
  }

  async function saveProfile() {
    setProfileSaving(true)
    const { error } = await supabase
      .from('customer_profiles')
      .update({ prenom: profileForm.prenom, nom: profileForm.nom, telephone: profileForm.telephone })
      .eq('user_id', user.id)
    setProfileSaving(false)
    if (error) { toast.error('Erreur'); return }
    // Update local store
    useAuthStore.setState(s => ({ profile: { ...s.profile, ...profileForm } }))
    toast.success('Profil mis à jour')
    setEditProfile(false)
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
          <h1 className="section-title">Mon compte</h1>
          <button onClick={handleSignOut} className="btn-secondary flex items-center gap-2 text-sm">
            <LogOut size={14} />Déconnexion
          </button>
        </div>

        {/* Profile card */}
        <div className="card p-5 mb-8">
          {editProfile ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold">Modifier mon profil</p>
                <button onClick={() => setEditProfile(false)}><X size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Prénom</label>
                  <input className="input-field" value={profileForm.prenom} onChange={e => setProfileForm(f => ({ ...f, prenom: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Nom</label>
                  <input className="input-field" value={profileForm.nom} onChange={e => setProfileForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Téléphone</label>
                <input className="input-field" value={profileForm.telephone} onChange={e => setProfileForm(f => ({ ...f, telephone: e.target.value }))} placeholder="06 XX XX XX XX" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditProfile(false)} className="btn-secondary flex-1">Annuler</button>
                <button onClick={saveProfile} disabled={profileSaving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Sauvegarder
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-semous-black text-white flex items-center justify-center font-bold text-lg shrink-0">
                {profile?.prenom?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{profile?.prenom || ''} {profile?.nom || ''}</p>
                <p className="text-sm text-semous-gray-text">{user.email}</p>
                {profile?.telephone && <p className="text-sm text-semous-gray-text">{profile.telephone}</p>}
              </div>
              <button onClick={() => setEditProfile(true)} className="text-xs text-semous-gray-text hover:text-semous-black underline">
                Modifier
              </button>
            </div>
          )}
        </div>

        {/* Orders */}
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <ShoppingBag size={18} />Mes commandes
        </h2>

        {ordersLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center text-semous-gray-text">
            <p className="mb-4">Vous n&apos;avez pas encore de commande.</p>
            <Link to="/menu" className="btn-primary inline-block">Commander maintenant</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <Link key={order.id} to={`/commande/confirmation/${order.id}`} className="card p-4 block hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{order.numero}</p>
                  <span className={`badge ${orderStatusColor(order.statut)}`}>
                    {orderStatusLabel(order.statut)}
                  </span>
                </div>
                <div className="text-xs text-semous-gray-text mb-2">{formatDate(order.created_at)} · <span className="capitalize">{order.type}</span></div>
                <div className="text-sm flex justify-between">
                  <span className="text-semous-gray-text">
                    {order.order_items?.slice(0, 2).map(i => `${i.products?.nom}`).join(', ')}
                    {(order.order_items?.length || 0) > 2 ? ` +${order.order_items.length - 2}` : ''}
                  </span>
                  <span className="font-bold">{formatPrice(order.total_ttc)}</span>
                </div>
              </Link>
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
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === t.key ? 'bg-semous-black text-white' : 'text-semous-gray-text hover:text-semous-black'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Email</label>
            <input required type="email" className="input-field" value={loginForm.email}
              onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" autoFocus />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Mot de passe</label>
            <div className="relative">
              <input required type={showPwd ? 'text' : 'password'} className="input-field pr-10" value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-semous-gray-text">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
            Se connecter
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Prénom *</label>
              <input required className="input-field" value={signupForm.prenom}
                onChange={e => setSignupForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Prénom" autoFocus />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Nom</label>
              <input className="input-field" value={signupForm.nom}
                onChange={e => setSignupForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nom" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Email *</label>
            <input required type="email" className="input-field" value={signupForm.email}
              onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Téléphone</label>
            <input className="input-field" value={signupForm.telephone}
              onChange={e => setSignupForm(f => ({ ...f, telephone: e.target.value }))} placeholder="06 XX XX XX XX" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Mot de passe *</label>
            <div className="relative">
              <input required type={showPwd ? 'text' : 'password'} minLength={8} className="input-field pr-10" value={signupForm.password}
                onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))} placeholder="8 caractères minimum" />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-semous-gray-text">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
