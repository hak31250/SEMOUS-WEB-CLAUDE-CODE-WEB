import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const SETTINGS_META = [
  { cle: 'livraison_minimum_eur', label: 'Minimum commande livraison (EUR)', type: 'number' },
  { cle: 'livraison_offerte_a_partir_de_eur', label: 'Livraison offerte à partir de (EUR)', type: 'number' },
  { cle: 'validation_timeout_minutes', label: 'Délai validation commande (min)', type: 'number' },
  { cle: 'sonnerie_active', label: 'Sonnerie activée', type: 'boolean' },
  { cle: 'stock_mise_a_jour_interval_minutes', label: 'Intervalle mise à jour stock (min)', type: 'number' },
  { cle: 'restaurant_nom', label: 'Nom du restaurant', type: 'text' },
  { cle: 'restaurant_adresse', label: 'Adresse du restaurant', type: 'text' },
  { cle: 'restaurant_telephone', label: 'Téléphone', type: 'text' },
  { cle: 'restaurant_email', label: 'Email contact', type: 'email' },
]

export default function Settings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('settings').select('cle, valeur')
    const map = {}
    ;(data || []).forEach(s => { map[s.cle] = s.valeur })
    // Defaults
    const defaults = {
      livraison_minimum_eur: '15', livraison_offerte_a_partir_de_eur: '20',
      validation_timeout_minutes: '2', sonnerie_active: 'true',
      stock_mise_a_jour_interval_minutes: '60', restaurant_nom: 'SEMOUS',
      restaurant_adresse: '32 avenue Honoré Serres, 31000 Toulouse',
    }
    setSettings({ ...defaults, ...map })
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    const upserts = Object.entries(settings).map(([cle, valeur]) => ({ cle, valeur: String(valeur), updated_at: new Date().toISOString() }))
    const { error } = await supabase.from('settings').upsert(upserts, { onConflict: 'cle' })
    setSaving(false)
    if (error) { toast.error('Erreur sauvegarde'); return }
    toast.success('Paramètres sauvegardés')
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="card p-6 flex flex-col gap-5 mb-6">
        {SETTINGS_META.map(meta => (
          <div key={meta.cle}>
            <label className="text-xs font-medium mb-1.5 block">{meta.label}</label>
            {meta.type === 'boolean' ? (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[meta.cle] === 'true'}
                  onChange={e => setSettings(s => ({ ...s, [meta.cle]: e.target.checked ? 'true' : 'false' }))}
                />
                <span className="text-sm">{settings[meta.cle] === 'true' ? 'Activée' : 'Désactivée'}</span>
              </label>
            ) : (
              <input
                type={meta.type}
                className="input-field"
                value={settings[meta.cle] || ''}
                onChange={e => setSettings(s => ({ ...s, [meta.cle]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Sauvegarder
      </button>
    </div>
  )
}
