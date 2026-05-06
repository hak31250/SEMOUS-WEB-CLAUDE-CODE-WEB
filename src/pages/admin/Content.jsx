import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/format'
import { FileText, Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Content() {
  const [pages, setPages] = useState([])
  const [faqs, setFaqs] = useState([])
  const [popups, setPopups] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pages')
  const [editItem, setEditItem] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: p }, { data: f }, { data: pp }] = await Promise.all([
      supabase.from('pages').select('*').order('updated_at', { ascending: false }),
      supabase.from('faqs').select('*').order('ordre'),
      supabase.from('popups').select('*').order('created_at', { ascending: false }),
    ])
    setPages(p || [])
    setFaqs(f || [])
    setPopups(pp || [])
    setLoading(false)
  }

  async function deleteFaq(id) {
    if (!confirm('Supprimer cette FAQ ?')) return
    await supabase.from('faqs').delete().eq('id', id)
    setFaqs(prev => prev.filter(f => f.id !== id))
    toast.success('FAQ supprimée')
  }

  async function deletePopup(id) {
    if (!confirm('Supprimer ce popup ?')) return
    await supabase.from('popups').delete().eq('id', id)
    setPopups(prev => prev.filter(p => p.id !== id))
    toast.success('Popup supprimé')
  }

  async function togglePopup(popup) {
    const next = !popup.actif
    await supabase.from('popups').update({ actif: next }).eq('id', popup.id)
    setPopups(prev => prev.map(p => p.id === popup.id ? { ...p, actif: next } : p))
  }

  async function togglePage(page) {
    const next = !page.publiee
    await supabase.from('pages').update({ publiee: next, updated_at: new Date().toISOString() }).eq('id', page.id)
    setPages(prev => prev.map(p => p.id === page.id ? { ...p, publiee: next } : p))
  }

  function onSaved(type, item, isNew) {
    if (type === 'faq') {
      if (isNew) setFaqs(prev => [...prev, item])
      else setFaqs(prev => prev.map(f => f.id === item.id ? item : f))
    } else if (type === 'popup') {
      if (isNew) setPopups(prev => [item, ...prev])
      else setPopups(prev => prev.map(p => p.id === item.id ? item : p))
    } else if (type === 'page') {
      setPages(prev => prev.map(p => p.id === item.id ? item : p))
    }
    setEditItem(null)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contenus SEO</h1>

      <div className="flex rounded-xl overflow-hidden border border-semous-gray-mid mb-6 w-fit">
        {[{ key: 'pages', label: 'Pages' }, { key: 'faqs', label: 'FAQ' }, { key: 'popups', label: 'Popups' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-semous-black text-white' : 'text-semous-gray-text hover:text-semous-black'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pages' && (
        <div className="flex flex-col gap-3">
          {pages.map(page => (
            <div key={page.id} className="card p-4 flex items-center gap-4">
              <FileText size={18} className="text-semous-gray-text shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{page.titre}</p>
                <p className="text-xs text-semous-gray-text">/{page.slug} · Mis à jour {formatDate(page.updated_at)}</p>
                {page.meta_description && (
                  <p className="text-xs text-semous-gray-text/70 mt-0.5 truncate">{page.meta_description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePage(page)}
                  className={`badge cursor-pointer ${page.publiee ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {page.publiee ? 'Publiée' : 'Brouillon'}
                </button>
                <button onClick={() => setEditItem({ type: 'page', data: page })} className="p-1.5 text-semous-gray-text hover:text-semous-black">
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          ))}
          {pages.length === 0 && <p className="text-center py-12 text-semous-gray-text">Aucune page créée</p>}
        </div>
      )}

      {tab === 'faqs' && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end mb-2">
            <button onClick={() => setEditItem({ type: 'faq', data: {} })} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={14} />Ajouter une FAQ
            </button>
          </div>
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="card p-4 flex items-start gap-4">
              <span className="text-sm font-bold text-semous-gray-text w-6 shrink-0">#{idx + 1}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{faq.question}</p>
                <p className="text-xs text-semous-gray-text line-clamp-2 mt-1">{faq.reponse}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditItem({ type: 'faq', data: faq })} className="p-1.5 text-semous-gray-text hover:text-semous-black">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteFaq(faq.id)} className="p-1.5 text-semous-gray-text hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {faqs.length === 0 && <p className="text-center py-12 text-semous-gray-text">Aucune FAQ créée</p>}
        </div>
      )}

      {tab === 'popups' && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end mb-2">
            <button onClick={() => setEditItem({ type: 'popup', data: {} })} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={14} />Nouveau popup
            </button>
          </div>
          {popups.map(popup => (
            <div key={popup.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{popup.titre}</p>
                <p className="text-xs text-semous-gray-text line-clamp-1">{popup.contenu}</p>
                {(popup.date_debut || popup.date_fin) && (
                  <p className="text-xs text-semous-gray-text/70 mt-0.5">
                    {popup.date_debut ? formatDate(popup.date_debut) : '∞'} → {popup.date_fin ? formatDate(popup.date_fin) : '∞'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePopup(popup)}
                  className={`badge cursor-pointer ${popup.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {popup.actif ? 'Actif' : 'Inactif'}
                </button>
                <button onClick={() => setEditItem({ type: 'popup', data: popup })} className="p-1.5 text-semous-gray-text hover:text-semous-black">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deletePopup(popup.id)} className="p-1.5 text-semous-gray-text hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {popups.length === 0 && <p className="text-center py-12 text-semous-gray-text">Aucun popup créé</p>}
        </div>
      )}

      {/* Edit modals */}
      {editItem?.type === 'faq' && (
        <FaqModal
          faq={editItem.data}
          onSave={item => onSaved('faq', item, !editItem.data.id)}
          onClose={() => setEditItem(null)}
        />
      )}
      {editItem?.type === 'popup' && (
        <PopupModal
          popup={editItem.data}
          onSave={item => onSaved('popup', item, !editItem.data.id)}
          onClose={() => setEditItem(null)}
        />
      )}
      {editItem?.type === 'page' && (
        <PageModal
          page={editItem.data}
          onSave={item => onSaved('page', item, false)}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  )
}

function FaqModal({ faq, onSave, onClose }) {
  const [form, setForm] = useState({ question: faq.question || '', reponse: faq.reponse || '', ordre: faq.ordre || 0 })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.question.trim() || !form.reponse.trim()) { toast.error('Question et réponse requis'); return }
    setSaving(true)
    if (faq.id) {
      const { data, error } = await supabase.from('faqs').update({ ...form, updated_at: new Date().toISOString() }).eq('id', faq.id).select().single()
      if (error) { toast.error('Erreur'); setSaving(false); return }
      onSave(data)
    } else {
      const { data, error } = await supabase.from('faqs').insert(form).select().single()
      if (error) { toast.error('Erreur'); setSaving(false); return }
      onSave(data)
    }
    toast.success('FAQ sauvegardée')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="font-bold text-lg">{faq.id ? 'Modifier la FAQ' : 'Nouvelle FAQ'}</p>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Question *</label>
            <input className="input-field" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Question fréquente..." autoFocus />
          </div>
          <div>
            <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Réponse *</label>
            <textarea className="input-field resize-none" rows={5} value={form.reponse} onChange={e => setForm(f => ({ ...f, reponse: e.target.value }))} placeholder="Réponse détaillée..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Ordre d'affichage</label>
            <input type="number" className="input-field w-24" value={form.ordre} onChange={e => setForm(f => ({ ...f, ordre: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}

function PopupModal({ popup, onSave, onClose }) {
  const [form, setForm] = useState({
    titre: popup.titre || '',
    contenu: popup.contenu || '',
    type: popup.type || 'info',
    actif: popup.actif ?? true,
    date_debut: popup.date_debut ? popup.date_debut.slice(0, 16) : '',
    date_fin: popup.date_fin ? popup.date_fin.slice(0, 16) : '',
    bouton_label: popup.bouton_label || '',
    bouton_url: popup.bouton_url || '',
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.titre.trim() || !form.contenu.trim()) { toast.error('Titre et contenu requis'); return }
    setSaving(true)
    const payload = {
      ...form,
      date_debut: form.date_debut || null,
      date_fin: form.date_fin || null,
    }
    if (popup.id) {
      const { data, error } = await supabase.from('popups').update(payload).eq('id', popup.id).select().single()
      if (error) { toast.error('Erreur'); setSaving(false); return }
      onSave(data)
    } else {
      const { data, error } = await supabase.from('popups').insert(payload).select().single()
      if (error) { toast.error('Erreur'); setSaving(false); return }
      onSave(data)
    }
    toast.success('Popup sauvegardé')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <p className="font-bold text-lg">{popup.id ? 'Modifier le popup' : 'Nouveau popup'}</p>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Titre *</label>
            <input className="input-field" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} placeholder="Titre du popup..." autoFocus />
          </div>
          <div>
            <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Contenu *</label>
            <textarea className="input-field resize-none" rows={4} value={form.contenu} onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))} placeholder="Message affiché..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="info">Info</option>
                <option value="promo">Promo</option>
                <option value="alerte">Alerte</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors ${form.actif ? 'bg-semous-black' : 'bg-semous-gray-mid'}`}
                  onClick={() => setForm(f => ({ ...f, actif: !f.actif }))}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${form.actif ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-medium">{form.actif ? 'Actif' : 'Inactif'}</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Date début</label>
              <input type="datetime-local" className="input-field text-sm" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Date fin</label>
              <input type="datetime-local" className="input-field text-sm" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Label bouton</label>
              <input className="input-field" value={form.bouton_label} onChange={e => setForm(f => ({ ...f, bouton_label: e.target.value }))} placeholder="Ex: En savoir plus" />
            </div>
            <div>
              <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">URL bouton</label>
              <input className="input-field" value={form.bouton_url} onChange={e => setForm(f => ({ ...f, bouton_url: e.target.value }))} placeholder="/menu" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}

function PageModal({ page, onSave, onClose }) {
  const [form, setForm] = useState({
    titre: page.titre || '',
    meta_description: page.meta_description || '',
    meta_keywords: page.meta_keywords || '',
    contenu: page.contenu || '',
    publiee: page.publiee ?? false,
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.titre.trim()) { toast.error('Titre requis'); return }
    setSaving(true)
    const { data, error } = await supabase.from('pages')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', page.id).select().single()
    if (error) { toast.error('Erreur'); setSaving(false); return }
    onSave(data)
    toast.success('Page mise à jour')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <p className="font-bold text-lg">Modifier la page — /{page.slug}</p>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Titre SEO</label>
            <input className="input-field" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} autoFocus />
          </div>
          <div>
            <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Meta description <span className="font-normal">(150 car. max)</span></label>
            <textarea className="input-field resize-none" rows={2} maxLength={160} value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} />
            <p className="text-xs text-semous-gray-text mt-1">{form.meta_description.length}/160</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Mots-clés</label>
            <input className="input-field" value={form.meta_keywords} onChange={e => setForm(f => ({ ...f, meta_keywords: e.target.value }))} placeholder="semoule, livraison, toulouse..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-semous-gray-text mb-1.5 block">Contenu (HTML)</label>
            <textarea className="input-field resize-none font-mono text-xs" rows={8} value={form.contenu} onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-6 rounded-full transition-colors ${form.publiee ? 'bg-semous-black' : 'bg-semous-gray-mid'}`}
              onClick={() => setForm(f => ({ ...f, publiee: !f.publiee }))}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${form.publiee ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm font-medium">{form.publiee ? 'Page publiée' : 'Brouillon'}</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}
