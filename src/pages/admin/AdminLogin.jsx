import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(form)
      // Attendre que le profil + rôle soient chargés par loadProfile
      await new Promise(resolve => setTimeout(resolve, 400))
      const { role } = useAuthStore.getState()
      if (!['admin', 'cuisine', 'livreur'].includes(role)) {
        toast.error('Accès non autorisé pour ce compte')
        await useAuthStore.getState().signOut()
        return
      }
      navigate('/admin')
    } catch {
      toast.error('Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-semous-black flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <p className="font-bold text-2xl mb-1">SEMOUS</p>
          <p className="text-sm text-semous-gray-text">Accès réservé au personnel</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Email</label>
            <input required type="email" className="input-field" autoComplete="email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@semous.fr" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Mot de passe</label>
            <input required type="password" className="input-field" autoComplete="current-password"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" />Connexion...</> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
