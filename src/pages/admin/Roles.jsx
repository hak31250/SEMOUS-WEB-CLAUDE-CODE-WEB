import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/format'
import { UserCog, Plus, Loader2, Check, X, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'admin', label: 'Administrateur', desc: 'Accès complet à tous les modules' },
  { value: 'cuisine', label: 'Cuisine', desc: 'Dashboard cuisine, acceptation et préparation des commandes' },
  { value: 'livreur', label: 'Livreur', desc: 'Accès livraisons uniquement' },
  { value: 'client', label: 'Client', desc: 'Accès client standard' },
]

export default function Roles() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('users')
      .select('*, customer_profiles(prenom, nom)')
      .in('role', ['admin', 'cuisine', 'livreur'])
      .order('role')
    setStaff(data || [])
    setLoading(false)
  }

  async function updateRole(userId, newRole) {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId)
    if (error) { toast.error('Erreur mise à jour'); return }
    toast.success('Rôle mis à jour')
    setStaff(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    setEditUser(null)
  }

  const roleColor = {
    admin: 'bg-red-100 text-red-700',
    cuisine: 'bg-orange-100 text-orange-700',
    livreur: 'bg-blue-100 text-blue-700',
    client: 'bg-gray-100 text-gray-600',
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des rôles</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />Inviter un membre
        </button>
      </div>

      {/* Rôles description */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {ROLES.filter(r => r.value !== 'client').map(role => (
          <div key={role.value} className="card p-4">
            <span className={`badge ${roleColor[role.value]} mb-2`}>{role.label}</span>
            <p className="text-xs text-semous-gray-text">{role.desc}</p>
          </div>
        ))}
      </div>

      {/* Staff list */}
      <div className="flex flex-col gap-3">
        {staff.length === 0 && (
          <div className="card p-10 text-center text-semous-gray-text">
            <UserCog size={36} className="mx-auto mb-3 opacity-30" />
            <p>Aucun membre du personnel configuré</p>
          </div>
        )}
        {staff.map(member => (
          <div key={member.id} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-semous-black text-white flex items-center justify-center font-bold shrink-0">
              {member.customer_profiles?.prenom?.[0] || member.email[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {member.customer_profiles?.prenom} {member.customer_profiles?.nom || ''}
              </p>
              <p className="text-xs text-semous-gray-text">{member.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {editUser?.id === member.id ? (
                <div className="flex items-center gap-2">
                  <select
                    className="input-field text-sm py-1.5 w-auto"
                    value={editUser.role}
                    onChange={e => setEditUser(u => ({ ...u, role: e.target.value }))}
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <button onClick={() => updateRole(member.id, editUser.role)} className="p-1.5 text-green-600 hover:text-green-700">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditUser(null)} className="p-1.5 text-semous-gray-text hover:text-semous-black">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className={`badge ${roleColor[member.role]}`}>
                    {ROLES.find(r => r.value === member.role)?.label || member.role}
                  </span>
                  <button
                    onClick={() => setEditUser({ id: member.id, role: member.role })}
                    className="p-1.5 text-semous-gray-text hover:text-semous-black"
                  >
                    <Pencil size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && <InviteForm onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  )
}

function InviteForm({ onClose, onSaved }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('cuisine')
  const [loading, setLoading] = useState(false)

  async function handleInvite() {
    if (!email) return
    setLoading(true)
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role },
    }).catch(() => ({ error: { message: 'API admin non disponible côté client' } }))

    if (error) {
      toast.error(`Pour inviter un utilisateur, utilisez la console Supabase ou l'API admin.\nEmail: ${email} · Rôle: ${role}`)
      setLoading(false)
      return
    }
    toast.success('Invitation envoyée !')
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold">Inviter un membre</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Email *</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="membre@semous.fr" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Rôle *</label>
            <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.filter(r => r.value !== 'client').map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-semous-gray-text bg-semous-gray rounded-lg p-3">
            L'invitation est envoyée par email. La personne devra créer son mot de passe via le lien reçu.
          </p>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={handleInvite} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Inviter
          </button>
        </div>
      </div>
    </div>
  )
}
