import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice } from '@/utils/format'
import { Search, Users, Loader2 } from 'lucide-react'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('clients')
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: c }, { data: g }] = await Promise.all([
      supabase.from('customer_profiles').select('*, users(email), orders(count, total_ttc)').order('created_at', { ascending: false }),
      supabase.from('guest_customers').select('*').order('created_at', { ascending: false }),
    ])
    setClients(c || [])
    setGuests(g || [])
    setLoading(false)
  }

  const filteredClients = clients.filter(c =>
    !search || c.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.users?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredGuests = guests.filter(g =>
    !search || g.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    g.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold">Clients</h1>
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-semous-gray-text" />
          <input className="input-field pl-9 text-sm" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex rounded-xl overflow-hidden border border-semous-gray-mid mb-6 w-fit">
        {[{ key: 'clients', label: `Comptes (${clients.length})` }, { key: 'guests', label: `Invités (${guests.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-semous-black text-white' : 'text-semous-gray-text hover:text-semous-black'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'clients' ? (
        <div className="flex flex-col gap-3">
          {filteredClients.map(client => (
            <div key={client.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-semous-black text-white flex items-center justify-center font-bold shrink-0">
                {client.prenom?.[0] || '?'}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{client.prenom} {client.nom}</p>
                <p className="text-xs text-semous-gray-text">{client.users?.email} · {client.telephone}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{client.orders?.[0]?.count || 0} commande(s)</p>
                <p className="text-xs text-semous-gray-text">{formatDate(client.created_at)}</p>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && <p className="text-center py-10 text-semous-gray-text">Aucun client trouvé</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredGuests.map(guest => (
            <div key={guest.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-semous-gray flex items-center justify-center shrink-0">
                <Users size={18} className="text-semous-gray-text" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{guest.prenom || 'Invité'}</p>
                <p className="text-xs text-semous-gray-text">{guest.email} · {guest.telephone}</p>
              </div>
              <p className="text-xs text-semous-gray-text">{formatDate(guest.created_at)}</p>
            </div>
          ))}
          {filteredGuests.length === 0 && <p className="text-center py-10 text-semous-gray-text">Aucun invité trouvé</p>}
        </div>
      )}
    </div>
  )
}
