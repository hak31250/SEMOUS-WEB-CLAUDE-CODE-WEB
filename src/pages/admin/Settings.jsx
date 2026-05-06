import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Loader2, AlertTriangle, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const SETTINGS_SECTIONS = [
  {
    title: 'Ouverture & Commandes',
    fields: [
      { cle: 'commandes_actives', label: 'Commandes en ligne actives', type: 'boolean', default: 'true', desc: 'Désactiver pour fermeture exceptionnelle' },
      { cle: 'livraison_active', label: 'Livraison active', type: 'boolean', default: 'true' },
      { cle: 'retrait_actif', label: 'Retrait à emporter actif', type: 'boolean', default: 'true' },
      { cle: 'message_fermeture', label: 'Message de fermeture', type: 'text', default: '', desc: 'Affiché sur le site quand les commandes sont fermées' },
    ],
  },
  {
    title: 'Tarifs livraison',
    fields: [
      { cle: 'minimum_livraison', label: 'Minimum commande livraison (EUR)', type: 'number', default: '15' },
      { cle: 'livraison_offerte_a', label: 'Livraison offerte à partir de (EUR)', type: 'number', default: '20' },
      { cle: 'zone_max_km', label: 'Zone max livraison (km)', type: 'number', default: '7' },
    ],
  },
  {
    title: 'Restaurant',
    fields: [
      { cle: 'restaurant_nom', label: 'Nom du restaurant', type: 'text', default: 'SEMOUS' },
      { cle: 'restaurant_adresse', label: 'Adresse', type: 'text', default: '32 avenue Honoré Serres, 31000 Toulouse' },
      { cle: 'restaurant_telephone', label: 'Téléphone', type: 'text', default: '+33623233677' },
      { cle: 'restaurant_email', label: 'Email contact', type: 'email', default: 'contact@semous.fr' },
    ],
  },
  {
    title: 'Commandes & Validation',
    fields: [
      { cle: 'validation_timeout_minutes', label: 'Délai validation commande (min)', type: 'number', default: '2' },
      { cle: 'acompte_pct', label: 'Acompte entreprises (%)', type: 'number', default: '30' },
      { cle: 'tva_taux', label: 'Taux TVA (%)', type: 'number', default: '10' },
    ],
  },
  {
    title: 'Sonnerie',
    fields: [
      { cle: 'sonnerie_active', label: 'Sonnerie notifications activée', type: 'boolean', default: 'true' },
      { cle: 'sonnerie_fichier', label: 'Fichier sonnerie (URL)', type: 'text', default: '/sounds/notification.mp3' },
    ],
  },
]

export default function Settings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('settings').select('cle, valeur')
    const defaults = {}
    SETTINGS_SECTIONS.forEach(sec => sec.fields.forEach(f => { defaults[f.cle] = f.default }))
    const map = { ...defaults }
    ;(data || []).forEach(s => { map[s.cle] = s.valeur })
    setSettings(map)
    setLoading(false)
  }

  function updateField(cle, value) {
    setSettings(s => ({ ...s, [cle]: value }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    const upserts = Object.entries(settings).map(([cle, valeur]) => ({
      cle,
      valeur: String(valeur),
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase.from('settings').upsert(upserts, { onConflict: 'cle' })
    setSaving(false)
    if (error) { toast.error('Erreur sauvegarde'); return }
    toast.success('Paramètres sauvegardés')
    setDirty(false)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  const commandesActives = settings['commandes_actives'] !== 'false'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        {dirty && (
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Sauvegarder
          </button>
        )}
      </div>

      {/* Quick toggle: commandes actives */}
      <div className={`card p-5 mb-6 border-2 ${commandesActives ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold flex items-center gap-2">
              {commandesActives
                ? <><Check size={16} className="text-green-600" />Commandes ouvertes</>
                : <><AlertTriangle size={16} className="text-red-600" />Commandes FERMÉES</>}
            </p>
            <p className="text-xs text-semous-gray-text mt-0.5">
              {commandesActives ? 'Les clients peuvent passer commande en ligne.' : 'Aucune commande ne peut être passée.'}
            </p>
          </div>
          <button
            onClick={() => updateField('commandes_actives', commandesActives ? 'false' : 'true')}
            className={`w-14 h-8 rounded-full transition-colors relative ${commandesActives ? 'bg-green-500' : 'bg-red-500'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow absolute top-1 transition-transform ${commandesActives ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
        {!commandesActives && (
          <div className="mt-3">
            <label className="text-xs font-medium mb-1 block">Message affiché sur le site</label>
            <input
              className="input-field text-sm"
              value={settings['message_fermeture'] || ''}
              onChange={e => updateField('message_fermeture', e.target.value)}
              placeholder="Ex: Fermé exceptionnellement ce soir. Retour demain à 19h !"
            />
          </div>
        )}
      </div>

      {SETTINGS_SECTIONS.map(section => (
        <div key={section.title} className="card p-6 mb-4">
          <h2 className="font-bold text-sm mb-4 text-semous-gray-text uppercase tracking-wide">{section.title}</h2>
          <div className="flex flex-col gap-4">
            {section.fields.filter(f => f.cle !== 'commandes_actives' && f.cle !== 'message_fermeture').map(meta => (
              <div key={meta.cle}>
                <label className="text-xs font-medium mb-1 block">
                  {meta.label}
                  {meta.desc && <span className="ml-1 font-normal text-semous-gray-text">— {meta.desc}</span>}
                </label>
                {meta.type === 'boolean' ? (
                  <button
                    type="button"
                    onClick={() => updateField(meta.cle, settings[meta.cle] === 'true' ? 'false' : 'true')}
                    className={`flex items-center gap-3`}
                  >
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${settings[meta.cle] !== 'false' ? 'bg-semous-black' : 'bg-semous-gray-mid'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${settings[meta.cle] !== 'false' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm">{settings[meta.cle] !== 'false' ? 'Activé' : 'Désactivé'}</span>
                  </button>
                ) : (
                  <input
                    type={meta.type}
                    className="input-field"
                    value={settings[meta.cle] || ''}
                    onChange={e => updateField(meta.cle, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={save} disabled={saving || !dirty} className="btn-primary flex items-center gap-2 w-full justify-center">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Sauvegarder tous les paramètres
      </button>
    </div>
  )
}
