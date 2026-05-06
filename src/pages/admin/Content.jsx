import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/format'
import { FileText, Plus, Pencil, Eye, EyeOff, Loader2, X, Check } from 'lucide-react'
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
              <div className="flex-1">
                <p className="font-semibold">{page.titre}</p>
                <p className="text-xs text-semous-gray-text">/{page.slug} · Mis à jour {formatDate(page.updated_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${page.publiee ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {page.publiee ? 'Publiée' : 'Brouillon'}
                </span>
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
          {faqs.map(faq => (
            <div key={faq.id} className="card p-4 flex items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold text-sm">{faq.question}</p>
                <p className="text-xs text-semous-gray-text line-clamp-2 mt-1">{faq.reponse}</p>
              </div>
              <button onClick={() => setEditItem({ type: 'faq', data: faq })} className="p-1.5 text-semous-gray-text hover:text-semous-black shrink-0">
                <Pencil size={14} />
              </button>
            </div>
          ))}
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
              <div className="flex-1">
                <p className="font-semibold">{popup.titre}</p>
                <p className="text-xs text-semous-gray-text line-clamp-1">{popup.contenu}</p>
              </div>
              <span className={`badge ${popup.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {popup.actif ? 'Actif' : 'Inactif'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
