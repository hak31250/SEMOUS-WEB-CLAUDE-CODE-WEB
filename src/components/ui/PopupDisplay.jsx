import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

export default function PopupDisplay() {
  const [popups, setPopups] = useState([])
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('semous_dismissed_popups') || '[]') }
    catch { return [] }
  })

  useEffect(() => {
    const now = new Date().toISOString()
    supabase.from('popups')
      .select('*')
      .eq('actif', true)
      .or(`date_debut.is.null,date_debut.lte.${now}`)
      .or(`date_fin.is.null,date_fin.gte.${now}`)
      .then(({ data }) => {
        if (data) {
          setPopups(data.filter(p => !dismissed.includes(p.id)))
        }
      })
  }, [])

  function dismiss(id) {
    const next = [...dismissed, id]
    setDismissed(next)
    localStorage.setItem('semous_dismissed_popups', JSON.stringify(next))
    setPopups(prev => prev.filter(p => p.id !== id))
  }

  if (popups.length === 0) return null

  const popup = popups[0]

  const typeStyles = {
    info: 'bg-blue-600',
    promo: 'bg-semous-black',
    alerte: 'bg-red-600',
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className={`px-5 py-3 ${typeStyles[popup.type] || 'bg-semous-black'}`}>
          <div className="flex items-center justify-between">
            <p className="font-bold text-white text-sm">{popup.titre}</p>
            <button onClick={() => dismiss(popup.id)} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-semous-gray-text leading-relaxed">{popup.contenu}</p>
          <div className="flex gap-3 mt-5">
            {popup.bouton_label && popup.bouton_url && (
              <a
                href={popup.bouton_url}
                onClick={() => dismiss(popup.id)}
                className="btn-primary flex-1 text-center text-sm py-2.5"
              >
                {popup.bouton_label}
              </a>
            )}
            <button onClick={() => dismiss(popup.id)} className="btn-secondary flex-1 text-sm py-2.5">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
