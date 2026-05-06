import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/utils/format'
import { TrendingUp, ShoppingBag, Users, Truck, RotateCcw, Tag, Loader2 } from 'lucide-react'

const PERIODS = [
  { label: "Aujourd'hui", days: 0 },
  { label: '7 jours', days: 7 },
  { label: '30 jours', days: 30 },
  { label: '90 jours', days: 90 },
]

function startOf(days) {
  const d = new Date()
  if (days === 0) d.setHours(0, 0, 0, 0)
  else d.setDate(d.getDate() - days)
  return d.toISOString()
}

export default function Statistics() {
  const [period, setPeriod] = useState(7)
  const [stats, setStats] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [dailyCA, setDailyCA] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [period])

  async function load() {
    setLoading(true)
    const since = startOf(period)

    const [
      { data: orders },
      { data: refunds },
      { data: codes },
      { data: guests },
    ] = await Promise.all([
      supabase.from('orders').select('total_ttc, total_ht, tva, type, statut, reduction, created_at')
        .gte('created_at', since).not('statut', 'in', '("refusee","annulee")'),
      supabase.from('refunds').select('montant').gte('created_at', since),
      supabase.from('code_usages').select('id').gte('created_at', since),
      supabase.from('guest_customers').select('id').gte('created_at', since),
    ])

    const validOrders = (orders || []).filter(o => !['refusee', 'annulee'].includes(o.statut))
    const terminatedOrders = validOrders.filter(o => ['livree', 'terminee'].includes(o.statut))

    const ca_ttc = terminatedOrders.reduce((s, o) => s + (o.total_ttc || 0), 0)
    const ca_ht = terminatedOrders.reduce((s, o) => s + (o.total_ht || 0), 0)
    const tva_total = terminatedOrders.reduce((s, o) => s + (o.tva || 0), 0)
    const remboursements = (refunds || []).reduce((s, r) => s + (r.montant || 0), 0)
    const reductions = validOrders.reduce((s, o) => s + (o.reduction || 0), 0)

    const byType = { livraison: 0, retrait: 0, entreprise: 0 }
    terminatedOrders.forEach(o => { if (byType[o.type] !== undefined) byType[o.type] += o.total_ttc || 0 })

    setStats({
      ca_ttc, ca_ht, tva: tva_total,
      nb_commandes: validOrders.length,
      nb_terminees: terminatedOrders.length,
      panier_moyen: terminatedOrders.length ? ca_ttc / terminatedOrders.length : 0,
      remboursements,
      reductions,
      nb_codes: (codes || []).length,
      nb_nouveaux_clients: (guests || []).length,
      by_type: byType,
    })

    // Top produits
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantite, prix_unitaire_ttc, products(nom)')
      .gte('created_at', since)
    const prodMap = {}
    ;(items || []).forEach(i => {
      const id = i.product_id
      if (!prodMap[id]) prodMap[id] = { nom: i.products?.nom || '?', qty: 0, ca: 0 }
      prodMap[id].qty += i.quantite
      prodMap[id].ca += i.quantite * i.prix_unitaire_ttc
    })
    setTopProducts(Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 10))

    // CA journalier (7 derniers jours max)
    const daily = {}
    const daysToShow = Math.min(period === 0 ? 1 : period, 30)
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      daily[d.toISOString().slice(0, 10)] = 0
    }
    terminatedOrders.forEach(o => {
      const day = o.created_at.slice(0, 10)
      if (daily[day] !== undefined) daily[day] += o.total_ttc || 0
    })
    setDailyCA(Object.entries(daily).map(([date, ca]) => ({ date, ca })))
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin" /></div>

  const maxCA = Math.max(...dailyCA.map(d => d.ca), 1)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button key={p.days} onClick={() => setPeriod(p.days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p.days ? 'bg-semous-black text-white' : 'bg-semous-gray text-semous-black hover:bg-semous-gray-mid'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: TrendingUp, label: 'CA TTC', value: formatPrice(stats.ca_ttc), sub: `HT: ${formatPrice(stats.ca_ht)}`, color: 'text-green-600' },
          { icon: ShoppingBag, label: 'Commandes', value: stats.nb_terminees, sub: `En cours: ${stats.nb_commandes - stats.nb_terminees}`, color: 'text-blue-600' },
          { icon: TrendingUp, label: 'Panier moyen', value: formatPrice(stats.panier_moyen), sub: `TVA: ${formatPrice(stats.tva)}`, color: 'text-purple-600' },
          { icon: RotateCcw, label: 'Remboursements', value: formatPrice(stats.remboursements), sub: `Réductions: ${formatPrice(stats.reductions)}`, color: 'text-red-500' },
          { icon: Truck, label: 'Livraisons', value: formatPrice(stats.by_type.livraison), sub: `CA livraison`, color: 'text-indigo-600' },
          { icon: ShoppingBag, label: 'Retraits', value: formatPrice(stats.by_type.retrait), sub: `CA retrait`, color: 'text-cyan-600' },
          { icon: Tag, label: 'Codes utilisés', value: stats.nb_codes, sub: `usages période`, color: 'text-orange-500' },
          { icon: Users, label: 'Nouveaux clients', value: stats.nb_nouveaux_clients, sub: `invités période`, color: 'text-teal-600' },
        ].map((kpi, i) => (
          <div key={i} className="card p-4">
            <kpi.icon size={18} className={`mb-2 ${kpi.color}`} />
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-semous-gray-text mt-0.5">{kpi.label}</p>
            <p className="text-xs text-semous-gray-text/70 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CA journalier */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">CA journalier (TTC)</h2>
          {dailyCA.length === 0 ? <p className="text-semous-gray-text text-sm">Pas de données</p> : (
            <div className="flex items-end gap-1 h-32">
              {dailyCA.map(({ date, ca }) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-semous-black rounded-t transition-all"
                      style={{ height: `${Math.max(4, (ca / maxCA) * 112)}px` }}
                      title={`${date}: ${formatPrice(ca)}`}
                    />
                  </div>
                  <p className="text-xs text-semous-gray-text hidden group-hover:block absolute bg-white border border-semous-gray-mid rounded px-1 text-xs z-10 whitespace-nowrap">
                    {formatPrice(ca)}
                  </p>
                  {dailyCA.length <= 14 && (
                    <p className="text-xs text-semous-gray-text" style={{ fontSize: '9px' }}>
                      {date.slice(8)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top produits */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Top produits</h2>
          {topProducts.length === 0 ? <p className="text-semous-gray-text text-sm">Pas de données</p> : (
            <div className="flex flex-col gap-2">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-semous-gray-text w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="font-medium truncate">{p.nom}</span>
                      <span className="text-semous-gray-text shrink-0 ml-2">{p.qty} ventes</span>
                    </div>
                    <div className="h-1.5 bg-semous-gray rounded-full overflow-hidden">
                      <div
                        className="h-full bg-semous-black rounded-full"
                        style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold shrink-0">{formatPrice(p.ca)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
