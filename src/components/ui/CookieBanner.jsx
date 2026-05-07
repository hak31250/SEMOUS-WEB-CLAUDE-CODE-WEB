import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useCookieStore } from '@/store/cookieStore'

export default function CookieBanner() {
  const { shown, acceptAll, rejectAll, savePreferences } = useCookieStore()
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false })

  if (shown) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-semous-gray-mid overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Cookie size={20} className="text-semous-black shrink-0" />
              <p className="font-bold text-sm">Ce site utilise des cookies</p>
            </div>
            <button onClick={rejectAll} className="text-semous-gray-text hover:text-semous-black shrink-0">
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-semous-gray-text mb-4">
            Nous utilisons des cookies essentiels au fonctionnement du site (panier, session).
            Vous pouvez accepter ou personnaliser vos préférences.{' '}
            <Link to="/legal/cookies" className="underline">En savoir plus</Link>
          </p>

          {/* Détails */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs text-semous-black font-medium flex items-center gap-1 mb-3 hover:opacity-70"
          >
            Personnaliser {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="flex flex-col gap-2 mb-4 text-xs">
              {[
                { key: 'essential', label: 'Cookies essentiels', desc: 'Panier, session — toujours actifs', locked: true },
                { key: 'analytics', label: 'Analytiques', desc: 'Mesure d\'audience anonyme' },
                { key: 'marketing', label: 'Marketing', desc: 'Offres personnalisées (avec votre consentement)' },
              ].map(item => (
                <div key={item.key} className="flex items-start justify-between gap-3 p-3 bg-semous-gray rounded-lg">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-semous-gray-text">{item.desc}</p>
                  </div>
                  {item.locked ? (
                    <span className="text-green-600 font-medium shrink-0">Actif</span>
                  ) : (
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={prefs[item.key]}
                        onChange={e => setPrefs(p => ({ ...p, [item.key]: e.target.checked }))}
                      />
                      <div className={`w-9 h-5 rounded-full transition-colors ${prefs[item.key] ? 'bg-semous-black' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[item.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={rejectAll} className="btn-secondary text-sm py-2.5 flex-1">Refuser tout</button>
            {expanded ? (
              <button onClick={() => savePreferences(prefs)} className="btn-primary text-sm py-2.5 flex-1">
                Sauvegarder mes choix
              </button>
            ) : (
              <button onClick={acceptAll} className="btn-primary text-sm py-2.5 flex-1">Accepter tout</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
