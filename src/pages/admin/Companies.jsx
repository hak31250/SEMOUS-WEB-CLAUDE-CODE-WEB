import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/format'
import { Building2, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('requests')

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: comp }, { data: req }] = await Promise.all([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('company_orders').select('*, companies(*)').eq('statut_validation', 'en_attente').order('created_at', { ascending: false }),
    ])
    setCompanies(comp || [])
    setRequests(req || [])
    setLoading(false)
  }

  async function validateRequest(reqId, status) {
    await supabase.from('company_orders').update({ statut_validation: status }).eq('id', reqId)
    toast.success(status === 'acceptee' ? 'Demande acceptée' : 'Demande refusée')
    load()
  }

  async function toggleValide(company) {
    await supabase.from('companies').update({ valide: !company.valide }).eq('id', company.id)
    setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, valide: !c.valide } : c))
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Entreprises & Groupes</h1>

      <div className="flex rounded-xl overflow-hidden border border-semous-gray-mid mb-6 w-fit">
        {[{ key: 'requests', label: `Demandes (${requests.length})` }, { key: 'companies', label: `Comptes (${companies.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-semous-black text-white' : 'text-semous-gray-text hover:text-semous-black'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'requests' ? (
        <div className="flex flex-col gap-4">
          {requests.length === 0 && <p className="text-center py-12 text-semous-gray-text">Aucune demande en attente</p>}
          {requests.map(req => (
            <div key={req.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold">{req.companies?.nom}</p>
                  <p className="text-sm text-semous-gray-text">{req.companies?.prenom_referent} · {req.companies?.email_referent} · {req.companies?.telephone_referent}</p>
                </div>
                <span className="badge bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock size={10} />En attente</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
                <div><span className="text-semous-gray-text">Personnes</span><p className="font-medium">{req.nombre_personnes}</p></div>
                <div><span className="text-semous-gray-text">Budget</span><p className="font-medium">{req.budget_approximatif} EUR</p></div>
                <div><span className="text-semous-gray-text">Facture</span><p className="font-medium">{req.demande_facture ? 'Oui' : 'Non'}</p></div>
                <div><span className="text-semous-gray-text">Adresse</span><p className="font-medium">{req.companies?.adresse || '—'}</p></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => validateRequest(req.id, 'acceptee')} className="btn-green flex items-center gap-1.5 text-sm py-2">
                  <CheckCircle size={14} />Accepter
                </button>
                <button onClick={() => validateRequest(req.id, 'refusee')} className="border border-red-400 text-red-600 text-sm py-2 px-4 rounded-lg hover:bg-red-50 flex items-center gap-1.5">
                  <XCircle size={14} />Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {companies.map(company => (
            <div key={company.id} className="card p-4 flex items-center gap-4">
              <Building2 size={24} className="text-semous-gray-text shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{company.nom}</p>
                <p className="text-xs text-semous-gray-text">{company.email_referent} · {formatDate(company.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleValide(company)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium ${company.valide ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {company.valide ? 'Validé' : 'Non validé'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
