import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice } from '@/utils/format'
import { Plus, Tag, Loader2, X, Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

const CODE_TYPES = [
  { value: 'reduction_eur', label: 'Réduction (EUR)' },
  { value: 'reduction_pct', label: 'Réduction (%)' },
  { value: 'livraison_offerte', label: 'Livraison offerte' },
  { value: 'produit_offert', label: 'Produit offert' },
  { value: 'menu_offert', label: 'Menu offert' },
]

function generateCode(prefix = 'SEMOUS') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = prefix + '-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function Codes() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('codes').select('*').order('created_at', { ascending: false })
    setCodes(data || [])
    setLoading(false)
  }

  async function toggleActif(code) {
    await supabase.from('codes').update({ actif: !code.actif }).eq('id', code.id)
    setCodes(prev => prev.map(c => c.id === code.id ? { ...c, actif: !c.actif } : c))
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code)
    toast.success('Code copié !')
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Codes promotionnels</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />Nouveau code
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {codes.map(code => (
          <div key={code.id} className={`card p-4 flex items-center gap-4 ${!code.actif ? 'opacity-50' : ''}`}>
            <Tag size={18} className="text-semous-gray-text shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold font-mono">{code.code}</p>
                <button onClick={() => copyCode(code.code)} className="text-semous-gray-text hover:text-semous-black">
                  <Copy size={12} />
                </button>
              </div>
              <p className="text-xs text-semous-gray-text">
                {CODE_TYPES.find(t => t.value === code.type)?.label}
                {code.valeur ? ` · ${code.type === 'reduction_pct' ? code.valeur + '%' : formatPrice(code.valeur)}` : ''}
                {code.campagne ? ` · ${code.campagne}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <p className="font-medium">{code.usage_count} usage(s)</p>
                {code.limite_total && <p className="text-xs text-semous-gray-text">/ {code.limite_total}</p>}
              </div>
              {code.date_fin && <p className="text-xs text-semous-gray-text hidden md:block">Exp. {formatDate(code.date_fin)}</p>}
              <button
                onClick={() => toggleActif(code)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${code.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
              >
                {code.actif ? 'Actif' : 'Inactif'}
              </button>
            </div>
          </div>
        ))}
        {codes.length === 0 && <p className="text-center py-12 text-semous-gray-text">Aucun code promo créé</p>}
      </div>

      {showForm && <CodeForm onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  )
}

function CodeForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    code: generateCode(),
    type: 'reduction_eur',
    valeur: '',
    campagne: '',
    influenceur: '',
    date_debut: '',
    date_fin: '',
    limite_total: '',
    limite_par_client: '',
    actif: true,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('codes').insert({
      ...form,
      valeur: form.valeur ? parseFloat(form.valeur) : null,
      limite_total: form.limite_total ? parseInt(form.limite_total) : null,
      limite_par_client: form.limite_par_client ? parseInt(form.limite_par_client) : null,
      date_debut: form.date_debut || null,
      date_fin: form.date_fin || null,
    })
    setSaving(false)
    if (error) { toast.error('Erreur : code déjà existant ?'); return }
    toast.success('Code créé !')
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-semous-gray-mid">
          <h2 className="font-bold">Nouveau code promo</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block">Code *</label>
              <input className="input-field font-mono" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
            </div>
            <div className="mt-6">
              <button type="button" onClick={() => setForm(f => ({ ...f, code: generateCode() }))} className="btn-secondary text-sm py-3 px-3">↻</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Type *</label>
            <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {CODE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {['reduction_eur', 'reduction_pct'].includes(form.type) && (
            <div>
              <label className="text-xs font-medium mb-1 block">Valeur *</label>
              <input type="number" step="0.01" className="input-field" value={form.valeur} onChange={e => setForm(f => ({ ...f, valeur: e.target.value }))} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Date début</label>
              <input type="datetime-local" className="input-field" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Date fin</label>
              <input type="datetime-local" className="input-field" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Limite totale</label>
              <input type="number" className="input-field" value={form.limite_total} onChange={e => setForm(f => ({ ...f, limite_total: e.target.value }))} placeholder="∞" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Limite/client</label>
              <input type="number" className="input-field" value={form.limite_par_client} onChange={e => setForm(f => ({ ...f, limite_par_client: e.target.value }))} placeholder="∞" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Campagne / étiquette</label>
            <input className="input-field" value={form.campagne} onChange={e => setForm(f => ({ ...f, campagne: e.target.value }))} placeholder="influenceur, parrainage..." />
          </div>
        </div>
        <div className="p-5 border-t border-semous-gray-mid flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Créer
          </button>
        </div>
      </div>
    </div>
  )
}
